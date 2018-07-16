import * as Bluebird from 'bluebird';
import {expect} from 'chai';
import * as iltorb from 'iltorb';
import {before, describe, it} from 'mocha';
import * as tmp from 'tmp';
import * as zlib from 'zlib';
import {PolyfillBuilder, PolyfillBuilderConfig} from '../../packages/builder';
import {Compression, PolyfillIoAot} from '../../packages/core';

tmp.setGracefulCleanup();

//tslint:disable:no-unused-expression

describe('core.PolyfillIoAot', () => {
  let outDir: string;
  let aot: PolyfillIoAot;
  const unknownUas: Set<string> = new Set<string>();
  const polyfills = ['default'];
  const ua = 'Mozilla/5.0 (Windows; U; MSIE 8; Windows NT 6.0; en-US)';

  function mkTmpDir(): string {
    const opts: tmp.Options = {
      discardDescriptor: true,
      unsafeCleanup: true
    };

    return tmp.dirSync(opts).name;
  }

  class AotPatched extends PolyfillIoAot {

    public emit(evt: string, ua$: string): boolean {
      if (evt === PolyfillIoAot.POLYFILL_NOT_FOUND) {
        unknownUas.add(ua$);
      }

      return (<any>super.emit)(...arguments);
    }
  }

  before('init out dir', () => {
    outDir = mkTmpDir();
  });

  before('Init core', () => {
    aot = new AotPatched({outDir, polyfills});
  });

  before('run builder', () => {
    const conf: Partial<PolyfillBuilderConfig> = {
      outDir,
      packageManager: 'yarn',
      polyfills
    };

    return new PolyfillBuilder(conf).start();
  });

  describe('Get known UA polyfill string', () => {
    let none: Buffer;
    let noneStr: string;
    let gzip: Buffer;
    let brotli: Buffer;

    function makeDecompressCallback(cb: any) {
      return (error: Error, result: Buffer) => {
        if (error) {
          cb(error);
        } else {
          try {
            expect(result.toString('utf8')).to.eq(noneStr);
            cb();
          } catch (e) {
            cb(e);
          }
        }
      };
    }

    describe('Compression.NONE', () => {
      before(() => {
        return Bluebird.resolve(aot.getPolyfills(ua))
          .then((ret: Buffer) => {
            none = ret;
            noneStr = ret.toString('utf8');
          })
          .then(() => Bluebird.delay(100));
      });

      it('Should default to NONE if not provided', () => {
        return aot.getPolyfills(ua, Compression.NONE)
          .then(b => {
            expect(b.toString('utf8')).to.eq(noneStr);
          });
      });

      it('UA hash should be found', () => {
        expect(unknownUas.size).to.eq(0);
      });
    });

    describe('Compression.GZIP', () => {
      before('run', () => {
        return aot.getPolyfills(ua, Compression.GZIP)
          .then(r => {
            gzip = r;
          });
      });

      it('Should be smaller in size than uncompressed', () => {
        //tslint:disable-next-line:no-magic-numbers
        expect(gzip.length === 20 || gzip.length < none.length).to.eq(true);
      });

      it('Contents should be equal', (cb: any) => {
        zlib.unzip(gzip, makeDecompressCallback(cb));
      });
    });

    describe('Compression.BROTLI', () => {
      before('run', () => {
        return aot.getPolyfills(ua, Compression.BROTLI)
          .then(r => {
            brotli = r;
          });
      });

      it('Should be smaller in size than gzip', () => {
        expect(brotli.length).to.be.lt(gzip.length);
      });

      it('Contents should be equal', (cb: any) => {
        iltorb.decompress(brotli, makeDecompressCallback(cb));
      });
    });
  });

  describe('Get unknown UA polyfill string', () => {
    //tslint:disable-next-line:max-line-length
    let out: Buffer;
    let gzip: Buffer;
    let aot$: AotPatched;

    before('run', () => {
      aot$ = new AotPatched({outDir, polyfills});
      Object.defineProperty(aot$, 'manifest', {
        value: []
      });

      return Bluebird.resolve(aot$.getPolyfills(ua))
        .then((buf: Buffer) => {
          out = buf;

          return Bluebird.delay(100);
        });
    });

    it('Should return a non-empty buffer', () => {
      expect(out.length).to.be.gt(10);
    });

    it('Should emit an event', () => {
      expect(unknownUas.has(ua)).to.eq(true);
    });

    it('Gzip should be smaller in size than uncompressed', () => {
      return aot$.getPolyfills(ua, Compression.GZIP)
        .then(b => {
          gzip = b;
          expect(b.length).to.be.lt(out.length);
        });
    });

    it('Brotli should be smaller in size than gzip', () => {
      return aot$.getPolyfills(ua, Compression.BROTLI)
        .then(b => {
          expect(b.length).to.be.lt(gzip.length);
        });
    });
  });
});
