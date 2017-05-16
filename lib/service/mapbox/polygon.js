var util = require('./util');

module.exports = polygon;

var paint = {
  fillColor: 'fill-color',
  fillOpacity: 'fill-opacity',
  strokeColor: 'fill-outline-color'
};

function create(self, id, options) {
  options = Object.assign({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.fillColor = options.fillColor || '#FFFFFF';
  options.strokeColor = options.strokeColor || '#FFFFFF';

  if (typeof options.path === 'string') {
    options.path = util.decodePath(options.path);
  }
  self._l = {
    id: '' + id,
    type: 'fill',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [options.path]
        }
      }
    },
    paint: {
      'fill-color': options.fillColor,
      'fill-opacity': options.fillOpacity || 0,
      'fill-outline-color': options.strokeColor
    }
  };

  return options;
}

var layer = require('./layer')(paint, create);

function polygon(options) {
  var self;

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = [p];
    self.update();
  }

  self = layer({
    path: path
  }, options);

  return self;
}
