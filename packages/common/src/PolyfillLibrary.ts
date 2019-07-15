//tslint:disable-next-line:no-var-requires
const svc: any = require('polyfill-library');

/** When the polyfill should be shown */
export type PolyfillFlag = 'gated' | 'always';
/** What to do when we can't determine whether a polyfill should be included or not */
export type Unknown = 'polyfill' | 'ignore';

/** Feature definition */
export interface Feature {
  flags?: PolyfillFlag[];
}

/** Feature definitions */
export interface Features {
  [feature: string]: Feature;
}

/** Options for {@link getPolyfills} */
export interface GetPolyfillsOptions {
  /** Polyfills to exclude */
  excludes?: string[];

  /** Polyfills to include */
  features?: Features;

  /** Useragent */
  uaString: string;
}

/** Options for {@link getPolyfillString} */
export interface GetPolyfillStringOptions extends GetPolyfillsOptions {
  /** Whether the output should be uglified */
  minify?: boolean;

  /** @see Unknown */
  unknown?: Unknown;
}

/** Polyfill definition */
export interface PolyfillSpec {
  aliasOf?: Set<string>;

  flags: Set<PolyfillFlag>;
}

/** {@link getPolyfills} response */
export interface GetPolyfillsResponse {
  [name: string]: PolyfillSpec;
}

/** List all available polyfills */
export function listAllPolyfills(): Promise<ReadonlyArray<string>> {
  return svc.listAllPolyfills();
}

/**
 * Compile a polyfill bundle with the given options
 * @param options Options to pass to polyfill-library.getPolyfillString
 */
export function getPolyfillString(options: GetPolyfillStringOptions): Promise<string> {
  return svc.getPolyfillString(options);
}

/**
 * Get polyfill specs with the given options
 * @param options Options to pass to polyfill-library.getPolyfills
 */
export function getPolyfills(options: GetPolyfillsOptions): Promise<GetPolyfillsResponse> {
  return svc.getPolyfills(options);
}
