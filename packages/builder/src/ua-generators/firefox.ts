import {Versions} from './versions';

export = function* uaGenerator(): IterableIterator<string> {
  for (let i = Versions.firefox.min; i <= Versions.firefox.max; i++) {
    yield `Mozilla/5.0 (X11; Linux i586; rv:${i}.0) Gecko/20100101 Firefox/${i}.0`;
  }
};
