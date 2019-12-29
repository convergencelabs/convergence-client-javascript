<div align="center">
  <img  alt="Convergence Logo" height="80" src="assets/convergence-logo.png" >
</div>

# Convergence JavaScript Client
[![Build Status](https://travis-ci.org/convergencelabs/convergence-client-javascript.svg?branch=master)](https://travis-ci.org/convergencelabs/convergence-client-javascript)

This is the first (and only) client for the [Convergence Collaboration Framework](https://convergence.io).  It runs in all evergreen browsers and node.js as well (with a [slight configuration](https://docs.convergence.io/guide/getting-started.html)).

The client is implemented in typescript.  The build system uses both Rollup and WebPack to bundle and transpile the typescript to single files using a variety of module systems.  For testing, the typescript compiler is used to compile the code into ES5 and commonjs modules to support direct unit testing in node.

## Issue Reporting
The core Convergence capability is composed of multiple individual projects that are released together. To simplify things, there is a central project that is used for issues, project planning, and road mapping.  To report an issue please use the [convergence-project](https://github.com/convergencelabs/convergence-project) repository.

## Usage

```
npm install @convergence/convergence
```

See our [developer guide](https://docs.convergence.io/guide/getting-started.html) for a quick overview and some getting started code snippets.

## Versioning
The Convergence JavaScript Client follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) with two notable exceptions:

1. API introduced in a MAJOR or MINOR pre-release version (e.g. 1.1.0-alpha.1) is considered unstable and subject to breaking changes until that MAJOR or MINOR version is released.
2. API marked with an `@experimental` tag is considered unstable and subject to breaking changes in a future release.

These deviations from strict Semantic Versioning are intended to get potential new functionality to the community as fast as possible in order to get rapid feedback before the API is finalized. If you do not want to be an early adopter, then you should refrain from using pre-release versions or API marked as `@experimental`.

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
The Convergence JavaScript client is licensed under the [Lesser GNU Public License v3](COPYING.LESSER) (LGPLv3). This allows developers to use the client without having to release their code under the LGPLv3, assuming they only use the client as a library and do not modify it. Refer to the [COPYING](COPYING) and [COPYING.LESSER](COPYING.LESSER) for the specific terms and conditions of the license.

The Convergence Client is also available under a Commercial License. If you are interested in a non-open source license please contact us at [Convergence Labs](https://convergencelabs.com).
