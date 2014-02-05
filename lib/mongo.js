/** @fileOverview A file to handle everything mDB. */

var mongodb = require('mongodb'),
    q       = require('q'),
    file    = require('./file');

var m = module.exports = {

  db: null,

  /**
   * Collection obj to hold reference to all collections.
   * @type {object}
   */
  collection: {
      testData: null
  },
  
  init: function (conf) {
    var deferred = q.defer();
    
    // Setup mongo uri.
    var uri = '' + conf.scheme + '://' + conf.host;
    uri += conf.port ? ':' + conf.port : ':27017';
    uri += '/' + conf.database;
    
    var connect = q.denodeify(mongodb.MongoClient.connect);
    connect(uri).then(function (db) {
      m.db = db;
      return 'Mongo connected';
    })
    .then(function (data) {
      // Mongo connected, drop previous databases.
      return m.dropDatabase();
    })
    .then(function (data) {
      // Previous databases dropped, add new collections
      return m.setupCollection('testData');
    })
    .then(function (data) {
      // Return mongo loaded.
      deferred.resolve('Mongo loaded');
    })
    .catch(function (err) {
      file.write(null, err);
    });
    
    return deferred.promise;
  },
  
  /**
   * Close the database connection.
   * @param {Function} cb The callback function.
   */
  close: function () {
    var deferred = q.defer();
    
    m.db.close(function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve('Mongo closed');
    });
    
    return deferred.promise;
  },
  
  /**
   * Delete the database.
   */
  dropDatabase: function () {
    var deferred = q.defer();
    
    m.db.dropDatabase(function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve('Database deleted');
    });
    
    return deferred.promise;
  },
  
  /**
   * Setup the provided collections.
   */
  setupCollection: function (name) {
    var deferred = q.defer();
    
    m.db.createCollection(name, function (err, col) {
      if (err) {
        deferred.reject(err);
      }
      else {
        m.collection[name] = col;
        deferred.resolve('Collection created');
      }
    });
    
    return deferred.promise;
  },

  read: {},

  update: {},

};