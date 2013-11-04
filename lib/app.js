var http    = require('http')
  , mongo   = require('./dbs/mongo')
  , redis   = require('./dbs/redis')
  , config  = require('../config.json')
  , port    = process.env.PORT || config.port || 3000
  , app     = {};

/**
 * Global constant defining debug status.
 */
global.DEBUG = typeof config.debug === 'undefined' ? true : false;

/**
 * The application server.
 */
app.server = http.createServer(function (req, res) {});

/**
 * Connect the application. Initialise and create the server.
 *
 * @param  {function} cb A callback function.
 */
app.connect = function (cb) {
  mongo.init();
  redis.init();
  app.server.listen(port);
  // Runs the callback once the application is loaded.
  typeof cb === 'function' && cb();
};

module.exports = app;

if (require.main === module)
  app.connect(function () {
    console.log('Server is running on port ' + port);
  });