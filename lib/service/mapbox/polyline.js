var draggable = require('./draggable');
var findPoint = require('../../util').findPoint;
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

  options = Object.assign({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color || '#FFFFFF';

  if (typeof options.path === 'string') {
    options.path = util.decodePath(options.path);
  }
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
          coordinates: validate(options.path)
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

  if (options.dashOpacity) {
    Object.assign(self._l.paint, paint.dashOpacity(options.dashOpacity));
  }

  return options;
}

var layer = require('./layer')(paint, create);

function polyline(options) {
  var self;

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = validate(p);
    self.update();
  }

  function ll(e) {
    var point;
    if (e && e.lngLat) {
      if (e.drag) {
        e.ll = util.mll2ll(e.lngLat);
        return;
      }
      point = findPoint(util.mll2ll(e.lngLat), self.path(), margin(self._m, e.point, options.margin));
      if (point) {
        e.ll = point.p;
        e.pointOnPath = point;
        e.featurePoint = self._m.project(e.ll);
        var path = self._l.source.data.geometry.coordinates;
        if (path) {
          if (point.idx || point.pol) {
            e.featurePoint.prev = self._m.project(path[point.pol ? point.idx : (point.idx - 1)]);
          }
          if (point.idx < path.length - 1) {
            e.featurePoint.next = self._m.project(path[point.idx + 1]);
          }
        }
      }
    }
  }

  options = Object.assign({
    margin: 10,
    clickable: true
  }, options);

  self = layer({
    ll: ll,
    path: path
  }, options);
  self = draggable(self, options);

  return self;
}

function margin(_m, p, margin) {
  var p1 = _m.unproject(p),
    p2 = _m.unproject({
    x: p.x + margin,
    y: p.y + margin
  });
  return [Math.abs(p1.lng - p2.lng), Math.abs(p1.lat - p2.lat)];
}