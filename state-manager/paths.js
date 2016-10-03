var path = require('path');

module.exports = {
  SRC: path.resolve(__dirname, 'src'),
  APP: path.resolve(__dirname, 'src/app'),
  BUILD: path.resolve(__dirname, 'build'),
  NODE_MODULES: path.resolve(__dirname, 'node_modules'),
  COMPONENTS: path.resolve(__dirname, 'src/app/components'),
  VARIABLES_MATCH: /(v|V)ariables\.scss$/
};
