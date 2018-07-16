import {md5Array} from '@polyfill-io-aot/common/src/fns/md5Hash';
import * as fs from 'fs-extra';
import noop = require('lodash/noop');
import {join} from 'path';
import {Features, getPolyfillString, Unknown} from 'polyfill-service';
import * as wp from 'workerpool';
import {reviver} from '../Serialiser';

const emptyHash: string = md5Array([]);

/** @internal */
export function generate(excludes: string[],
                         features$: string,
                         uaString: string,
                         unknown: Unknown,
                         outDir: string,
                         hash: string): Promise<void> {
  let polyStr$: Promise<string>;

  if (hash === emptyHash) {
    polyStr$ = Promise.resolve('');
  } else {
    const features: Features = JSON.parse(features$, reviver);
    polyStr$ = getPolyfillString({
      excludes,
      features,
      minify: false,
      uaString,
      unknown
    });
  }

  return polyStr$
    .then((polyStr: string) => fs.writeFile(join(outDir, `${hash}.js`), polyStr))
    .then(noop);
}

if (!wp.isMainThread) {
  wp.worker({generate});
}
