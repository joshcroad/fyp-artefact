var http = require('http')
  , mongo = require('./dbs/mongo')
  , redis = require('./dbs/redis')
  , config = require('../config.json')
  , PORT = process.env.PORT || config.port || 3000
  , app = {};

/**
 * Global constant defining debug status.
 * 
 * @type {boolean}
 */
global.DEBUG = typeof config.debug === 'undefined' ? true : false;

/**
 * Initialise the application.
 */
app.init = function () {
  mongo.init();
  redis.init();
};

/**
 * Create the server and listen.
 * 
 * @param  {function} cb A callback function.
 */
app.server = function (cb) {
  http.createServer(cb).listen(PORT)
};

/**
 * Connect the application. Initialise and create the server.
 * 
 * @param  {function} cb A callback function.
 */
app.connect = function (cb) {
  app.init();
  // This callback is called each time a user connects client side.
  app.server(function (req, res) {});
  // Runs the callback once the application is loaded.
  if (typeof cb === 'function')
    cb();
};

module.exports = app;

if (require.main === module)
  app.connect(function () {
    console.log('Server is running on port ' + PORT);
  });