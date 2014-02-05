/** @fileOverview A file to handle everything Redis. */

var redis = require('redis')
  , client = redis.createClient();

var r = module.exports = {
  
  init: function (conf) {
    client.on('error', function (err) { console.log(err) });
    
    client.on('connect', function connected() {
      console.log('redis connected');
    });
  },
  
  close: function () {
    client.quit();
  }
  
}