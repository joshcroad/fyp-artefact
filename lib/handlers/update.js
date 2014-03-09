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
  conduct: function (load) {
    var deferred = q.defer();

    file.write('mongo', 'Time (nanoseconds) to update a record in n records.\n');
    file.write('redis', 'Time (nanoseconds) to update a record in n records.\n');

    var i = 0;

    util.prep(load)
    .then(function (data) {
      log.prepped();
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })
    .then(function () {
      return update.run(++i, load);
    })

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

  run: function (iteration, load) {
    var deferred = q.defer(),
        ran = Math.floor(Math.random() * load);

    file.write('mongo', 'Updating ' + ran);
    file.write('redis', 'Updating ' + ran);

    log.test('Mongo', 'Update', load);

    update.mongoUpdate(ran, ran)
    .then(function (data) {
      log.roundComplete('Mongo', load);
      file.write('mongo', iteration + ': Updated in ' + data + '\n');

      log.test('Redis', 'Update', load);
    })
    .then(function () {
      return update.redisUpdate(ran, ran);
    })
    .then(function (data) {
      log.roundComplete('Redis', load);
      file.write('redis', iteration + ': Updated in ' + data + '\n');

      return;
    })

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
  mongoUpdate: function (value1, value2) {
    var deferred = q.defer()
      , startTime = process.hrtime();

    mongo.update(value1, value2)
    .then(function (doc) {
      var diff = process.hrtime(startTime);
      if (diff[0] === 0) {
        diff = diff[1];
      } else {
        var seconds = diff[0] * 1000000000;
        diff = seconds + diff[1];
      }

      deferred.resolve(diff);
    });

    return deferred.promise;
  },

  /**
   * Update the value provided, in redis.
   */
  redisUpdate: function (value1, value2) {
    var deferred = q.defer()
      , startTime = process.hrtime();

    redis.update(value1, value2)
    .then(function (reply) {
      var diff = process.hrtime(startTime);
      if (diff[0] === 0) {
        diff = diff[1];
      } else {
        var seconds = diff[0] * 1000000000;
        diff = seconds + diff[1];
      }

      deferred.resolve(diff);
    });

    return deferred.promise;
  }
}

module.exports = update;
