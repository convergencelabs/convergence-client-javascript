# Convergence Javascript Client

This is the first (and only) client for the [Convergence Collaboration Engine](https://convergence.io).  It runs in all evergreen browsers and node.js as well (with a [slight configuration](https://docs.convergence.io/guide/getting-started.html)).

The client is implemented in typescript.  The build system uses Rollup to bundle and transpile the typescript to a single minified ES5 file.  For testing, the typescript compiler is used to compile the code into ES5 and commonjs modules to support direct unit testing in node.

## Usage in your app

```
npm install @convergence/convergence
```

See our [developer guide](https://docs.convergence.io/guide/getting-started.html) for a quick overview and some getting started code snippets.

## Support

[Convergence Labs](https://convergencelabs.com) provides several different channels for support:

- Please use the [Discourse Forum](https://forum.convergence.io) for general and technical questions, so the whole community can benefit.
- For paid dedicated support or custom development services, [contact us](https://convergence.io/contact-sales/) directly.
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

### Examples
Several examples are available in the examples folder.  An active server must be available to run the
examples.  This allows for easy testing of certain functionality without needing to mess with `npm link`.


### Mock Convergence Server
The src/test-e2e/mock-server directory contains a mock server infrastructure that allows end-to-end testing
of the client without the need for a server.
