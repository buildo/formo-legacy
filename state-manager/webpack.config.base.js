var path = require('path');
var webpack = require('webpack');
var assign = require('lodash/assign');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackUtil = require('./webpack.util');

module.exports = function(opts) {
  var config = opts.config;
  var paths = opts.paths;
  var base = require('./webpack.base')({ config: config, paths: paths });

  return assign({}, base, {

    entry: [
      'webpack/hot/dev-server',
      path.resolve(paths.SRC, 'index.js')
    ],

    devtool: config.devTool || 'source-map',

    devServer: {
      contentBase: paths.BUILD,
      hot: true,
      inline: true,
      port: config.port
    },

    plugins: base.plugins.concat([
      new HtmlWebpackPlugin(WebpackUtil.getHtmlPluginConfig(config, false))
    ]),

    module: assign({}, base.module, {
      loaders: base.module.loaders.concat([
        // style!css loaders
        {
          test: /\.css?$/,
          loaders: ['style', 'css']
        },
        // SASS loaders
        {
          test: /\.scss?$/,
          exclude: paths.VARIABLES_MATCH,
          loaders: ['style', 'css', 'resolve-url', 'sass?sourceMap']
        }
      ])
    })

  });

};
