## [4.0.1](https://github.com/Alorel/polyfill.io-aot/compare/4.0.0...4.0.1) (2019-05-03)


### Dependency updates

* **package:** update [@types](https://github.com/types)/node to version 12.0.0 ([6dafaa0](https://github.com/Alorel/polyfill.io-aot/commit/6dafaa0))

# [4.0.0](https://github.com/Alorel/polyfill.io-aot/compare/3.0.2...4.0.0) (2019-04-24)


### Refactoring

* Replaced UglifyJS with Terser ([#100](https://github.com/Alorel/polyfill.io-aot/issues/100)) ([d03b85a](https://github.com/Alorel/polyfill.io-aot/commit/d03b85a))
* Use zlib instead of iltorb ([#99](https://github.com/Alorel/polyfill.io-aot/issues/99)) ([8f7d11e](https://github.com/Alorel/polyfill.io-aot/commit/8f7d11e))


### BREAKING CHANGES

* The library now requires Node >= 11.7.0

## [3.0.2](https://github.com/Alorel/polyfill.io-aot/compare/3.0.1...3.0.2) (2019-04-03)


### Dependency updates

* **package:** update ora to version 3.4.0 ([96e5d05](https://github.com/Alorel/polyfill.io-aot/commit/96e5d05))


### Maintenance

* Ignore .tsbuildinfo ([1150f34](https://github.com/Alorel/polyfill.io-aot/commit/1150f34))

## [3.0.1](https://github.com/Alorel/polyfill.io-aot/compare/3.0.0...3.0.1) (2019-04-02)


### Bug Fixes

* Updated dependencies ([0851eb9](https://github.com/Alorel/polyfill.io-aot/commit/0851eb9))

# [3.0.0](https://github.com/Alorel/polyfill.io-aot/compare/2.0.4...3.0.0) (2019-03-12)


### Bug Fixes

* Fixed typescript moment-timezone imports ([0349eb2](https://github.com/Alorel/polyfill.io-aot/commit/0349eb2)), closes [#73](https://github.com/Alorel/polyfill.io-aot/issues/73) [#72](https://github.com/Alorel/polyfill.io-aot/issues/72)


### Maintenance

* Replaced polyfill-service with polyfill-library ([b678fac](https://github.com/Alorel/polyfill.io-aot/commit/b678fac))


### Tests

* Fixed fixture dependencies ([c5cfd64](https://github.com/Alorel/polyfill.io-aot/commit/c5cfd64))


### BREAKING CHANGES

* The peer dependency polyfill-service has changed to polyfill-library.

## [2.0.4](https://github.com/Alorel/polyfill.io-aot/compare/2.0.3...2.0.4) (2019-03-02)


### Maintenance

* Fix tslint errors ([0c4dbae](https://github.com/Alorel/polyfill.io-aot/commit/0c4dbae))
* Update typescript-lazy-get-decorator to lazy-get-decorator ([59b5f92](https://github.com/Alorel/polyfill.io-aot/commit/59b5f92))

## [2.0.3](https://github.com/Alorel/polyfill.io-aot/compare/2.0.2...2.0.3) (2019-02-12)


### Dependency updates

* **package:** update yargs to version 13.1.0 ([8fb14a2](https://github.com/Alorel/polyfill.io-aot/commit/8fb14a2))


### Maintenance

* Update deps ([7738cad](https://github.com/Alorel/polyfill.io-aot/commit/7738cad))

## [2.0.2](https://github.com/Alorel/polyfill.io-aot/compare/2.0.1...2.0.2) (2018-12-12)


### Dependency updates

* **package:** update workerpool to version 3.0.0 ([fae88bd](https://github.com/Alorel/polyfill.io-aot/commit/fae88bd))

## [2.0.1](https://github.com/Alorel/polyfill.io-aot/compare/2.0.0...2.0.1) (2018-11-02)


### Dependency updates

* **package:** update node-zopfli-es to version 1.0.0 ([68a41dd](https://github.com/Alorel/polyfill.io-aot/commit/68a41dd))

# [2.0.0](https://github.com/Alorel/polyfill.io-aot/compare/1.0.2...2.0.0) (2018-10-10)


### Maintenance

* **builder-cli:** Remove packages/builder-cli/nod_modules/json5 ([c2e66af](https://github.com/Alorel/polyfill.io-aot/commit/c2e66af))
* **fix:** Update spawn call @ CompilePolyfillsExecutor to comply with updated Node types ([ccf4fbd](https://github.com/Alorel/polyfill.io-aot/commit/ccf4fbd))
* Add GitHub issue templates ([1c27e74](https://github.com/Alorel/polyfill.io-aot/commit/1c27e74))
* Drop Node 6 support ([ad70baf](https://github.com/Alorel/polyfill.io-aot/commit/ad70baf))
* run tslint --fix for updated rules ([3300917](https://github.com/Alorel/polyfill.io-aot/commit/3300917))


### Refactoring

* Reduce polyfills method refactored for new tslint rules ([ef63fca](https://github.com/Alorel/polyfill.io-aot/commit/ef63fca))


### BREAKING CHANGES

* Droped Node 6 support

## [1.0.2](https://github.com/Alorel/polyfill.io-aot/compare/1.0.1...1.0.2) (2018-08-20)


### Bug Fixes

* **package:** Add prepare-gpg-key.sh to npmignore ([330f6c6](https://github.com/Alorel/polyfill.io-aot/commit/330f6c6))
* **package:** Remove builder-cli node_modules ([9acaa2d](https://github.com/Alorel/polyfill.io-aot/commit/9acaa2d))

## [1.0.1](https://github.com/Alorel/polyfill.io-aot/compare/1.0.0...1.0.1) (2018-08-17)


### Bug Fixes

* **package:** Add yarn.lock to npmignore ([46f093b](https://github.com/Alorel/polyfill.io-aot/commit/46f093b))


### Maintenance

* **package:** update [@alorel-personal](https://github.com/alorel-personal)/conventional-changelog-alorel to version 2.0.0 ([6dcd0de](https://github.com/Alorel/polyfill.io-aot/commit/6dcd0de))
* **package:** update [@alorel-personal](https://github.com/alorel-personal)/conventional-changelog-alorel to version 2.0.1 ([5ac0b38](https://github.com/Alorel/polyfill.io-aot/commit/5ac0b38))
* **package:** update [@alorel-personal](https://github.com/alorel-personal)/semantic-release to version 1.2.0 ([820ccb7](https://github.com/Alorel/polyfill.io-aot/commit/820ccb7)), closes [#7](https://github.com/Alorel/polyfill.io-aot/issues/7)
* **package:** update [@alorel-personal](https://github.com/alorel-personal)/semantic-release to version 1.2.1 ([d139ac2](https://github.com/Alorel/polyfill.io-aot/commit/d139ac2))
* **package:** update [@alorel-personal](https://github.com/alorel-personal)/semantic-release to version 1.2.2 ([ec755a2](https://github.com/Alorel/polyfill.io-aot/commit/ec755a2))
* **package:** update json5 to version 2.0.0 ([c92c7e5](https://github.com/Alorel/polyfill.io-aot/commit/c92c7e5))
* **readme:** Add travis badge ([0c058a7](https://github.com/Alorel/polyfill.io-aot/commit/0c058a7))

# 1.0.0 (2018-08-09)


### Bug Fixes

* **CI:** tweak release script ([f129962](https://github.com/Alorel/polyfill.io-aot/commit/f129962))
* **CLI:** support relative paths at --config ([73c878f](https://github.com/Alorel/polyfill.io-aot/commit/73c878f))


### Build System

* Configure semantic-release ([4b01725](https://github.com/Alorel/polyfill.io-aot/commit/4b01725))
* Fix path to [@semantic-release](https://github.com/semantic-release)/exec ([f40f6d0](https://github.com/Alorel/polyfill.io-aot/commit/f40f6d0))
* Re-add post-release CI commit message ([4e3da52](https://github.com/Alorel/polyfill.io-aot/commit/4e3da52))


### Documentation

* **readme:** add Greenkeeper badge ([f70ce0f](https://github.com/Alorel/polyfill.io-aot/commit/f70ce0f))


### Maintenance

* **readme:** Update coveralls badge to use master branch ([f0f23ac](https://github.com/Alorel/polyfill.io-aot/commit/f0f23ac))
* Remove .npmrc from gitignore as it is no longer used ([3887f98](https://github.com/Alorel/polyfill.io-aot/commit/3887f98))
* Replace node-zopfli with node-zopfli-es, update typescript to v3 ([503ac79](https://github.com/Alorel/polyfill.io-aot/commit/503ac79))
