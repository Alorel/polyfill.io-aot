import {LazyGetter} from 'lazy-get-decorator';
import {CopyExecutor} from '../CopyExecutor';
import {CopyPath} from '../CopyPath';
import {BuildEvent} from '../interfaces/BuildEvent';
import {COPY_FILES} from '../symbols';

/** @internal */
class CopyExtraFilesExecutor extends CopyExecutor {
  protected readonly allOk: BuildEvent = BuildEvent.COPY_EXTRA_FILES_OK;
  protected readonly allStart: BuildEvent = BuildEvent.COPY_EXTRA_FILES_BEGIN;
  protected readonly isDir = false;
  protected readonly okText = 'Copied extra files';
  protected readonly oneErr: BuildEvent = BuildEvent.COPY_EXTRA_FILE_ERR;
  protected readonly oneOk: BuildEvent = BuildEvent.COPY_EXTRA_FILE_OK;
  protected readonly oneStart: BuildEvent = BuildEvent.COPY_EXTRA_FILE_BEGIN;
  protected readonly startText = 'Copying extra files';

  @LazyGetter()
  protected get source(): CopyPath[] {
    return this.builder[COPY_FILES];
  }
}

export = CopyExtraFilesExecutor;
