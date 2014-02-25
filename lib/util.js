/** @fileOverview A file to handle utilities. */

var q     = require('q')
  , redis = require('./redis')
  , mongo = require('./mongo')
  , log   = require('./log');

var util = {
  
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