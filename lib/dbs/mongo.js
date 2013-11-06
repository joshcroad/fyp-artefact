var mongoose  = require('mongoose');

var Mongo = module.exports = {
  conn: null,

  Schema: {
    users: mongoose.Schema({
        username: { type: String, index: { unique: true } }
      , email: String
      , displayName: String
      , password: String
      , timestamp: { type: Number, default: Date.now }
      , bio: String
    })
  },

  Model: {
    users: null
  },

  init: function (uri) {
    DEBUG && mongoose.set('debug', true);

    mongoose.connect(uri);
    Mongo.conn = mongoose.connection;

    Mongo.conn.on('error', console.error.bind(console, 'Mongo'));

    Mongo.conn.once('open', function setupModels() {
      Mongo.Model.users = mongoose.model('users', Mongo.Schema.users);
    });
  },

  create: function () {},

  read: function () {},

  update: function () {},

  delete: function () {},
};