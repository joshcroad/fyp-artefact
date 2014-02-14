/** @fileOverview A file to handle the write tests. */

var q     = require('q')
  , file  = require('../file')
  , mongo = require('../mongo')
  , redis = require('../redis');

var write = {
  
  /**
   * Run the write test.
   */
  conduct: function (start, end) {
    var deferred = q.defer();
    
    console.log('\n\nTesting Mongo');
    file.write('mongo', 'Number of inserts against speed taken (milliseconds).\n');
    file.setTitle('Number of inserts against speed taken (milliseconds).');
    
    // Run tests for mongo.
    write.runMongo(start, end)
    
    // Mongo tested.
    .then(function (data) {
      file.write('redis', 'Number of inserts against speed taken (milliseconds).\n');
      
      return write.runRedis(start, end);
    })
    
    // Redis tested. Resolve promise. 
    .then(function (data) {
      deferred.resolve('\nTests finished');
    });
    
    return deferred.promise;
  },
  
  /**
   * Run the tests on the mongo database.
   */
  runMongo: function (min, max) {
    var deferred = q.defer();
    console.log('Write tests commencing for ' + min);
    
    file.addLabel(min);
    
    mongo.flush()
    
    // Mongo flushed.
    .then(function (data) {
      console.log(data);
      
      var promises = [];
      for (var i = 0; i < min; i++) {
        var promise = mongo.write(i);
        promises.push(promise);
      }
      
      console.log('Mongo setup complete for ' + min);
      console.log('Writing data to Mongo, please wait...');
      
      var startTime = Date.now();
      return q.all(promises)
      
      .then(function () {
        var endTime =  Date.now(),
            diff = endTime - startTime;
        
        console.log('>>Complete');
        console.log('Mongo TEST complete for ' + min);
        file.write('mongo', min + ': ' + diff);
        file.addData('mongo', diff);
        
        if (min !== max) return write.runMongo(min * 10, parseInt(max));
      })
    })
    
    // Mongo finished, resolve promise.
    .then(function () {
      deferred.resolve('\nMongo tests complete.')
    })
    
    .catch(function (err) {
      file.write(null, err);
    });
        
    return deferred.promise;
  },
  
  /**
   * Run the tests on the redis database.
   */
  runRedis: function (min, max) {
    var deferred = q.defer();
    console.log('Write tests commencing for ' + min);
    
    redis.flush()
    
    // Redis flushed.
    .then(function (data) {
      console.log(data);
      
      var arr = [];
      for (var i = 0, len = min; i < len; i++) {
        arr.push(['hset', 'x:'+i, 'field', i]);
      }
      
      console.log('Redis setup complete for ' + min);
      console.log('Writing data to Redis, please wait...');
      
      var startTime = Date.now();
      return redis.write(arr)
      
      .then(function () {
        // Inserts complete.
        var endTime = Date.now(),
            diff = endTime - startTime;
        
        console.log('>>Complete');
        console.log('Redis TEST complete for ' + min);
        file.write('redis', min + ': ' + diff);
        file.addData('redis', diff);
        
        if (min !== max) return write.runRedis(min * 10, parseInt(max));
      });
    })
    
    // Redis finished, resolve promise.
    .then(function () {
      deferred.resolve('\nRedis tests complete.');
    })
    
    .catch(function (err) {
      file.write(null, err);
    });
    
    return deferred.promise;
  } 
}

module.exports = write;