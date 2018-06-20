const vars = require('./_vars');
const {join} = require('path');
const fs = require('fs');
const get = require('lodash/get');
const set = require('lodash/set');
const has = require('lodash/has');

const {packages, pkgJson, syncedKeys} = vars;
const filteredKeys = syncedKeys.filter(k => has(pkgJson, k));

for (const pkgName of fs.readdirSync(packages, 'utf8')) {
  const pkgJsonPath = join(packages, pkgName, 'package.json');
  const pkgJsonContents = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

  for (const key of filteredKeys) {
    set(pkgJsonContents, key, get(pkgJson, key));
  }

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJsonContents, null, 2));
}