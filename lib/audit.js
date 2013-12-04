/** @fileOverview An audit module to write outputs to a text file. */

var fs = require('fs');

var audit = module.exports = {

  file: null,
  path: null,
  filename: null,
  settings: {
    flag: 'w',
    encoding: 'uft8',
    mode: 0777,
    finalMode: 0644
  },

  /**
   * Initialise the audit trail, create the directory and output file.
   * @param  {String} path     The path to the desired output file.
   * @param  {String} filename The name of the output file, with ext.
   */
  init: function (path, filename) {
    this.setPath(path);
    this.setFilename(filename);
    if (!this.exists(this.path)) {
      this.mkdir(this.path);
    }
    this.mkfile(filename);
  },

  /**
   * Check a path exists and return.
   * @param  {String}   path The path to check.
   * @return {Boolean}       Whether the path exists.
   */
  exists: function (path) {
    return fs.existsSync(path);
  },

  write: function (string) {
    string = string + '\n';
    var buf = new Buffer(string.toString(), this.settings.encoding);
    fs.writeSync(this.file, buf, 0, buf.length);
    return this;
  },

  close: function () {
    fs.close(this.file);
    fs.chmod(this.path + this.filename, this.settings.finalMode);
    return this;
  },

  setPath: function (path) {
    this.path = path;
  },

  setFilename: function (filename) {
    this.filename = filename;
  },

  mkdir: function (path, cb) {
    fs.mkdirSync(path, cb);
  },

  mkfile: function (filename, cb) {
    this.file = fs.openSync(this.path + filename, this.settings.flag, this.settings.mode);
  }
};