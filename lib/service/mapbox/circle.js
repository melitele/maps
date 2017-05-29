module.exports = circle;

var paint = {
  fillColor: 'circle-color',
  fillOpacity: 'circle-opacity',
  strokeColor: 'circle-stroke-color',
  strokeOpacity: 'circle-stroke-opacity',
  strokeWeight: 'circle-stroke-width'
};

var R = 6378137;

function pixels(_m, center, r) {
  return Math.abs(_m.project([center[0], center[1] + (r / R) * 180 / Math.PI]).y - _m.project(center).y);
}

function create(self, id, options) {
  options = Object.assign({
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
    layout: {},
    paint: {
      'circle-radius': 0,
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
    if (!r) {
      return options.radius;
    }
    options.radius = r;
    if (!self._m) {
      return;
    }
    self._l.paint['circle-radius'] = pixels(self._m, self._l.source.data.geometry.coordinates, r);
    self.update(true);
  }

  function setRadius() {
    self.radius(options.radius);
  }

  function onadd() {
    setRadius();
  }

  self = layer({
    center: center,
    radius: radius
  }, options);

  self.on('zoom_changed', setRadius);

  if (options.map) {
    onadd();
  }
  self.add = function (add, map) {
    add(map);
    onadd();
  }.bind(undefined, self.add);

  return self;
}
