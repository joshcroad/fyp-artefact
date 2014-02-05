/** @fileOverview The main application. */

var q     = require('q')
  , file  = require('./file')
  , mongo = require('./mongo')
  , redis = require('./redis')
  , conf  = require('../config.json')
  , app   = {};

/** Global constant defining debug status. Debug is always assumed. */
global.DEBUG = typeof conf.env.dev === 'undefined' ? true : conf.env.dev;

// Start the application.
app.run = function () {
  console.log('\nErrors are logged at /output/dump.txt\n');
  
  var setup = q.all([ file.init(), mongo.init(conf.dbs.mongo), redis.init() ]);
  setup.then(function runTests(data) {
    for(var i = 0, l = data.length; i < l; i++) { 
      console.log(data[i])
    }
    // Setup complete, run tests.
  })
  .then(function closeConnections(data) {
    // Test complete, close all connections.
    var closeAll = q.all([ file.close(), mongo.close(), redis.close() ]);
    return closeAll;
  })
  .then(function finishUp(data) {
    // Program finished.
    for(var i = 0, l = data.length; i < l; i++) {
      console.log(data[i])
    }
  })
  .catch(function printError(err) {
    file.write(null, err)
  });
  
}

module.exports = app;

if (require.main === module) app.run()