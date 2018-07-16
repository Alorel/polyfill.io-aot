import {relative as relative$} from 'path';
import {LazyGetter} from 'typescript-lazy-get-decorator';

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
