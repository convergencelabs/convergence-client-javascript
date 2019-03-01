import rollupTypescript2 from "rollup-plugin-typescript2";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from "typescript";
import json from "rollup-plugin-json";

export default {
  input: "src/main/ts/index.ts",
  output: {
    file: "dist-internal/umd/convergence.js",
    format: 'umd',
    name: "Convergence",
    exports: "named",
    sourcemap: true,
    globals: {
      "rxjs": "rxjs",
      "rxjs/operators": "rxjs.operators",
      "protobufjs/light": "protobuf",
      "long": "long"
    },
  },
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
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({include: 'node_modules/**'}),
    json()
  ]
};
