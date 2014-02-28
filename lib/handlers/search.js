/** @fileOverview A file to handle the search tests. */

var q     = require('q')
  , file  = require('../file')
  , util  = require('../util')
  , mongo = require('../mongo')
  , redis = require('../redis')
  , log   = require('../log');

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
      log.dbComplete('Mongo');
      log.dbComplete('Redis');
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

    // Redis records inserted, run search.
    .then(function () {
      file.write('mongo', 'Searching for ' + ran);
      log.test('Mongo', 'Search', min);

      return search.mSearch(ran);
    })

    // Search tests for mongo complete.
    .then(function (data) {
      log.roundComplete('Mongo', min);
      file.write('mongo', min + ': ' + data[1] + ' found in ' + data[0] + '\n');

      file.write('redis', 'Searching for ' + ran);
      log.test('Redis', 'Search', min);

      return search.rSearch(ran);
    })

    // Search tests for redis complete.
    .then(function (data) {
      log.roundComplete('Redis', min);
      file.write('redis', min + ': ' + data[1] + ' found in ' + data[0] + '\n');

      if (min !== max) return search.run(min * 10, parseInt(max));
    })

    // Tests for redis complete.
    .then(function () {
      deferred.resolve('Search tests complete');
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
      , startTime = process.hrtime();

    mongo.find(value)

    // Value found.
    .then(function (doc) {
      var diff = process.hrtime(startTime);
      if (diff[0] === 0) {
        diff = diff[1];
      } else {
        var seconds = diff[0] * 1000000000;
        diff = seconds + diff[1];
      }

      file.addData('mongo', diff);

      deferred.resolve([diff, doc.x]);
    });

    return deferred.promise;
  },

  /**
   * Search for the value provided, in redis.
   */
  rSearch: function (value) {
    var deferred = q.defer()
      , startTime = process.hrtime();

    redis.find(value)

    // Value found.
    .then(function (reply) {
      var diff = process.hrtime(startTime);
      if (diff[0] === 0) {
        diff = diff[1];
      } else {
        var seconds = diff[0] * 1000000000;
        diff = seconds + diff[1];
      }

      file.addData('redis', diff);

      deferred.resolve([diff, reply]);
    });

    return deferred.promise;
  }
}

module.exports = search;
