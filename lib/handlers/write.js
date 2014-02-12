/** @fileOverview A file to handle the write tests. */

var q     = require('q')
  , file  = require('../file')
  , mongo = require('../mongo')
  , redis = require('../redis')

var write = module.exports = {
  
  /**
   * R the write test.
   */
  conduct: function (start, end) {
    var deferred = q.defer();
    console.log('\n\nTesting Mongo');
    file.write('mongo', 'Number of inserts against speed taken (milliseconds).\n');
    file.setTitle('Number of inserts against speed taken (milliseconds).');
    write.runMongo(start, end)
    .then(function (data) {
      file.write('redis', 'Number of inserts against speed taken (milliseconds).\n');
      return write.runRedis(start, end);
    })
    .then(function (data) {
      deferred.resolve('\nTests finished');
    });
    
    return deferred.promise;
  },
  
  /**
   * Run the tests on the mongo database.
   */
  runMongo: function (min, max) {
    console.log('Write tests commencing for ' + min);
    var deferred = q.defer();
    
    file.addLabel(min);
    
    mongo.flush()
    .then(function (data) {
      console.log(data);
      var promises = [];
      for (var i = 0; i < min; a++) {
        var promise = mongo.write(i);
        promises.push(promise);
      }
      console.log('Mongo SETUP complete for ' + min);
      var startTime = Date.now();
      return q.all(promises)
      .then(function (data) {
        var endTime =  Date.now(),
            diff = endTime - startTime;
        console.log('Mongo TEST complete for ' + min);
        file.write('mongo', min + ': ' + diff);
        file.addData('mongo', diff);
        if (min !== max) return write.runMongo(min * 10, parseInt(max));
      })
    })
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
    console.log('Write tests commencing for ' + min);
    var deferred = q.defer();
    
    // Loops through each run.
    write.setupRedisArr(min)
    .then(function (arr) {
      return redis.flush()
      .then(function (data) {
        console.log(data);
        console.log('Redis SETUP complete for ' + min);
        var startTime = Date.now()
        return redis.write(arr)
        .then(function () {
          // Inserts complete.
          var endTime = Date.now(),
              diff = endTime - startTime;
          console.log('Redis TEST complete for ' + min);
          file.write('redis', min + ': ' + diff);
          file.addData('redis', diff);
          if (min !== max) return write.runRedis(min * 10, parseInt(max));
        });
      });
    })
    .then(function () {
      deferred.resolve('\nRedis tests complete.');
    })
    .catch(function (err) {
      file.write(null, err);
    });
    
    return deferred.promise;
  },
  
  /**
   * Setup the mongo function array.
   */
  setupRedisArr: function (num) {
    var deferred = q.defer(),
        arr = [];
    
    for (var i = 0, len = num; i < len; i++) {
      arr.push(['hset', 'x:'+i, 'field', i]);
    }
    
    deferred.resolve(arr);
    return deferred.promise;
  }
  
}
