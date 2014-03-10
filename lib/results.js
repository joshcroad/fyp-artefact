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

  averageResults: function (load) {
    var deferred = q.defer(),
        mongoR = 0,
        redisR = 0;

    // Remove top & bottom 10%
    this.tempMongoResults.sort();
    this.tempMongoResults.shift();
    this.tempMongoResults.pop();
    this.tempRedisResults.sort();
    this.tempRedisResults.shift();
    this.tempRedisResults.pop();

    // Sum array
    for (var i = 0, l = this.tempMongoResults.length; i < l; i++) {
      mongoR += this.tempMongoResults[i];
      redisR += this.tempRedisResults[i];
    }
    mongoR = mongoR / this.tempMongoResults.length;
    redisR = redisR / this.tempRedisResults.length;

    this.mongoResults.push({
      load: load,
      result: mongoR
    });
    this.redisResults.push({
      load: load,
      result: redisR
    });

    // Clear arrays
    this.tempMongoResults = [];
    this.tempRedisResults = [];

    deferred.resolve();
    return deferred.promise;
  },

  outputData: function () {
    for (var i = 0, l = this.mongoResults.length; i < l; i++) {
      file.write(false, this.mongoResults[i].load + ',' + this.mongoResults[i].result + ',mongo');
    }
    for (var i = 0, l = this.redisResults.length; i < l; i++) {
      file.write(false, this.redisResults[i].load + ',' + this.redisResults[i].result + ',redis');
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
