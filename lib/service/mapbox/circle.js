var merge = require('lodash.assign');

module.exports = circle;

var paint = {
  radius: 'circle-radius',
  fillColor: 'circle-color',
  fillOpacity: 'circle-opacity',
  strokeColor: 'circle-stroke-color',
  strokeOpacity: 'circle-stroke-opacity',
  strokeWeight: 'circle-stroke-width'
};

function create(self, id, options) {
  options = merge({
    editable: true
  }, options);

  options.fillColor = options.fillColor || '#FFFFFF';
  options.strokeColor = options.strokeColor || '#FFFFFF';

  self._l = {
    id: '' + id,
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: options.center || [0, 0]
        }
      }
    },
    paint: {
      'circle-radius': options.radius || 0,
      'circle-color': options.fillColor,
      'circle-opacity': options.fillOpacity || 0,
      'circle-stroke-color': options.strokeColor,
      'circle-stroke-opacity': options.strokeOpacity || 1,
      'circle-stroke-width': options.strokeWeight
    }
  };
  return options;
}

var layer = require('./layer')(paint, create);

function circle(options) {
  var self;

  function center(c) {
    if (!c) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = c;
    self.update();
  }

  function radius(r) {
    return self.option('radius', r);
  }

  self = layer({
    center: center,
    radius: radius
  }, options);

  return self;
}
