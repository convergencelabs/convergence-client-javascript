import rollupTypescript2 from "rollup-plugin-typescript2";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from "typescript";
import json from "rollup-plugin-json";

const packageJson = require("./dist-internal/package.json");
const replacePlugin = replace({
  CONVERGENCE_CLIENT_VERSION: "" + packageJson.version
});


const commonPlugins = [
  resolve({
    jsnext: true,
    main: true
  }),
  commonjs({include: 'node_modules/**'}),
  json()
];

const input = "src/main/ts/index.ts";

export default [
  {
    input: input,
    output: [
      {
        file: "dist-internal/bundles/convergence.umd.js",
        format: 'umd',
        amd: {
          id: 'convergence'
        },
        name: "Convergence",
        exports: "named",
        sourcemap: true,
        globals: {
          "rxjs": "rxjs",
          "rxjs/operators": "rxjs.operators"
        }
      }, {
        file: "dist-internal/bundles/convergence.global.js",
        format: 'iife',
        name: "Convergence",
        sourcemap: true,
        globals: {
          "rxjs": "rxjs",
          "rxjs/operators": "rxjs.operators"
        }
      }, {
        file: "dist-internal/bundles/convergence.amd.js",
        format: 'amd',
        amd: {
          id: 'convergence'
        },
        name: "Convergence",
        sourcemap: true,
        globals: {
          "rxjs": "rxjs",
          "rxjs/operators": "rxjs.operators"
        }
      }
    ],
    external: [
      "rxjs",
      "rxjs/operators"
    ],
    plugins: [
      replacePlugin,
      rollupTypescript2({
        typescript: typescript,
        rollupCommonJSResolveHack: true,
        tsconfigOverride: {
          compilerOptions: {
            resolveJsonModule: false,
            module: "ES2015"
          }
        }
      }),
      ...commonPlugins
    ]
  },
  {
    input: input,
    output: [
      {file: "dist-internal/convergence.js", format: 'cjs', sourcemap: true, exports: "named"},
    ],
    external: [
      "rxjs",
      "rxjs/operators",
      "protobufjs/light",
      "long"
    ],
    plugins: [
      rollupTypescript2({
        typescript: typescript,
        rollupCommonJSResolveHack: true,
        tsconfigOverride: {
          compilerOptions: {
            resolveJsonModule: false,
            module: "ES2015"
          }
        }
      }),
      replacePlugin,
      ...commonPlugins
    ]
  },
  {
    input: input,
    output: [
      {file: "dist-internal/convergence.mjs", format: 'es', sourcemap: true, exports: "named"}
    ],
    external: [
      "rxjs",
      "rxjs/operators",
      "protobufjs/light",
      "long"
    ],
    plugins: [
      replacePlugin,
      rollupTypescript2({
        typescript: typescript,
        rollupCommonJSResolveHack: true,
        tsconfigOverride: {
          compilerOptions: {
            resolveJsonModule: false,
            target: "es6",
            module: "ES2015"
          }
        }
      }),
      ...commonPlugins
    ]
  }
];
