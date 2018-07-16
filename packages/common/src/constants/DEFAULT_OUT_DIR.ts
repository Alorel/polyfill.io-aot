import {homedir} from 'os';
import {join} from 'path';

/** Default output directory */
export const DEFAULT_OUT_DIR = join(homedir(), '.polyfill.io-aot', '.polyfills');
