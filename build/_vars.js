const {join, resolve} = require('path');

const root = resolve(__dirname, '..');
const packages = join(root, 'packages');
const pkgJson = require('../package.json');
const scope = '@polyfill-io-aot';
const keysToCheck = ['dependencies', 'devDependencies', 'peerDependencies'];
const rootKeys = ['peerDependencies', 'devDependencies', 'dependencies'].filter(k => k in pkgJson);
const syncedKeys = [
  'version',
  'author',
  'license',
  'repository',
  'main',
  'publishConfig'
];

module.exports = {
  root,
  packages,
  pkgJson,
  scope,
  keysToCheck,
  rootKeys,
  syncedKeys
};