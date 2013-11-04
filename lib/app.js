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
};