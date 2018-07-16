import {expect} from 'chai';
import {describe, it} from 'mocha';
import {md5Array, md5Object, md5String} from '../../../packages/common/src/fns/md5Hash';

describe('common.md5Hash', () => {
  describe('string', () => {
    it('Should produce 32 chars', () => {
      expect(md5String('foo')).to.eq('acbd18db4cc2f85cedef654fccc4a4d8');
    });
  });

  describe('md5Array', () => {
    it('Should sort sliced array by default', () => {
      const arr = ['1', '0'];
      const h = md5Array(arr);

      expect(h).to.eq('eb5298c8c74ac15494c9c7b69694ccd5', 'hash');
      expect(arr).to.deep.eq(['1', '0']);
    });

    it('Can work on same array', () => {
      const arr = ['1', '0'];
      const h = md5Array(arr, false);

      expect(h).to.eq('eb5298c8c74ac15494c9c7b69694ccd5', 'hash');
      expect(arr).to.deep.eq(['0', '1']);
    });
  });

  it('md5Object', () => {
    const o = {b: 1, a: 1};
    const h = md5Object(o);
    expect(h).to.eq('e53f04d1bcc1428d9e8db9a93578c5eb');
  });
});
