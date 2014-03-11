/** @fileOverview A file to handle the search tests. */

var q       = require('q')
  , util    = require('../util')
  , results = require('../results')
  , mongo   = require('../mongo')
  , redis   = require('../redis')
  , log     = require('../log');

var search = {

  /**
   * Run the search test.
   */
  conduct: function (load) {
    var deferred = q.defer();

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
      results.averageResults('search', load)
      .then(function () {
        log.dbComplete('Mongo');
        log.dbComplete('Redis');
        deferred.resolve(data);
      });
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

    log.test('Mongo', 'Search', load);

    search.mongoSearch(ran)
    .then(function (data) {
      log.roundComplete('Mongo', load);

      log.test('Redis', 'Search', load);
    })
    .then(function () {
      return search.redisSearch(ran);
    })
    .then(function (data) {
      log.roundComplete('Redis', load);

      return;
    })

    .then(function () {
      deferred.resolve('Search tests complete');
    })

    .catch(function (err) {
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

      results.addTempResult('mongo', diff);

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

      results.addTempResult('redis', diff);

      deferred.resolve([diff, reply]);
    });

    return deferred.promise;
  }
}

module.exports = search;
