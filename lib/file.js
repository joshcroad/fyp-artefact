/** @fileOverview An audit module to write performance outputs to a text file. */

var fs  = require('fs'),
    q   = require('q');

var file = {
  
  path: './output',
  
  mongo: {
    name: '/mongo-r',
    ext:  '.txt',
    loc:  null
  },
  
  redis: {
    name: '/redis-r',
    ext:  '.txt',
    loc:  null
  },
  
  dump: {
    name: '/dump',
    ext:  '.txt',
    loc:  null
  },
  
  chart: {
    name: '/chart',
    ext:  '.js',
    loc:  null
  },
  
  options: {
    flag: 'w',
    encoding: 'utf8',
    mode: 0777,
    finalMode: 0644
  },

  chartData: {
    title: null,
    labels: [],
	datasets: [
      {
        fillColor : "rgba(255,255,255,0.0)",
        strokeColor : "rgba(90,172,65,0.5)",
        pointColor : "rgba(90,172,65,0.5)",
        pointStrokeColor : "rgba(255,255,255,0.0)",
        data : []
      }, {
        fillColor : "rgba(255,255,255,0.0)",
        strokeColor : "rgba(216,42,32,0.5)",
        pointColor : "rgba(216,42,32,0.5)",
        pointStrokeColor : "rgba(255,255,255,0.0)",
        data : []
      }
	]
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
    this.dump.loc   = this.path + this.dump.name + this.dump.ext;
    this.mongo.loc  = this.path + this.mongo.name + this.mongo.ext;
    this.redis.loc  = this.path + this.redis.name + this.redis.ext;
    this.chart.loc  = this.path + this.chart.name + this.chart.ext;
    
    // Open files for business.
    if (!fs.existsSync(this.dump.loc))
      this.dump.file = fs.openSync(this.dump.loc, this.options.flag, this.options.mode);
    this.mongo.file = fs.openSync(this.mongo.loc, this.options.flag, this.options.mode);
    this.redis.file = fs.openSync(this.redis.loc, this.options.flag, this.options.mode);
    this.chart.file = fs.openSync(this.chart.loc, this.options.flag, this.options.mode);
    
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
  },
  
  /**
   * Add a title to the chart.
   */
  setTitle: function (value) {
    file.chartData.title = value;
  },
    
  /**
   * Push a value to the labels.
   */
  addLabel: function (label) {
    file.chartData.labels.push(parseInt(label));
  },
    
  /**
   * Add value to the dataset.
   */
  addData: function (db, value) {
    if (db === 'mongo')
      file.chartData.datasets[0].data.push(value);
    else
      file.chartData.datasets[1].data.push(value);
  },
    
  /**
   * Print chart data to chart.js.
   */
  printChartDataToFile: function () {
    var data = 'chartData = ',
        text = JSON.stringify(file.chartData);
    data += text;
    file.write('chart', data);
  }
  
}

module.exports = file;