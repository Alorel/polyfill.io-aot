const vars = require('./_vars');
const {join} = require('path');
const fs = require('fs');

const {packages, root} = vars;
const npmignore = join(root, '.npmignore');

for (const pkgName of fs.readdirSync(packages, 'utf8')) {
  // Can't use copyFileSync because of lts/boron
  const src = fs.readFileSync(npmignore, 'utf8');
  fs.writeFileSync(join(packages, pkgName, '.npmignore'), src);
}