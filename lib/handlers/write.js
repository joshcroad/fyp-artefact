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
  conduct: function (load) {
    var deferred = q.defer();

    file.write('mongo', 'Time (nanoseconds) to write ' + load + ' records.\n');
    file.write('redis', 'Time (nanoseconds) to write ' + load + ' records.\n');

    var i = 0;

    write.runMongo(++i, load)
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })
    .then(function () {
      return write.runMongo(++i, load)
    })

    .then(function (data) {
      i = 0;
      log.dbComplete(data);
      return;
    })

    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })
    .then(function () {
      return write.runRedis(++i, load)
    })

    .then(function (data) {
      log.dbComplete(data);
      deferred.resolve('Write');
    });

    return deferred.promise;
  },

  /**
   * Run the tests on the mongo database.
   */
  runMongo: function (iteration, load) {
    var deferred = q.defer();
    log.test('Mongo', 'Write', load);

    mongo.flush()
    .then(function (data) {
      log.flushed(data);

      var promises = [];
      for (var i = 0; i < load; i++) {
        var promise = mongo.write(i);
        promises.push(promise);
      }

      log.setup('Mongo', load);
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

        log.roundComplete('Mongo', load);
        file.write('mongo', iteration + ': ' + diff);

        return;
      })
    })

    .then(function () {
      deferred.resolve('Mongo');
    })

    .catch(function (err) {
      file.write(null, err);
      deferred.reject(err);
    });

    return deferred.promise;
  },

  /**
   * Run the tests on the redis database.
   */
  runRedis: function (iteration, load) {
    var deferred = q.defer();
    log.test('Redis', 'Write', load);

    redis.flush()
    .then(function (data) {
      log.flushed(data);

      var arr = [];
      for (var i = 0; i < load; i++) {
        arr.push(['hset', 'x:' + i, 'field', i]);
      }

      log.setup('Redis', load);
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

        log.roundComplete('Redis', load);
        file.write('redis', iteration + ': ' + diff);

        return;
      });
    })

    .then(function () {
      deferred.resolve('Redis');
    })

    .catch(function (err) {
      file.write(null, err);
      deferred.reject(err);
    });

    return deferred.promise;
  }
}

module.exports = write;
