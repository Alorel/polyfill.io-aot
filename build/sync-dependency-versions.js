const {join} = require('path');
const fs = require('fs');

const vars = require('./_vars');
const {packages, pkgJson, keysToCheck, rootKeys} = vars;


for (const pkgName of fs.readdirSync(packages, 'utf8')) {
  const pkgJsonPath = join(packages, pkgName, 'package.json');
  const pkgJsonContents = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

  for (const pkgKey of keysToCheck) {
    const dependencyTree = pkgJsonContents[pkgKey];
    if (!dependencyTree) {
      continue;
    }

    const deps = Object.keys(dependencyTree);

    for (const depName of deps) {
      if (depName.startsWith(vars.scope)) {
        dependencyTree[depName] = pkgJson.version;
      } else {
        for (const rootKey of rootKeys) {
          if (pkgJson[rootKey][depName]) {
            dependencyTree[depName] = pkgJson[rootKey][depName];
            break;
          }
        }
      }
    }
  }

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJsonContents, null, 2));
}