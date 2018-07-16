import {md5Object} from '@polyfill-io-aot/common/src/fns/md5Hash';
import {reducePolyfills} from '@polyfill-io-aot/common/src/fns/reducePolyfills';
import * as Bluebird from 'bluebird';
import {Features, getPolyfills, GetPolyfillsResponse} from 'polyfill-service';
import {Executor} from '../Executor';
import {BuildEvent} from '../interfaces/BuildEvent';
import {COMBO_HASH_UA_MAP, COMBO_HASHES, COMBO_MAP, USERAGENTS} from '../symbols';

/** @internal */
class GeneratePolyfillCombinations extends Executor {

  protected execute(): void {
    this._ora.start('Generating polyfill combinations');
    const outMap = new Map<string, GetPolyfillsResponse>();
    const features: Features = reducePolyfills(this.conf.polyfills, this.conf.flags || []);
    const hashes: string[] = [];
    const uaMap: { [k: string]: string } = {};
    this.emit(BuildEvent.GENERATE_COMBO_ALL_BEGIN);

    Bluebird
      .map(this.builder[USERAGENTS], (uaString: string): Promise<void> => {
        return this.map(uaString, features, hashes, outMap, uaMap);
      })
      .then(() => {
        this.builder[COMBO_HASHES] = hashes;
        this.builder[COMBO_MAP] = outMap;
        this.builder[COMBO_HASH_UA_MAP] = uaMap;
      })
      .then(
        () => {
          this._ora.succeed('Generated polyfill combinations');
          this.emit(BuildEvent.GENERATE_COMBO_ALL_OK);
        },
        (e: Error) => {
          this._ora.fail(`Error generating polyfill combinations: ${this.formatError(e)}`);
          this.onError(e);
        }
      );
  }

  private map(uaString: string,
              features: Features,
              hashes: string[],
              outMap: Map<string, GetPolyfillsResponse>,
              uaMap: { [k: string]: string }): Promise<void> {
    this.emit(BuildEvent.GENERATE_COMBO_UA_BEGIN, uaString);
    const p$: Promise<GetPolyfillsResponse> = getPolyfills({
      excludes: this.conf.excludes,
      features,
      uaString
    });

    return p$
      .then((obj: GetPolyfillsResponse) => {
        const hash: string = md5Object(obj);

        if (!outMap.has(hash)) {
          outMap.set(hash, obj);
          hashes.push(hash);
          uaMap[hash] = uaString;
        }

        this._ora.text = `Generated combinations for ${uaString}`;
        this.emit(BuildEvent.GENERATE_COMBO_UA_OK, uaString);
      })
      .catch((e: Error) => {
        this.emit(BuildEvent.GENERATE_COMBO_UA_ERR, uaString, e);

        throw e;
      });
  }
}

export = GeneratePolyfillCombinations;
