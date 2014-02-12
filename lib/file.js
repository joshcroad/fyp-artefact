/** @fileOverview An audit module to write performance outputs to a text file. */

var fs  = require('fs')
  , q   = require('q');

var file = module.exports = {

  mongo: {
    name: '/mongo-r'
  },
  redis: {
    name: '/redis-r'
  },
  dump: {
    name: '/dump'
  },
  chart: {
    name: '/chart'
  },
  path: './output',
  ext: '.txt',
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
    var dumpLoc = this.path + this.dump.name + this.ext,
        mongoLoc = this.path + this.mongo.name + this.ext,
        redisLoc = this.path + this.redis.name + this.ext,
        chartLoc = this.path + this.chart.name + '.js';
  
    
    // Open files for business.
    if (!fs.existsSync(dumpLoc))
      this.dump.file = fs.openSync(dumpLoc, this.options.flag, this.options.mode);
    this.mongo.file = fs.openSync(mongoLoc, this.options.flag, this.options.mode);
    this.redis.file = fs.openSync(redisLoc, this.options.flag, this.options.mode);
    this.chart.file = fs.openSync(chartLoc, this.options.flag, this.options.mode);
    
    // Setup promise return.
    deferred.resolve('File loaded');
    return deferred.promise;
  },
  
  /**
   * Write a string to the end of the file.
   * @param  {String} name The name of the file to write.
   * @param  {String} data The string to write to the file.
   * @return {Function} An instant of the function to train functions.
   */
  write: function (name, data) {
    data = data + '\n';
    switch (name) {
      case 'mongo':
        var mongoLoc = this.path + this.mongo.name + this.ext;
        fs.appendFileSync(mongoLoc, data);
        break;
      case 'redis':
        var redisLoc = this.path + this.redis.name + this.ext;
        fs.appendFileSync(redisLoc, data);
        break;
      case 'chart':
        var chartLoc = this.path + this.chart.name + '.js';
        fs.appendFileSync(chartLoc, data);
        break;
      case 'dump': default:
        var dumpLoc = this.path + this.dump.name + this.ext;
        fs.appendFileSync(dumpLoc, Date.now().toString() + ' - ' + data);
        break;
    }
    return this;
  },
  
  /**
   * Close the file off, changing the mode to final 644)
   * @return {Function} An instant of the function to train functions.
   */
  close: function () {
    var deferred = q.defer();
    
    this.write(null, 'Program closed');
    fs.chmodSync(this.path + this.mongo.name + this.ext, this.options.finalMode);
    fs.chmodSync(this.path + this.redis.name + this.ext, this.options.finalMode);
    
    deferred.resolve('File closed');
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
   * Add value to the dataset
   */
  addData: function (db, value) {
    if (db === 'mongo')
      file.chartData.datasets[0].data.push(value);
    else
      file.chartData.datasets[1].data.push(value);
  },
    
  /**
   * 
   */
  printChartDataToFile: function () {
    var data = 'chartData = ',
        text = JSON.stringify(file.chartData);
    data += text;
    file.write('chart', data);
  }
  
};