/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

const merge = require("webpack-merge");
const commonConfig = require('./webpack.common.config.js');

module.exports = merge(commonConfig, {
  output: {
    filename: 'convergence.global.js',
    libraryTarget: 'var'
  },
  externals: {
    "rxjs": "rxjs",
    "rxjs/operators": "rxjs.operators"
  }
});
