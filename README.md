<div align="center">
  <img  alt="Convergence Logo" height="80" src="assets/convergence-logo.png" >
</div>

# Convergence Javascript Client
![Build Status](https://travis-ci.org/convergencelabs/convergence-client-javascriipt.svg?branch=master)

This is the first (and only) client for the [Convergence Collaboration Engine](https://convergence.io).  It runs in all evergreen browsers and node.js as well (with a [slight configuration](https://docs.convergence.io/guide/getting-started.html)).

The client is implemented in typescript.  The build system uses both Rollup and WebPack to bundle and transpile the typescript to single files using a variety of module systems.  For testing, the typescript compiler is used to compile the code into ES5 and commonjs modules to support direct unit testing in node.

## Usage

```
npm install @convergence/convergence
```

See our [developer guide](https://docs.convergence.io/guide/getting-started.html) for a quick overview and some getting started code snippets.

## Support

[Convergence Labs](https://convergencelabs.com) provides several different channels for support:

- Please use the [Discourse Forum](https://forum.convergence.io) for general and technical questions, so the whole community can benefit.
- For paid dedicated support, integration assistance, or other custom development services, [contact us](https://convergence.io/contact-sales/) directly.
- Email <support@convergencelabs.com> for all other inquiries.


## Developing
To build a distribution build:
```
npm install
npm run dist
```

To test:
```
npm run test
```

Test coverage can be run using
```
npm run test:cover
```

### Test Pages and Scripts
Several examples are available in the [test-pages](test-pages) folder. These allow you to open a browser window with the current compiled version of the client and test functionality. Similarly, the [src/scripts](src/scripts) directory contains several node scripts that leverage ts-node to execute the raw typescript codebase without compiling.

In both cases, an active server must be available to run the examples or scripts.


## License
The Convergence JavaScript client is licensed under the [Lesser GNU Public License v3](LICENSE.txt) (LGPLv3). This allows developers to use the client without having to release their code under the LGPLv3 assuming, they only use the client as a library and do not modify it. Refer to the [LICENSE.txt](LICENSE.txt) for the specific terms and conditions of the license.

The Convergence Client is also available under a Commercial License. If you are interested in a non-open source license please contact us at [Convergence Labs](https://convergencelabs.com).
