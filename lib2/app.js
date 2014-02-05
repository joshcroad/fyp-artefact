/** @fileOverview The main application. */

var q     = require('q')
  , file  = require('./file')
  , mongo = require('./mongo')
  , redis = require('./redis')
  , conf  = require('../config.json')
  , port  = process.env.PORT || conf.env.port || 3000
  , app   = {};

/** Global constant defining debug status. Debug is always assumed. */
global.DEBUG = typeof conf.env.dev === 'undefined' ? true : conf.env.dev;

// Open mongo connection async.
app.openMongo = function () {};

// Open redis connection async.
app.openRedis = function () {};

// Catch errors
app.catchErrors = function () {};

// Start the application.
app.run = function () {
  
  file.init()
  .then(function mongoInit(val) {
    console.log('1:', val);
    mongo.init(conf.dbs.mongo)
  })
  .then(function (val) {
    console.log('2:', val);
    mongo.print;
  })
  .catch(console.dir);
  
}

module.exports = app;

if (require.main === module) app.run();