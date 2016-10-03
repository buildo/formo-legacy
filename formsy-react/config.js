const t = require('tcomb');

const Config = t.struct({
 NODE_ENV: t.enums.of(['development', 'production']),
 uglify: t.maybe(t.Boolean), // default: false
 gzip: t.maybe(t.Boolean), // default: false
 debug: t.maybe(t.String), // default: undefined (no debug)
 eslint: t.maybe(t.Boolean) // default: false
}, 'Config');

module.exports = Config(require('./config.json'));