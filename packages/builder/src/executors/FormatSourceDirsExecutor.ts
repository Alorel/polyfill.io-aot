import * as Bluebird from 'bluebird';
import {Stats} from 'fs';
import * as fs from 'fs-extra';
import {join, resolve} from 'path';
import {CopyPath} from '../CopyPath';
import {Executor} from '../Executor';
import {BuildEvent} from '../interfaces/BuildEvent';
import {COPY_DIRS, COPY_FILES} from '../symbols';

/** @internal */
class FormatSourceDirsExecutor extends Executor {

  protected execute(): void {
    this.emit(BuildEvent.FORMAT_DIRS_BEGIN);
    this._ora.start('Formatting source directory paths');
    const out: CopyPath[] = [];
    const extraCopies$: CopyPath[] = [];

    const createReducer = (root: string): (acc: CopyPath[], dir: string) => Promise<CopyPath[]> => {
      const reducer = async(acc: CopyPath[], dir: string): Promise<CopyPath[]> => {
        try {
          dir = resolve(dir);
          this.emit(BuildEvent.FORMAT_DIR_BEGIN, dir);

          let hasSubdirs = false;
          const entries: string[] = (await fs.readdir(dir))
            .map((p: string): string => join(dir, p));

          const stats: { [entry: string]: Stats } = {};

          for (const entry of entries) {
            const stat = await fs.stat(entry);
            stats[entry] = stat;

            if (stat.isDirectory()) {
              hasSubdirs = true;
              await reducer(acc, entry);
            }
          }
          if (hasSubdirs) {
            for (const entry of entries) {
              if (stats[entry].isFile()) {
                extraCopies$.push(new CopyPath(entry, root));
              }
            }
          } else {
            acc.push(new CopyPath(dir, root));
          }

          this.emit(BuildEvent.FORMAT_DIR_OK, dir);
          this._ora.text = `Formatted ${dir}`;

          return acc;
        } catch (e) {
          this.emit(BuildEvent.FORMAT_DIR_ERR, dir, e);
        }
      };

      return reducer;
    };

    Bluebird
      .reduce(
        this.conf.dirs,
        (acc: CopyPath[], dir: string): Promise<CopyPath[]> => createReducer(dir)(acc, dir),
        out
      )
      .then(
        () => {
          this._ora.succeed('Source directories formatted');
          this.builder[COPY_DIRS] = out;
          this.builder[COPY_FILES] = extraCopies$;
          this.emit(BuildEvent.FORMAT_DIRS_OK);
        },
        (e: Error) => {
          this._ora.fail(`Failed formatting source dirs: ${this.formatError(e)}`);
          this.onError(e);
        }
      );
  }
}

export = FormatSourceDirsExecutor;
