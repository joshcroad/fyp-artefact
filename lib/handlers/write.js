/** @fileOverview A file to handle the write tests. */

var q       = require('q')
  , mongo   = require('../mongo')
  , redis   = require('../redis')
  , results = require('../results')
  , log     = require('../log');

var write = {

  /**
   * Run the write test.
   */
  conduct: function (load) {
    var deferred = q.defer();

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
      results.averageResults('write', load)
      .then(function () {
        log.dbComplete(data);
        deferred.resolve('Write');
      });
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

        results.addTempResult('mongo', diff);

        return;
      })
    })

    .then(function () {
      deferred.resolve('Mongo');
    })

    .catch(function (err) {
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

        results.addTempResult('redis', diff);

        return;
      });
    })

    .then(function () {
      deferred.resolve('Redis');
    })

    .catch(function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  }
}

module.exports = write;
