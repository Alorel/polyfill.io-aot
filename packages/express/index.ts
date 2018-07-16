import {PolyfillBuffer, PolyfillCoreConfig, PolyfillIoAot} from '@polyfill-io-aot/core';
import {Acceptance, mkAcceptance} from '@polyfill-io-aot/express/mkAcceptance';
import {modifiedSince} from '@polyfill-io-aot/express/modifiedSince';
import {noneMatch} from '@polyfill-io-aot/express/noneMatch';
import {Request, RequestHandler, Response} from 'express';

export type PolyfillIoAotRequestHandler = RequestHandler & { readonly aot: PolyfillIoAot };

const enum Const {
  OK = 200,
  NOT_MODIFIED = 304,
  ERR = 500,
  VARY = 'user-agent, accept-encoding'
}

function onPolyfillsReceived(res: Response, buf: PolyfillBuffer, acc: Acceptance): void {
  if (acc.contentEncoding) {
    res.header('content-encoding', acc.contentEncoding);
  }
  if (buf.$etag) {
    res.header('etag', buf.$etag);
  }
  if (buf.$lastModified) {
    res.header('last-modified', buf.$lastModified);
  }

  commonHeaders(res)
    .status(Const.OK)
    .end(buf, 'utf8');
}

function commonHeaders(res: Response): Response {
  return res.type('application/javascript')
    .vary(Const.VARY);
}

export function createRequestHandler(init?: Partial<PolyfillCoreConfig> | PolyfillIoAot): PolyfillIoAotRequestHandler {
  const aot = init instanceof PolyfillIoAot ? init : new PolyfillIoAot(init);

  function polyfillIoRequestHandler(req: Request, res: Response): void {
    if (noneMatch(req, aot) || !modifiedSince(aot, req)) {
      commonHeaders(res).status(Const.NOT_MODIFIED).end();

      return;
    }

    const acc: Acceptance = mkAcceptance(req);

    aot.getPolyfills(req.get('user-agent') || 'unknown', acc.compression)
      .then((buf: PolyfillBuffer): void => {
        onPolyfillsReceived(res, buf, acc);
      })
      .catch((e: Error) => {
        res.type('text/plain')
          .status(Const.ERR)
          .end(e.message);
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
