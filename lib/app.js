/** @fileOverview The main application. */

var q     = require('q')
  , file  = require('./file')
  , mongo = require('./mongo')
  , conf  = require('../config.json')
  , port  = process.env.PORT || conf.env.port || 3000
  , app   = {};

/** Global constant defining debug status. Debug is always assumed. */
global.DEBUG = typeof conf.env.dev === 'undefined' ? true : conf.env.dev;

// Start the application.
app.run = function () {
  
  console.log('\nErrors are logged at /output/dump.txt\n');
  
  file.init()
  .then(function (data) {
    // File has loaded.
    console.log(data);
    return mongo.init(conf.dbs.mongo);
  })
  .then(function (data) {
    // Mongo has loaded.
    console.log(data);
    return mongo.close();
  })
  .then(function (data) {
    console.log(data);
    file.write(null, data);
  })
  .catch(function (err) {
    // Write the error the the dump file.
    file.write(null, err);
  });
  
}

module.exports = app;

if (require.main === module) app.run();