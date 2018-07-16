import {Versions} from './versions/index';

export = function* uaGenerator(): IterableIterator<string> {
  yield* Versions.opMob.static.map((v: string) => {
    return `MOpera/9.80 (S60; SymbOS; Opera Mobi/1181; U; en-GB) Presto/2.5.28 Version/${v}`;
  });
};
