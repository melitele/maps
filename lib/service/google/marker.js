var label = require('./label');
var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = marker;

function marker(options) {
  var _gm = util.gm(), iconPath = {
    circle: _gm.SymbolPath.CIRCLE,
    forward_closed_arrow: _gm.SymbolPath.FORWARD_CLOSED_ARROW
  }, _gcj02 = options.gcj20, self, lbl;

  function add(map) {
    if (map.gcj02) {
      _gcj02 = map.gcj02();
    }
    self._m.setMap(map._m);
    if (lbl) {
      lbl.add(self);
    }
    return self;
  }

  function remove() {
    self._m.setMap(null);
    return self;
  }

  function animation(type) {
    var gtype = type && _gm.Animation[type.toUpperCase()];
    self._m.setAnimation(gtype);
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return self._m.get(key);
    }
    self._m.set(key, value);
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

  function icon(i) {
    if (i === undefined) {
      return self._m.getIcon();
    }
    self._m.setIcon(prepareIcon(merge({}, i)));
  }

  function zindex(zi) {
    if (zi === undefined) {
      return self._m.getZIndex();
    }
    self._m.setZIndex(zi);
  }

  function position(p) {
    if (p === undefined) {
      return self._m.getPosition();
    }
    if (Array.isArray(p)) {
      p = util.ll2gll(p);
    }
    self._m.setPosition(p);
  }

  self = object({
    animation: animation,
    add: add,
    icon: icon,
    option: option,
    position: position,
    remove: remove,
    zindex: zindex
  });

  lbl = options.label;
  delete options.label;
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

  self._m = new _gm.Marker(options);

  if (lbl) {
    lbl = label({
      marker: self,
      text: lbl
    });
  }

  return self;
}
