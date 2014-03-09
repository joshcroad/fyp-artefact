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
  conduct: function (load) {
    var deferred = q.defer();

    file.write('mongo', 'Time (nanoseconds) to find a record in ' + load + ' records.\n');
    file.write('redis', 'Time (nanoseconds) to find a record in ' + load + ' records.\n');

    var i = 0;

    util.prep(load)
    .then(function (data) {
      log.prepped();
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })
    .then(function () {
      return search.run(++i, load);
    })

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

  run: function (iteration, load) {
    var deferred = q.defer(),
        ran = Math.floor(Math.random() * load);

    file.write('mongo', 'Searching for ' + ran);
    file.write('redis', 'Searching for ' + ran);

    log.test('Mongo', 'Search', load);

    search.mongoSearch(ran)
    .then(function (data) {
      log.roundComplete('Mongo', load);
      file.write('mongo', iteration + ': ' + data[1] + ' found in ' + data[0] + '\n');

      log.test('Redis', 'Search', load);
    })
    .then(function () {
      return search.redisSearch(ran);
    })
    .then(function (data) {
      log.roundComplete('Redis', load);
      file.write('redis', iteration + ': ' + data[1] + ' found in ' + data[0] + '\n');

      return;
    })

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
  mongoSearch: function (value) {
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

      deferred.resolve([diff, doc.x]);
    });

    return deferred.promise;
  },

  /**
   * Search for the value provided, in redis.
   */
  redisSearch: function (value) {
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

      deferred.resolve([diff, reply]);
    });

    return deferred.promise;
  }
}

module.exports = search;
