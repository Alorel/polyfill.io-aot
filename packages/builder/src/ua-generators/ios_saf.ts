import {format} from 'util';
import {Versions} from './versions';

export = function* uaGenerator(): IterableIterator<string> {
  //tslint:disable-next-line:max-line-length
  const base = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/%s Mobile/15A356 Safari/604.1';

  for (const v of Versions.safari.static) {
    yield format(base, v);
  }
  for (let i = Versions.safari.min; i <= Versions.safari.max; i++) {
    yield format(base, `${i}.0`);
  }
};
