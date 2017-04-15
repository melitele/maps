var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = map;

function map(node, options) {
  var _gm = util.gm(), mapType = {
    hybrid:  _gm.MapTypeId.HYBRID,
    roadmap: _gm.MapTypeId.ROADMAP,
    satellite:  _gm.MapTypeId.SATELLITE,
    terrain:  _gm.MapTypeId.TERRAIN
  }, mapTypeControl = {
    standard: _gm.MapTypeControlStyle.DEFAULT,
    bar: _gm.MapTypeControlStyle.HORIZONTAL_BAR,
    menu: _gm.MapTypeControlStyle.DROPDOWN_MENU
  }, controlPosition = {
    BC: _gm.ControlPosition.BOTTOM_CENTER,
    BL: _gm.ControlPosition.BOTTOM_LEFT,
    BR: _gm.ControlPosition.BOTTOM_RIGHT,
    LB: _gm.ControlPosition.LEFT_BOTTOM,
    LC: _gm.ControlPosition.LEFT_CENTER,
    LT: _gm.ControlPosition.LEFT_TOP,
    RB: _gm.ControlPosition.RIGHT_BOTTOM,
    RC: _gm.ControlPosition.RIGHT_CENTER,
    RT: _gm.ControlPosition.RIGHT_TOP,
    TC: _gm.ControlPosition.TOP_CENTER,
    TL: _gm.ControlPosition.TOP_LEFT,
    TR: _gm.ControlPosition.TOP_RIGHT
  }, self;

  function element() {
    return node;
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

  function center(c) {
    if (!c) {
      return util.gll2ll(self._g.getCenter());
    }
    self._g.panTo(util.ll2gll(c));
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

  self = object({
    bounds: bounds,
    element: element,
    fitBounds: fitBounds,
    panToBounds: panToBounds,
    center: center,
    zoom: zoom,
    zoomIn: zoomIn,
    zoomOut: zoomOut
  });

  options.mapTypeId = mapType[options.mapTypeId] || options.mapTypeId;
  ['mapTypeControlOptions', 'zoomControlOptions'].forEach(function (ctrlOptions) {
    ctrlOptions = options[ctrlOptions];
    if (ctrlOptions && ctrlOptions.position) {
      ctrlOptions.position = controlPosition[ctrlOptions.position] || ctrlOptions.position;
    }
  });
  if (options.mapTypeControlOptions && options.mapTypeControlOptions.style) {
    var style = mapTypeControl[options.mapTypeControlOptions.style];
    if (style !== undefined) {
      options.mapTypeControlOptions.style = style;
    }
  }
  self._g = new _gm.Map(node, options);

  return self;
}
