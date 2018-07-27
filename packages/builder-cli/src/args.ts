import {PackageManager, PartialPolyfillBuilderConfig} from '@polyfill-io-aot/builder';
import {optnames} from '@polyfill-io-aot/builder-cli/src/optnames';
import {Omit} from '@polyfill-io-aot/builder/src/interfaces/Omit';
import {readFileSync} from 'fs';
import * as JSON5 from 'json5';
import {join} from 'path';
import * as yargs from 'yargs';

export type OmittedProps = 'uaGenerators' | 'outDir' | 'packageManager';

export type CLIPolyfillBuilderConfig = Omit<PartialPolyfillBuilderConfig, OmittedProps> & {
  /** Maps to outDir */
  out?: string;
  /** Maps to packageManager */
  pkg?: PackageManager;
};

export type Args = CLIPolyfillBuilderConfig & {
  /** Path to config file */
  config?: PartialPolyfillBuilderConfig;
  /** Inline JSON5 config */
  json?: CLIPolyfillBuilderConfig;
};

const json5Parse = (v: string): any => JSON5.parse(v);

export const args: Args = <any>yargs
  .option('brotli', {
    alias: 'b',
    coerce: json5Parse,
    defaultDescription: '{quality: 11}',
    desc: 'Options to pass to the iltorb module (JSON5).',
    string: true
  })
  .option('dirs', {
    alias: 'd',
    array: true,
    defaultDescription: '[]',
    desc: 'Additional directories containing your own polyfills in the polyfill-service format.'
  })
  .option('excludes', {
    alias: 'e',
    array: true,
    defaultDescription: '[]',
    description: 'Array of polyfills to exclude from the final bundle.'
  })
  .option('flags', {
    alias: 'f',
    array: true,
    choices: ['gated', 'always'],
    defaultDescription: '[]',
    desc: 'Flags to pass to polyfill-service when generating bundles.'
  })
  .option('out', {
    alias: 'o',
    defaultDescription: '~/.polyfill-io-aot/.polyfills',
    desc: 'Output directory',
    string: true
  })
  .option('pkg', {
    alias: 'k',
    choices: ['npm', 'yarn'],
    defaultDescription: 'npm',
    desc: 'The package manager to use when spawning processes.',
    string: true
  })
  .option('processes', {
    alias: 'r',
    defaultDescription: 'Math.max(1, NUM_CPU_CORES - 1)',
    desc: 'Number of processes to spawn for compression and polyfill bundle generation.',
    number: true
  })
  .option('polyfills', {
    alias: 'p',
    array: true,
    defaultDescription: '[\'default\']',
    desc: 'Polyfills to consider'
  })
  .option('unknown', {
    alias: 'u',
    choices: [
      'polyfill',
      'ignore'
    ],
    defaultDescription: 'polyfill',
    desc: 'What to do when the user agent cannot be recognised',
    string: true
  })
  .option('zopfli', {
    alias: 'z',
    coerce: json5Parse,
    defaultDescription: '{blocksplitting: true, numiterations: 15}',
    desc: 'Options to pass to node-zopfli (JSON5).',
    string: true
  })
  .option('json', {
    alias: 'j',
    coerce: json5Parse,
    conflicts: optnames.concat('config'),
    desc: 'Builder configuration (JSON5). Exclusive with any other config option. '
    + 'This can be set in the "polyfill-io-aot" key in your package.json.',
    string: true
  })
  .option('config', {
    alias: 'c',
    coerce: (p: string): any => require(join(process.cwd(), p)),
    conflicts: optnames.concat('json'),
    desc: 'Path to a .js config file exporting the configuration (module.exports = {}). '
    + 'No other option may be provided if this is specified.',
    type: 'string'
  })
  .pkgConf('polyfill-io-aot')
  // @see https://github.com/yargs/yargs/blob/HEAD/docs/api.md#envprefix
  .env('POLYFILL_IO_AOT')
  .epilogue(readFileSync(join(__dirname, 'epilogue.txt'), 'utf8'))
  .group(<string[]>optnames, 'Inline config:')
  .group(['json', 'config'], 'Full config:')
  .strict()
  .wrap(yargs.terminalWidth())
  .argv;
