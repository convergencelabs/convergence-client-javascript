/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

const path = require('path');
const merge = require("webpack-merge");
const commonConfig = require('./webpack.common.config.js');

module.exports = merge(commonConfig, {
  resolve: {
    alias: {
      'rxjs/operators': path.resolve(__dirname, 'rxjs_operators_amd_fix.js')
    }
  },
  output: {
    filename: 'convergence.amd.js',
    libraryTarget: 'amd'
  },
  externals: [
    "rxjs"
  ]
});
