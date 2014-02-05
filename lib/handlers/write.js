/** @fileOverview A file to handle the write tests. */

var q = require('q')
  , file = require('../file')
  , mongo = require('../mongo')
  , redis = require('../redis')

var write = module.exports = {
  
  /**
   * Initialise the write test.
   */
  run: function (start, end) {
    var deferred = q.defer();
    console.log('\n\nTesting Mongo');
    file.write('mongo', 'Number of inserts against speed taken (milliseconds).\n');
    write.mongoRun(start, end)
    .then(function (data) {
      file.write('redis', 'Number of inserts against speed taken (milliseconds).\n');
      return write.redisRun(start, end);
    })
    .then(function (data) {
      deferred.resolve('\nTests finished');
    });
    
    return deferred.promise;
  },
  
  /**
   * Run the tests on the mongo database.
   */
  mongoRun: function (i, j) {
    console.log('Write tests commencing for ' + i);
    var deferred = q.defer();
    
    // Loops through each run.
    write.setupArr('mongo', i)
    .then(function (arr) {
      return mongo.flush()
      .then(function (data) {
        console.log(data);
        console.log('Mongo SETUP complete for ' + i);
        var startTime = Date.now()
        return q.all(arr).then(function () {
          // Inserts complete.
          var endTime = Date.now(),
              diff = endTime - startTime;
          console.log('Mongo TEST complete for ' + i);
          file.write('mongo', i + ': ' + diff);
          if (i !== j) return write.mongoRun(i * 10, parseInt(j));
        });
      });
    })
    .then(function () {
      deferred.resolve('\nMongo tests complete.');
    })
    .catch(function (err) {
      file.write(null, err);
    });
    
    return deferred.promise;
  },
  
  /**
   * Run the tests on the redis database.
   */
  redisRun: function (i, j) {
    console.log('Write tests commencing for ' + i);
    var deferred = q.defer();
    
    // Loops through each run.
    write.setupArr('redis', i)
    .then(function (arr) {
      return redis.flush()
      .then(function (data) {
        console.log(data);
        console.log('Redis SETUP complete for ' + i);
        var startTime = Date.now()
        return redis.write(arr)
        .then(function () {
          // Inserts complete.
          var endTime = Date.now(),
              diff = endTime - startTime;
          console.log('Redis TEST complete for ' + i);
          file.write('redis', i + ': ' + diff);
          if (i !== j) return write.redisRun(i * 10, parseInt(j));
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
  setupArr: function (db, num) {
    var deferred = q.defer(),
        func = db === 'mongo' ? mongo.write : redis.write,
        arr = [];
    for (var i = 0, len = num; i < len; i++) {
      arr.push(function () { return func(i) });
    }
    deferred.resolve(arr);
    return deferred.promise;
  }
  
}