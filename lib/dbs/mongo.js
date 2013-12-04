/** @fileOverview A file to handle everything MongoDB. */
var mongodb = require('mongodb');

/** @namespace Holds all MongoDB functionality. */
var mongo = module.exports = {

  db: null,

  /**
   * Collection obj to hold reference to all collections.
   * @type {object}
   */
  collection: {
      users: null
    , blogs: null
    , posts: null
  },

  /**
   * Initialise MongoDB
   * @param {string} uri The mongodb location.
   * Example: mongodb://127.0.0.1:27017/test
   */
  init: function (conf) {
    // Setup mongo uri.
    var uri = '' + conf.scheme + '://' + conf.host;
    // If port isn't provided, use default 27017.
    uri += conf.port ? ':' + conf.port : ':27017';
    uri += '/' + conf.database;

    mongodb.MongoClient.connect(uri, function mongoConnected(err, db) {
      if (err && DEBUG)
        return console.error('mongo.init', err);
      mongo.db = db;
      // Drop previous database, once complete recreate collections
      mongo.delete.database(function prevDbDeleted() {
        mongo.setup.collections('users', 'blogs', 'posts');
      });
    });
  },

  /**
   * Setup obj to handle all setup operations.
   * @type {object}
   */
  setup: {

    /** Setup all the provided collections. */
    collections: function () {
      for (var i = 0, len = arguments.length; i < len; i++) {
        mongo.create.collection(arguments[i]);
      }
    }

  },

  /**
   * Create obj to handle all create operations.
   * @type {object}
   */
  create: {

    /**
     * Create a collection, give the collection name.
     * @param {string} name The name of the collection.
     */
    collection: function (name) {
      mongo.db.createCollection(name, function created(err, collection) {
        if (err && DEBUG)
          return console.error('mongo.create.collection', err);
        mongo.collection[name] = collection;
      });
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
    database: function (cb) {
      mongo.db.dropDatabase(function deleted(err, done) {
        if (err && DEBUG)
          return console.error('mongo.delete.database', err);
        if (typeof cb === 'function')
          return cb(done);
      });
    },

    /**
     * Delete a given collection.
     * @param  {strign}   name The name of the collection.
     * @param  {function} cb   A callback function.
     * @return {function} The callback function.
     */
    collection: function (name, cb) {
      mongo.collection[name].drop(function deleted(err, done) {
        if (err && DEBUG)
          return console.error('mongo.delete.collection', err);
        if (typeof cb === 'function')
          return cb(done);
      });
      mongo.collection[name] = null;
    }

  }

};