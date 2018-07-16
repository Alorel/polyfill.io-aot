import {Compression, PolyfillBuffer, PolyfillCoreConfig, PolyfillIoAot} from '@polyfill-io-aot/core';
import {Request, RequestHandler, Response} from 'express';

export type PolyfillIoAotRequestHandler = RequestHandler & { readonly aot: PolyfillIoAot };

const commaSplit = /,\s*/g;

const enum Status {
  OK = 200,
  NOT_MODIFIED = 304
}

export function createRequestHandler(init?: Partial<PolyfillCoreConfig> | PolyfillIoAot): PolyfillIoAotRequestHandler {
  const aot = init instanceof PolyfillIoAot ? init : new PolyfillIoAot(init);

  function modifiedSince(since: string): boolean {
    try {
      return aot.modifiedSince(since);
    } catch {
      return true;
    }
  }

  const vary = 'user-agent, accept-encoding';

  function polyfillIoRequestHandler(req: Request, res: Response): void {
    let conditionalHeader: string;

    if ((conditionalHeader = req.get('if-none-match'))) {
      const headerEtagSplit: string[] = conditionalHeader.split(commaSplit);
      for (const t of headerEtagSplit) {
        if (aot.hasEtag(t)) {
          res.status(Status.NOT_MODIFIED).vary(vary).end();

          return;
        }
      }
    } else if ((conditionalHeader = req.get('if-modified-since'))) {
      if (!modifiedSince(conditionalHeader)) {
        res.status(Status.NOT_MODIFIED).vary(vary).end();

        return;
      }
    }

    let compression: Compression;
    let contentEncoding: string;

    if (req.acceptsEncodings('br')) {
      compression = Compression.BROTLI;
      contentEncoding = 'br';
    } else if (req.acceptsEncodings('gzip')) {
      compression = Compression.GZIP;
      contentEncoding = 'gz';
    } else {
      compression = Compression.NONE;
    }

    aot.getPolyfills(req.get('user-agent') || 'unknown', compression)
      .then((buf: PolyfillBuffer): void => {
        res.type('application/javascript')
          .vary(vary);

        if (contentEncoding) {
          res.header('content-encoding', contentEncoding);
        }
        if (buf.$etag) {
          res.header('etag', buf.$etag);
        }
        if (buf.$lastModified) {
          res.header('last-modified', buf.$lastModified);
        }

        res.status(Status.OK).end(buf, 'utf8');
      });
  }

  Object.defineProperty(polyfillIoRequestHandler, 'aot', {
    configurable: false,
    enumerable: true,
    value: aot,
    writable: false
  });

  return <any>polyfillIoRequestHandler;
}
