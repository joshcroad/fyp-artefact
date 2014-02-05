/** @fileOverview The main application. */

var q     = require('q')
  , file = require('./file')
  , mongo = require('./mongo')
  , redis = require('./redis')
  , conf  = require('../config.json')
  , port  = process.env.PORT || conf.env.port || 3000
  , app   = {};

/** Global constant defining debug status. Debug is always assumed. */
global.DEBUG = typeof conf.env.dev === 'undefined' ? true : conf.env.dev;

app.openFiles = file.init();

app.openMongo = app.openFiles.then(mongo.init();

app.openRedis = redis.init();

/**
 * Connect the application. Initialise and create the server.
 * @param {Function} cb A callback function.
 */
app.run = function () {
  console.log('Errors are logged at /output/dump.txt');
  
  // Promise to handle asychronous functionality.
  return q
  .fcall(function configureFiles() {
    return file.init();
  })
  .then(function openMongo(done) {
    if (done)
      return mongo.init(conf.dbs.mongo);
  })
  .then(function test(done) {
    console.log(done);
  })
//  .then(function openRedis(done) {
//    if (done)
//      return true;
//  })
//  .then(function runTests(done) {
//    // If done is true, setup is successful.
//    // Run tests.
//    if (done)
//      return true;
//  })
  .catch(function (err) {
    return console.log(err);
  })
  .done(function (done) {
    if (done) {
      file.close();
      mongo.close(console.log.bind(this, 'Mongo closed'));
      // redis.close(console.log.bind(this, 'Redis closed'));
    }
  });

};

module.exports = app;

if (require.main === module) app.run();