import {expect} from 'chai';
import {beforeEach, describe, it} from 'mocha';
import {
  BROTLI_COMPLETE,
  StatImpl,
  ZOPFLI_COMPLETE
} from '../../../../packages/builder/src/executors/util/CompressExecutorStatImpl';
import CompressExecutor = require('../../../../packages/builder/src/executors/CompressExecutor');

//tslint:disable:no-magic-numbers

describe('CompressExecutorStatImpl', () => {
  let stat: StatImpl;

  beforeEach('init', () => {
    stat = new StatImpl(100);
    stat[BROTLI_COMPLETE] += 10;
    stat[ZOPFLI_COMPLETE] += 10;
  });

  it('toJSON', () => {
    const j: CompressExecutor.Stat = stat.toJSON();
    const expected: Partial<CompressExecutor.Stat> = {
      brotliComplete: 10,
      brotliTotal: 100,
      complete: 20,
      done: false,
      total: 200,
      zopfliComplete: 10,
      zopfliTotal: 100
    };

    expect(j).to.deep.eq(expected);
  });

  it('toString', () => {
    const xp = 'br: [10/100] | gz: [10/100] | total: [20/200]';

    expect(stat.toString()).to.eq(xp);
  });
});
