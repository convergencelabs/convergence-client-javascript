const path = require('path');
const VirtualModulesPlugin = require("webpack-virtual-modules");
const webpackRxjsExternals = require('webpack-rxjs-externals');

const virtualModules = new VirtualModulesPlugin({
  'rxjs/operators': `
   const rxjs = require("rxjs");
   module.exports = rxjs.operators;
  `
});

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: './src/main/ts/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Convergence',
    libraryTarget: 'umd'
  },
  externals: [
    webpackRxjsExternals()
  ],
  plugins: [virtualModules]
};
