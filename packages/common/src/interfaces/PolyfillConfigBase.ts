import {BrotliOptions} from 'zlib';
import {PolyfillFlag, Unknown} from '../PolyfillLibrary';

export interface PolyfillConfigBase {
  /**
   * Options to pass to the brotli encoder
   * @default {[zlib.constants.BROTLI_PARAM_QUALITY]: 11}
   */
  brotli: BrotliOptions['params'];

  /**
   * Array of polyfills to exclude from the final bundle
   * @default []
   */
  excludes: string[];

  /**
   * Flags to pass to polyfill-library when generating bundles
   * @default []
   */
  flags: PolyfillFlag[];

  /**
   * Output directory
   * @default ~/.polyfill-io-aot/.polyfills
   */
  outDir: string;

  /**
   * Polyfills to consider (including aliases)
   * @default ['default']
   */
  polyfills: string[];

  /**
   * What to do when the user agent cannot be recognised
   * @default polyfill
   */
  unknown: Unknown;
}
