var mongo = require('mongodb');

var Mongo = module.exports = {

  db: null,

  // Object to store the collections
  collection: {
    users: null
  },

  /**
   * Initialise MongoDB
   * @param  {string} uri The whereabouts of mongo. Example: mongodb://127.0.0.1:27017/test
   * @return {string}     A log of any errors.
   */
  init: function (uri) {
    mongo.MongoClient.connect(uri, function connected(err, db) {
      if (err && DEBUG)
        return console.error('Mongo Error', err);
      Mongo.db = db;
      Mongo.setupCollections();
    });
  },

  /**
   * Setup the initial collections to be used.
   * @return {string} A log of any the error.
   */
  setupCollections: function () {
    // User collection.
    Mongo.db.createCollection('users', function created(err, collection) {
      if (err && DEBUG)
        return console.error('Mongo Error', err);
      Mongo.collection.users = collection;
    });
  },

  create: function () {},

  read: function () {},

  update: function () {},

  delete: function () {}
};