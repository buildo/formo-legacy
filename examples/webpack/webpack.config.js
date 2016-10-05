/* eslint-disable no-var */
var path = require('path');
var paths = require('./paths');

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    path.resolve(paths.SRC, 'index.js')
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: paths.BUILD,
    hot: true,
    inline: true,
    port: 8080
  },
  output: {
    library: 'webclient',
    libraryTarget: 'var',
    path: paths.BUILD,
    filename: 'bundle.js'
  },
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'eslint',
        include: paths.SRC
      }
    ],
    loaders: [
      // babel transpiler
      {
        test: /\.jsx?$/, // test for both js and jsx
        loaders: ['babel'], // babel config stays in .babelrc
        include: [
          paths.SRC
        ]
      }
    ]
  }
};
