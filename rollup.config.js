/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

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
