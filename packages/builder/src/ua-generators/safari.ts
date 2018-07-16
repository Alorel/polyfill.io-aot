import {format} from 'util';
import {Versions} from './versions';

export = function* uaGenerator(): IterableIterator<string> {
  //tslint:disable-next-line:max-line-length
  const base = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/%s Safari/7046A194A';
  for (const v of Versions.safari.static) {
    yield format(base, v);
  }
  for (let i = Versions.safari.min; i <= Versions.safari.max; i++) {
    yield format(base, `${i}.0`);
  }
};
