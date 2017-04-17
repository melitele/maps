var label = require('./label');
var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = marker;

function marker(options) {
  var _gm = util.gm(), iconPath = {
    circle: _gm.SymbolPath.CIRCLE
  }, self, lbl;

  function add(map) {
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

  function zindex() {
    return self._m.getZIndex();
  }

  function position(p) {
    if (p === undefined) {
      return self._m.getPosition();
    }
    self._m.setPosition(p);
  }

  self = object({
    animation: animation,
    add: add,
    remove: remove,
    zindex: zindex,
    position: position
  });

  lbl = options.label;
  delete options.label;
  options = merge({
    flat: true,
    icon: {
      path: 'circle',
      fillColor: options.color,
      fillOpacity: 1,
      strokeColor:  '#555555',
      strokeWeight: 2,
      scale: 7
    }
  }, options);
  if (options.map) {
    options.map = options.map._m;
  }
  if (options.position) {
    options.position = util.ll2gll(options.position);
  }
  if (iconPath[options.icon.path] !== undefined) {
    options.icon.path = iconPath[options.icon.path];
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
