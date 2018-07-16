/** A Node Buffer extended with polyfill details */
export interface PolyfillBuffer extends Buffer {
  /** The bundle ETag */
  readonly $etag: string;
  /** Bundle hash */
  readonly $hash: string;
  /** Bundle modification date. Only present for prebuilt bundles */
  readonly $lastModified?: string;
}
