/** @fileOverview A file to handle utilities. */

var q     = require('q')
  , redis = require('./redis')
  , mongo = require('./mongo')
  , log   = require('./log');

var util = {

  /**
   * Prep the database with the records needed.
   */
  prep: function (load) {
    var deferred = q.defer();

    mongo.flush()
    .then(function (data) {
      log.flushed(data);
      return redis.flush();
    })

    .then(function (data) {
      log.flushed(data);
      return util.mInsert(load);
    })
    .then(function (data) {
      return util.rInsert(load);
    })
    .then(function () {
      deferred.resolve();
    })
    .catch(function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  },

  /**
   * Insert num (param) into mongo db.
   */
  mInsert: function (num) {
    var deferred = q.defer()
      , promises = [];

    for (var i = 0; i < num; i++) {
      var promise = mongo.write(i);
      promises.push(promise);
    }

    log.writeWait('Mongo');
    q.all(promises)

    // Values inserted into mongo.
    .then(function () {
      log.setup('Mongo', num);
      deferred.resolve();
    });

    return deferred.promise;
  },

  /**
   * Insert num (param) into redis db.
   */
  rInsert: function (num) {
    var arr = [];
    for (var i = 0; i < num; i++) {
      arr.push(['hset', 'x:'+i, 'field', i]);
    }

    log.writeWait('Redis');
    return redis.write(arr)

    // Values inserted into redis.
    .then(function () {
      log.setup('Redis', num);
      return;
    });
  }

}

module.exports = util;
