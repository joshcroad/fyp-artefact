/** @fileOverview A file to handle everything mDB. */

var mongodb = require('mongodb'),
    q       = require('q'),
    file    = require('./file');

var m = {

  db: null,
  
  /**
   * Collection obj to hold reference to all collections.
   */
  collection: null,
  
  /**
   * Initialise the mongo database.
   */
  init: function (conf) {
    var deferred = q.defer();
    
    // Setup mongo uri.
    var uri = '' + conf.scheme + '://' + conf.host;
    uri += conf.port ? ':' + conf.port : ':27017';
    uri += '/' + conf.database;
    
    var connect = q.denodeify(mongodb.MongoClient.connect);
    connect(uri)
    
    // Mongo connected.
    .then(function (db) {
      m.db = db;
    })
    
    // Mongo connected, drop previous databases. 
    .then(function (data) {
      return m.dropDatabase();
    })
    
    // Previous databases dropped, add new collections
    .then(function (data) {
      return m.setupCollection('testData');
    })
    
    // Return mongo loaded.
    .then(function (data) {
      deferred.resolve('MongoDB');
    })
    
    .catch(function (err) {
      file.write(null, err);
    });
    
    return deferred.promise;
  },
  
  /**
   * Close the database connection.
   */
  close: function () {
    var deferred = q.defer();
    
    m.db.close(function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve('MongoDB');
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
        m.collection = col;
        deferred.resolve('Collection created');
      }
    });
    
    return deferred.promise;
  },
  
  /**
   * Write data to the collection.
   */
  write: function (data) {
    var deferred = q.defer();
    
    m.collection.save({ 'x': data, 'field': data }, function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve();
    });
    
    return deferred.promise;
  },
  
  /**
   * Find a value within the data set.
   */
  find: function (value) {
    var deferred = q.defer();
    
    m.collection.findOne({ 'x': value }, function (err, doc) {
      if (err) deferred.reject(err);
      else deferred.resolve(doc);
    });
    
    return deferred.promise;
  },
  
  /**
   * Update a value to the collection.
   */
  update: function (value1, value2) {
    var deferred = q.defer();
    
    m.collection.update({ 'x': value1 }, { 'x': value1, 'field': value2 }, function (err, doc) {
      if (err) deferred.reject(err);
      else deferred.resolve(doc);
    });
    
    return deferred.promise;
  },
  
  /**
   * Flush the database.
   */
  flush: function () {
    var deferred = q.defer();
    
    m.collection.remove(function (err) {
      if (err) deferred.reject(err);
      else deferred.resolve('Mongo');
    });
    
    return deferred.promise;
  }

}

module.exports = m;