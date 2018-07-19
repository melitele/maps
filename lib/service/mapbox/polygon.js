var util = require('./util');

module.exports = polygon;

var properties = [
  'fillColor',
  'fillOpacity',
  'strokeColor'
];

var LAYOUT = {}, PAINT  = {
  'fill-color': [ 'get', 'fillColor' ],
  'fill-opacity': [ 'get', 'fillOpacity' ],
  'fill-outline-color': [ 'get', 'strokeColor' ]
};

function create(self, id, options) {

  options.fillColor = options.fillColor || '#FFFFFF';
  options.fillOpacity = options.fillOpacity || 0;
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
        properties: util.getProperties(properties, options),
        geometry: {
          type: 'Polygon',
          coordinates: [options.path || [[0, 0], [0, 0]]]
        }
      }
    },
    layout: LAYOUT,
    paint: PAINT
  };

  return options;
}

var layer = require('./layer')(undefined, create);

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
