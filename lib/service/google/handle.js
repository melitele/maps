var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = handle;

function handle(options) {
  var _gm = util.gm(), iconPath = {
    circle: _gm.SymbolPath.CIRCLE,
    forward_closed_arrow: _gm.SymbolPath.FORWARD_CLOSED_ARROW
  }, _gcj02 = options.gcj20, self;

  function add(map) {
    if (!self._m) {
      self._m = map._m;
      if (map.gcj02) {
        _gcj02 = map.gcj02();
      }
      self._l.setMap(map._m);
    }
    return self;
  }

  function remove() {
    if (self._m) {
      self._l.setMap(null);
      delete self._m;
    }
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return self._l.get(key);
    }
    self._l.set(key, value);
  }

  function prepareIcon(icon) {
    if (iconPath[icon.path] !== undefined) {
      icon.path = iconPath[icon.path];
    }
    if (icon.anchor) {
      icon.anchor = new _gm.Point(icon.anchor[0], icon.anchor[1]);
    }
    if (icon.origin) {
      icon.origin = new _gm.Point(icon.origin[0], icon.origin[1]);
    }
    if (icon.size) {
      icon.size = new _gm.Size(icon.size[0], icon.size[1]);
    }
    if (icon.scaledSize) {
      icon.scaledSize = new _gm.Size(icon.scaledSize[0], icon.scaledSize[1]);
    }
    return icon;
  }

  function zindex() {
    return self._l.getZIndex();
  }

  function position(p) {
    if (p === undefined) {
      return util.gll2ll(self._l.getPosition(), _gcj02);
    }
    self._l.setPosition(util.ll2gll(p, _gcj02));
  }

  self = object({
    add: add,
    option: option,
    position: position,
    remove: remove,
    zindex: zindex
  });

  options = merge({
    flat: true,
    icon: {
      path: 'circle',
      strokeColor:  '#555555',
      strokeWeight: 2,
      scale: 7
    }
  }, options);
  if (options.color !== undefined) {
    options.icon.fillColor = options.color;
    options.icon.fillOpacity = 1;
  }
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.position) {
    options.position = util.ll2gll(options.position, _gcj02);
  }
  if (options.icon) {
    prepareIcon(options.icon);
  }
  if (options.zIndex !== undefined) {
    options.zIndex = (options.zIndex.type === 'max' ? _gm.Marker.MAX_ZINDEX : 0) + options.zIndex.value;
  }

  self._l = new _gm.Marker(options);

  return self;
}
