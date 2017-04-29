var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = polyline;

function dashes(options) {
  options.strokeOpacity = 0.1;
  options.icons = [{
    icon: {
      path: 'M 0,-0.75 0,0.75',
      fillOpacity: options.dashOpacity,
      strokeOpacity: options.dashOpacity
    },
    offset: '0',
    repeat: '15px'
  }];
}

function polyline(options) {
  var _gm = util.gm(), _gcj02 = options.gcj20, poly, self;

  function add(map) {
    if (map.gcj02) {
      _gcj02 = map.gcj02();
    }
    self._m.setMap(map._m);
    if (poly) {
      poly.setMap(map._m);
    }
    return self;
  }

  function remove() {
    self._m.setMap(null);
    if (poly) {
      poly.setMap(null);
    }
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return (poly || self._m).get(key);
    }
    if (key === 'dashOpacity') {
      value = {
        dashOpacity: value
      };
      dashes(value);
      (poly || self._m).setOptions(value);
      return;
    }
    (poly || self._m).set(key, value);
    if (poly) {
      if (key === 'strokeOpacity' || key === 'strokeWeight') {
        return;
      }
      else if (key === 'outlineZIndex') {
        key = 'zIndex';
      }
      self._m.set(key, value);
    }
  }

  function path(p) {
    if (p === undefined) {
      return self._m.getPath();
    }
    p = util.path2gpath(p, _gcj02);
    self._m.setPath(p);
    if (poly) {
      poly.setPath(p);
    }
  }

  self = object({
    add: add,
    remove: remove,
    option: option,
    path: path
  });

  options = merge({
    strokeOpacity: 0.8,
    strokeWeight: 4,
    margin: 10,
    clickable: true
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.path) {
    options.path = util.path2gpath(options.path, _gcj02);
  }

  if (options.clickable) {
    poly = merge({}, options);
    poly.strokeOpacity = 0;
    poly.strokeWeight = 2 * options.margin;
    poly.zIndex = options.outlineZIndex;
    options.clickable = false;
  }
  if (options.dashOpacity) {
    dashes(options);
  }

  if (poly) {
    self._m = new _gm.Polyline(poly);
    poly = new _gm.Polyline(options);
  }
  else {
    self._m = new _gm.Polyline(options);
  }

  return self;
}
