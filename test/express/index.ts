import * as e from 'express';
import {before, describe, it} from 'mocha';
import * as request from 'supertest';
import * as tmp from 'tmp';
import {PolyfillBuilder} from '../../packages/builder';
import {PolyfillIoAot} from '../../packages/core';
import {createRequestHandler} from '../../packages/express/index';

tmp.setGracefulCleanup();

describe('express', () => {
  let app: e.Express;
  let outDir: string;
  let aot: PolyfillIoAot;
  const polyfills = ['fetch'];
  const ua = 'Mozilla/5.0 (Windows; U; MSIE 8; Windows NT 6.0; en-US)';

  function mkTmpDir(): string {
    const opts: tmp.Options = {
      discardDescriptor: true,
      unsafeCleanup: true
    };

    return tmp.dirSync(opts).name;
  }

  function call(cb: any, encoding?: string, responseEncoding?: string) {
    let rq = request(app)
      .get('/')
      .set('user-agent', ua)
      .expect('vary', 'accept-encoding')
      .expect('content-type', /application\/javascript/);

    if (encoding) {
      if (!responseEncoding) {
        responseEncoding = encoding;
      }
      rq = rq
        .set('accept-encoding', encoding)
        .expect('content-encoding', responseEncoding);
    } else {
      rq = rq.set('accept-encoding', '');
    }

    return rq.expect(200, cb); //tslint:disable-line:no-magic-numbers
  }

  before('init out dir', () => {
    outDir = mkTmpDir();
  });

  before('init express', (cb: any) => {
    app = e();

    const handler = createRequestHandler({
      outDir,
      polyfills
    });
    aot = handler.aot;

    app.get('/', handler);

    app.listen(0, () => {
      cb();
    });
  });

  before('Generate polyfills', () => {
    return new PolyfillBuilder({outDir, polyfills, packageManager: 'yarn'})
      .start();
  });

  it('no accept-encoding', (cb: any) => {
    call(cb);
  });

  it('brotli', (cb: any) => {
    call(cb, 'br');
  });

  it('gzip', (cb: any) => {
    call(cb, 'gzip', 'gz');
  });
});
