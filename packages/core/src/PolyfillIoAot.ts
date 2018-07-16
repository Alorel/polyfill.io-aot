import {Manifest} from '@polyfill-io-aot/common';
import {DEFAULT_OUT_DIR} from '@polyfill-io-aot/common/src/constants/DEFAULT_OUT_DIR';
import {md5Object} from '@polyfill-io-aot/common/src/fns/md5Hash';
import {reducePolyfills} from '@polyfill-io-aot/common/src/fns/reducePolyfills';
import {PolyfillBuffer} from '@polyfill-io-aot/core/src/PolyfillBuffer';
import * as etag from 'etag';
import * as EventEmitter from 'events';
import {readFile, readFileSync} from 'fs-extra';
import * as brotli from 'iltorb';
import merge = require('lodash/merge');
import * as moment from 'moment-timezone';
import {join} from 'path';
import * as svc from 'polyfill-service';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import * as zlib from 'zlib';
import {Compression} from './Compression';
import {PolyfillCoreConfig} from './PolyfillCoreConfig';

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

function compressBrotli(buf: Buffer, opts: brotli.BrotliEncodeParams): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject): void => {
    brotli.compress(buf, opts, compressCallback(resolve, reject));
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

export class PolyfillIoAot extends EventEmitter {

  public static readonly POLYFILL_NOT_FOUND = 'POLYFILL_IO_AOT_POLYFILL_NOT_FOUND';

  /** @internal */
  private readonly [$cfg]: Readonly<PolyfillCoreConfig>;

  public constructor(cfg?: Partial<PolyfillCoreConfig>) {
    super();
    const defaultCfg: PolyfillCoreConfig = {
      brotli: {
        quality: 11
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

  @LazyGetter()
  public get lastModified(): string {
    return this.manifest.lastModified;
  }

  @LazyGetter()
  private get conf(): Readonly<PolyfillCoreConfig> {
    return this[$cfg];
  }

  @LazyGetter()
  private get features(): Readonly<svc.Features> {
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

  public getPolyfills(uaString: string, compression: Compression = Compression.NONE): Promise<PolyfillBuffer> {
    return svc
      .getPolyfills({
        excludes: this.conf.excludes,
        features: this.features,
        uaString
      })
      .then((polyfills: svc.GetPolyfillsResponse): Promise<PolyfillBuffer> => {
        const hash: string = md5Object(polyfills);

        if (hash in this.manifest.hashes) {
          return readFile(join(this.conf.outDir, `${hash}.${compression.extension}`))
            .then((b: Buffer): PolyfillBuffer => {
              setValue(b, '$etag', this.manifest.hashes[hash][compression.encodingKey].etag);
              setValue(b, '$lastModified', this.manifest.lastModified);
              setValue(b, '$hash', hash);

              return <PolyfillBuffer>b;
            });
        }

        setImmediate(() => {
          this.emit(PolyfillIoAot.POLYFILL_NOT_FOUND, uaString, polyfills, hash);
        });

        return this.generatePolyfills(uaString, compression, hash);
      });
  }

  public hasEtag(eTag: string): boolean {
    return !!this.manifest.etags[eTag];
  }

  public modifiedSince(since: moment.MomentInput): boolean {
    return this.lastModifiedAsMoment.isAfter(since, 'second');
  }

  private generatePolyfills(uaString: string, compression: Compression, hash: string): Promise<PolyfillBuffer> {
    return svc
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
}
