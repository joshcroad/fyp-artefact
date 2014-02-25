/** @fileOverview A file to handle logging. */

var clc = require('cli-color');

var log = (function () {

  var theme = {
    title: {
      mongo: clc.bgBlack.green,
      redis: clc.bgBlack.red
    },
    conn: clc.bgBlack.cyan,
    bold: clc.bold,
    error: clc.bold.red,
    info: clc.yellow,
    success: clc.bold.green,
    setup: clc.italic.blue
  };

  var space = function () {
    return console.log('');
  };

  var info = function (str) {
    return console.log(theme.info(str));
  };

  var success = function () {
    return console.log(theme.success('Test completed successfully'));
  };

  var msg = function (str) {
    return console.log(str);
  };

  var flushed = function (db) {
    return console.log(theme.conn('Flush'), clc.magenta('OK'), db);
  }

  var loaded = function (str) {
    return console.log(theme.conn('Load'), clc.magenta('OK'), str);
  };

  var closed = function (str) {
    return console.log(theme.conn('Close'), clc.magenta('OK'), str);
  };

  var error = function (str) {
    return console.log(theme.error(str));
  };

  var dbComplete = function (db) {
    return console.log(theme.title[db.toLowerCase()](db), theme.success('Complete'));
  };

  var roundComplete = function (db, value) {
    return console.log(theme.title[db.toLowerCase()](db), theme.success('Complete'), 'for', value);
  };

  var writeWait = function (db) {
    return console.log(theme.title[db.toLowerCase()](db), 'Writing data. Please wait...');
  };

  var setup = function (db, value) {
    return console.log(theme.title[db.toLowerCase()](db), theme.setup('Setup Complete'), value + ' records');
  };

  var test = function (db, test, value) {
    return console.log(theme.title[db.toLowerCase()](db), test, 'tests commencing for', value + ' records');
  };

  return {
    'space': space,
    'success': success,
    'msg': msg,
    'flushed': flushed,
    'loaded': loaded,
    'closed': closed,
    'error': error,
    'info': info,
    'dbComplete': dbComplete,
    'roundComplete': roundComplete,
    'writeWait': writeWait,
    'setup': setup,
    'test': test
  };

}());

module.exports = log;