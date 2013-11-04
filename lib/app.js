var http = require('http')
  , mongo = require('./mongo')
  , redis = require('./redis')
  , app = {};
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
};/**
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