const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: "production",
  optimization: {
    minimizer: [new TerserPlugin({
      terserOptions: {
        output: {
          comments: /^\**!|@preserve|@license|@cc_on/i
        },
        toplevel: true,
        mangle: {
          properties: {
            regex: /(^_.*|.*transform.*|serverOp|clientOp)/
          }
        }
      }
    })]
  }
};
