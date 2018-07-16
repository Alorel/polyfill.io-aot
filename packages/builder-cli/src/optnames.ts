/** 1:1 mapped option names */
export const baseOptNames = Object.freeze([
  'brotli',
  'dirs',
  'excludes',
  'flags',
  'polyfills',
  'processes',
  'unknown',
  'zopfli'
]);

/** Shortened option names */
export const optnames = Object.freeze(baseOptNames.concat([
  'out',
  'pkg'
]));
