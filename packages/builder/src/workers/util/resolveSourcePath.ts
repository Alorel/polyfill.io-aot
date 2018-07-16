import {join} from 'path';

/** @internal */
function resolveSourcePath(rootDir: string, hash: string): string {
  return join(rootDir, `${hash}.js`);
}

export = resolveSourcePath;
