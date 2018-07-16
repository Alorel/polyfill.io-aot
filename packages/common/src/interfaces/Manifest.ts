export interface HashSpec {
  etag: string;
}

export interface Hash {
  br: HashSpec;
  gz: HashSpec;
  raw: HashSpec;
}

export interface Hashes {
  [hash: string]: Hash;
}

export const enum Encoding {
  RAW,
  GZIP,
  BROTLI
}

export interface ManifestEtag {
  encoding: Encoding;
  hash: string;
}

export interface ManifestEtags {
  [etag: string]: ManifestEtag;
}

/** Polyfill bundle manifest */
export interface Manifest {
  /** ETag specs */
  etags: ManifestEtags;
  /** Hash specs */
  hashes: Hashes;
  /** Header-friendly bundle generation date */
  lastModified: string;
}
