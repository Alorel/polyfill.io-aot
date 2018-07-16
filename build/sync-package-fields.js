const vars = require('./_vars');
const {join} = require('path');
const fs = require('fs');

function get(obj, path) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }

  let root = obj || {};
  for (const p of path) {
    if (!(p in root)) {
      return;
    }

    root = root[p];
  }

  return root;
}

function has(obj, path) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }

  let root = obj || {};
  for (const p of path) {
    if (!(p in root)) {
      return false;
    }

    root = root[p];
  }

  return true;
}

function set(obj, path, value) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }

  let root = obj || {};
  for (let i = 0; i < path.length - 1; i++) {
    const p = root[path[i]];
    if (!(p in root)) {
      root[p] = {};
    }
    root = root[p];
  }

  root[path[path.length - 1]] = value;
}

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