/** @fileOverview A file to handle everything Redis. */

var q     = require('q')
  , redis = require('./redis')
  , mongo = require('./mongo');

var util = module.exports = {
  
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
    console.log('Inserting ' + num + ' values into mongo');
    q.all(promises)
    .then(function (data) {
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
      arr.push(['set', 'x:'+i, i]);
    }
    console.log('Inserting ' + num + ' values into redis');
    return redis.write(arr)
    .then(function () {
      return 'Inserting complete, commencing search tests';
    });
  }
  
}