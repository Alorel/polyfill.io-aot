import {PolyfillIoAot} from '@polyfill-io-aot/core';
import {Request} from 'express';

/** @internal */
export function modifiedSince(aot: PolyfillIoAot, req: Request): boolean {
  let since: string;

  if ((since = req.get('if-none-match'))) {
    try {
      return aot.modifiedSince(since);
    } catch {
      return true;
    }
  }

  return true;
}
