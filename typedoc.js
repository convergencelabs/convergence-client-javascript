module.exports = {
  name: "Convergence JavaScript Client API Documentation",
  target: "ES6",

  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
  excludeProtected: true,
  exclude: [
    '**/model/ot/**',
    '**/model/internal/**',
    '**/model/rt/richtext/**',
    '**/index' // this doesn't do anything..
  ],

  mode: "modules",
  out: "dist/docs",
  baseUrl: "src/main/ts",
  readme: "src/docs/README.md",
  json: "dist/docs.json",

  theme: "node_modules/@convergencelabs/typedoc-theme/bin/default",

  gaId: "UA-84372428-3",

  hideGenerator: true
};