var assign = require('lodash/assign');
var config = require('./config');
var paths = require('./paths');
var base = require('./webpack.config.base')({ config: config, paths: paths });

module.exports = assign({}, base);
