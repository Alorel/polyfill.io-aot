import * as Bluebird from 'bluebird';
import {expect} from 'chai';
import {Stats} from 'fs';
import * as fs from 'fs-extra';
import * as iltorb from 'iltorb';
import {before, describe, it} from 'mocha';
import {join, resolve as resolve$} from 'path';
import * as tmp from 'tmp';
import * as zlib from 'zlib';
import {Executor} from '../../packages/builder/src/Executor';
import {BuildEvent} from '../../packages/builder/src/interfaces/BuildEvent';
import {PolyfillBuilder} from '../../packages/builder/src/PolyfillBuilder';
import {
  COMBO_HASH_UA_MAP,
  COMBO_HASHES,
  COMBO_MAP,
  COPY_DIRS,
  COPY_FILES,
  POLYFILLS_ROOT,
  USERAGENTS
} from '../../packages/builder/src/symbols';
import {Encoding, Hash, Manifest, ManifestEtag} from '../../packages/common';
import CompilePolyfillsExecutor = require('../../packages/builder/src/executors/CompilePolyfillsExecutor');
import CompressExecutor = require('../../packages/builder/src/executors/CompressExecutor');
import CopyExtraFilesExecutor = require('../../packages/builder/src/executors/CopyExtraFilesExecutor');
import CopySourceDirsExecutor = require('../../packages/builder/src/executors/CopySourceDirsExecutor');
import FormatSourceDirsExecutor = require('../../packages/builder/src/executors/FormatSourceDirsExecutor');
import GeneratePolyfillCombinations = require('../../packages/builder/src/executors/GeneratePolyfillCombinations');
import GenerateUserAgentsExecutor = require('../../packages/builder/src/executors/GenerateUserAgentsExecutor');
import UglifyExecutor = require('../../packages/builder/src/executors/UglifyExecutor');
import ValidateSourceDirsExecutor = require('../../packages/builder/src/executors/ValidateSourceDirsExecutor');
import WritePolyfillCombinationsExecutor = require('../../packages/builder/src/executors/WritePolyfillCombinationsExecutor');
import WriteManifestExecutor = require('../../packages/builder/src/executors/WriteManifestExecutor');
import isObject = require('lodash/isObject');

tmp.setGracefulCleanup();

//tslint:disable:max-file-line-count

interface ExecConstructor<T extends Executor> {
  new(builder: PolyfillBuilder): T;
}

