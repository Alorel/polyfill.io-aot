import {BrotliEncodeParams} from 'iltorb';
import {PolyfillFlag, Unknown} from '../PolyfillLibrary';

export interface PolyfillConfigBase {
  /**
   * Options to pass to the iltorb module
   * @default {quality: 11}
   */
  brotli: BrotliEncodeParams;
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
