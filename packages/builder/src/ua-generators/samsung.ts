import {Versions} from './versions/index';

export = function* uaGenerator(): IterableIterator<string> {
  for (let major = Versions.samsung.min; major <= Versions.samsung.max; major++) {
    for (const minor of Versions.samsung.steps) {
      //tslint:disable-next-line:max-line-length
      yield `Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-N920C Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/${major}.${minor} Chrome/56.0.2924.87 Mobile Safari/537.36`;
    }
  }
};
