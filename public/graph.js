(function (window, d3) {
  "use strict";

  function DataGroup(data, options) {
    data = data || [];
    options = options || {};

    this.length = options.length || data.length || 60;
    this.data = [];
    this.paths = {};

    data.forEach(this.push.bind(this));
  }

  DataGroup.prototype.init = function (data) {
    data.forEach(this.push.bind(this));
  };

  DataGroup.prototype.draw = function (graph) {
    return graph.svg
      .append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .datum(this.data)
        .attr("class", "line")
        .attr("d", graph.line)
      .append("path")
        .datum(this.data)
        .attr("class", "area")
        .attr("d", graph.area);
  };

  DataGroup.prototype.mock = function () {
    return this.push({temperature: 25 + (Math.random() - 0.5) * 5, taken_at: new Date()});
  };

  DataGroup.prototype.convertDatum = function (raw) {
    return {temperature: raw.temperature, timestamp: new Date(raw.taken_at)};
  };

  DataGroup.prototype.push = function (datum) {
    this.data.push(this.convertDatum(datum));

    if (this.data.length > this.length) {
      this.data.shift();
    }
  };

  function Graph(options) {
    options = options || {};

    this.timeScale = options.timeScale || d3.time.minute;
    this.minTemp = options.minTemp || 0;
    this.maxTemp = options.maxTemp || 40;

    this.dataGroups = {};
  }

  Graph.prototype.pause = function () {
    this.drawing = false;
  };

  Graph.prototype.draw = function () {
    this.drawing = true;

    d3.select("svg").remove();

    var name, n;
    var axes = {};

    var width = window.innerWidth;
    var height = window.innerHeight;

    this.svg = d3
      .select("body")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g");

    var now = new Date();

    var x = d3
      .scale.linear()
      .domain([this.timeScale.offset(now, -n), this.timeScale.offset(now, -1)])
      .range([0, width]);

    var y = d3
      .scale.linear()
      .domain([this.minTemp, this.maxTemp])
      .range([height, 0]);

    this.area = d3
      .svg.area()
      .x(function(d) { return x(d.timestamp); })
      .y0(height)
      .y1(function(d) { return y(d.temperature); });

    this.line = d3.svg.line()
      .x(function(d) { return x(d.timestamp); })
      .y(function(d) { return y(d.temperature); });

    this.svg
      .append("defs")
      .append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    axes.x = d3.svg.axis()
      .scale(x)
      .orient("top")
      .tickFormat(function (d) { return d3.time.format("%H:%M")(new Date(d)); });

    this.paths.xAxis = this.svg
      .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(this.minTemp) + ")")
        .call(axes.x);

    axes.y = d3
      .svg.axis()
      .scale(y)
      .orient("right")
      .tickFormat(function (d) { return d + "°C"; });

    this.svg
      .append("g")
        .attr("class", "y axis")
        .call(axes.y);

    for (name in this.dataGroups) {
      this.dataGroups[name].draw(this);
    }

    if (this.drawing) {
      requestAnimationFrame(this.draw.bind(this));
    }
  };

  window.Graph = Graph;
  window.DataGroup = DataGroup;
})(window, d3);