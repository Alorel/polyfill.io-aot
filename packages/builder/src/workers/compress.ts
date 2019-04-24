import * as fs from 'fs-extra';
import * as zopfli from 'node-zopfli-es';
import * as wp from 'workerpool';
import {brotliCompress, BrotliOptions} from 'zlib';
import resolveSourcePath = require('./util/resolveSourcePath');

function write(path: string): (inp: Buffer) => Promise<void> {
  return (outBuf: Buffer) => fs.writeFile(path, outBuf);
}

/** @internal */
export function gzip(root: string, hash: string, opts: zopfli.Options): Promise<void> {
  const path: string = resolveSourcePath(root, hash);
  const out = `${path}.gz`;

  return fs.readFile(path)
    .then((sourceBuf: Buffer) => zopfli.gzip(sourceBuf, opts))
    .then(write(out));
}

/** @internal */
export function brotli(root: string, hash: string, opts: BrotliOptions['params']): Promise<void> {
  const path: string = resolveSourcePath(root, hash);
  const out = `${path}.br`;

  return fs.readFile(path)
    .then((sourceBuf: Buffer) => new Promise<Buffer>((resolve, reject) => {
      brotliCompress(sourceBuf, {params: opts}, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    }))
    .then(write(out));
}

if (!wp.isMainThread) {
  wp.worker({brotli, gzip});
}
