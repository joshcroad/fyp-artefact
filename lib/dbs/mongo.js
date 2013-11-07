var mongodb = require('mongodb');

var Mongo = module.exports = {

  db: null,

  // Object to store the collections.
  collection: {},

  /**
   * Initialise MongoDB
   * @param  {string} uri The whereabouts of mongodb. Example: mongodb://127.0.0.1:27017/test
   * @return {string}     A log of any errors.
   */
  init: function (uri) {

    mongodb.MongoClient.connect(uri, function connected(err, db) {
      if (err && DEBUG)
        return console.error('Mongo Err @init', err);
      Mongo.db = db;

      // Drop previous database, and recreate collections
      Mongo.delete.database();
      Mongo.setup.collections('users', 'posts');
    });
  },

  /**
   * Setup the initial collections to be used.
   * @return {string} A log of any error.
   */
  setup: {
    collections: function () {
      for (var i = 0, len = arguments.length; i < len; i++) {
        Mongo.create.collection(arguments[i]);
      }
    }
  },

  create: {
    /**
     * Create a collection, give the collection name.
     * @param  {string} name The name of the collection.
     * @return {string}      A log of any errors.
     */
    collection: function (name) {
      Mongo.db.createCollection(name, function created(err, collection) {
        if (err && DEBUG)
          return console.error('Mongo Err @create.collection', err);
        Mongo.collection[name] = collection;
      });
    }
  },

  read: {},

  update: {},

  delete: {
    database: function () {
      Mongo.db.dropDatabase(function (err, done) {
        if (err && DEBUG)
          return console.error('Mongo Err @delete.database', err);
      });
    }
  }
};