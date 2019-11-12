/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

const path = require('path');

module.exports = {
  mode: "production",
  optimization: {
    minimize: false
  },
  devtool: "source-map",
  entry: './src/main/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            module: "es6"
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    library: 'Convergence'
  },
  externals: [
    "rxjs"
  ]
};
