var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = polyline;

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

  function path(p) {
    if (p === undefined) {
      return self._m.getPath();
    }
    self._m.setPath(util.path2gpath(p, _gcj02));
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
