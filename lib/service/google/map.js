var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = map;

function map(node, options) {
  var _gm = util.gm(), mapTypeId = {
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
  }, _gcj02 = options.gcj20, self;

  function element() {
    return node;
  }

  function bounds(b) {
    if (b === undefined) {
      return util.gbounds2bounds(self._m.getBounds(), _gcj02);
    }
    self._m.fitBounds(util.bounds2gbounds(b, _gcj02));
  }

  function panToBounds(bounds) {
    self._m.panToBounds(util.bounds2gbounds(bounds, _gcj02));
    return self;
  }

  function panBy(x, y) {
    self._m.panBy(x, y);
    return self;
  }

  function zoom(z) {
    if (z === undefined) {
      return self._m.getZoom();
    }
    self._m.setZoom(z);
  }

  function center(c) {
    if (!c) {
      return util.gll2ll(self._m.getCenter(), _gcj02);
    }
    self._m.panTo(util.ll2gll(c, _gcj02));
  }

  function mapType(type) {
    if (type === undefined) {
      return self._m.getMapTypeId();
    }
    self._m.setMapTypeId(mapMapType(type));
  }

  function mapMapType(id) {
    return mapTypeId[id] || id;
  }

  function getTile(coord, zoom, document) {
    return document.createElement('div');
  }

  function releaseTile() {}

  function refresh() {
    _gm.event.trigger(self._m, 'resize');
  }

  function gcj02(v) {
    if (v === undefined) {
      return _gcj02;
    }
    _gcj02 = v;
  }

  function addControl(el, position) {
    self._m.controls[controlPosition[position]].push(el);
    return self;
  }

  options = merge({
    streetViewControl: false,
    panControl: false,
    zoomControl: false,
    scaleControl: true,
    mapTypeControl: false,
    mapTypeId: _gm.MapTypeId.TERRAIN
  }, options);

  self = object({
    gcj02: gcj02,
    bounds: bounds,
    element: element,
    fitBounds: bounds, // obsolete; use bounds(b)
    panToBounds: panToBounds,
    panBy: panBy,
    center: center,
    zoom: zoom,
    mapType: mapType,
    addControl: addControl,
    refresh: refresh
  });

  if (options.center) {
    options.center = util.ll2gll(options.center, _gcj02);
  }

  options.mapTypeId = mapMapType(options.mapTypeId);
  ['mapTypeControlOptions', 'streetViewControlOptions', 'zoomControlOptions'].forEach(function (ctrlOptions) {
    ctrlOptions = options[ctrlOptions];
    if (ctrlOptions && ctrlOptions.position) {
      ctrlOptions.position = controlPosition[ctrlOptions.position] || ctrlOptions.position;
    }
  });
  if (options.mapTypeControlOptions) {
    if (options.mapTypeControlOptions.mapTypeIds) {
      options.mapTypeControlOptions.mapTypeIds = options.mapTypeControlOptions.mapTypeIds.map(mapMapType);
    }
    if (options.mapTypeControlOptions.style) {
      var style = mapTypeControl[options.mapTypeControlOptions.style];
      if (style !== undefined) {
        options.mapTypeControlOptions.style = style;
      }
    }
  }
  self._m = new _gm.Map(node, options);

  if (options.customMapTypes) {
    Object.keys(options.customMapTypes).forEach(function (key) {
      var type = options.customMapTypes[key];
      if (type.tileSize) {
        type.tileSize = new _gm.Size(type.tileSize[0], type.tileSize[1]);
      }
      if (!type.getTile) {
        type.getTile = getTile;
        type.releaseTile = releaseTile;
      }
      self._m.mapTypes.set(key, type);
    });
  }

  return self;
}
