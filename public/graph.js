(function () {
  var Graph = window.Graph = {};

  var width = window.innerWidth,
      height = window.innerHeight,
      minTemp = 10,
      maxTemp = 30;

  var n = 30,
      data  =[];

  var x = d3.scale.linear()
      .domain([0, n - 1])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([minTemp, maxTemp])
      .range([height, 0]);

  var line = d3.svg.line()
      .x(function(d, i) { return x(i); })
      .y(function(d, i) { return y(d); });

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g");

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  // svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + y(0) + ")")
  //     .call(d3.svg.axis().scale(x).orient("bottom"));

  // svg.append("g")
  //     .attr("class", "y axis")
  //     .call(d3.svg.axis().scale(y).orient("left"));

  var path = svg.append("g")
      .attr("clip-path", "url(#clip)")
    .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  function draw() {
    // redraw the line, and slide it to the left
    path
        .attr("d", line)
        .attr("transform", null)
      .transition()
        .duration(59000)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ",0)")
        .each("end", function () {});
  }

  Graph.init = function (temperatures) {
    data.push.apply(data, temperatures);
    draw();
  };

  Graph.push = function (temperature) {
    // push a new data point onto the back
    data.push(temperature);
    draw();
    // pop the old data point off the front
    data.shift();
  }
})();