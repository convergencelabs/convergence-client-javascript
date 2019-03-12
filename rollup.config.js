import rollupTypescript2 from "rollup-plugin-typescript2";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from "typescript";
import json from "rollup-plugin-json";
import virtual from "rollup-plugin-virtual";

const packageJson = require("./dist-internal/package.json");
const replacePlugin = replace({
  CONVERGENCE_CLIENT_VERSION: "" + packageJson.version
});


const commonPlugins = [
  resolve({
    jsnext: true,
    main: true
  }),
  // cjsEs({ nested: true, include: ['node_modules/**/*'], exclude: ["node_modules/**/*.json"]}),
  commonjs({include: ['node_modules/**'], exclude: ['node_modules/protobufjs/**/*', "*.json"]}),
  json(),
];

const input = "src/main/ts/index.ts";

export default [
  {
    treeshake: false,
    input: input,
    output: [
      {
        file: "dist-internal/bundles/convergence.global.js",
        format: 'iife',
        name: "Convergence",
        sourcemap: true,
        exports: "named",
        globals: {
          "rxjs": "rxjs"
        }
      }, {
        file: "dist-internal/bundles/convergence.amd.js",
        format: 'amd',
        amd: {
          id: 'convergence'
        },
        name: "Convergence",
        exports: "named",
        sourcemap: true,
      }, {
        file: "dist-internal/bundles/convergence.umd.js",
        format: 'umd',
        amd: {
          id: 'convergence'
        },
        name: "Convergence",
        sourcemap: true,
        exports: "named",
        globals: {
          "rxjs": "rxjs"
        }
      }
    ],
    external: [
      "rxjs"
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
      virtual({
        'rxjs/operators': `
            import rxjs from 'rxjs'; 
            export const {filter, map, concatMap, tap, share} = rxjs.operators;
        `,
        'protobufjs/light': `
            export const {Root} = protobuf;
        `
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
      {file: "dist-internal/convergence.esm.js", format: 'es', sourcemap: true, exports: "named"}
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
