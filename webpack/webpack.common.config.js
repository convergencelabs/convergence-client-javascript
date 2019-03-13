const path = require('path');

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
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, '../dist-internal'),
    library: 'Convergence'
  },
  externals: [
    "rxjs"
  ]
};
