var margin = {top: 20, right: 80, bottom: 30, left: 100},
    width = 1400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.records); })
    .y(function(d) { return y(d.avgtime); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data-search.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "records"; }));

  var databases = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {records: d.records, avgtime: +d[name]};
      })
    };
  });

  x.domain([10, 100000]);

  y.domain([
    d3.min(databases, function(c) { return d3.min(c.values, function(v) { return v.avgtime; }); }),
    d3.max(databases, function(c) { return d3.max(c.values, function(v) { return v.avgtime; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Average Time (nanoseconds)");

  var database = svg.selectAll(".database")
      .data(databases)
    .enter().append("g")
      .attr("class", "database");

  database.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });
});
