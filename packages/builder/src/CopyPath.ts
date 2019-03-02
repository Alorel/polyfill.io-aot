import {LazyGetter} from 'lazy-get-decorator';
import {relative as relative$} from 'path';

/** @internal */
export class CopyPath {
  public constructor(public readonly absolute: string, public readonly root: string) {
  }

  @LazyGetter()
  public get relative(): string {
    return relative$(this.root, this.absolute);
  }

  public toString(): string {
    return this.absolute;
  }

}
