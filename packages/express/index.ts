import {Compression, PolyfillCoreConfig, PolyfillIoAot} from '@polyfill-io-aot/core';
import {Request, RequestHandler, Response} from 'express';

export type PolyfillIoAotRequestHandler = RequestHandler & { readonly aot: PolyfillIoAot };

export function createRequestHandler(init?: Partial<PolyfillCoreConfig> | PolyfillIoAot): PolyfillIoAotRequestHandler {
  const aot = init instanceof PolyfillIoAot ? init : new PolyfillIoAot(init);

  function polyfillIoRequestHandler(req: Request, res: Response): void {
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
      .then((buf: Buffer): void => {
        res.type('application/javascript')
          .status(200) //tslint:disable-line:no-magic-numbers
          .vary('accept-encoding');

        if (contentEncoding) {
          res.header('content-encoding', contentEncoding);
        }

        res.end(buf, 'utf8');
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
