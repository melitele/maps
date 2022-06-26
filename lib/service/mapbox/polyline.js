const draggable = require('./draggable');
const findPoint = require('../../util').findPoint;
const util = require('./util');

module.exports = polyline;

const properties = [
  'dashOpacity',
  'strokeColor',
  'strokeOpacity',
  'strokeWeight'
];

const LAYOUT = {
        'line-join': 'round',
        'line-cap': 'round'
      },
      PAINT  = {
        solid: {
          'line-color': [ 'get', 'strokeColor' ],
          'line-opacity': [ 'get', 'strokeOpacity' ],
          'line-width': [ 'get', 'strokeWeight' ]
        },
        dashed: {
          'line-color': [ 'get', 'strokeColor' ],
          'line-dasharray': [2, 3],
          'line-opacity': [ 'get', 'dashOpacity' ],
          'line-width': [ 'get', 'strokeWeight' ]
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

function getChangedProperties(key, value, options) {
  if (key === 'dashOpacity') {
    // line-dasharray doesn't support functions - https://github.com/mapbox/mapbox-gl-js/issues/3045
    return {
      paint: PAINT[value ? 'dashed' : 'solid']
    };
  }
  if (key === 'visible') {
    if (value) {
      return {
        update: true,
        data: {
          dashOpacity: options.dashOpacity,
          strokeOpacity: options.strokeOpacity
        }
      };
    }
    else {
      return {
        update: true,
        data: {
          dashOpacity: 0,
          strokeOpacity: 0
        }
      };
    }
  }
}

function create(self, id, options) {

  options = Object.assign({
    dashOpacity: 0,
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color || '#FFFFFF';

  self._l = {
    id: '' + id,
    type: 'line',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: util.getProperties(properties, options),
        geometry: {
          type: 'LineString',
          coordinates: validate(options.path)
        }
      }
    },
    layout: LAYOUT,
    paint: getChangedProperties('dashOpacity', options.dashOpacity).paint
  };

  return options;
}

const layer = require('./layer')(getChangedProperties, create);

function polyline(options) {
  let self;

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = validate(p);
    self.update();
  }

  function ll(e) {
    let point;
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
        const path = self._l.source.data.geometry.coordinates;
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
    ll,
    path
  }, options);
  self = draggable(self, options);

  return self;
}

function margin(_m, p, margin) {
  const p1 = _m.unproject(p),
        p2 = _m.unproject({
        x: p.x + margin,
        y: p.y + margin
      });
  return [Math.abs(p1.lng - p2.lng), Math.abs(p1.lat - p2.lat)];
}