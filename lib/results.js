var q = require('q')
  , file = require('./file');

var results = {

  mongoResults: [],
  redisResults: [],
  tempMongoResults: [],
  tempRedisResults: [],

  addTempResult: function (db, value) {
    if (db === 'mongo') {
      this.tempMongoResults.push(value);
    } else {
      this.tempRedisResults.push(value);
    }
  },

  averageResults: function (test, load) {
    var deferred = q.defer(),
        mongoR = 0,
        redisR = 0;

    this.outputSubData(test, load, this.tempMongoResults, this.tempRedisResults)
    .then(function () {
      // Remove top & bottom 10%
      results.tempMongoResults.sort();
      results.tempMongoResults.shift();
      results.tempMongoResults.pop();
      results.tempRedisResults.sort();
      results.tempRedisResults.shift();
      results.tempRedisResults.pop();

      // Sum array
      for (var i = 0, l = results.tempMongoResults.length; i < l; i++) {
        mongoR += results.tempMongoResults[i];
        redisR += results.tempRedisResults[i];
      }
      mongoR = mongoR / results.tempMongoResults.length;
      redisR = redisR / results.tempRedisResults.length;

      results.mongoResults.push({
        load: load,
        result: mongoR
      });
      results.redisResults.push({
        load: load,
        result: redisR
      });

      // Clear arrays
      results.tempMongoResults = [];
      results.tempRedisResults = [];

      deferred.resolve();
    });

    return deferred.promise;
  },

  outputSubData: function (test, load, mR, rR) {
    var deferred = q.defer();
    file.writeSubTest(test, load, 'Iteration,Mongo,Redis');
    for (var i = 0, l = mR.length; i < l; i++) {
      var str = (i + 1) + ',' + mR[i] + ',' + rR[i];
      file.writeSubTest(test, load, str);
      if ((i + 1) === l) {
        deferred.resolve();
      }
    }
    return deferred.promise;
  },

  outputData: function () {
    for (var i = 0, l = this.mongoResults.length; i < l; i++) {
      file.write(false, this.mongoResults[i].load + ',' + this.mongoResults[i].result + ',' + this.redisResults[i].result);
    }
  },

  getMongoResults: function () {
    return this.mongoResults;
  },

  getRedisResults: function () {
    return this.redisResults;
  }

};

module.exports = results;
