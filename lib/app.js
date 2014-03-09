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

  if (options[0] === '--write' || options[0] === '-w') {
    args.script = 'write';
  }
  else if (options[0] === '--update' || options[0] === '-u') {
    args.script = 'update';
  }
  else if (options[0] === '--search' || options[0] === '-s') {
    args.script = 'search';
  }

  args.load  = options[1] || 10000;

  log.info('Errors logged at output/dump.txt');

  // Call all the setup functions async style, then run test.
  var setup = q.all([ file.init(args.script, args.load), mongo.init(conf.dbs.mongo), redis.init() ]);

  // Run all setup functions, and return a promise.
  setup

  // App opened for business. Run tests.
  .then(function (data) {
    // Print all promise resolutions.
    for(var i = 0, l = data.length; i < l; i++) {
      log.loaded(data[i]);
    }
    log.space();

    if (args.script === 'write') {
      return writeTest.conduct(args.load);
    }

    else if (args.script === 'update') {
      return updateTest.conduct(args.load);
    }

    else if (args.script === 'search') {
      return searchTest.conduct(args.load);
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
  })

  .catch(function (err) {
    file.write(null, err);
  });

}

module.exports = app;

if (require.main === module) app.run(process.argv);
