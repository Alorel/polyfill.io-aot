import {PolyfillConfigBase} from '@polyfill-io-aot/common';
import {ZlibOptions} from 'zlib';

export interface PolyfillCoreConfig extends PolyfillConfigBase {
  /**
   * Options to pass to zlib.gzip when compressing non-bundled polyfills.
   * @default {level: 9}
   */
  gzip: ZlibOptions;
}
