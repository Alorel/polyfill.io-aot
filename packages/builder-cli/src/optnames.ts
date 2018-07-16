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

export const optnames = Object.freeze(baseOptNames.concat([
  'out',
  'pkg'
]));
