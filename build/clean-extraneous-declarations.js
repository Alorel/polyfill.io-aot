const glob = require('glob');
const {resolve} = require('path');
const fs = require('fs-extra');
const Bluebird = require('bluebird');

const globs = [
  'builder/src/executors/**/*.d.ts',
  'builder/src/workers/**/*.d.ts',
  'builder/src/CopyExecutor.d.ts',
  'builder/src/CopyPath.d.ts',
  'builder/src/Executor.d.ts',
  'builder/src/PoolExecutor.d.ts',
  'builder/src/symbols.d.ts',
  'builder/src/xSpawn.d.ts',
];

const cwd = resolve(__dirname, '..', 'packages');
const glob$ = Bluebird.promisify(glob);

return Bluebird
  .map(globs, glob => glob$(glob, {cwd, absolute: true}))
  .reduce(
    (acc, globArr) => {
      for (const f of globArr) {
        acc.push(f);
      }

      return acc;
    },
    []
  )
  .map(p => fs.unlink(p))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });