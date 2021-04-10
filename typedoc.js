module.exports = {
  name: "Convergence JavaScript Client API Documentation",

  excludeExternals: true,

  excludePrivate: true,
  excludeProtected: true,
  exclude: [
    '**/model/ot/**',
    '**/model/internal/**',
    '**/model/rt/richtext/**'
  ],

  out: "dist/docs",
  entryPoints: ["src/main/ts/index.ts"],
  readme: "src/docs/README.md",
  json: "dist/docs.json",

  theme: "node_modules/@convergencelabs/typedoc-theme/bin/default",

  gaID: "UA-84372428-3",

  hideGenerator: true
};
