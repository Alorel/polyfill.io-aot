# polyfill.io AOT

An AOT-bundler for [polyfill.io](https://polyfill.io)'s
[polyfill-service](https://www.npmjs.com/package/polyfill-service) package.

![Preview](https://cdn.rawgit.com/Alorel/polyfill.io-aot/fe6db4d188c8e4206571889bb0066ac74e28605d/assets/preview.gif)

[![codebeat badge](https://codebeat.co/badges/0c6bfaca-9794-4588-a017-05d88882e364)](https://codebeat.co/projects/github-com-alorel-polyfill-io-aot-master)
[![CodeFactor](https://www.codefactor.io/repository/github/alorel/polyfill.io-aot/badge)](https://www.codefactor.io/repository/github/alorel/polyfill.io-aot)
[![Coverage Status](https://coveralls.io/repos/github/Alorel/polyfill.io-aot/badge.svg?branch=1.0.0)](https://coveralls.io/github/Alorel/polyfill.io-aot?branch=1.0.0)
# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Prerequisites](#prerequisites)
- [Building](#building)
  - [Node API](#node-api)
    - [Node API configuration](#node-api-configuration)
    - [Node API events](#node-api-events)
    - [Providing your own user agent generators](#providing-your-own-user-agent-generators)
  - [CLI](#cli)
- [Consuming](#consuming)
  - [Framework-agnostic Node API](#framework-agnostic-node-api)
    - [Consumer API configuration](#consumer-api-configuration)
    - [Listening for missing bundles](#listening-for-missing-bundles)
  - [Express request handler](#express-request-handler)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Prerequisites

    npm install polyfill-service
    
Note: If you're using Node >=10.0 you need to pass the `--build-from-source parameter` to `npm install`
because of the `polyfill-service`'s `node-zopfli` dependency. `--ignore-engines` *may* be necessary as `polyfill-service`
lists the `node` requirement as `6.11.1 - 9` at the time of writing.

[^Table of Contents](#table-of-contents)

# Building
## Node API

    npm install --save-dev @polyfill-io-aot/builder
    
```javascript
//some-file.js
import {PolyfillBuilder, BuildEvent} from '@polyfill-io-aot/builder';

const config = {}; //information below
const builder = new PolyfillBuilder(config); //configuration is optional

function errorHandler(e) {}
function successHandler() {}

// If using the event API
builder.once(BuildEvent.ERROR, errorHandler);
builder.once(BuildEvent.END, successHandler);

// Start the process. This returns a promise in line with the events above.
builder.start()
  .then(successHandler)
  .catch(errorHandler);

```

[^Table of Contents](#table-of-contents)

### Node API configuration

| **Option**     	| **Default value**                           	| **Description**                                                                                                                                                                                                                                      	|
|----------------	|---------------------------------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| brotli         	| `{quality: 11}`                             	| Options to pass to the [iltorb module](https://github.com/MayhemYDG/iltorb/tree/503179e69762b3f11d7c3c1c8f116da081255d7e#brotliencodeparams)                                                                                                          |
| dirs           	| `[]`                                        	| Additional directories containing your own polyfills in the polyfill-service format. See [here](https://github.com/Financial-Times/polyfill-service/tree/v3.25.1/polyfills) and [here](https://polyfill.io/v2/docs/contributing/authoring-polyfills) 	|
| excludes       	| `[]`                                        	| Array of polyfills to exclude from the final bundle                                                                                                                                                                                                  	|
| flags          	| `[]`                                        	| Flags to pass to polyfill-service when generating bundles. Options: `gated` and `always`.                                                                                                                                                            	|
| outDir         	| ~/.polyfill-io-aot/.polyfills               	| Output directory                                                                                                                                                                                                                                     	|
| packageManager 	| npm                                         	| The package manager to use when spawning processes. Options: `npm`, `yarn`                                                                                                                                                                           	|
| polyfills      	| `['default']`                               	| Polyfills to consider (including aliases)                                                                                                                                                                                                            	|
| processes      	| `Math.max(1, NUM_CPU_CORES - 1)`            	| Number of processes to spawn for compression and polyfill bundle generation                                                                                                                                                                          	|
| uaGenerators   	|                                             	| Spoof user agent generators. Every user agent generated by these will be used to generate a set of polyfills and every unique set of polyfills will be persisted for use in production.                                                              	|
| unknown        	| polyfill                                    	| What to do when the user agent cannot be recognised. Options: `polyfill`, `ignore`                                                                                                                                                                   	|
| zopfli         	| `{blocksplitting: true, numiterations: 15}` 	| Options to pass to [node-zopfi-es](https://github.com/jaeh/node-zopfli-es/blob/1b58f2b098b250a3ef4517747104a43c8aaae7fb/README.md#options)                                                                                                                |

[^Table of Contents](#table-of-contents)

### Node API events

Import the build events enum as follows:

```javascript
import {BuildEvent} from '@polyfill-io-aot/builder';
```

| **Event**                 	| **Params**                        	| **Notes**                                                                                       	|
|---------------------------	|-----------------------------------	|-------------------------------------------------------------------------------------------------	|
| ERROR                     	| Error thrown                      	|                                                                                                 	|
| END                       	|                                   	|                                                                                                 	|
| COMPRESS_ALL_BEGIN        	|                                   	| The compression step began                                                                      	|
| COMPRESS_ALL_OK           	|                                   	| The compression step finished                                                                   	|
| COMPRESS_BROTLI_OK        	|                                   	| Brotli compression succeeded                                                                    	|
| COMPRESS_BROTLI_ERR       	| Error                             	| Brotli compression errored                                                                      	|
| COMPRESS_ZOPFLI_OK        	|                                   	| Zopfli compression succeeded                                                                    	|
| COMPRESS_ZOPFLI_ERR       	|                                   	| Zopfli compression errored                                                                      	|
| UGLIFY_ALL_BEGIN          	|                                   	| Uglify step began                                                                               	|
| UGLIFY_ALL_OK             	|                                   	| Uglify step succeeded                                                                           	|
| UGLIFY_ONE_BEGIN          	| Bundle hash (string)              	| Uglification of a specific bundle began                                                         	|
| UGLIFY_ONE_OK             	| Bundle hash (string)              	| Uglification of a specific bundle succeeded                                                     	|
| UGLIFY_ONE_ERR            	| Bundle hash (string), Error       	| Uglification of a specific bundle errored                                                       	|
| GENERATE_BUNDLES_BEGIN    	|                                   	| Bundle generation step began                                                                    	|
| GENERATE_BUNDLES_OK       	|                                   	| Bundle generation step succeeded                                                                	|
| GENERATE_BUNDLE_BEGIN     	| User agent (string)               	| User agent bundle generation began                                                              	|
| GENERATE_BUNDLE_OK        	| User agent (string)               	| User agent bundle generation succeeded                                                          	|
| GENERATE_BUNDLE_ERR       	| User agent (string), Error        	| User agent bundle generation errored                                                            	|
| GENERATE_COMBO_ALL_BEGIN  	|                                   	| Computing required polyfills step began                                                         	|
| GENERATE_COMBO_ALL_OK     	|                                   	| Computing required polyfills step succeeded                                                     	|
| GENERATE_COMBO_UA_BEGIN   	| User agent (string)               	|                                                                                                 	|
| GENERATE_COMBO_UA_OK      	| User agent (string)               	|                                                                                                 	|
| GENERATE_COMBO_UA_ERR     	| User agent (string), Error        	|                                                                                                 	|
| GENERATE_UAS_ALL_BEGIN    	|                                   	| Generating spoof user agents step began                                                         	|
| GENERATE_UAS_ALL_OK       	|                                   	| Generating spoof user agents step succeeded                                                     	|
| GENERATE_UAS_VENDOR_BEGIN 	| Browser vendor (string)           	|                                                                                                 	|
| GENERATE_UAS_VENDOR_OK    	| Browser vendor (string)           	|                                                                                                 	|
| GENERATE_UAS_VENDOR_ERR   	| Browser vendor (string), Error    	|                                                                                                 	|
| COMPILE_POLYFILLS_BEGIN   	|                                   	| Generating polyfill strings step began                                                          	|
| COMPILE_POLYFILLS_OK      	|                                   	| Generating polyfill strings step succeeded                                                      	|
| COMPILE_POLYFILLS_ERR     	|                                   	| Generating polyfill strings step errored                                                        	|
| COPY_EXTRA_DIRS_BEGIN     	|                                   	| Copying of directories from the `dirs` option to the `polyfill-service` package began.          	|
| COPY_EXTRA_DIRS_OK        	|                                   	| Copying of directories from the `dirs` option to the `polyfill-service` package succeeded.      	|
| COPY_EXTRA_FILES_BEGIN    	|                                   	| Copying of additional files from the `dirs` option to the `polyfill-service` package began.     	|
| COPY_EXTRA_FILES_OK       	|                                   	| Copying of additional files from the `dirs` option to the `polyfill-service` package succeeded. 	|
| COPY_EXTRA_DIR_BEGIN      	| from (string), to (string)        	|                                                                                                 	|
| COPY_EXTRA_DIR_OK         	| from (string), to (string)        	|                                                                                                 	|
| COPY_EXTRA_DIR_ERR        	| from (string), to (string), Error 	|                                                                                                 	|
| COPY_EXTRA_FILE_BEGIN     	| from (string), to (string)        	|                                                                                                 	|
| COPY_EXTRA_FILE_OK        	| from (string), to (string)        	|                                                                                                 	|
| COPY_EXTRA_FILE_ERR       	| from (string), to (string), Error 	|                                                                                                 	|
| FORMAT_DIR_BEGIN          	| directory (string)                	|                                                                                                 	|
| FORMAT_DIR_ERR            	| directory (string), Error         	|                                                                                                 	|
| FORMAT_DIR_OK             	| directory (string)                	|                                                                                                 	|
| FORMAT_DIRS_BEGIN         	|                                   	| Formatting of directories from the `dirs` option began.                                         	|
| FORMAT_DIRS_OK            	|                                   	| Formatting of directories from the `dirs` option succeeded.                                     	|
| START                     	|                                   	| The process has started.                                                                        	|
| VALIDATE_DIRS_BEGIN       	|                                   	| Validating of directories from the `dirs` option began.                                         	|
| VALIDATE_DIRS_OK          	|                                   	| Validating of directories from the `dirs` option succeeded.                                     	|
| VALIDATE_DIR_BEGIN        	| directory (string)                	|                                                                                                 	|
| VALIDATE_DIR_ERR          	| directory (string)                	|                                                                                                 	|
| WRITE_MANIFEST_BEGIN       	|                                   	| Started writing manifest.json                                                                   	|
| WRITE_MANIFEST_OK          	|                                   	| Finished writing manifest.json                                                                   	|

[^Table of Contents](#table-of-contents)

### Providing your own user agent generators

The library needs to generate spoof user agents in order to generate polyfill bundles. While the generators
provided should suit most needs, the `uaGenerators` option can be specified with a partial of the interface
below:

```typescript
type UAGeneratorFunction = () => IterableIterator<string>;

interface UserAgentGenerators {
  android: UAGeneratorFunction;
  blackberry: UAGeneratorFunction;
  chrome: UAGeneratorFunction;
  firefox: UAGeneratorFunction;
  firefoxMobile: UAGeneratorFunction;
  ie: UAGeneratorFunction;
  ieMobile: UAGeneratorFunction;
  iosSafari: UAGeneratorFunction;
  opera: UAGeneratorFunction;
  operaMobile: UAGeneratorFunction;
  safari: UAGeneratorFunction;
  samsung: UAGeneratorFunction;
}
```

For example, the generator function for Chrome could look as follows:

```javascript
function* uaGenerator() {
  for (let i = 4; i <= 100; i++) {
    yield `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${i}.0.0 Safari/537.36`;
  }
}
```

[^Table of Contents](#table-of-contents)

## CLI

    npm install --save-dev @polyfill-io-aot/builder-cli
    
    you@happy-place:~/dev/my-app$ polyfill-io-aot --help    
  
    Inline config:
      --brotli, -b     Options to pass to the iltorb module (JSON5).                                                                                                    [string] [default: {quality: 11}]
      --dirs, -d       Additional directories containing your own polyfills in the polyfill-service format.                                                                         [array] [default: []]
      --excludes, -e   Array of polyfills to exclude from the final bundle.                                                                                                         [array] [default: []]
      --flags, -f      Flags to pass to polyfill-service when generating bundles.                                                                      [array] [choices: "gated", "always"] [default: []]
      --polyfills, -p  Polyfills to consider                                                                                                                               [array] [default: ['default']]
      --processes, -r  Number of processes to spawn for compression and polyfill bundle generation.                                                    [number] [default: Math.max(1, NUM_CPU_CORES - 1)]
      --unknown, -u    What to do when the user agent cannot be recognised                                                                   [string] [choices: "polyfill", "ignore"] [default: polyfill]
      --zopfli, -z     Options to pass to node-zopfli-es (JSON5).                                                                              [string] [default: {blocksplitting: true, numiterations: 15}]
      --out, -o        Output directory                                                                                                                 [string] [default: ~/.polyfill-io-aot/.polyfills]
      --pkg, -k        The package manager to use when spawning processes.                                                                               [string] [choices: "npm", "yarn"] [default: npm]
    
    Full config:
      --json, -j    Builder configuration (JSON5). Exclusive with any other config option. This can be set in the "polyfill-io-aot" key in your package.json.                                    [string]
      --config, -c  Path to a .js config file exporting the configuration (module.exports = {}). No other option may be provided if this is specified.                                           [string]
    
    Options:
      --help     Show help                                                                                                                                                                      [boolean]
      --version  Show version number                                                                                                                                                            [boolean]
    
    Any inline JSON configuration can be entered in non-strict JSON5 format.
    See:
      https://www.npmjs.com/package/json5
      https://spec.json5.org/

Any JSON input is parsed according to the [JSON5 specification](https://spec.json5.org/), i.e.
it accepts both standard JSON and the syntax accepted in Javascript.

Additionally, environment
variables prefixed with `POLYFILL_IO_AOT` can be used; for more information, refer to the
[yargs documentation](https://github.com/yargs/yargs/blob/a2f2eae2235fa9b10ce221aea1320b1dfc564efa/docs/api.md#envprefix).

[^Table of Contents](#table-of-contents)

# Consuming
## Framework-agnostic Node API

    npm install @polyfill-io-aot/core
    
```javascript
import {PolyfillIoAot, Compression} from '@polyfill-io-aot/core';

const conf = {}; //details below
const aot = new PolyfillIoAot(conf);

// Get uncompressed polyfills
let polyfills = aot.getPolyfills(userAgentString);
// Alternatively
polyfills = aot.getPolyfills(userAgentString, Compression.NONE);

// Get them gzipped
polyfills = aot.getPolyfills(userAgentString, Compression.GZIP);

// Or brotli-encoded
polyfills = aot.getPolyfills(userAgentString, Compression.BROTLI);

// Consume
polyfills
  .then(buffer => doSomething(buffer));
```

The buffer returned also has the following read-only properties:

- `$hash`: Hash of the included polyfills
- `$etag`: ETag of the buffer
- `$lastModified` (pre-built polyfills only): a header-friendly string of when the polyfills were built. 

[^Table of Contents](#table-of-contents)

### Consumer API configuration

The api inherits the following config parameters from the [builder configuration](#node-api-configuration):

- brotli
- excludes
- flags
- outDir
- polyfills
- unknown

Additionally, the `gzip` parameter can be specified and will be passed to [zlib.gzip()](https://nodejs.org/api/zlib.html#zlib_class_options).

It is important to keep `excludes`, `flags`, `outDir`, `polyfills` and `unknown` synchronised with those used for
building the bundle.

`brotli` and `gzip` will only be used if a prebuilt bundle cannot be found for a given user agent. These are
set to maximum compression by default; you may want to reduce these values if your server struggles to cope.

[^Table of Contents](#table-of-contents)

### Listening for missing bundles

While such an event *should* be rare, it's possible that a bundle may be missing for a given user agent.
The `PolyfillIoAot` instance will emit an event which you can subscribe to and react accordingly:

```javascript
import {PolyfillIoAot} from '@polyfill-io-aot/core';

const aot = new PolyfillIoAot();
aot.on(PolyfillIoAot.POLYFILL_NOT_FOUND, (userAgent, computedPolyfills, hash) => {
  log('The world is ending: ', userAgent, computedPolyfills, hash);
});
```

[^Table of Contents](#table-of-contents)

## Express request handler

An Express 4.x request handler is available for your convenience:

    npm install @polyfill-io-aot/express
    
```javascript
  import * as express from 'express';
  import {createRequestHandler} from '@polyfill-io-aot/express';
  
  const app = express();
  app.get('/polyfill.js', createRequestHandler(config))
```

The `createRequestHandler` accepts the same parameters as the
[framework-agnostic consumer](#consumer-api-configuration). Alternatively, an instance of
`PolyfillIoAot` can be passed instead of the configuration.

The created handler will have the `PolyfillIoAot` instance as the `aot` property, allowing you to
interact with it the same way you would with the original API:

```javascript
const handler = createRequestHandler(config);
handler.aot.on(PolyfillIoAot.POLYFILL_NOT_FOUND, keepCalmAndHandleIt);
  app.get('/polyfill.js', handler);
```

[^Table of Contents](#table-of-contents)