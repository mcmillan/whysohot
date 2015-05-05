(function (window, d3) {
  var Graph = window.Graph = {};

  var timeScale = d3.time.second;
  var interval = 200;
  var minTemp = 0;
  var maxTemp = 40;
  var paths = {};
  var axes = {};
  var n, data, width, height, x, y, line, svg, area;

  function draw() {
    d3.select("svg").remove();

    width = window.innerWidth;
    height = window.innerHeight;

    svg = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    var now = new Date();

    x = d3.scale.linear()
      .domain([timeScale.offset(now, -n), timeScale.offset(now, -1)])
      .range([0, width]);

    y = d3.scale.linear()
        .domain([minTemp, maxTemp])
        .range([height, 0]);

    area = d3.svg.area()
      .x(function(d) { return x(d.timestamp); })
      .y0(height)
      .y1(function(d) { return y(d.temperature); });

    line = d3.svg.line()
        .x(function(d) { return x(d.timestamp); })
        .y(function(d) { return y(d.temperature); });

    svg.append("defs")
      .append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    axes.x = d3.svg.axis()
      .scale(x)
      .orient("top")
      .tickFormat(function (d) { return d3.time.format("%H:%M")(new Date(d)); });

    paths.xAxis = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + y(minTemp) + ")")
      .call(axes.x);

    axes.y = d3.svg.axis()
      .scale(y)
      .orient("right")
      .tickFormat(function (d) { return d + "°C"; });

    svg.append("g")
      .attr("class", "y axis")
      .call(axes.y);

    paths.line = svg.append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    paths.area = svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);
  }

  function drawLine() {
    // redraw the line, and slide it to the left
    var now = new Date();
    var offset = x(now) - x(timeScale.offset(now, 1));

    paths.line
      .attr("d", line)
      // .attr("transform", null)
      .attr("transform", "translate(" + offset + ",0)")
      .transition()
        .duration(interval)
        .ease("linear")
        .attr("transform", "translate(" + offset + ",0)")
        .each("end", function () {});

    paths.area
      .attr("d", area)
      // .attr("transform", null)
      .transition()
        .duration(interval)
        .ease("linear")
        .attr("transform", "translate(" + offset + ",0)")
        .each("end", function () {});

    // d3.select('x axis')
    //   .attr("transform", null)
    //   .transition()
    //     .duration(800)
    //     .ease("linear")
    //     .attr("transform", "translate(" + offset + ", " + y(maxTemp) + ")")
    //     .each("end", function () {})
    //     .call(xAxis)
  }

  // function updateXAxis() {
  //   now = new Date();
  //   x = d3.scale.linear()
  //     // .domain([0, n - 1])
  //     .domain([d3.time.minute.offset(now, -n), now])
  //     .range([0, width]);
  // }

  function convertDatum(raw) {
    return {temperature: raw.temperature, timestamp: new Date(raw.taken_at)};
  }

  Graph.init = function (_data) {
    data = _data.map(convertDatum);
    n = _data.length - 1;
    draw();
  };

  Graph.push = function (raw) {
    var datum = convertDatum(raw);
    data.push(datum);
    drawLine();
    setTimeout(data.shift.bind(data), interval + 100);
  };

  window.onresize = draw;

  requestAnimationFrame(function frame() {
    draw();
    requestAnimationFrame(frame);
  });

})(window, d3);