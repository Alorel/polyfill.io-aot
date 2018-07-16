import * as Bluebird from 'bluebird';
import noop = require('lodash/noop');
import {BuildEvent} from '../interfaces/BuildEvent';
import {PoolExecutor} from '../PoolExecutor';
import {COMBO_HASHES} from '../symbols';
import {BROTLI_COMPLETE, StatImpl, ZOPFLI_COMPLETE} from './util/CompressExecutorStatImpl';

//tslint:disable:no-namespace
const STAT = Symbol('Stat');

/** @internal */
class CompressExecutor extends PoolExecutor {

  /** @internal */
  private [STAT]: StatImpl;

  protected execute(): void {
    this._ora.start('Compressing polyfill bundles');
    this._initPool(require.resolve('../workers/compress'));
    this[STAT] = new StatImpl(this.builder[COMBO_HASHES].length);
    this.emit(BuildEvent.COMPRESS_ALL_BEGIN, this[STAT]);
    let te: Error;

    Bluebird
      .map(this.builder[COMBO_HASHES], (hash: string) => {
        return Bluebird.all([this.makeZopfli(hash), this.makeBrotli(hash)])
          .then(noop);
      })
      .then(
        () => {
          if (te) {
            this._ora.warn(`Polyfill bundles compressed with warning: ${this.formatError(te)}`);
          } else {
            this._ora.succeed('Polyfill bundles compressed');
          }
          this.emit(BuildEvent.COMPRESS_ALL_OK, this[STAT]);
        },
        (e: Error) => {
          this._ora.fail(`Failed to compress polyfill bundles: ${this.formatError(e)}`);
          this.onError(e);
        }
      )
      .finally(() => {
        this._terminate().catch(noop);
      });
  }

  private makeBrotli(hash: string): Bluebird<void> {
    return this
      ._wrap(this._pool.exec('brotli', [
        this.conf.outDir,
        hash,
        this.conf.brotli
      ]))
      .then(() => {
        this[STAT][BROTLI_COMPLETE]++;
        this._ora.text = this[STAT].toString();
        this.emit(BuildEvent.COMPRESS_BROTLI_OK, this[STAT]);
      })
      .catch((e: Error) => {
        this.emit(BuildEvent.COMPRESS_BROTLI_ERR, hash, e);
        throw e;
      });
  }

  private makeZopfli(hash: string): Bluebird<void> {
    return this
      ._wrap(this._pool.exec('gzip', [
        this.conf.outDir,
        hash,
        this.conf.zopfli
      ]))
      .then(() => {
        this[STAT][ZOPFLI_COMPLETE]++;
        this._ora.text = this[STAT].toString();
        this.emit(BuildEvent.COMPRESS_ZOPFLI_OK, this[STAT]);
      })
      .catch((e: Error) => {
        this.emit(BuildEvent.COMPRESS_ZOPFLI_ERR, hash, e);
        throw e;
      });
  }
}

/** @internal */
module CompressExecutor {
  export interface Stat {
    readonly brotliComplete: number;
    readonly brotliTotal: number;
    readonly complete: number;
    readonly done: boolean;
    readonly total: number;
    readonly zopfliComplete: number;
    readonly zopfliTotal: number;

    toJSON(): Stat;

    toString(): string;
  }
}

/** @internal */
export = CompressExecutor;