describe('Executors', () => {
  let pb: PolyfillBuilder;
  let polyFixtureDir: string;
  let polyDirs: string[];
  let outDir: string;

  function mkTmpDir(): string {
    const opts: tmp.Options = {
      discardDescriptor: true,
      unsafeCleanup: true
    };

    return tmp.dirSync(opts).name;
  }

  function promisify<T extends Executor>(xc: ExecConstructor<T>, ok: BuildEvent): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const inst = new xc(pb);
      pb.once(ok, () => {
        pb.removeListener(BuildEvent.ERROR, reject);
        resolve(inst);
      });
      pb.once(BuildEvent.ERROR, reject);
      inst.start();
    });
  }

  before('init out dir', () => {
    outDir = mkTmpDir();
  });

  before('set fixture dir', () => {
    polyFixtureDir = resolve$(__dirname, '..', '_fixtures', 'extra-polys');
  });

  describe('FormatSourceDirsExecutor', () => {
    before('run', () => {
      pb = new PolyfillBuilder({
        brotli: {
          quality: 1
        },
        dirs: [polyFixtureDir],
        outDir,
        packageManager: 'yarn',
        polyfills: [
          'default-3.3'
        ],
        zopfli: {
          numiterations: 1
        }
      });

      return promisify(FormatSourceDirsExecutor, BuildEvent.FORMAT_DIRS_OK);
    });

    describe('Copy files', () => {
      for (const p of ['config.json', 'detect.js', 'polyfill.js', 'tests.js']) {
        const end = join('polyfill-builder-aot', p);

        it(`Should have ${end}`, () => {
          for (const f of pb[COPY_FILES]) {
            if (f.absolute.endsWith(end)) {
              return;
            }
          }

          expect.fail();
        });
      }
    });

    describe('Copy dirs', () => {
      it('Should not be empty', () => {
        expect(pb[COPY_DIRS].length).to.be.gt(0);
      });
    });
  });

  describe('WriteManifestExecutor', () => {
    it('Should finish', () => {
      return promisify(ValidateSourceDirsExecutor, BuildEvent.VALIDATE_DIRS_OK);
    });
  });

  describe('Copy executors', () => {
    let root: string;

    before('Set root', () => {
      root = join(polyFixtureDir, 'polyfill-builder-aot');
    });

    describe('CopySourceDirsExecutor', () => {
      before('Determine extra dirs', () => {
        return Bluebird.resolve(fs.readdir(root))
          .filter((f: string) => !f.endsWith('.js') && !f.endsWith('.json'))
          .then((d: string[]) => {
            polyDirs = d;
          });
      });

      before('run', () => {
        return promisify(CopySourceDirsExecutor, BuildEvent.COPY_EXTRA_DIRS_OK);
      });

      it('Dirs should exist', () => {
        return Bluebird
          .map(polyDirs, (dir$: string) => {
            return fs.stat(join(pb[POLYFILLS_ROOT], 'polyfill-builder-aot', dir$))
              .then(s => {
                if (!s.isDirectory()) {
                  throw new Error(`${dir$} is not a dir`);
                }
              });
          });
      });
    });

    describe('CopyExtraFilesExecutor', () => {
      before('run', () => {
        return promisify(CopyExtraFilesExecutor, BuildEvent.COPY_EXTRA_FILES_OK);
      });

      for (const p of ['config.json', 'detect.js', 'polyfill.js', 'tests.js']) {
        it(`Should have ${p}`, () => {
          const fp = join(pb[POLYFILLS_ROOT], 'polyfill-builder-aot', p);

          return fs.stat(fp)
            .then(s => {
              if (s.isDirectory()) {
                throw new Error(`${p} is a directory`);
              }
            });
        });
      }
    });
  });

  describe('CompilePolyfillsExecutor', () => {
    before('run', () => {
      return promisify(CompilePolyfillsExecutor, BuildEvent.COMPILE_POLYFILLS_OK);
    });

    it('Should have all dist poly dirs compiled', () => {
      return Bluebird
        .map(polyDirs, (dir$: string) => join('polyfill-builder-aot', dir$).replace(/[\\/]/g, '.'))
        .then((dirs: string[]) => dirs.concat('polyfill-builder-aot'))
        .map((dir$: string) => join(pb[POLYFILLS_ROOT], '__dist', dir$))
        .map((dir$: string) => {
          return fs.stat(dir$)
            .then(s => {
              if (!s.isDirectory()) {
                throw new Error(`${dir$} is not a dir`);
              }
            });
        });
    });
  });

  describe('GenerateUserAgentsExecutor', () => {
    before('run', () => {
      return promisify(GenerateUserAgentsExecutor, BuildEvent.GENERATE_UAS_ALL_OK);
    });

    it('should result in a non-empty array', () => {
      expect(pb[USERAGENTS].length).to.be.gt(0);
    });

    it('array should be unique', () => {
      const found: string[] = [];
      for (const ua of pb[USERAGENTS]) {
        if (found.includes(ua)) {
          throw new Error(`${ua} has a duplicate`);
        }
        found.push(ua);
      }
    });
  });

  describe('GeneratePolyfillCombinations', () => {
    before('run', () => {
      return promisify(GeneratePolyfillCombinations, BuildEvent.GENERATE_COMBO_ALL_OK);
    });

    it('Should have a non-empty hash array', () => {
      expect(pb[COMBO_HASHES].length).to.be.gt(0);
    });

    it('Map size should eq hash size', () => {
      const map: Map<any, any> = pb[COMBO_MAP];
      expect(map.size).to.eq(pb[COMBO_HASHES].length);
    });

    it('hash UA map should eq hash size', () => {
      expect(Object.keys(pb[COMBO_HASH_UA_MAP]).length).to.eq(pb[COMBO_HASHES].length);
    });
  });

  describe('WritePolyfillCombinationsExecutor', () => {
    it('Dir should be empty at first', () => {
      return fs.readdir(outDir)
        .then((i: string[]) => {
          expect(i.length).to.eq(0);
        });
    });

    describe('Inner', () => {
      before('run', () => {
        return promisify(WritePolyfillCombinationsExecutor, BuildEvent.GENERATE_BUNDLES_OK);
      });

      it('Dir should no longer be empty', () => {
        return fs.readdir(outDir)
          .then((i: string[]) => {
            expect(i.length).to.eq(pb[COMBO_HASHES].length);
          });
      });
    });
  });

  describe('Uglify executor', () => {
    let initialSize: number;

    const getSize = (): Bluebird<number> => {
      return Bluebird.resolve(fs.readdir(outDir))
        .map((f: string) => fs.stat(join(outDir, f)))
        .map((s: Stats) => s.size)
        .reduce((acc: number, size: number): number => acc + size, 0);
    };

    before('calculate initial size', () => {
      return getSize().then((s: number) => {
        initialSize = s;
      });
    });

    before('run', () => {
      return promisify(UglifyExecutor, BuildEvent.UGLIFY_ALL_OK);
    });

    it('New size should be lower than old size', () => {
      return getSize().then(s => {
        expect(s).to.be.lt(initialSize);
      });
    });
  });

  describe('CompressExecutor', () => {
    before('run', () => {
      return promisify(CompressExecutor, BuildEvent.COMPRESS_ALL_OK);
    });

    it('Gz file contents should ungzip to the same contents', () => {
      return Bluebird.map(pb[COMBO_HASHES], (hash: string) => {
        return fs.readFile(join(outDir, `${hash}.js`), 'utf8')
          .then((original: string) => {
            return fs.readFile(join(outDir, `${hash}.js.gz`))
              .then((buf: Buffer) => new Promise((resolve, reject) => {
                zlib.gunzip(buf, (e, result) => {
                  if (e) {
                    reject(e);
                  } else {
                    resolve(result.toString());
                  }
                });
              }))
              .then((result: string) => {
                expect(result).to.eq(original);
              });
          });
      });
    });

    it('Br file contents should decompress to the same contents', () => {
      return Bluebird.map(pb[COMBO_HASHES], (hash: string) => {
        return fs.readFile(join(outDir, `${hash}.js`), 'utf8')
          .then((original: string) => {
            return fs.readFile(join(outDir, `${hash}.js.br`))
              .then((buf: Buffer) => new Promise((resolve, reject) => {
                iltorb.decompress(buf, (e, result) => {
                  if (e) {
                    reject(e);
                  } else {
                    resolve(result.toString());
                  }
                });
              }))
              .then((result: string) => {
                expect(result).to.eq(original);
              });
          });
      });
    });
  });

  describe('WriteManifestExecutor', () => {
    let manifestContents: Manifest;

    before('run', () => {
      return promisify(WriteManifestExecutor, BuildEvent.WRITE_MANIFEST_OK);
    });

    before('parse', () => {
      return fs.readFile(join(outDir, 'manifest.json.gz'))
        .then(zlib.unzipSync)
        .then(b => {
          manifestContents = JSON.parse(b.toString());
        });
    });

    it('Should have a valid last-modified', () => {
      expect(manifestContents.lastModified).to
        .match(/^[A-Z][a-z]{2},\s\d{2}\s[A-Z][a-z]{2}\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT$/);
    });

    it('Should have a hashes object', () => {
      expect(isObject(manifestContents.hashes)).to.eq(true);
    });

    it('Should have an etags object', () => {
      expect(isObject(manifestContents.etags)).to.eq(true);
    });

    describe('etags', () => {
      let tag: ManifestEtag;

      before('init etag', () => {
        tag = manifestContents.etags[Object.keys(manifestContents.etags)[0]];
      });

      it('Should have a hash', () => {
        expect(tag.hash).to.match(/^[a-z\d]{32}$/gi);
      });

      it('Should have an encoding', () => {
        const e = tag.encoding;
        expect(e === Encoding.RAW || e === Encoding.GZIP || e === Encoding.BROTLI)
          .to.eq(true);
      });
    });

    describe('Hashes', () => {
      let hash: Hash;

      before('init hash', () => {
        hash = manifestContents.hashes[Object.keys(manifestContents.hashes)[0]];
      });

      it('Should have a br key', () => {
        expect(hash).to.haveOwnProperty('br');
      });

      it('Should have a gz key', () => {
        expect(hash).to.haveOwnProperty('gz');
      });

      it('Should have a raw key', () => {
        expect(hash).to.haveOwnProperty('raw');
      });

      for (const k of ['raw', 'br', 'gz']) {
        describe(k, () => {
          it('Should have a string etag value', () => {
            expect(typeof hash[k].etag).to.eq('string');
          });
        });
      }
    });
  });
});
