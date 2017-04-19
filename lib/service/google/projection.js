var merge = require('lodash.assign');
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

  function isReady() {
    return Boolean(_m);
  }

  function remove() {
    overlay.setMap();
    _m = undefined;
  }

  overlay = merge(new _gm.OverlayView(), {
    onAdd: function() {
      _m = this.getProjection();
    },
    onRemove: function () {},
    draw: options.calculate ? options.calculate.bind(options) : function () {}
  });
  overlay.setMap(options.map._m);

  return {
    position: position,
    location: location,
    isReady: isReady,
    remove: remove
  };
}