import * as fs from 'fs';
import * as Terser from 'terser';
import * as wp from 'workerpool';
import resolveSourcePath = require('./util/resolveSourcePath');

/** @internal */
export function uglify(hash: string, rootDir: string) {
  const path = resolveSourcePath(rootDir, hash);
  const unminifiedContents: string = fs.readFileSync(path, 'utf8');
  const result = Terser.minify(unminifiedContents);

  if (result.error) {
    throw result.error;
  }

  fs.writeFileSync(path, result.code);
}

if (!wp.isMainThread) {
  wp.worker({uglify});
}
