/** Hashing output */
export interface HashSpec {
  etag: string;
}

/** Polyfill hash outputs */
export interface Hash {
  /** .js.br hash spec */
  br: HashSpec;
  /** .js.gz hash spec */
  gz: HashSpec;
  /** .js hash spec */
  raw: HashSpec;
}

/** Hash map */
export interface Hashes {
  [hash: string]: Hash;
}

/** File encoding */
export const enum Encoding {
  /** .js */
  RAW,
  /** .js.gz */
  GZIP,
  /** .js.br */
  BROTLI
}

/** Etag manifest definition */
export interface ManifestEtag {
  encoding: Encoding;
  hash: string;
}

/** Etags manifest map */
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
