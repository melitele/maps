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
  var _gm = util.gm(), _gcj02 = options.gcj20, self;

  function add(map) {
    if (map.gcj02) {
      _gcj02 = map.gcj02();
    }
    self._m.setMap(map._m);
    return self;
  }

  function remove() {
    self._m.setMap(null);
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return self._m.get(key);
    }
    if (key === 'dashOpacity') {
      value = {
        dashOpacity: value
      };
      dashes(value);
      self._m.setOptions(value);
      return;
    }
    self._m.set(key, value);
  }

  function path(p) {
    if (p === undefined) {
      return self._m.getPath();
    }
    self._m.setPath(util.path2gpath(p, _gcj02));
  }

  self = object({
    add: add,
    remove: remove,
    option: option,
    path: path
  });

  options = merge({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.dashOpacity) {
    dashes(options);
  }
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.path) {
    options.path = util.path2gpath(options.path, _gcj02);
  }

  self._m = new _gm.Polyline(options);

  return self;
}
