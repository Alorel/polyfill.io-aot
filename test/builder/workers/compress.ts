import {expect} from 'chai';
import * as fs from 'fs-extra';
import * as iltorb from 'iltorb';
import {before, describe, it} from 'mocha';
import {join} from 'path';
import * as tmp from 'tmp';
import * as zlib from 'zlib';
import {brotli, gzip} from '../../../packages/builder/src/workers/compress';

tmp.setGracefulCleanup();

describe('Builder.workers.compress', () => {
  let dir: string;

  before(() => {
    dir = tmp.dirSync().name;
  });

  before(() => fs.writeFile(join(dir, 'foo.js'), 'alert(1);'));

  describe('Gzip', () => {
    before(() => {
      return gzip(dir, 'foo', {
        blocksplitting: true,
        numiterations: 1
      });
    });

    it('Should have the same contents', () => {
      return fs.readFile(join(dir, 'foo.js.gz'))
        .then((buf: Buffer) => new Promise((resolve, reject) => {
          zlib.gunzip(buf, (e, res) => {
            if (e) {
              reject(e);
            } else {
              resolve(res.toString());
            }
          });
        }))
        .then((res: string) => {
          expect(res).to.eq('alert(1);');
        });
    });
  });

  describe('Brotli', () => {
    before(() => {
      return brotli(dir, 'foo', {quality: 1});
    });

    it('Should have the same contents', () => {
      return fs.readFile(join(dir, 'foo.js.br'))
        .then((buf: Buffer) => new Promise((resolve, reject) => {
          iltorb.decompress(buf, ((err, output) => {
            if (err) {
              reject(err);
            } else {
              resolve(output.toString());
            }
          }));
        }))
        .then((res: string) => {
          expect(res).to.eq('alert(1);');
        });
    });
  });
});
