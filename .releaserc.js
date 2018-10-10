const {readdirSync} = require('fs');
const {join} = require('path');
const pkgDir = join(__dirname, 'packages');

const packageNames = readdirSync(pkgDir, 'utf8');
packageNames.sort();

const out = {
  branch: 'master',
  tagFormat: '${version}',
  prepare: [
    '@semantic-release/changelog',
    '@alorel-personal/semantic-release',
    '@semantic-release/npm',
    {
      path: '@semantic-release/exec',
      cmd: 'yarn run sync'
    },
    {
      path: '@semantic-release/git',
      message: 'chore(release): ${nextRelease.version}',
      assets: [
        'CHANGELOG.md',
        'README.md',
        'package.json',
        'yarn.lock',
        ...packageNames.map(pkgName => `./packages/${pkgName}/package.json`)
      ]
    }
  ],
  generateNotes: {
    config: '@alorel-personal/conventional-changelog-alorel'
  },
  publish: [
    '@semantic-release/github'
  ]
};

for (const pkg of packageNames) {
  out.publish.push({
    path: '@semantic-release/npm',
    pkgRoot: join(pkgDir, pkg)
  })
}

module.exports = out;

