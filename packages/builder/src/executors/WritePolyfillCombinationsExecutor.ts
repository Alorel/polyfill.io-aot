import * as Bluebird from 'bluebird';
import * as fs from 'fs-extra';
import noop = require('lodash/noop');
import {BuildEvent} from '../interfaces/BuildEvent';
import {PoolExecutor} from '../PoolExecutor';
import {replacer} from '../Serialiser';
import {COMBO_HASH_UA_MAP, COMBO_HASHES, COMBO_MAP} from '../symbols';

/** @internal */
class WritePolyfillCombinationsExecutor extends PoolExecutor {

  protected execute(): void {
    this._ora.start(`Creating empty output dir ${this.conf.outDir}`);

    Bluebird.resolve(fs.emptyDir(this.conf.outDir))
      .then(() => {
        this._initPool(require.resolve('../workers/polyfill-string-generator'));
        this._ora.text = 'Generating bundles';

        return this.builder[COMBO_HASHES];
      })
      .map(this.mapper.bind(this))
      .then(
        () => {
          this.emit(BuildEvent.GENERATE_BUNDLES_OK);
          this._ora.succeed('Bundles generated');
        },
        (e: Error) => {
          this._ora.fail(`Failed to generate bundles: ${this.formatError(e)}`);
          this.onError(e);
        }
      )
      .finally(() => {
        this._terminate().catch(noop);
      });
  }

  private mapper(hash: string): Bluebird<void> {
    const uaString: string = this.builder[COMBO_HASH_UA_MAP][hash];
    this.emit(BuildEvent.GENERATE_BUNDLE_BEGIN, uaString);

    return this
      ._wrap(this._pool.exec('generate', [
        this.conf.excludes,
        JSON.stringify(this.builder[COMBO_MAP].get(hash), replacer),
        this.builder[COMBO_HASH_UA_MAP][hash],
        this.conf.unknown,
        this.conf.outDir,
        hash
      ]))
      .then(() => {
        this.emit(BuildEvent.GENERATE_BUNDLE_OK, uaString);
        this._ora.text = `Generated bundle for ${uaString}`;
      })
      .catch((e: Error) => {
        this.emit(BuildEvent.GENERATE_BUNDLE_ERR, uaString, e);

        throw e;
      });
  }
}

export = WritePolyfillCombinationsExecutor;
