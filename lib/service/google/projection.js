var merge = require('lodash.assign');
var util = require('./util');

module.exports = projection;

function projection(options) {
  var _gm = util.gm(), _m;

  function position(p) {
    if (p._m) {
      p = p._m.getPosition();
    }
    return _m.fromLatLngToContainerPixel(p);
  }

  function location(x, y) {
    var p = y === undefined ? x : new _gm.Point(x, y);
    return _m.fromContainerPixelToLatLng(p);
  }

  merge(new _gm.OverlayView(), {
    onAdd: function() {
      _m = this.getProjection();
    },
    onRemove: function () {},
    draw: function () {
      options.calculate();
    }
  }).setMap(options.map._m);

  function isReady() {
    return Boolean(_m);
  }

  return {
    position: position,
    location: location,
    isReady: isReady
  };
}