import {PolyfillConfigBase} from '@polyfill-io-aot/common';
import {ZlibOptions} from 'zlib';

export interface PolyfillCoreConfig extends PolyfillConfigBase {
  gzip: ZlibOptions;
}
