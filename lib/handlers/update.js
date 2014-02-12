/** @fileOverview A file to handle the update tests. */

var q     = require('q')
  , file  = require('../file')
  , util  = require('../util')
  , mongo = require('../mongo')
  , redis = require('../redis')

var update = module.exports = {

  /**
   * Run the update test.
   */
  conduct: function (min, max) {
    var deferred = q.defer();
    
    file.write('mongo', 'Time to update a random record within n records.\n');
    file.write('redis', 'Time to update a random record within n records.\n');
    file.setTitle('Time to update a random record within n records.');
    
    update.run(min, max)
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
    .then(redis.flush())
    .then(util.mInsert(min))
    .then(util.rInsert(min))
    .then(function (data) {
      file.write('mongo', 'Updating ' + ran + ' to ' + -1);
      console.log('Mongo: Update tests commencing for ' + min);
      return update.mUpdate(ran, -1);
    })
    .then(function (data) {
      file.write('mongo', min + ': Updated in ' + data[0] + '\n');
      file.write('redis', 'Updating ' + ran + ' to ' + -1);
      console.log('Redis: Update tests commencing for ' + min);
      return update.rUpdate(ran, -1);
    })
    .then(function (data) {
      console.log('>>Complete');
      file.write('redis', min + ': Updated in ' + data[0] + '\n');
      if (min !== max) return update.run(min * 10, parseInt(max));
    })
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
    .then(function (doc) {
      var endTime = Date.now();
      file.addData('mongo', endTime - startTime);
      deferred.resolve([endTime - startTime, doc.x]);
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
    .then(function (reply) {
      var endTime = Date.now();
      file.addData('redis', endTime - startTime);
      deferred.resolve([endTime - startTime, reply]);
    });
    
    return deferred.promise;
  }

}