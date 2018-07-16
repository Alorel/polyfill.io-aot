#!/usr/bin/env node

import {PolyfillBuilder, PolyfillBuilderConfig} from '@polyfill-io-aot/builder';
import {args} from '@polyfill-io-aot/builder-cli/src/args';
import {baseOptNames} from '@polyfill-io-aot/builder-cli/src/optnames';
import pick = require('lodash/pick');

const finalCfg: Partial<PolyfillBuilderConfig> = args.json || args.config || ((): Partial<PolyfillBuilderConfig> => {
  const out: Partial<PolyfillBuilderConfig> = <any>pick(args, <string[]>baseOptNames);

  if (args.out) {
    out.outDir = args.out;
  }
  if (args.pkg) {
    out.packageManager = args.pkg;
  }

  return out;
})();

new PolyfillBuilder(finalCfg).start()
  .catch((e: Error) => {
    console.error(e.stack);
    process.exit(1);
  });
