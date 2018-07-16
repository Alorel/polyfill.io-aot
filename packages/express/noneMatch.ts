import {PolyfillIoAot} from '@polyfill-io-aot/core';
import {Request} from 'express';

const commaSplit = /,\s*/g;

/** @internal */
export function noneMatch(req: Request, aot: PolyfillIoAot): boolean {
  let conditionalHeader: string;
  if ((conditionalHeader = req.get('if-none-match'))) {
    const headerEtagSplit: string[] = conditionalHeader.split(commaSplit);

    for (const t of headerEtagSplit) {
      if (aot.hasEtag(t)) {
        return true;
      }
    }
  }

  return false;
}
