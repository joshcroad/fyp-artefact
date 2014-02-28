/** @fileOverview A file to handle the update tests. */

var q     = require('q')
  , file  = require('../file')
  , util  = require('../util')
  , mongo = require('../mongo')
  , redis = require('../redis')
  , log   = require('../log');

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
      log.dbComplete('Mongo');
      log.dbComplete('Redis');
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
    .then(function (data) {
      log.flushed(data);
      return redis.flush();
    })

    // Redis flushed, insert records to mongo.
    .then(function (data) {
      log.flushed(data);
      return util.mInsert(min);
    })

    // Mongo records inserted, insert records to redis.
    .then(function (data) {
      return util.rInsert(min);
    })

    // Redis records inserted, run update.
    .then(function (data) {
      file.write('mongo', 'Updating ' + ran + ' to ' + -1);
      log.test('Mongo', 'Update', min);

      return update.mUpdate(ran, -1);
    })

    // Update tests for mongo complete.
    .then(function (data) {
      log.roundComplete('Mongo', min);
      file.write('mongo', min + ': Updated in ' + data + '\n');

      file.write('redis', 'Updating ' + ran + ' to ' + -1);
      log.test('Redis', 'Update', min);

      return update.rUpdate(ran, -1);
    })

    // Search tests for redis complete.
    .then(function (data) {
      log.roundComplete('Redis', min);
      file.write('redis', min + ': Updated in ' + data + '\n');

      if (min !== max) return update.run(min * 10, parseInt(max));
    })

    // Tests for redis complete.
    .then(function () {
      deferred.resolve('Update tests complete');
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
      , startTime = process.hrtime();

    mongo.update(value1, value2)

    // Mongo value updated.
    .then(function (doc) {
      var diff = process.hrtime(startTime);
      if (diff[0] === 0) {
        diff = diff[1];
      } else {
        var seconds = diff[0] * 1000000000;
        diff = seconds + diff[1];
      }

      file.addData('mongo', diff);

      deferred.resolve(diff);
    });

    return deferred.promise;
  },

  /**
   * Update the value provided, in redis.
   */
  rUpdate: function (value1, value2) {
    var deferred = q.defer()
      , startTime = process.hrtime();

    redis.update(value1, value2)

    // Redis value updated.
    .then(function (reply) {
      var diff = process.hrtime(startTime);
      if (diff[0] === 0) {
        diff = diff[1];
      } else {
        var seconds = diff[0] * 1000000000;
        diff = seconds + diff[1];
      }
      file.addData('redis', diff);

      deferred.resolve(diff);
    });

    return deferred.promise;
  }
}

module.exports = update;
