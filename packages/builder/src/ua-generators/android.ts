import {Versions} from './versions/index';

//tslint:disable:max-line-length

export = function* uaGenerator(): IterableIterator<string> {
  for (const v of Versions.android) {
    yield `Mozilla/5.0 (Linux; U; Android ${v}; en-us; T-Mobile myTouch 3G Slide Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`;
  }
};
