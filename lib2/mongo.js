/** @fileOverview A file to handle everything mDB. */

var mongodb = require('mongodb'),
    q       = require('q');

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
    
    this.connect(uri)
    .then(function doneFilter(val) {
      console.log(val);
      deferred.resolve('done')
    }, function failFilter(err) {
      deferred.reject(err)
    });
    
    return deferred.promise;
  },
  
  print: function () {
    console.log(m.db);
  },

  /**
   * Initialise MongoDB
   * Example: mongodb://127.0.0.1:27017/test
   * @param {Object}    conf The mdb configuration.
   * @param {Function}  cb The callback function.
   */
  init2: function (conf) {
    var deferred = q.defer();
    
    // Setup mongo uri.
    var uri = '' + conf.scheme + '://' + conf.host;
    uri += conf.port ? ':' + conf.port : ':27017';
    uri += '/' + conf.database;
    
    this.connect(uri)
    .then(m.delete.database)
    .then(m.setup.collections)
    .catch(function (err) {
      deferred.reject(err)
    })
    .fin(function () {
      deferred.resolve();
    });
    
    return deferred.promise;
  },
  
  connect: function (uri) {
    var deferred = q.defer();
    mongodb.MongoClient.connect(uri, function (err, db) {
      if (err)
        return deferred.reject(err);
      m.db = db;
      deferred.resolve('mongo connected');
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
      if (err)
        deferred.reject(err);
      deferred.resolve();
    });
    return deferred.resolve;
  },

  /**
   * Setup obj to handle all setup operations.
   * @type {object}
   */
  setup: {
    
    /** Setup all the provided collections. */
    collections: function () {
      var deferred = q.defer();
      m.db.createCollection('testData', function created(err, collection) {
        if (err && DEBUG)
          return deferred.reject(err);
        m.collection[name] = collection;
        deferred.resolve();
      });
      return deferred.promise;
    }
    
  },

  read: {},

  update: {},

  /**
   * Delete obj to handle all delete operations.
   * @type {object}
   */
  delete: {

    /**
     * Delete the database.
     * @param  {function} cb A callback function.
     * @return {function} The callback function.
     */
    database: function () {
      var deferred = q.defer();
      m.db.dropDatabase(function deleted(err, done) {
        if (err && DEBUG)
          return deferred.reject(err);
        deferred.resolve();
      });
      return deferred.promise;
    },

    /**
     * Delete a given collection.
     * @param  {strign}   name The name of the collection.
     * @param  {function} cb   A callback function.
     * @return {function} The callback function.
     */
    collection: function (name, cb) {
      m.collection[name].drop(function deleted(err, done) {
        if (err && DEBUG)
          return console.error('m.delete.collection', err);
        if (typeof cb === 'function')
          return cb(done);
      });
      m.collection[name] = null;
    }

  }

};