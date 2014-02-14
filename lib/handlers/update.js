/** @fileOverview A file to handle the update tests. */

var q     = require('q')
  , file  = require('../file')
  , util  = require('../util')
  , mongo = require('../mongo')
  , redis = require('../redis');

var update = {

  /**
   * Run the update test.
   */
  conduct: function (min, max) {
    var deferred = q.defer();
    
    file.write('mongo', 'Time to update a random record within n records.\n');
    file.write('redis', 'Time to update a random record within n records.\n');
    file.setTitle('Time to update a random record within n records.');
    
    update.run(min, max)
    
    // The test has finished running, resolve promise.
    .then(function (data) {
      deferred.resolve(data);
    })
    
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
    
    // Redis records inserted, run update.
    .then(function (data) {
      file.write('mongo', 'Updating ' + ran + ' to ' + -1);
      console.log('Mongo: Update tests commencing for ' + min);
      
      return update.mUpdate(ran, -1);
    })
    
    // Update tests for mongo complete.
    .then(function (data) {
      console.log('>>Complete');
      file.write('mongo', min + ': Updated in ' + data + '\n');
      file.write('redis', 'Updating ' + ran + ' to ' + -1);
      console.log('Redis: Update tests commencing for ' + min);
      
      return update.rUpdate(ran, -1);
    })
    
    // Search tests for redis complete.
    .then(function (data) {
      console.log('>>Complete');
      file.write('redis', min + ': Updated in ' + data + '\n');
      
      if (min !== max) return update.run(min * 10, parseInt(max));
    })
    
    // Tests for redis complete.
    .then(function () {
      deferred.resolve('\nUpdate tests complete');
    })
    
    .catch(function (err) {
      file.write(null, err);
      deferred.reject(err);
    });
    
    return deferred.promise; 
  },
  
  /**
   * Update the value provided, in mongo.
   */
  mUpdate: function (value1, value2) {
    var deferred = q.defer()
      , startTime = Date.now();
    
    mongo.update(value1, value2)
    
    // Mongo value updated.
    .then(function (doc) {
      var endTime = Date.now();
      file.addData('mongo', endTime - startTime);
      
      deferred.resolve(endTime - startTime);
    });
    
    return deferred.promise;
  },
  
  /**
   * Update the value provided, in redis.
   */
  rUpdate: function (value1, value2) {
    var deferred = q.defer()
      , startTime = Date.now();
    
    redis.update(value1, value2)
    
    // Redis value updated.
    .then(function (reply) {
      var endTime = Date.now();
      file.addData('redis', endTime - startTime);
      
      deferred.resolve(endTime - startTime);
    });
    
    return deferred.promise;
  }
}

module.exports = update;