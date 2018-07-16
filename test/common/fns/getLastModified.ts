import {getLastModified} from '@polyfill-io-aot/common';
import {expect} from 'chai';
import {describe, it} from 'mocha';
import * as m from 'moment-timezone';

describe('common.getLastModified', () => {
  const rg = /^[A-Z][a-z]{2},\s\d{2}\s[A-Z][a-z]{2}\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT$/;

  it('Should have a valid regex by default', () => {
    expect(getLastModified()).to.match(rg);
  });

  it('Should have a valid regex with a date', () => {
    expect(getLastModified(new Date())).to.match(rg);
  });

  it('Should have a valid regex with moment', () => {
    expect(getLastModified(m())).to.match(rg);
  });

  it('Should have a valid regex with string', () => {
    expect(getLastModified('2000-01-01')).to.match(rg);
  });
});
