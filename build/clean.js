const glob = require('glob');
const {resolve, join} = require('path');
const fs = require('fs-extra');
const Bluebird = require('bluebird');

const home = resolve(__dirname, '..');
const cwd = join(home, 'packages');

function noop() {
}

const glob$ = Bluebird.promisify(glob);

const promises = [
  Bluebird.all([glob$('**/*.{js,map,d.ts}', {cwd, absolute: true}), glob$('./*.tgz', {cwd: home, absolute: true})])
    .spread((src, tgz) => src.concat(tgz))
    .map(path => fs.unlink(path)),
  Bluebird.map(
    ['.nyc_output', 'coverage'],
    d => fs.remove(join(home, d)).catch(noop)
  )
];

Bluebird.all(promises)
  .catch(e => {
    console.error(e);
    process.exit(1);
  });