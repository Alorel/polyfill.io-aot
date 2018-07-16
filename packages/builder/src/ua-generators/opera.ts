import range = require('lodash/range');
import {Versions} from './versions/index';

export = function* uaGenerator(): IterableIterator<string> {
  yield* Versions.opMob.static
    .concat(range(Versions.opera.min, Versions.opera.max).map((v: number): string => `${v}.0`))
    .map((v: string): string => `Opera/${v} (Linux ppc64 ; U; en) Presto/2.2.1`);
};
