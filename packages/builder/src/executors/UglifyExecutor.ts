import * as Bluebird from 'bluebird';
import noop = require('lodash/noop');
import {BuildEvent} from '../interfaces/BuildEvent';
import {PoolExecutor} from '../PoolExecutor';
import {COMBO_HASHES} from '../symbols';

/** @internal */
class UglifyExecutor extends PoolExecutor {

  private _complete: number;
  private _total: number;

  private get _pct(): number {
    return Math.round(this._complete / this._total * 100);
  }

  private get _progressText(): string {
    return `Minifying compiled bundles: ${this._complete}/${this._total} [${this._pct}%]`;
  }

  protected execute(): void {
    this.emit(BuildEvent.UGLIFY_ALL_BEGIN);
    this._total = this.builder[COMBO_HASHES].length;
    this._complete = 0;
    this._ora.start('Minifying compiled bundles');
    this._initPool(require.resolve('../workers/uglify-js'));
    let te: Error;

    Bluebird
      .map(this.builder[COMBO_HASHES], (hash: string) => {
        this.emit(BuildEvent.UGLIFY_ONE_BEGIN, hash);

        return this._wrap(this._pool.exec('uglify', [hash, this.conf.outDir]))
          .then(() => {
            this._inc().emit(BuildEvent.UGLIFY_ONE_OK, hash);
          })
          .catch((e: Error) => {
            this.emit(BuildEvent.UGLIFY_ONE_ERR, hash, e);

            throw e;
          });
      })
      .then(
        () => {
          this.emit(BuildEvent.UGLIFY_ALL_OK);
          if (te) {
            this._ora.warn(`Uglified ${this._complete} bundles with warning: ${this.formatError(te)}`);
          } else {
            this._ora.succeed(`Uglified ${this._complete} bundles`);
          }
        },
        (e: Error) => {
          this._ora.fail(`Failed to uglify bundles: ${this.formatError(e)}`);
          this.onError(e);
        }
      )
      .finally(() => {
        this._terminate().catch(noop);
      });
  }

  private _inc(): this {
    this._complete++;
    this._ora.text = this._progressText;

    return this;
  }
}

export = UglifyExecutor;
