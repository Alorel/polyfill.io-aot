import {format} from 'util';
import {Versions} from '../versions';

/** @internal */
export function safariCommonGenerator(base: string): () => IterableIterator<string> {
  return function* uaGenerator(): IterableIterator<string> {
    for (const v of Versions.safari.static) {
      yield format(base, v);
    }
    for (let i = Versions.safari.min; i <= Versions.safari.max; i++) {
      yield format(base, `${i}.0`);
    }
  };
}
