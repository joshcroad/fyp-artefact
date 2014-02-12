/** @fileOverview The main application. */

var q           = require('q')
  , file        = require('./file')
  , mongo       = require('./mongo')
  , redis       = require('./redis')
  , writeTest   = require('./handlers/write')
  , updateTest  = require('./handlers/update')
  , searchTest  = require('./handlers/search')
  , conf        = require('../config.json')
  , app         = {};

/** Global constant defining debug status. Debug is always assumed. */
global.DEBUG = typeof conf.env.dev === 'undefined' ? true : conf.env.dev;

// Remove the first two arguments from the parameters.
var args = process.argv;
args.splice(0,2);

/**
 * Start the application.
 */
app.run = function () {
  console.log('\nErrors are logged at ./output/dump.txt\n');
  
  // Call all the setup functions async style, then run test.
  var setup = q.all([ file.init(), mongo.init(conf.dbs.mongo), redis.init() ]);
  setup
  .then(function runTests(data) {
    for(var i = 0, l = data.length; i < l; i++) { 
      console.log(data[i])
    }
    if (args[1] > args[2])
      return console.log('\n\nFirst paramater must be smaller than second.\n\n');
    switch(args[0]) {
      case 'write':
        return writeTest.conduct(args[1] || 10, args[2] || 100000);
        break;
      case 'update':
        return updateTest.conduct(args[1] || 10, args[2] || 100000);
        break;
      case 'search':
        return searchTest.conduct(args[1] || 10, args[2] || 100000);
        break;
      default: 
        console.log('\n\nNo test specified, closing.\n\n');
        break;
    }
  })
  .then(function closeConnections(data) {
    console.log(data || 'No test executed.');
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
