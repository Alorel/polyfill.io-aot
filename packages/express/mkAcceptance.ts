import {Compression} from '@polyfill-io-aot/core';
import {Request} from 'express';

/** @internal */
export interface Acceptance {
  compression: Compression;
  contentEncoding: string | null;
}

/** @internal */
export function mkAcceptance(req: Request): Acceptance {
  let compression: Compression;
  let contentEncoding: string | null = null;

  if (req.acceptsEncodings('br')) {
    compression = Compression.BROTLI;
    contentEncoding = 'br';
  } else if (req.acceptsEncodings('gzip')) {
    compression = Compression.GZIP;
    contentEncoding = 'gz';
  } else {
    compression = Compression.NONE;
  }

  return {compression, contentEncoding};
}
