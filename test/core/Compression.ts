import {expect} from 'chai';
import {before, describe, it} from 'mocha';
import {Compression} from '../../packages/core';

//tslint:disable:no-unused-expression

describe('core.Compression', () => {
  it('Should be frozen', () => {
    expect(Compression).to.be.frozen;
  });

  it('BROTLI should have the extension js.br', () => {
    expect(Compression.BROTLI.extension).to.eq('js.br');
  });

  it('GZIP should have the extension js.gz', () => {
    expect(Compression.GZIP.extension).to.eq('js.gz');
  });

  it('NONE should have the extension js', () => {
    expect(Compression.NONE.extension).to.eq('js');
  });

  describe('Extension descriptor', () => {
    let desc: PropertyDescriptor;

    before(() => {
      desc = Object.getOwnPropertyDescriptor(Compression.NONE, 'extension');
    });

    it('Should not be configurable', () => {
      expect(desc.configurable).to.be.false;
    });

    it('Should be enumerable', () => {
      expect(desc.enumerable).to.be.true;
    });

    it('Should not be writable', () => {
      expect(desc.writable).to.be.false;
    });
  });
});
