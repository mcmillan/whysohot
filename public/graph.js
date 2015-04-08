(function (window, d3) {
  var Graph = window.Graph = {};

  var minTemp = 10,
      maxTemp = 30,
      paths = {},
      n, data, width, height, x, y, line, svg, now, area;

  function draw() {
    d3.select("svg").remove();

    width = window.innerWidth;
    height = window.innerHeight;

    svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    updateXAxis();

    y = d3.scale.linear()
        .domain([minTemp, maxTemp])
        .range([height, 0]);

    area = d3.svg.area()
      .x(function(d) { return x(d.timestamp); })
      .y0(height)
      .y1(function(d) { return y(d.temperature); });

    line = d3.svg.line()
        .x(function(d, i) { return x(d.timestamp); })
        .y(function(d, i) { return y(d.temperature); });

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x axis")
        // .attr("transform", "translate(0," + y(minTemp) + ")")
        .call(d3.svg.axis()
            .scale(x)
            // .orient("top")
            .orient("bottom")
            .ticks(d3.time.minute, 5)
            .tickFormat(d3.time.format("%H:%M")));
            // .tickFormat(function (d) { return d3.time.format("%H:%M")(d); }));
            // .tickFormat(function (d) { return "-0:" + d3.format("02d")(30 - d); }));
            // .tickFormat(function (d) { return 30 - d + " minutes ago"}));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis()
          .scale(y)
          .orient("right")
          .tickFormat(function (d) { return d + "°C"; }));

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
    var offset = x(d3.time.minute.offset(new Date, -1));

    // paths.line
    //   .attr("d", line)
    //   .attr("transform", null)
    //   .transition()
    //     .duration(59000)
    //     .ease("linear")
    //     .attr("transform", "translate(" + offset + ",0)");
    //     // .each("end", function () {});

    // paths.area
    //   .attr("d", area)
    //   .attr("transform", null)
    //   .transition()
    //     .duration(59000)
    //     .ease("linear")
    //     .attr("transform", "translate(" + offset + ",0)");
    //     // .each("end", function () {});
  }


  function updateXAxis() {
    now = new Date();
    x = d3.scale.linear()
      // .domain([0, n - 1])
      .domain([d3.time.hour.offset(now, -1), now])
      .range([0, width]);
  }

  function convertDatum(raw) {
    return {temperature: raw.temperature, timestamp: new Date(raw.taken_at)};
  }

  Graph.init = function (_data) {
    data = _data.map(convertDatum);
    n = _data.length;
    draw();
  };

  Graph.push = function (raw) {
    var datum = convertDatum(raw);
    // push a new data point onto the back
    data.push(datum);
    drawLine();
    // pop the old data point off the front
    data.shift();
  };

  window.onresize = draw;
})(window, d3);