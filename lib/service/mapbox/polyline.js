var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = polyline;

var id = 0;

function polyline(options) {
  var self;

  function createLayer(path) {
    if (typeof path === 'string') {
      path = util.decodePath(path);
    }
    id += 1;
    self._l = {
      id: '' + id,
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: path
          }
        }
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': options.strokeColor,
        'line-opacity': options.strokeOpacity,
        'line-width': options.strokeWeight
      }
    };
  }

  function onadd() {
    self._m.addLayer(self._l);
  }

  function onremove() {
    self._m.removeLayer(self._l.id);
    self._m.removeSource(self._l.id);
  }

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = p;
    if (self._m) {
      self._m.getSource(self._l.id).setData(self._l.source.data);
    }
  }

  self = object({
    path: path
  }, {
    onadd: onadd,
    onremove: onremove
  });

  options = merge({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color;

  createLayer(options.path);

  if (options.map) {
    self.add(options.map);
  }

  return self;
}
