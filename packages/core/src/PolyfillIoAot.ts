import {DEFAULT_OUT_DIR} from '@polyfill-io-aot/common/src/constants/DEFAULT_OUT_DIR';
import {md5Object} from '@polyfill-io-aot/common/src/fns/md5Hash';
import {reducePolyfills} from '@polyfill-io-aot/common/src/fns/reducePolyfills';
import * as EventEmitter from 'events';
import {readFile, readFileSync} from 'fs-extra';
import * as brotli from 'iltorb';
import merge = require('lodash/merge');
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
  private get conf(): Readonly<PolyfillCoreConfig> {
    return this[$cfg];
  }

  @LazyGetter()
  private get features(): Readonly<svc.Features> {
    return Object.freeze(reducePolyfills(this.conf.polyfills));
  }

  @LazyGetter()
  private get manifest(): ReadonlyArray<string> {
    return Object.freeze(JSON.parse(readFileSync(join(this.conf.outDir, 'manifest.json'), 'utf8')));
  }

  public getPolyfills(uaString: string, compression: Compression = Compression.NONE): Promise<Buffer> {
    return svc
      .getPolyfills({
        excludes: this.conf.excludes,
        features: this.features,
        uaString
      })
      .then((polyfills: svc.GetPolyfillsResponse): Promise<Buffer> => {
        const hash: string = md5Object(polyfills);

        if (this.manifest.includes(hash)) {
          return readFile(join(this.conf.outDir, `${hash}.${compression.extension}`));
        }

        setImmediate(() => {
          this.emit(PolyfillIoAot.POLYFILL_NOT_FOUND, uaString, polyfills);
        });

        return this.generatePolyfills(uaString, compression);
      });
  }

  private generatePolyfills(uaString: string, compression: Compression): Promise<Buffer> {
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
      });
  }
}
