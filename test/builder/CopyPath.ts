import {expect} from 'chai';
import {before, describe, it} from 'mocha';
import {CopyPath} from '../../packages/builder/src/CopyPath';

describe('Builder.CopyPath', () => {
  let cp: CopyPath;

  before(() => {
    cp = new CopyPath('/foo/bar/qux/baz', '/foo/bar');
  });

  it('toString() should return absolute path', () => {
    expect(cp.toString()).to.eq('/foo/bar/qux/baz');
  });

  it('Should return a correct relative path', () => {
    expect(cp.relative).to.eq('qux/baz');
  });
});
