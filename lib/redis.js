/** @fileOverview A file to handle everything Redis. */

var redis   = require('redis')
  , q       = require('q')
  , file    = require('./file')
  , client  = redis.createClient()

var r = module.exports = {
  
  /**
   * Initialise the redis database.
   */
  init: function (conf) {
    var deferred = q.defer();
    
    client.on('error', function (err) {
      deferred.reject(err);
    });
    
    client.on('connect', function connected() {
      
      // Mongo connected, drop previous databases.
      r.flushdb()
      .then(function done(data) {
        deferred.resolve('Redis loaded');
      })
      .catch(function (err) {
        file.write(null, err);
      });
      
    });
    
    return deferred.promise;
  },
  
  /**
   * Close the database connection.
   */
  close: function () {
    var deferred = q.defer();
    
    client.quit(function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve('Redis closed');
    });
    
    return deferred.promise;
  },
  
  /**
   * Flush the database of all previous information.
   */
  flushdb: function () {
    var deferred = q.defer();
    
    client.flushdb(function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve('Redis flushed');
    });
    
    return deferred.promise;
  },
  
  write: function (data) {
    var deferred = q.defer();
    
    client.incr('nextid', function (err, id) {
      client.set('x:' + id, data, function (err) {
        if (err) deferred.reject(err);
        else deferred.resolve();
      });
    });
    
    return deferred.resolve();
  }
}