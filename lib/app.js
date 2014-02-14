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

/**
 * Run the application.
 */
app.run = function (argv) {
  var options = argv.slice(2),
      args = {};
  
  args.script = options[0];
  args.lower  = options[1] || 10;
  args.upper  = options[2] || 100000;
  
  // Check first argument is less than second.
  if (options.upper < options.lower)
    return console.log('\n\nFirst paramater must be smaller than second.\n\n');
  console.log('\nErrors are logged at ./output/dump.txt\n');
  
  // Call all the setup functions async style, then run test.
  var setup = q.all([ file.init(), mongo.init(conf.dbs.mongo), redis.init() ]);
  
  // Run all setup functions, and return a promise.
  setup
  
  // App opened for business. Run tests.
  .then(function (data) {
    // Print all promise resolutions.
    for(var i = 0, l = data.length; i < l; i++) { 
      console.log(data[i])
    }
    
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
      return console.log('\n\nNo test specified, closing...\n\n');
    }
  })
  
  // Tests finished, promised received. Close app.
  .then(function (data) {
    // Test complete, close all connections.
    var closeAll = q.all([ file.close(), mongo.close(), redis.close() ]);
    console.log(data || 'No test executed.');
    
    return closeAll;
  })
  
  // Application closed, promise received. Finish up.
  .then(function (data) {
    for(var i = 0, l = data.length; i < l; i++) {
      console.log(data[i])
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