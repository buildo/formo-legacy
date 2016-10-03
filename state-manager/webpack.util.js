var path = require('path');
var fs = require('fs');

var getTemplate = function(config) {
  var indexHtml = fs.readFileSync(path.resolve(process.cwd(), './src/index.html'), 'utf8');
  indexHtml = indexHtml.replace(/__GZIP__/g, config.gzip ? '.gz' : '');
  return indexHtml;
};

var getHtmlPluginConfig = function(config, bundle) {
  var htmlPluginConfig = {};
  htmlPluginConfig.inject = false;
  htmlPluginConfig.bundle = bundle;
  htmlPluginConfig.minify = bundle ? {} : false;
  htmlPluginConfig.templateContent = getTemplate(config);
  return htmlPluginConfig;
};


module.exports = {
  getHtmlPluginConfig: getHtmlPluginConfig
};
