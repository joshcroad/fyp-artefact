/** @fileOverview An audit module to write performance outputs to a text file. */

var fs  = require('fs'),
    q   = require('q');

var file = {

  data: {
    path: './public',
    name: '/data',
    ext:  '.csv',
    loc:  null
  },

  dump: {
    path: './output',
    name: '/dump',
    ext:  '.txt',
    loc:  null
  },

  options: {
    flag: 'w',
    encoding: 'utf8',
    mode: 0777,
    finalMode: 0644
  },

  /**
   * Initialise the application output.
   */
  init: function (test, load) {
    var deferred = q.defer();

    // If the path doesn't exist, create it.
    if (!fs.existsSync(this.dump.path))
      fs.mkdirSync(this.dump.path);

    if (!fs.existsSync(this.data.path))
      fs.mkdirSync(this.data.path);

    // File locations.
    this.dump.loc = this.dump.path + this.dump.name + this.dump.ext;
    this.data.loc = this.data.path + this.data.name + '-' + test + this.data.ext;

    // Open files for business.
    if (!fs.existsSync(this.dump.loc)) {
      fs.openSync(this.dump.loc, this.options.flag, this.options.mode);
    }

    fs.openSync(this.data.loc, this.options.flag, this.options.mode);
    var str = 'Records,Mongo,Redis\n';
    fs.appendFileSync(this.data.loc, str);

    // Setup promise return.
    deferred.resolve('File');
    return deferred.promise;
  },

  /**
   * Write a string to the end of the file.
   */
  write: function (dump, str) {
    str += '\n';

    if (dump) {
      fs.appendFileSync(this.dump.loc, Date.now().toString() + ' - ' + str);
    } else {
      fs.appendFileSync(this.data.loc, str);
    }

    return this;
  },

  /**
   * Write a string to the end of the file.
   */
  writeSubTest: function (test, load, str) {
    str += '\n';
    fs.appendFileSync('./public/data-' + test + '-' + load + '.csv', str);
    return this;
  },

  /**
   * Close the file off, changing the mode to final 644.
   */
  close: function () {
    var deferred = q.defer();

    this.write(true, 'Program closed');

    deferred.resolve('File');
    return deferred.promise;
  }
}

module.exports = file;
