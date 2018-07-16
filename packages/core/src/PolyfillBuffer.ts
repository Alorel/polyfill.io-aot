export interface PolyfillBuffer extends Buffer {
  readonly $etag: string;
  readonly $hash: string;
  readonly $lastModified?: string;
}
