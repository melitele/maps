var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = polyline;

var id = 0;

function polyline(options) {
  var self, map;

  function createLayer(path) {
    if (typeof path === 'string') {
      path = util.decodePath(path);
    }
    id += 1;
    self._m = {
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

  function add(mp) {
    map = mp;
    map._m.addLayer(self._m);
    return self;
  }

  function remove() {
    if (map) {
      map._m.removeLayer(self._m.id);
      map = undefined;
    }
    return self;
  }

  function path(p) {
    var mp;
    if (p === undefined) {
      return map && map.getLayer(self._m.id).source.data.geometry.coordinates;
    }
    mp = map;
    remove();
    createLayer(p);
    if (mp) {
      add(mp);
    }
  }

  self = object({
    add: add,
    remove: remove,
    path: path
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
