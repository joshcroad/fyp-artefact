/** @fileOverview The main application. */

var q         = require('q')
  , file      = require('./file')
  , mongo     = require('./mongo')
  , redis     = require('./redis')
  , writeTest = require('./handlers/write')
  , conf      = require('../config.json')
  , args      = process.argv
  , app       = {};

/** Global constant defining debug status. Debug is always assumed. */
global.DEBUG = typeof conf.env.dev === 'undefined' ? true : conf.env.dev;

// Remove the first two arguments.
args.splice(0,2);

/**
 * Start the application.
 */
app.run = function () {
  console.log('\nErrors are logged at ./output/dump.txt\n');
  
  var setup = q.all([ file.init(), mongo.init(conf.dbs.mongo), redis.init() ]);
  setup.then(function runTests(data) {
    for(var i = 0, l = data.length; i < l; i++) { 
      console.log(data[i])
    }
    
    // args[0] can be 'write', 'read', ...
    switch(args[0]) {
      case 'write':
        return writeTest.run(args[1], args[2]);
        break;
      default: break;
    }
  })
  .then(function closeConnections(data) {
    console.log(data);
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