/** @fileOverview A file to handle everything Redis. */

var redis   = require('redis')
  , q       = require('q')
  , file    = require('./file')
  , client  = redis.createClient();

var r = {

  /**
   * Initialise the redis database.
   */
  init: function () {
    var deferred = q.defer();

    client.on('error', function (err) {
      deferred.reject(err);
    });

    client.on('connect', function connected() {

      r.flush()

      // Redis flushed.
      .then(function done(data) {
        deferred.resolve('Redis');
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
      else deferred.resolve('Redis');
    });

    return deferred.promise;
  },

  /**
   * Write one or more hashes to the database.
   */
  write: function (data) {
    var deferred = q.defer();

    client.multi(data)
    .exec(function (err, replies) {
        if (err) deferred.reject(err);
        else deferred.resolve();
    });

    return deferred.promise;
  },

  /**
   * Find a hash value.
   */
  find: function (value) {
    var deferred = q.defer();

    client.hget('x:'+value, 'field', function(err, reply) {
      if (err) deferred.reject(err);
      else deferred.resolve(reply);
    });

    return deferred.promise;
  },

  /**
   * Update value1 with value2.
   */
  update: function (value1, value2) {
    var deferred = q.defer();

    client.hset('x:'+value1, 'field', value2, function (err, reply) {
      if (err) deferred.reject(err);
      else deferred.resolve(reply);
    });

    return deferred.promise;
  },

  /**
   * Flush the database of all previous information.
   */
  flush: function () {
    var deferred = q.defer();

    client.flushdb(function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve('Redis');
    });

    return deferred.promise;
  }

}

module.exports = r;
