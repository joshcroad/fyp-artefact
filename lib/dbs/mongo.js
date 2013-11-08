/** @fileOverview A file to handle everything MongoDB. */

var mongodb = require('mongodb');

/** @namespace Holds all MongoDB functionality. */
var Mongo = module.exports = {

  db: null,

  /**
   * Collection obj to hold reference to all collections.
   * @type {object}
   */
  collection: {
      users: null
    , posts: null
  },

  /**
   * Initialise MongoDB
   * @param {string} uri The mongodb location.
   * Example: mongodb://127.0.0.1:27017/test
   */
  init: function (conf) {
    var uri = '';
    // Setup mongo uri.
    uri += conf.scheme + '://';
    uri += conf.host;
    // If port isn't provided, use default 27017.
    uri += conf.port ? ':' + conf.port : ':27017';
    uri += '/' + conf.database;

    mongodb.MongoClient.connect(uri, function connected(err, db) {
      if (err && DEBUG)
        return console.error('Mongo.init', err);
      Mongo.db = db;
      // Drop previous database, and recreate collections
      Mongo.delete.database();
      Mongo.setup.collections('users', 'posts');
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
        Mongo.create.collection(arguments[i]);
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
      Mongo.db.createCollection(name, function created(err, collection) {
        if (err && DEBUG)
          return console.error('Mongo.create.collection', err);
        Mongo.collection[name] = collection;
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

    /** Delete the database. */
    database: function () {
      Mongo.db.dropDatabase(function (err, done) {
        if (err && DEBUG)
          return console.error('Mongo Err @delete.database', err);
      });
    }

  }

};