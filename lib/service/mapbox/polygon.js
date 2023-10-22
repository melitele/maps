const util = require('./util');

module.exports = polygon;

const properties = [
  'fillColor',
  'fillOpacity',
  'strokeColor'
];

const LAYOUT = {},
      PAINT  = {
        'fill-color': [ 'get', 'fillColor' ],
        'fill-opacity': [ 'get', 'fillOpacity' ],
        'fill-outline-color': [ 'get', 'strokeColor' ]
      };

function getChangedProperties(key, value, options) {
  if (key === 'visible') {
    if (value) {
      return {
        update: true,
        data: {
          fillOpacity: options.fillOpacity
        }
      };
    }
    else {
      return {
        update: true,
        data: {
          fillOpacity: 0
        }
      };
    }
  }
}

function getType(path) {
  if (typeof path[0][0] === 'number') {
    return 'Polygon';
  }
  return 'MultiPolygon';
}

function getCoordinates(type, path) {
  if (type === 'Polygon') {
    return [path];
  }
  return path;
}

function create(self, id, options) {

  options.fillColor = options.fillColor || '#FFFFFF';
  options.fillOpacity = options.fillOpacity || 0;
  options.strokeColor = options.strokeColor || '#FFFFFF';

  const path = options.path || [[0, 0], [0, 0]];
  const type = getType(path);
  self._l = {
    id: '' + id,
    type: 'fill',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: util.getProperties(properties, options),
        geometry: {
          type,
          coordinates: getCoordinates(type, path)
        }
      }
    },
    layout: LAYOUT,
    paint: PAINT
  };

  return options;
}

const layer = require('./layer')(getChangedProperties, create);

function polygon(options) {
  let self;

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.type = getType(p);
    self._l.source.data.geometry.coordinates = getCoordinates(self._l.source.data.geometry.type, p);
    self.update();
  }

  self = layer({
    path
  }, options);

  return self;
}
