/** @fileOverview A file to handle the write tests. */

var q     = require('q')
  , file  = require('../file')
  , util  = require('../util')
  , mongo = require('../mongo')
  , redis = require('../redis')

var search = module.exports = {
  
  /**
   * Run the write test.
   */
  conduct: function (min, max) {
    var deferred = q.defer();
    
    file.write('mongo', 'Time to search for 1 record within n records.');
    file.write('redis', 'Time to search for 1 record within n records.');
    
    search.run(min, max)
    .then(function (data) {
      deferred.resolve(data);
    })
    .catch(function (err) {
      deferred.reject(err);
    });
    
    return deferred.promise;
  },
  
  run: function (min, max) {
    var deferred = q.defer()
      , ran = Math.floor(Math.random() * min);
    
    mongo.flush()
    .then(redis.flush())
    .then(util.mInsert(min))
    .then(util.rInsert(min))
    .then(function (data) {
      file.write('mongo', 'Searching for ' + ran);
      console.log('Mongo: Search tests commencing for ' + min);
      return search.mSearch(ran);
    })
    .then(function (data) {
      file.write('mongo', min + ': ' + data[1] + ' found in ' + data[0] + '\n');
      file.write('redis', 'Searching for ' + ran);
      console.log('Redis: Search tests commencing for ' + min);
      return search.rSearch(ran);
    })
    .then(function (data) {
      console.log('>>Complete');
      file.write('redis', min + ': ' + data[1] + ' found in ' + data[0] + '\n');
      if (min !== max) return search.run(min * 10, parseInt(max));
    })
    .then(function () {
      deferred.resolve('\nSearch tests complete');
    })
    .catch(function (err) {
      file.write(null, err);
      deferred.reject(err);
    });
    
    return deferred.promise;
  },
  
  /**
   * Search for the value provided, in mongo.
   */
  mSearch: function (value) {
    var deferred = q.defer()
      , startTime = Date.now();
    
    mongo.find(value)
    .then(function (doc) {
      var endTime = Date.now();
      deferred.resolve([endTime - startTime, doc.x]);
    });
    
    return deferred.promise;
  },
  
  /**
   * Search for the value provided, in redis.
   */
  rSearch: function (value) {
    var deferred = q.defer()
      , startTime = Date.now();
    
    redis.find(value)
    .then(function (reply) {
      var endTime = Date.now();
      deferred.resolve([endTime - startTime, reply]);
    });
    
    return deferred.promise;
  }
  
}
