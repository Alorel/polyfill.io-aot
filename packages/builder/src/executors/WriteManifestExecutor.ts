import {Encoding, getLastModified, Manifest, ManifestEtag} from '@polyfill-io-aot/common';
import * as Bluebird from 'bluebird';
import * as etag from 'etag';
import * as fs from 'fs-extra';
import set = require('lodash/set');
import {join} from 'path';
import {gzip} from 'zlib';
import {Executor} from '../Executor';
import {BuildEvent} from '../interfaces/BuildEvent';

const hashRegex = /[\da-z]{32}/i;

/** @internal */
class WriteManifestExecutor extends Executor {

  protected execute(): void {
    this.emit(BuildEvent.WRITE_MANIFEST_BEGIN);
    this._ora.start('Writing manifest');

    const manifest: Manifest = <any>{};
    const filter = /\.js(\.gz|\.br)?$/;

    Bluebird.resolve(fs.readdir(this.builder.conf.outDir))
      .filter((fname: string): boolean => filter.test(fname))
      .reduce(this.reducer.bind(this), manifest)
      .then(() => this.gzip(manifest))
      .then((gzippedManifest: Buffer) => {
        return fs.writeFile(join(this.conf.outDir, 'manifest.json.gz'), gzippedManifest);
      })
      .then(
        () => {
          this.emit(BuildEvent.WRITE_MANIFEST_OK);
          this._ora.succeed('Manifest written');
        },
        (e: Error) => {
          this._ora.fail(`Error writing manifest: ${this.formatError(e)}`);
          this.onError(e);
        }
      );
  }

  private gzip(manifest: Manifest): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      manifest.lastModified = getLastModified();
      gzip(JSON.stringify(manifest), {level: 9}, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  private reducer(acc: Manifest, fname: string): Promise<Manifest> {
    const hash: string = (fname.match(hashRegex))[0];
    const enc: Encoding = fname.endsWith('br') ? Encoding.BROTLI
      : fname.endsWith('gz') ? Encoding.GZIP : Encoding.RAW;
    const encName: 'br' | 'gz' | 'raw' = enc === Encoding.RAW ? 'raw'
      : enc === Encoding.BROTLI ? 'br' : 'gz';

    return fs.readFile(join(this.conf.outDir, fname))
      .then((buf: Buffer) => {
        const tag = etag(buf);
        const setTag: ManifestEtag = {
          encoding: enc,
          hash
        };
        set(acc, ['etags', tag], setTag);
        set(acc, ['hashes', hash, encName, 'etag'], tag);

        return acc;
      });
  }
}

export = WriteManifestExecutor;
