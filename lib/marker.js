var util = require('./util');
var label = require('./label');
var merge = require('object').merge;

module.exports = marker;

function marker(options) {
  var _gm = util.gm(), self, lbl;

  function add(map) {
    self._g.setMap(map._g);
    if (lbl) {
      lbl.add(self);
    }
    return self;
  }

  function remove() {
    self._g.setMap(null);
    return self;
  }

  function animation(type) {
    var gtype = type && _gm.Animation[type.toUpperCase()];
    self._g.setAnimation(gtype);
    return self;
  }

  function on(event, fn) {
    _gm.event.addListener(self._g, event, fn);
    return self;
  }

  self = {
    animation: animation,
    add: add,
    remove: remove,
    on: on
  };

  options = merge({
    flat: true,
    icon: {
      path: _gm.SymbolPath.CIRCLE,
      fillColor: options.color,
      fillOpacity: 1,
      strokeColor:  '#555555',
      strokeWeight: 2,
      scale: 7
    }
  }, options);
  if (options.map) {
    options.map = options.map._g;
  }
  if (options.position) {
    options.position = util.ll2gll(options.position);
  }

  self._g = new _gm.Marker(options);

  if (options.label) {
    lbl = label({
      marker: self,
      text: options.label
    });
  }

  return self;
}
