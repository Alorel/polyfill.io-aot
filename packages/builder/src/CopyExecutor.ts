import * as Bluebird from 'bluebird';
import * as fs from 'fs-extra';
import {join} from 'path';
import {CopyPath} from './CopyPath';
import {Executor} from './Executor';
import {BuildEvent} from './interfaces/BuildEvent';
import {POLYFILLS_ROOT} from './symbols';

/** @internal */
export abstract class CopyExecutor extends Executor {

  protected abstract readonly allOk: BuildEvent;
  protected abstract readonly allStart: BuildEvent;
  protected abstract readonly isDir: boolean;
  protected abstract readonly okText: string;
  protected abstract readonly oneErr: BuildEvent;
  protected abstract readonly oneOk: BuildEvent;
  protected abstract readonly oneStart: BuildEvent;
  protected abstract readonly source: CopyPath[];
  protected abstract readonly startText: string;

  protected execute(): void {
    this._ora.start(this.startText);
    this.emit(this.allStart);
    const copyOpts: fs.CopyOptions = {
      errorOnExist: false,
      overwrite: true,
      preserveTimestamps: true,
      recursive: this.isDir
    };

    Bluebird
      .map(this.source, (cpp: CopyPath): Promise<void> => {
        const target: string = join(this.builder[POLYFILLS_ROOT], cpp.relative);
        const emptyingPromise: Promise<any> = this.isDir ? fs.emptyDir(target) : Promise.resolve();

        return emptyingPromise
          .then(() => {
            this.emit(this.oneStart, cpp.absolute, target);

            return fs.copy(cpp.absolute, target, copyOpts);
          })
          .then(() => {
            this.emit(this.oneOk, cpp.absolute, target);
          })
          .catch((e: Error) => {
            this.emit(this.oneErr, cpp.absolute, target, e);

            throw e;
          });
      })
      .then(
        () => {
          this._ora.succeed(this.okText);
          this.emit(this.allOk);
        },
        (e: Error) => {
          this._ora.fail(`Copy operation failed: ${this.formatError(e)}`);
          this.onError(e);
        }
      );
  }
}
