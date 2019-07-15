import {PolyfillBuffer, PolyfillCoreConfig, PolyfillIoAot} from '@polyfill-io-aot/core';
import {Acceptance, mkAcceptance} from '@polyfill-io-aot/express/mkAcceptance';
import {modifiedSince} from '@polyfill-io-aot/express/modifiedSince';
import {noneMatch} from '@polyfill-io-aot/express/noneMatch';
import {Request, RequestHandler, Response} from 'express';

/** Express request handler with polyfill-io-aot attached */
export type PolyfillIoAotRequestHandler = RequestHandler & { readonly aot: PolyfillIoAot };

/** Common constants */
const enum Const {
  /** OK HTTP code */
  OK = 200,
  /** Not modified HTTP code */
  NOT_MODIFIED = 304,
  /** Error HTTP code */
  ERR = 500,
  /** Standard vary header */
  VARY = 'user-agent, accept-encoding'
}

/**
 * Callback for when the polyfill string has been received
 * @param res Http response
 * @param buf Polyfill builder
 * @param acc What the request accepts
 */
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

/**
 * Sets common headers
 * @param res Http response object
 */
function commonHeaders(res: Response): Response {
  return res.type('application/javascript')
    .vary(Const.VARY);
}

/**
 * Create an Express request handler to serve polyfill bundles
 * @param init polyfill-io-aot configuration or instance
 */
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
