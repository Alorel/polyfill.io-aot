import {DEFAULT_OUT_DIR} from '@polyfill-io-aot/common/src/constants/DEFAULT_OUT_DIR';
import * as EventEmitter from 'events';
import {BrotliEncodeParams} from 'iltorb';
import merge = require('lodash/merge');
import {Options as ZopfliOptions} from 'node-zopfli';
import * as ora from 'ora';
import {cpus} from 'os';
import {dirname, join} from 'path';
import {GetPolyfillsResponse} from 'polyfill-service';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import {CopyPath} from './CopyPath';
import {Executor} from './Executor';
import {BuildEvent} from './interfaces/BuildEvent';
import {Omit} from './interfaces/Omit';
import {
  PartialPolyfillBuilderConfig,
  PolyfillBuilderConfig,
  UserAgentGenerators
} from './interfaces/PolyfillBuilderConfig';
import {
  COMBO_HASH_UA_MAP,
  COMBO_HASHES,
  COMBO_MAP,
  COPY_DIRS,
  COPY_FILES,
  POLYFILL_SERVICE_PKG,
  POLYFILLS_ROOT,
  USERAGENTS
} from './symbols';

const END_TIME = Symbol('End time');
const START_TIME = Symbol('Start time');

export class PolyfillBuilder extends EventEmitter {

  public readonly conf: Readonly<PolyfillBuilderConfig>;
  /** @internal */
  public [USERAGENTS]: string[];
  /** @internal */
  public [COPY_FILES]: CopyPath[];
  /** @internal */
  public [COPY_DIRS]: CopyPath[];
  /** @internal */
  public [COMBO_MAP]: Map<string, GetPolyfillsResponse>;
  /** @internal */
  public [COMBO_HASHES]: string[];
  /** @internal */
  public [COMBO_HASH_UA_MAP]: { [k: string]: string };
  /** @internal */
  private [END_TIME]: Date;
  /** @internal */
  private [START_TIME]: Date;

  public constructor(conf?: PartialPolyfillBuilderConfig) {
    super();
    type Defaults = Omit<PolyfillBuilderConfig, 'uaGenerators' | 'zopfli' | 'brotli'> & {
      brotli: Partial<BrotliEncodeParams>;
      uaGenerators: {};
      zopfli: Partial<ZopfliOptions>;
    };

    const defaults: Defaults = {
      brotli: {
        quality: 11
      },
      dirs: [],
      excludes: [],
      flags: [],
      outDir: DEFAULT_OUT_DIR,
      packageManager: 'npm',
      polyfills: ['default'],
      //tslint:disable-next-line:no-magic-numbers
      processes: process.env.CI ? 2 : Math.max(1, cpus().length - 1),
      uaGenerators: {},
      unknown: 'polyfill',
      zopfli: {
        blocksplitting: true,
        numiterations: 15
      }
    };

    this.conf = <PolyfillBuilderConfig>merge(defaults, conf || {});
    this.initUaGenerators();
    Object.freeze(this.conf);

    this.initLogs();
  }

  @LazyGetter()
  public get promise(): Promise<void> {
    return new Promise<void>((resolve$, reject) => {
      this.once(BuildEvent.END, resolve$);
      this.once(BuildEvent.ERROR, reject);
    });
  }

  public get runtimeSeconds(): string {
    if (!this[START_TIME]) {
      return '0.00';
    }

    return (((this[END_TIME] || new Date()).getTime() - this[START_TIME].getTime()) / 1000)
    //tslint:disable-next-line:no-magic-numbers
      .toFixed(2);
  }

  /** @internal */
  @LazyGetter(true)
  public get [POLYFILL_SERVICE_PKG](): string {
    return dirname(require.resolve('polyfill-service/package.json'));
  }

  /** @internal */
  @LazyGetter(true)
  public get [POLYFILLS_ROOT](): string {
    return join(this[POLYFILL_SERVICE_PKG], 'polyfills');
  }

  public start(): Promise<void> {
    if (this[START_TIME]) {
      const err = new Error('Build already started');
      this.emit(BuildEvent.ERROR, err);

      return Promise.reject(err);
    } else {
      const out = this.promise;
      this.initChain();

      setImmediate(() => {
        this.emit(BuildEvent.START);
      });

      return out;
    }
  }

  private initChain(): void {
    const chain: { [k: string]: string } = {
      [BuildEvent.START]: './executors/FormatSourceDirsExecutor',
      [BuildEvent.FORMAT_DIRS_OK]: './executors/ValidateSourceDirsExecutor',
      [BuildEvent.VALIDATE_DIRS_OK]: './executors/CopySourceDirsExecutor',
      [BuildEvent.COPY_EXTRA_DIRS_OK]: './executors/CopyExtraFilesExecutor',
      [BuildEvent.COPY_EXTRA_FILES_OK]: './executors/CompilePolyfillsExecutor',
      [BuildEvent.COMPILE_POLYFILLS_OK]: './executors/GenerateUserAgentsExecutor',
      [BuildEvent.GENERATE_UAS_ALL_OK]: './executors/GeneratePolyfillCombinations',
      [BuildEvent.GENERATE_COMBO_ALL_OK]: './executors/WritePolyfillCombinationsExecutor',
      [BuildEvent.GENERATE_BUNDLES_OK]: './executors/UglifyExecutor',
      [BuildEvent.UGLIFY_ALL_OK]: './executors/CompressExecutor',
      [BuildEvent.COMPRESS_ALL_OK]: './executors/WriteManifestExecutor'
    };

    this.once(BuildEvent.WRITE_MANIFEST_OK, () => {
      setImmediate(() => {
        this.emit(BuildEvent.END);
      });
    });

    interface Type<T extends Executor = any> {
      new(builder: PolyfillBuilder): T;
    }

    for (const k of Object.keys(chain)) {
      this.once(k, () => {
        setImmediate(() => {
          const xc: Type = require(chain[k]);
          new xc(this).start();
        });
      });
    }
  }

  private initLogs(): void {
    this
      .once(BuildEvent.START, () => {
        this[START_TIME] = new Date();
      })
      .once(BuildEvent.ERROR, (e: Error) => {
        this[END_TIME] = new Date();
        const msg: any = e.stack || e.message || e;
        ora().fail(`Build errored after ${this.runtimeSeconds} seconds with ${msg}`);
      })
      .once(BuildEvent.END, () => {
        this[END_TIME] = new Date();
        ora().succeed(`Build finished in ${this.runtimeSeconds} seconds`);
      });
  }

  private initUaGenerators(): void {
    type Mapping = [keyof UserAgentGenerators, string];
    const mappings: Mapping[] = [
      ['android', 'android'],
      ['blackberry', 'bb'],
      ['chrome', 'chrome'],
      ['firefox', 'firefox'],
      ['firefoxMobile', 'firefox'],
      ['ie', 'ie'],
      ['ieMobile', 'ie_mob'],
      ['iosSafari', 'ios_saf'],
      ['opera', 'opera'],
      ['operaMobile', 'op_mob'],
      ['safari', 'safari'],
      ['samsung', 'samsung']
    ];

    for (const mapping of mappings) {
      const prop = mapping[0];

      if (!this.conf.uaGenerators[prop]) {
        const src = mapping[1];
        //tslint:disable-next-line:no-var-requires
        this.conf.uaGenerators[prop] = require(`./ua-generators/${src}`);
      }
    }
  }
}
