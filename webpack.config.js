const webpack = require('webpack');
const path = require('path');
const paths = {
  SRC: path.resolve(__dirname, 'src'),
  APP: path.resolve(__dirname, 'src/app'),
  BUILD: path.resolve(__dirname, 'build'),
  TEST: path.resolve(__dirname, 'test')
};

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {

  resolve: {
    root: [paths.APP, paths.SRC],
    extensions: ['', '.js', 'ts', '.tsx']
  },

  stats: {
    children: false
  },

  output: {
    path: paths.BUILD,
    filename: 'bundle.js'
  },

  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(NODE_ENV) })
  ],

  entry: [
    'webpack/hot/dev-server',
    path.resolve(paths.SRC, 'client.js')
  ],

  devServer: {
    contentBase: paths.BUILD,
    hot: true,
    inline: true,
    host: '0.0.0.0',
    port: 9091
  },

  module: {
    loaders: [{
      test: /\.tsx?$|\.jsx?$/,
      loaders: ['awesome-typescript'],
      include: [paths.SRC, paths.TEST]
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }, {
      test: /\.scss$/,
      loader: 'style!css!sass'
    }]
  }
};
