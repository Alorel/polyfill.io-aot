import range = require('lodash/range');
import {Versions} from './versions/index';

//tslint:disable:max-line-length

export = function* uaGenerator(): IterableIterator<string> {
  const ieRange: string[] = range(Versions.ie.ie.min, Versions.ie.ie.max)
    .map((v: number) => `${v}.0`)
    .concat(Versions.ie.ie.static);
  for (const i of ieRange) {
    yield `Mozilla/5.0 (Windows; U; MSIE ${i}; Windows NT 6.0; en-US)`;
  }

  for (const i of range(Versions.ie.edge.min, Versions.ie.edge.max)) {
    yield `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/${i}.0`;
  }
};
