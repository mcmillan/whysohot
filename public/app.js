var currentContainer = document.querySelector('.currently');

function setBackgroundFromTemperature(temperature) {
  temperature = parseFloat(temperature);
  var min = 10,
      max = 30,
      hotness = Math.min(Math.max(temperature - min, 0), max - min) / (max - min),
      coldness = 1 - hotness,
      red = Math.floor(hotness * 255),
      blue = Math.floor(coldness * 255);

  document.body.style.backgroundColor = 'rgb(' + red + ', 0, ' + blue + ')';
}

setBackgroundFromTemperature(currentContainer.dataset.temperature);

function addTemperature(data) {
  var previous = document.createElement('div');
  previous.className = 'previously';
  previous.innerHTML = '<div class="timestamp">' +
    currentContainer.dataset.takenAt + '</div><div class="temperature">' +
    currentContainer.dataset.temperature + '&deg;C</div>';

  document.querySelector('.container').insertBefore(previous, document.querySelector('.previously'));
  // console.log(currentTemp);

  currentContainer.innerHTML = data.temperature + '&deg;C';
  currentContainer.dataset.temperature = data.temperature;
  currentContainer.dataset.takenAt = data.taken_at;
  setBackgroundFromTemperature(data.temperature);

  document.querySelector('.container').removeChild(document.querySelector('.previously:last-of-type'));

  Graph.push(data);
}
