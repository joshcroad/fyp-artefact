/** @fileOverview A file to handle the write tests. */

var q     = require('q')
  , file  = require('../file')
  , mongo = require('../mongo')
  , redis = require('../redis')
  , log   = require('../log');

var write = {

  /**
   * Run the write test.
   */
  conduct: function (min, max) {
    var deferred = q.defer();

    file.write('mongo', 'Number of inserts against speed taken (nanoseconds).\n');
    file.setTitle('Number of inserts against speed taken (nanoseconds).');

    // Run tests for mongo.
    write.runMongo(min, max)

    // Mongo tested.
    .then(function (data) {
      log.dbComplete(data);
      file.write('redis', 'Number of inserts against speed taken (nanoseconds).\n');

      return write.runRedis(min, max);
    })

    // Redis tested. Resolve promise.
    .then(function (data) {
      log.dbComplete(data);
      deferred.resolve('Write');
    });

    return deferred.promise;
  },

  /**
   * Run the tests on the mongo database.
   */
  runMongo: function (min, max) {
    var deferred = q.defer();
    log.test('Mongo', 'Write', min);

    file.addLabel(min);

    mongo.flush()

    // Mongo flushed.
    .then(function (data) {
      log.flushed(data);

      var promises = [];
      for (var i = 0; i < min; i++) {
        var promise = mongo.write(i);
        promises.push(promise);
      }

      log.setup('Mongo', min);
      log.writeWait('Mongo');

      var startTime = process.hrtime();
      return q.all(promises)

      .then(function () {
        var diff = process.hrtime(startTime);
        if (diff[0] === 0) {
          diff = diff[1];
        } else {
          var seconds = diff[0] * 1000000000;
          diff = seconds + diff[1];
        }

        log.roundComplete('Mongo', min);
        file.write('mongo', min + ': ' + diff);
        file.addData('mongo', diff);

        if (min !== max) return write.runMongo(min * 10, parseInt(max));
      })
    })

    // Mongo finished, resolve promise.
    .then(function () {
      deferred.resolve('Mongo');
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
    log.test('Redis', 'Write', min);

    redis.flush()

    // Redis flushed.
    .then(function (data) {
      log.flushed(data);

      var arr = [];
      for (var i = 0, len = min; i < len; i++) {
        arr.push(['hset', 'x:'+i, 'field', i]);
      }

      log.setup('Redis', min);
      log.writeWait('Redis');

      var startTime = process.hrtime();
      return redis.write(arr)

      .then(function () {
        var diff = process.hrtime(startTime);
        if (diff[0] === 0) {
          diff = diff[1];
        } else {
          var seconds = diff[0] * 1000000000;
          diff = seconds + diff[1];
        }

        log.roundComplete('Redis', min);
        file.write('redis', min + ': ' + diff);
        file.addData('redis', diff);

        if (min !== max) return write.runRedis(min * 10, parseInt(max));
      });
    })

    // Redis finished, resolve promise.
    .then(function () {
      deferred.resolve('Redis');
    })

    .catch(function (err) {
      file.write(null, err);
    });

    return deferred.promise;
  }
}

module.exports = write;
