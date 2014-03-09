/** @fileOverview An audit module to write performance outputs to a text file. */

var fs  = require('fs'),
    q   = require('q');

var file = {

  path: './output',

  mongo: {
    name: 'mongo',
    ext:  '.txt',
    loc:  null
  },

  redis: {
    name: 'redis',
    ext:  '.txt',
    loc:  null
  },

  dump: {
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
    if (!fs.existsSync(this.path))
      fs.mkdirSync(this.path);

    // File locations.
    this.dump.loc   = this.path + this.dump.name + this.dump.ext;
    this.mongo.loc  = this.path + '/' + test + '-' + load + '-' + this.mongo.name + this.mongo.ext;
    this.redis.loc  = this.path + '/' + test + '-' + load + '-' + this.redis.name + this.redis.ext;

    // Open files for business.
    if (!fs.existsSync(this.dump.loc))
      this.dump.file = fs.openSync(this.dump.loc, this.options.flag, this.options.mode);
    this.mongo.file = fs.openSync(this.mongo.loc, this.options.flag, this.options.mode);
    this.redis.file = fs.openSync(this.redis.loc, this.options.flag, this.options.mode);

    // Setup promise return.
    deferred.resolve('File');
    return deferred.promise;
  },

  /**
   * Write a string to the end of the file.
   */
  write: function (name, str) {
    str += '\n';

    if (name === 'mongo') {
      fs.appendFileSync(this.mongo.loc, str);
    }

    else if (name === 'redis') {
      fs.appendFileSync(this.redis.loc, str);
    }

    else if (name === 'chart') {
      fs.appendFileSync(this.chart.loc, str);
    }

    else {
      fs.appendFileSync(this.dump.loc, Date.now().toString() + ' - ' + str);
    }

    return this;
  },

  /**
   * Close the file off, changing the mode to final 644.
   */
  close: function () {
    var deferred = q.defer();

    this.write(null, 'Program closed');
    fs.chmodSync(this.mongo.loc, this.options.finalMode);
    fs.chmodSync(this.redis.loc, this.options.finalMode);

    deferred.resolve('File');
    return deferred.promise;
  }
}

module.exports = file;
