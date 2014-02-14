/** @fileOverview A file to handle the write tests. */

var q     = require('q')
  , file  = require('../file')
  , util  = require('../util')
  , mongo = require('../mongo')
  , redis = require('../redis');

var search = {
  
  /**
   * Run the search test.
   */
  conduct: function (min, max) {
    var deferred = q.defer();
    
    file.write('mongo', 'Time to search for 1 record within n records.');
    file.write('redis', 'Time to search for 1 record within n records.');
    file.setTitle('Time to search for 1 record within n records.');
    
    search.run(min, max)
    
    // The test has finished running, resolve promise.
    .then(function (data) {
      deferred.resolve(data);
    })
    
    // Catch any bubbled errors.
    .catch(function (err) {
      deferred.reject(err);
    });
    
    return deferred.promise;
  },
  
  run: function (min, max) {
    var deferred = q.defer(),
        ran = Math.floor(Math.random() * min);
    
    file.addLabel(min);
    
    mongo.flush()
    
    // Mongo flushed, flush redis.
    .then(redis.flush())
    
    // Redis flushed, insert records to mongo.
    .then(util.mInsert(min))
    
    // Mongo records inserted, insert records to redis.
    .then(util.rInsert(min))
    
    // Redis records inserted, run search.
    .then(function (data) {
      file.write('mongo', 'Searching for ' + ran);
      console.log('Mongo: Search tests commencing for ' + min);
      
      return search.mSearch(ran);
    })
    
    // Search tests for mongo complete.
    .then(function (data) {
      console.log('>>Complete');
      file.write('mongo', min + ': ' + data[1] + ' found in ' + data[0] + '\n');
      
      file.write('redis', 'Searching for ' + ran);
      console.log('Redis: Search tests commencing for ' + min);
      
      return search.rSearch(ran);
    })
    
    // Search tests for redis complete.
    .then(function (data) {
      console.log('>>Complete');
      file.write('redis', min + ': ' + data[1] + ' found in ' + data[0] + '\n');
      
      if (min !== max) return search.run(min * 10, parseInt(max));
    })
    
    // Tests for redis complete.
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
    
    // Value found.
    .then(function (doc) {
      var endTime = Date.now();
      file.addData('mongo', endTime - startTime);
      
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
    
    // Value found.
    .then(function (reply) {
      var endTime = Date.now();
      file.addData('redis', endTime - startTime);
      
      deferred.resolve([endTime - startTime, reply]);
    });
    
    return deferred.promise;
  }
}

module.exports = search;