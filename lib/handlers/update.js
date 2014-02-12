/** @fileOverview A file to handle the update tests. */

var q     = require('q')
  , file  = require('../file')
  , mongo = require('../mongo')
  , redis = require('../redis')

var update = module.exports = {

  /**
   * Run the update test.
   */
  run: function () {
    var deferred = q.defer();
    
    file.write('mongo', '');
    file.write('redis', '');
    
    deferred.reject();
    deferred.resolve();
    return deferred.promise;
  }

}