var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

module.exports = function(opts) {
  var config = opts.config;
  var paths = opts.paths;

  var NODE_ENV = process.env.NODE_ENV || config.NODE_ENV || 'development';

  var preLoaders = config.eslint ? [
    // linting with eslint
    {
      test: /\.jsx?$/, // test for both js and jsx
      loader: 'eslint',
      include: paths.SRC
    }
  ] : [];

  return {

    resolve: {
      root: [
        paths.APP, paths.COMPONENTS,
        paths.NODE_MODULES
      ]
    },

    stats: {
      children: false
    },

    output: {
      library: 'webclient',
      libraryTarget: 'var',
      path: paths.BUILD,
      filename: 'bundle.js'
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
      })
    ],

    module: {
      preLoaders: preLoaders,
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
}
