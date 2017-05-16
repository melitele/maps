var object = require('./object');
var util = require('./util');

module.exports = circle;

function circle(options) {
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
    self._m.set(key, value);
  }

  function center(c) {
    if (!c) {
      c = self._m.getCenter();
      return c && util.gll2ll(c, _gcj02);
    }
    self._m.setCenter(util.ll2gll(c, _gcj02));
  }

  function radius(r) {
    if (r === undefined) {
      return self._m.getRadius();
    }
    self._m.setRadius(r);
  }

  self = object({
    add: add,
    remove: remove,
    option: option,
    center: center,
    radius: radius
  });

  options = Object.assign({
    editable: true,
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.center) {
    options.center = util.ll2gll(options.center, _gcj02);
  }

  self._m = new _gm.Circle(options);

  return self;
}
