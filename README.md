# Convergence Javascript Client

The client is implemented in typescript.  The build system uses Rollup to bundle and transpile the
typescript to a single minified ES5 file.  For testing, the typescript compiler is used to compile the code
into ES5 and commonjs modules to support direct unit testing in node.


## Building
To build a distribution build:

```
npm install
gulp dist-min
```

To test run:

```
gulp test
```

Test coverage can be run using

```
gulp coverage
```


## Examples
Several examples are available in the examples folder.  An active server must be available to run the
examples.


## Mock Convergence Server
The src/test-e2e/mock-server directory contains a mock server infrastructure that allows end-to-end testing
of the client without the need for a server.