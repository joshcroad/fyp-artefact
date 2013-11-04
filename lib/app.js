var http = require('http')
/**
 * Create the server and listen.
 * 
 * @param  {function} cb A callback function.
 */
app.server = function (cb) {
  http.createServer(cb).listen(PORT)
};