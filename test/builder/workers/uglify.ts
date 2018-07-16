import {expect} from 'chai';
import * as fs from 'fs-extra';
import {before, describe, it} from 'mocha';
import {join} from 'path';
import * as tmp from 'tmp';
import {uglify} from '../../../packages/builder/src/workers/uglify-js';

tmp.setGracefulCleanup();

describe('Builder.workers.uglify', () => {
  let dir: string;

  before(() => {
    dir = tmp.dirSync().name;
  });

  before(() => fs.writeFile(join(dir, 'foo.js'), 'alert ( 1 ) ;'));

  before(() => uglify('foo', dir));

  it('Should minify the file', () => {
    return fs.readFile(join(dir, 'foo.js'), 'utf8')
      .then((c: string) => {
        expect(c).to.eq('alert(1);');
      });
  });
});
