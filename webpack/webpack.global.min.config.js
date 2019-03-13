const merge = require("webpack-merge");
const commonConfig = require('./webpack.global.config.js');
const minConfig = require('./webpack.common.min.config.js');

module.exports = merge(commonConfig, minConfig, {
  output: {
    filename: 'convergence.global.min.js',
  }
});
