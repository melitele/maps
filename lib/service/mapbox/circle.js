var geodesyLatLon = require('geodesy/latlon-spherical');
var handle = require('./handle');

module.exports = circle;

var paint = {
  fillColor: 'circle-color',
  fillOpacity: 'circle-opacity',
  strokeColor: 'circle-stroke-color',
  strokeOpacity: 'circle-stroke-opacity',
  strokeWeight: 'circle-stroke-width'
};

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
          coordinates: options.center
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

var R = 6378137;

function pixels(_m, center, r) {
  return Math.abs(_m.project([center[0], center[1] + (r / R) * 180 / Math.PI]).y - _m.project(center).y);
}

var CENTER = 0, TOP = 1, RIGHT = 2, BOTTOM = 3, LEFT = 4;

function transpose(_m, center, p1, p2) {
  center = _m.project(center);
  center.x += p1;
  center.y += p2;
  center = _m.unproject(center);
  return [center.lng, center.lat];
}

function distance(p1, p2) {
  p1 = new geodesyLatLon(p1[1], p1[0]);
  p2 = new geodesyLatLon(p2[1], p2[0]);
  return p1.distanceTo(p2, R);
}

function updateHandles(h, _m, c, rP) {
  h[TOP].position(transpose(_m, c, 0, - rP));
  h[RIGHT].position(transpose(_m, c, rP, 0));
  h[BOTTOM].position(transpose(_m, c, 0, rP));
  h[LEFT].position(transpose(_m, c, - rP, 0));
}

function circle(options) {
  var self, h;

  function center(c) {
    if (!c) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = c;
    self.update();
    if (h) {
      h[CENTER].position(c);
      updateHandles(h, self._m, c, self._l.paint['circle-radius']);
    }
    self.fire('center_changed');
  }

  function radius(r) {
    var rP;
    if (!r) {
      return options.radius;
    }
    options.radius = r;
    if (!self._m) {
      return;
    }
    rP = pixels(self._m, self._l.source.data.geometry.coordinates, r);
    self._l.paint['circle-radius'] = rP;
    self.update(true);
    if (h) {
      updateHandles(h, self._m, self.center(), rP);
    }
    self.fire('radius_changed');
  }

  function setRadius() {
    self.radius(options.radius);
  }

  function dragCenter(event) {
    self.center(event.ll);
  }

  function dragSide(event) {
    self.radius(distance(self.center(), event.ll));
  }

  function onadd(map) {
    var c;
    if (options.editable) {
      c = self.center();
      h = [
        dragCenter,
        dragSide,
        dragSide,
        dragSide,
        dragSide
      ].map(function (fn) {
        var h = handle({
          draggable: true,
          icon: icon(c)
        });
        h.add(map);
        h.on('drag', fn);
        return h;
      });
    }
    setRadius();
  }

  function onremove() {
    if (h) {
      h.forEach(function (h) {
        h.off();
        h.remove();
      });
      h = undefined;
    }
  }

  function icon(pos) {
    return {
      position: pos,
      scale: 6,
      fillColor: 'white',
      fillOpacity: 1,
      strokeColor: options.strokeColor,
      strokeWeight: 1
    };
  }

  options = Object.assign({
    editable: true,
    center: [0, 0],
    radius: 0
  }, options);

  self = layer({
    center: center,
    radius: radius
  }, options);

  self.on('zoom_changed', setRadius);

  if (options.map) {
    onadd(options.map);
  }
  self.add = function (add, map) {
    add(map);
    onadd(map);
  }.bind(undefined, self.add);
  self.remove = function (remove) {
    remove();
    onremove();
  }.bind(undefined, self.remove);

  return self;
}
