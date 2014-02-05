/** @fileOverview An audit module to write performance outputs to a text file. */

var fs  = require('fs')
  , q   = require('q');

var file = module.exports = {
  
  mongo: {
    file: null,
    name: '/mongo-r'
  },
  redis: {
    file: null,
    name: '/redis-r'
  },
  dump: {
    file: null,
    name: '/dump'
  },
  path: './output',
  ext: '.txt',
  options: {
    flag: 'w',
    encoding: 'utf8',
    mode: 0777,
    finalMode: 0644
  },

  /**
   * Initialise the application output.
   */
  init: function () {
    var deferred = q.defer();
    // If the path doesn't exist, create it.
    if (!fs.existsSync(this.path))
      fs.mkdirSync(path);
    
    // File locations.
    var dumpLoc = this.path + this.dump.name + this.ext,
        mongoLoc = this.path + this.mongo.name + this.ext,
        redisLoc = this.path + this.redis.name + this.ext;
    
    // Open files for business.
    if (!fs.existsSync(dumpLoc))
      this.dump.file = fs.openSync(dumpLoc, this.options.flag, this.options.mode);
    this.mongo.file = fs.openSync(mongoLoc, this.options.flag, this.options.mode);
    this.redis.file = fs.openSync(redisLoc, this.options.flag, this.options.mode);
    
    // Setup promise return.
    deferred.resolve('file done');
    return deferred.promise
  },
  
  /**
   * Write a string to the end of the file.
   * @param  {String} string The string to write to the file.
   * @return {Function} An instant of the function to train functions.
   */
  write: function (file, string) {
    string = string + '\n';
    var buf = new Buffer(string.toString(), this.options.encoding);
    switch (file) {
      case 'mongo':
        fs.writeSync(this.mongo.file, buf, 0, buf.length);
        break;
      case 'redis':
        fs.writeSync(this.redis.file, buf, 0, buf.length);
        break;
      default:
        var dumpLoc = this.path + this.dump.name + this.ext;
        fs.appendFileSync(dumpLoc, Date.now().toString() + ' - ' + string);
        break;
    }
    return this;
  },
  
  /**
   * Close the file off, changing the mode to final 644)
   * @return {Function} An instant of the function to train functions.
   */
  close: function () {
    fs.close(this.mongo.file);
    fs.chmod(this.path + this.mongo.name + this.ext, this.options.finalMode);
    fs.close(this.redis.file);
    fs.chmod(this.path + this.redis.name + this.ext, this.options.finalMode);
    return this;
  },
};