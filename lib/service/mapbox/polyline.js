var findPoint = require('../../util').findPoint;
var merge = require('lodash.assign');
var util = require('./util');

module.exports = polyline;

var paint = {
  strokeColor: 'line-color',
  strokeOpacity: 'line-opacity',
  strokeWeight: 'line-width',
  dashOpacity: function (value) {
    return {
      'line-opacity': value,
      'line-dasharray': [2, 3]
    };
  }
};

// Mapbox implementation of LineString expects 2 points
function validate(path) {
  if (path && path.length >= 2) {
    return path;
  }
  if (path && path.length === 1) {
    return [path[0], path[0]];
  }
  return [[0, 0], [0, 0]];
}

function create(self, id, options) {
  var prop = '_l', s;

  options = merge({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color || '#FFFFFF';

  if (typeof options.path === 'string') {
    options.path = util.decodePath(options.path);
  }
  self._s = {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: validate(options.path)
      }
    }
  };
  s = id = '' + id;
  if (options.clickable) {
    self._l = {
      id: id,
      type: 'line',
      source: s,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': options.strokeColor,
        'line-opacity': 0,
        'line-width': 2 * options.margin
      }
    };
    id += '-';
    prop = '_under';
  }
  self[prop] = {
    id: id,
    type: 'line',
    source: s,
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

  if (options.dashOpacity) {
    merge(self[prop].paint, paint.dashOpacity(options.dashOpacity));
  }

  return options;
}

var layer = require('./layer')(paint, create);

function polyline(options) {
  var self;

  function path(p) {
    if (p === undefined) {
      return self._s.data.geometry.coordinates;
    }
    self._s.data.geometry.coordinates = validate(p);
    self.update();
  }

  function ll(e) {
    var point;
    if (e && e.lngLat) {
      point = findPoint(util.mll2ll(e.lngLat), self.path());
      if (point) {
        e.ll = point.p;
        e.pointOnPath = point;
      }
    }
  }

  options = merge({
    margin: 10,
    clickable: true
  }, options);

  self = layer({
    ll: ll,
    path: path
  }, options);

  return self;
}
