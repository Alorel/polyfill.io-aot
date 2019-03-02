import {LazyGetter} from 'lazy-get-decorator';
import {CopyExecutor} from '../CopyExecutor';
import {CopyPath} from '../CopyPath';
import {BuildEvent} from '../interfaces/BuildEvent';
import {COPY_DIRS} from '../symbols';

/** @internal */
class CopySourceDirsExecutor extends CopyExecutor {
  protected readonly allOk: BuildEvent = BuildEvent.COPY_EXTRA_DIRS_OK;
  protected readonly allStart: BuildEvent = BuildEvent.COPY_EXTRA_DIRS_BEGIN;
  protected readonly isDir = true;
  protected readonly okText = 'Copied extra directories';
  protected readonly oneErr: BuildEvent = BuildEvent.COPY_EXTRA_DIR_ERR;
  protected readonly oneOk: BuildEvent = BuildEvent.COPY_EXTRA_DIR_OK;
  protected readonly oneStart: BuildEvent = BuildEvent.COPY_EXTRA_DIR_BEGIN;
  protected readonly startText = 'Copying extra directories';

  @LazyGetter()
  protected get source(): CopyPath[] {
    return this.builder[COPY_DIRS];
  }
}

export = CopySourceDirsExecutor;
