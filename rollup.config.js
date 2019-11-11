import rollupTypescript2 from "rollup-plugin-typescript2";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from "typescript";
import json from "rollup-plugin-json";

const commonPlugins = [
  resolve({
    jsnext: true,
    main: true
  }),
  commonjs({include: ['node_modules/**'], exclude: ["*.json"]}),
  json(),
];

const input = "src/main/index.ts";

export default [
  {
    input: input,
    output: [
      {file: "dist/convergence.js", format: 'cjs', sourcemap: true, exports: "named"},
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
      ...commonPlugins
    ]
  },
  {
    input: input,
    output: [
      {file: "dist/convergence.esm.js", format: 'es', sourcemap: true, exports: "named"}
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
            target: "ES2015",
            module: "ES2015"
          }
        }
      }),
      ...commonPlugins
    ]
  }
];
