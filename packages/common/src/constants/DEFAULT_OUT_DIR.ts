import {homedir} from 'os';
import {join} from 'path';

/** @internal */
export const DEFAULT_OUT_DIR = join(homedir(), '.polyfill.io-aot', '.polyfills');
