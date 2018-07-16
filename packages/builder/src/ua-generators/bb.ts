import {Versions} from './versions/index';

export = function* uaGenerator(): IterableIterator<string> {
  yield* Versions.bb;
};
