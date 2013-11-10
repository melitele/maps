var util = require('./util');
var merge = require('object').merge;

module.exports = map;

function map(node, options) {
  var _gm = util.gm(), self;

  function on(event, fn) {
    _gm.event.addListener(self._g, event, fn);
    return self;
  }

  function bounds() {
    return util.gbounds2bounds(self._g.getBounds());
  }

  function fitBounds(bounds) {
    self._g.fitBounds(util.bounds2gbounds(bounds));
    return self;
  }

  function panToBounds(bounds) {
    self._g.panToBounds(util.bounds2gbounds(bounds));
    return self;
  }

  function zoom() {
    return self._g.getZoom();
  }

  function zoomIn() {
    self._g.setZoom(zoom() + 1);
    return self;
  }

  function zoomOut() {
    self._g.setZoom(zoom() - 1);
    return self;
  }

  function center() {
    return util.gll2ll(self._g.getCenter());
  }

  options = merge({
    streetViewControl: false,
    panControl: false,
    zoomControl: false,
    scaleControl: true,
    mapTypeControl: false,
    mapTypeId: _gm.MapTypeId.TERRAIN
  }, options);

  if (options.center) {
    options.center = util.ll2gll(options.center);
  }

  self = {
    on: on,
    bounds: bounds,
    fitBounds: fitBounds,
    panToBounds: panToBounds,
    center: center,
    zoom: zoom,
    zoomIn: zoomIn,
    zoomOut: zoomOut
  };
  self._g = new _gm.Map(node, options);

  return self;
}
