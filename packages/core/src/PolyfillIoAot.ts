import {DEFAULT_OUT_DIR, Manifest} from '@polyfill-io-aot/common';
import {md5Object} from '@polyfill-io-aot/common/src/fns/md5Hash';
import {reducePolyfills} from '@polyfill-io-aot/common/src/fns/reducePolyfills';
import * as lib from '@polyfill-io-aot/common/src/PolyfillLibrary';
import {PolyfillBuffer} from '@polyfill-io-aot/core/src/PolyfillBuffer';
import * as etag from 'etag';
import * as EventEmitter from 'events';
import {readFile, readFileSync} from 'fs-extra';
import {LazyGetter} from 'lazy-get-decorator';
import merge = require('lodash/merge');
import * as moment from 'moment';
import {join} from 'path';
import * as zlib from 'zlib';
import {Compression} from './Compression';
import {PolyfillCoreConfig} from './PolyfillCoreConfig';

import BrotliOptions = zlib.BrotliOptions;

const {brotliCompress, constants} = zlib;

const $cfg = Symbol('Config');

function compressCallback(resolve: (b: Buffer) => void, reject: (e: Error) => void): (e: Error, out: Buffer) => void {
  return (err: Error, out: Buffer): void => {
    if (err) {
      reject(err);
    } else {
      resolve(out);
    }
  };
}

function compressBrotli(buf: Buffer, opts: BrotliOptions['params']): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject): void => {
    brotliCompress(buf, opts, compressCallback(resolve, reject));
  });
}

function compressGzip(buf: Buffer, opts: zlib.ZlibOptions): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject): void => {
    zlib.gzip(buf, opts, compressCallback(resolve, reject));
  });
}

function setValue(obj: any, key: PropertyKey, value: any): void {
  Object.defineProperty(obj, key, {
    configurable: false,
    enumerable: true,
    value,
    writable: false
  });
}

/** Framework-agnostic polyfill consumer */
export class PolyfillIoAot extends EventEmitter {

  /** Event name for when a polyfill bundle cannot be found */
  public static readonly POLYFILL_NOT_FOUND = 'POLYFILL_IO_AOT_POLYFILL_NOT_FOUND';

  /** @internal */
  private readonly [$cfg]: Readonly<PolyfillCoreConfig>;

  /**
   * Constructor
   * @param cfg Partial polyfill configuration
   */
  public constructor(cfg?: Partial<PolyfillCoreConfig>) {
    super();
    const defaultCfg: PolyfillCoreConfig = {
      brotli: {
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY
      },
      excludes: [],
      flags: [],
      gzip: {
        level: 9
      },
      outDir: DEFAULT_OUT_DIR,
      polyfills: ['default'],
      unknown: 'polyfill'
    };

    this[$cfg] = Object.freeze(merge(defaultCfg, cfg || {}));
  }

  /** The lastModified value from the manifest */
  @LazyGetter()
  public get lastModified(): string {
    return this.manifest.lastModified;
  }

  @LazyGetter()
  private get conf(): Readonly<PolyfillCoreConfig> {
    return this[$cfg];
  }

  @LazyGetter()
  private get features(): Readonly<lib.Features> {
    return Object.freeze(reducePolyfills(this.conf.polyfills));
  }

  @LazyGetter()
  private get lastModifiedAsMoment(): moment.Moment {
    return moment(this.manifest.lastModified);
  }

  @LazyGetter()
  private get manifest(): Manifest {
    return JSON.parse(zlib.unzipSync(readFileSync(join(this.conf.outDir, 'manifest.json.gz'))).toString());
  }

  /**
   * Get the polyfills for the given compression level and user agent
   * @param uaString User agent string
   * @param [compression=Compression.NONE] Compression level
   */
  public getPolyfills(uaString: string, compression: Compression = Compression.NONE): Promise<PolyfillBuffer> {
    return lib
      .getPolyfills({
        excludes: this.conf.excludes,
        features: this.features,
        uaString
      })
      .then((polyfills: lib.GetPolyfillsResponse): Promise<PolyfillBuffer> => {
        return this.onGetPolyfills(uaString, polyfills, compression);
      });
  }

  /** Check whether the given ETag was bundled */
  public hasEtag(eTag: string): boolean {
    return !!this.manifest.etags[eTag];
  }

  /** Check whether the bundle has been modified since the given date */
  public modifiedSince(since: moment.MomentInput): boolean {
    return this.lastModifiedAsMoment.isAfter(since, 'second');
  }

  private generatePolyfills(uaString: string, compression: Compression, hash: string): Promise<PolyfillBuffer> {
    return lib
      .getPolyfillString({
        excludes: this.conf.excludes,
        features: this.features,
        uaString
      })
      .then((polyStr: string): Promise<Buffer> | Buffer => {
        const polyBuf: Buffer = Buffer.from(polyStr, 'utf8');

        switch (compression.extension) {
          case Compression.BROTLI.extension:
            return compressBrotli(polyBuf, this.conf.brotli);
          case Compression.GZIP.extension:
            return compressGzip(polyBuf, this.conf.gzip);
          default:
            return polyBuf;
        }
      })
      .then((b: Buffer): PolyfillBuffer => {
        Object.defineProperty(b, '$etag', {
          configurable: true,
          enumerable: true,
          get() {
            const value = etag(b);
            Object.defineProperty(b, '$etag', {
              configurable: false,
              enumerable: true,
              value
            });

            return value;
          }
        });
        setValue(b, '$hash', hash);

        return <PolyfillBuffer>b;
      });
  }

  private onGetPolyfills(uaString: string,
                         polyfills: lib.GetPolyfillsResponse,
                         compression: Compression): Promise<PolyfillBuffer> {
    const hash: string = md5Object(polyfills);

    if (hash in this.manifest.hashes) {
      return this.onHashFound(hash, compression);
    }

    setImmediate(() => {
      this.emit(PolyfillIoAot.POLYFILL_NOT_FOUND, uaString, polyfills, hash);
    });

    return this.generatePolyfills(uaString, compression, hash);
  }

  private onHashFound(hash: string, compression: Compression): Promise<PolyfillBuffer> {
    return readFile(join(this.conf.outDir, `${hash}.${compression.extension}`))
      .then((b: Buffer): PolyfillBuffer => {
        setValue(b, '$etag', this.manifest.hashes[hash][compression.encodingKey].etag);
        setValue(b, '$lastModified', this.manifest.lastModified);
        setValue(b, '$hash', hash);

        return <PolyfillBuffer>b;
      });
  }
}
