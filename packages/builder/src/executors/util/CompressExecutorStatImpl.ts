import CompressExecutor = require('../CompressExecutor');

//tslint:disable:max-classes-per-file
/** @internal */
export const BROTLI_COMPLETE = Symbol('Brotli Complete');
const BROTLI_TOTAL = Symbol('Brotli Total');
/** @internal */
export const ZOPFLI_COMPLETE = Symbol('Zopfli Complete');

/** @internal */
export class StatImpl implements CompressExecutor.Stat {
  public [BROTLI_COMPLETE] = 0;
  public [ZOPFLI_COMPLETE] = 0;
  private [BROTLI_TOTAL]: number;

  public constructor(numHashes: number) {
    this[BROTLI_TOTAL] = numHashes;
  }

  public get brotliComplete(): number {
    return this[BROTLI_COMPLETE];
  }

  public get brotliTotal(): number {
    return this[BROTLI_TOTAL];
  }

  public get complete(): number {
    return this.brotliComplete + this.zopfliComplete;
  }

  public get done(): boolean {
    return this.complete === this.total;
  }

  public get total(): number {
    return this.brotliTotal + this.zopfliTotal;
  }

  public get zopfliComplete(): number {
    return this[ZOPFLI_COMPLETE];
  }

  public get zopfliTotal(): number {
    return this.brotliTotal;
  }

  public toJSON() {
    const props: string[] = [
      'brotliComplete',
      'brotliTotal',
      'complete',
      'done',
      'total',
      'zopfliComplete',
      'zopfliTotal'
    ];
    const out: CompressExecutor.Stat = <any>{};

    for (const p of props) {
      out[p] = this[p];
    }

    return out;
  }

  public toString(): string {
    return [
      `br: [${this.brotliComplete}/${this.brotliTotal}]`,
      `gz: [${this.zopfliComplete}/${this.zopfliTotal}]`,
      `total: [${this.complete}/${this.total}]`
    ].join(' | ');
  }
}
