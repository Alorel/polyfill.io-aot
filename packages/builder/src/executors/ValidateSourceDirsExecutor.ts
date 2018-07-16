import * as Bluebird from 'bluebird';
import * as fs from 'fs-extra';
import {join} from 'path';
import {CopyPath} from '../CopyPath';
import {Executor} from '../Executor';
import {BuildEvent} from '../interfaces/BuildEvent';
import {COPY_DIRS} from '../symbols';

/** @internal */
class ValidateSourceDirsExecutor extends Executor {

  protected execute(): void {
    this.emit(BuildEvent.VALIDATE_DIRS_BEGIN);
    this._ora.start('Validating source directories');

    Bluebird
      .map(this.builder[COPY_DIRS], (dir: CopyPath) => {
        this.emit(BuildEvent.VALIDATE_DIR_BEGIN, dir);

        return fs.stat(dir.absolute)
          .then(stat => {
            if (!stat.isDirectory()) {
              throw new Error(`${dir} is not a directory`);
            }

            return fs.readdir(dir.absolute);
          })
          .then((dirFiles: string[]) => {
            if (!dirFiles.includes('config.json')) {
              throw new Error(`${dir} does not include config.json`);
            }

            return Bluebird.map(dirFiles, (df: string) => {
              const statDir: string = join(dir.absolute, df);

              return fs.stat(statDir)
                .then(stat => {
                  if (stat.isDirectory()) {
                    throw new Error(`Directory ${dir} contains a subdirectory: ${df}`);
                  }

                  this._ora.text = `Validated ${dir}`;
                });
            });
          })
          .catch((e: Error) => {
            this.emit(BuildEvent.VALIDATE_DIR_ERR, dir, e);

            throw e;
          });
      })
      .then(
        () => {
          this.emit(BuildEvent.VALIDATE_DIRS_OK);
          this._ora.succeed('Validated source dirs');
        },
        (e: Error) => {
          this._ora.fail(`Failed to validate source dirs: ${this.formatError(e)}`);
          this.onError(e);
        }
      );
  }
}

export = ValidateSourceDirsExecutor;
