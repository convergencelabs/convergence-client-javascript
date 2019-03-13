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
