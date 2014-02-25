/** @fileOverview The main application. */

var q           = require('q')
  , file        = require('./file')
  , mongo       = require('./mongo')
  , redis       = require('./redis')
  , log         = require('./log')
  , writeTest   = require('./handlers/write')
  , updateTest  = require('./handlers/update')
  , searchTest  = require('./handlers/search')
  , conf        = require('../config.json')
  , app         = {};

/**
 * Run the application.
 */
app.run = function (argv) {
  var options = argv.slice(2),
      args = {};

  args.script = options[0];
  args.lower  = options[1] || 10;
  args.upper  = options[2] || 100000;

  log.info('Errors logged at output/dump.txt');
  
  // Check first argument is less than second.
  if (args.upper < args.lower)
    return log.error('First paramater must be smaller than second.');

  if (args.upper > 100000)
    return log.error('Not enough memory, lower upper bound.');
  
  // Call all the setup functions async style, then run test.
  var setup = q.all([ file.init(), mongo.init(conf.dbs.mongo), redis.init() ]);
  
  // Run all setup functions, and return a promise.
  setup
  
  // App opened for business. Run tests.
  .then(function (data) {
    // Print all promise resolutions.
    for(var i = 0, l = data.length; i < l; i++) { 
      log.loaded(data[i]);
    }
    log.space();
    
    if (args.script === '--write' || args.script === '-w') {
      return writeTest.conduct(args.lower, args.upper);
    }
    
    else if (args.script === '--update' || args.script === '-u') {
      return updateTest.conduct(args.lower, args.upper);
    }
    
    else if (args.script === '--search' || args.script === '-s') {
      return searchTest.conduct(args.lower, args.upper);
    }
    
    else {
      return log.error('No test specified');
    }
  })
  
  // Tests finished, promised received. Close app.
  .then(function (data) {
    if (data)
      log.success();
    // Test complete, close all connections.
    var closeAll = q.all([ file.close(), mongo.close(), redis.close() ]);
    return closeAll;
  })
  
  // Application closed, promise received. Finish up.
  .then(function (data) {
    log.space();
    for(var i = 0, l = data.length; i < l; i++) {
      log.closed(data[i]);
    }
    
    // Print data to chart.js
    file.printChartDataToFile();
  })
  
  .catch(function (err) {
    file.write(null, err);
  });
  
}

module.exports = app;

if (require.main === module) app.run(process.argv);