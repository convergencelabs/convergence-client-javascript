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
