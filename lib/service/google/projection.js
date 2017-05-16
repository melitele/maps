var util = require('./util');

module.exports = projection;

function projection(options) {
  var _gm = util.gm(), overlay, _m;

  function position(p) {
    if (!isReady()) {
      return;
    }
    if (p._m) {
      p = p._m.getPosition();
    }
    return _m.fromLatLngToContainerPixel(p);
  }

  function location(x, y) {
    if (!isReady()) {
      return;
    }
    if (y !== undefined) {
      x = new _gm.Point(x, y);
    }
    return _m.fromContainerPixelToLatLng(x);
  }

  function toMap(x, y) {
    if (!isReady()) {
      return;
    }
    if (y === undefined) {
      y = x[1];
      x = x[0];
    }
    return util.gll2ll(_m.fromContainerPixelToLatLng(new _gm.Point(x, y), options.map.gcj02()));
  }

  function toScreen(ll) {
    var xy;
    if (!isReady()) {
      return;
    }
    xy = _m.fromLatLngToContainerPixel(util.ll2gll(ll, options.map.gcj02()));
    return [xy.x, xy.y];
  }

  function isReady() {
    return Boolean(_m);
  }

  function remove() {
    overlay.setMap();
    _m = undefined;
  }

  overlay = Object.assign(new _gm.OverlayView(), {
    onAdd: function() {
      _m = this.getProjection();
    },
    onRemove: function () {},
    draw: options.calculate ? options.calculate.bind(options) : function () {}
  });
  overlay.setMap(options.map._m);

  return {
    position: position, // obsolete, use toScreen
    location: location, // obsolete, use to Map
    toMap: toMap,
    toScreen: toScreen,
    isReady: isReady,
    remove: remove
  };
}
