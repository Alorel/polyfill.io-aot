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
  const vary = 'user-agent, accept-encoding';

  function mkTmpDir(): string {
    const opts: tmp.Options = {
      discardDescriptor: true,
      unsafeCleanup: true
    };

    return tmp.dirSync(opts).name;
  }

  function call(cb: any,
                encoding?: string | null,
                responseEncoding?: string,
                code = 200) {
    let rq = request(app)
      .get('/')
      .set('user-agent', ua)
      .expect('vary', vary)
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

    return rq.expect(code, cb); //tslint:disable-line:no-magic-numbers
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

  describe('conditional', () => {
    //tslint:disable:no-magic-numbers

    it('modified-since', (cb: any) => {
      request(app)
        .get('/')
        .set('if-modified-since', aot.lastModified)
        .expect('vary', vary)
        .expect(304, cb);
    });

    it('modified-since', (cb: any) => {
      const etag: string = Object.keys(aot['manifest'].etags)[0];

      request(app)
        .get('/')
        .set('if-none-match', etag)
        .expect('vary', vary)
        .expect(304, cb);
    });
    //tslint:disable:no-magic-numbers
  });
});
