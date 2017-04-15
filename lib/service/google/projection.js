var merge = require('lodash.assign');
var util = require('./util');

module.exports = projection;

function projection(options) {
  var _gm = util.gm(), _g;

  function position(p) {
    if (p._g) {
      p = p._g.getPosition();
    }
    return _g.fromLatLngToContainerPixel(p);
  }

  function location(x, y) {
    var p = y === undefined ? x : new _gm.Point(x, y);
    return _g.fromContainerPixelToLatLng(p);
  }

  merge(new _gm.OverlayView(), {
    onAdd: function() {
      _g = this.getProjection();
    },
    onRemove: function () {},
    draw: function () {
      options.calculate();
    }
  }).setMap(options.map._g);

  function isReady() {
    return Boolean(_g);
  }

  return {
    position: position,
    location: location,
    isReady: isReady
  };
}