const glob = require('glob');
const {resolve} = require('path');
const fs = require('fs-extra');
const Bluebird = require('bluebird');

const root = resolve(__dirname, '..', 'packages');



process.exit(0);

Bluebird.promisify(glob)('**/*.{js,map,d.ts}', {cwd: root, absolute: true})
  .map(path => fs.unlink(path))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });