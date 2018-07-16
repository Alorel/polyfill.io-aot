import {Versions} from './versions/index';

export = function* uaGenerator(): IterableIterator<string> {
  for (let i = Versions.chrome.min; i <= Versions.chrome.max; i++) {
    yield `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${i}.0.0 Safari/537.36`;
  }
};
