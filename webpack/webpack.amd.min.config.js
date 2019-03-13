const merge = require("webpack-merge");
const commonConfig = require('./webpack.amd.config.js');
const minConfig = require('./webpack.common.min.config.js');

module.exports = merge(commonConfig, minConfig, {
  output: {
    filename: 'convergence.amd.min.js',
  }
});
