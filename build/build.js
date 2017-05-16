require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var distance = require('./util').distance;

module.exports = collate;

function collate(options) {
  var proj, regions, markers = [], threshold = options.threshold || 18, service = this;

  function reset() {
    markers = [];
    regions = undefined;
  }

  function add(marker, referenceOnly) {
    marker.referenceOnly = referenceOnly;
    markers.push(marker);
  }

  function calculate() {
    if (!proj.isReady()) {
      return;
    }
    regions = [];
    prepareRegions();
    hideMarkers();
  }

  function prepareRegions() {
    markers.forEach(function (m) {
      if (!regions.some(function (r) {
        return addToRegion(r, m);
      })) {
        regions.push(createRegion(m));
      }
    });
  }

  function createRegion(m) {
    return {
      show: m,
      hide: []
    };
  }

  function position(m) {
    return proj.position(m);
  }

  function addToRegion(r, m) {
    if (distance(position(r.show), position(m)) < threshold) {
      if (r.show.zindex() < m.zindex()) {
        r.hide.push(r.show);
        r.show = m;
      }
      else {
        r.hide.push(m);
      }
      return true;
    }
  }

  function hideMarkers() {
    regions.forEach(function (r) {
      if (!r.show.referenceOnly) {
        r.show.add(options.map);
      }
      r.hide.forEach(function (m) {
        if (!m.referenceOnly) {
          m.remove();
        }
      });
    });
  }

  proj = options.projection || service.projection({
    map: options.map,
    calculate: calculate
  });

  return {
    add: add,
    reset: reset,
    calculate: calculate
  };
}
},{"./util":34}],2:[function(require,module,exports){
var mixin = require('./mixin');

function init(opts, fn) {
  var service, module = this;

  if (!fn) {
    fn = opts;
    opts = {};
  }
  opts.service = opts.service || 'google'; // default service
  if (opts.service === 'google') {
    service = require('./service/google');
  }
  else if (opts.service === 'mapbox') {
    service = require('./service/mapbox');
  }
  service = service(opts, fn);
  Object.assign(service, {
    collate: require('./collate'),
    outline: require('./outline'),
    spread: require('./spread')
  });
  service.map = mixin(service.map, require('./map'));
  service.util = Object.assign(service.util || {}, require('./util'));
  if (!module.collate) {
    Object.assign(module, service); // compatibility with old interface
  }
  return service;
}

module.exports = {
  init: init
};

},{"./collate":1,"./map":3,"./mixin":4,"./outline":5,"./service/google":9,"./service/mapbox":24,"./spread":33,"./util":34}],3:[function(require,module,exports){

function zoomIn() {
  var self = this;
  self.zoom(self.zoom() + 1);
  return self;
}

function zoomOut() {
  var self = this;
  self.zoom(self.zoom() - 1);
  return self;
}

module.exports = {
  zoomIn: zoomIn,
  zoomOut: zoomOut
};

},{}],4:[function(require,module,exports){
module.exports = mixin;

function mixin(superior, mixin) {
  return function () {
    var self = superior.apply(this, arguments);
    Object.keys(mixin).forEach(function (m) {
      self[m] = self[m] || mixin[m];
    });
    return self;
  };
}

},{}],5:[function(require,module,exports){
module.exports = outline;

// finds a smallest possible bounding rectangle for a set of points
function outline(points) {
  var self, se, nw;

  function include(points) {
    if (!points || !points.length) {
      return self;
    }
    se = se || points[0].slice();
    nw = nw || points[0].slice();
    points.forEach(function(point) {
      var x = point[0], y = point[1];
      if (x < se[0]) {
        se[0] = x;
      }
      if (x > nw[0]) {
        nw[0] = x;
      }
      if (y < se[1]) {
        se[1] = y;
      }
      if (y > nw[1]) {
        nw[1] = y;
      }
    });
    return self;
  }

  function bounds() {
    return [se, nw];
  }

  self = {
    include: include,
    bounds: bounds
  };

  return include(points);
}

},{}],6:[function(require,module,exports){

function expand(result, e) {
  result[e] = e;
  return result;
}

module.exports = {
  drag: [
    'dragstart',
    'drag',
    'dragend'
  ].reduce(expand, {}),
  mouse: [
    'click',
    'mousemove',
    'mouseover',
    'mouseout',
    'dragstart',
    'drag',
    'dragend'
  ].reduce(expand, {})
};

},{}],7:[function(require,module,exports){
var object = require('./object');
var util = require('./util');

module.exports = circle;

function circle(options) {
  var _gm = util.gm(), _gcj02 = options.gcj20, self;

  function add(map) {
    if (map.gcj02) {
      _gcj02 = map.gcj02();
    }
    self._m.setMap(map._m);
    return self;
  }

  function remove() {
    self._m.setMap(null);
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return self._m.get(key);
    }
    self._m.set(key, value);
  }

  function center(c) {
    if (!c) {
      c = self._m.getCenter();
      return c && util.gll2ll(c, _gcj02);
    }
    self._m.setCenter(util.ll2gll(c, _gcj02));
  }

  function radius(r) {
    if (r === undefined) {
      return self._m.getRadius();
    }
    self._m.setRadius(r);
  }

  self = object({
    add: add,
    remove: remove,
    option: option,
    center: center,
    radius: radius
  });

  options = Object.assign({
    editable: true,
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.center) {
    options.center = util.ll2gll(options.center, _gcj02);
  }

  self._m = new _gm.Circle(options);

  return self;
}

},{"./object":14,"./util":19}],8:[function(require,module,exports){
var object = require('./object');
var util = require('./util');

module.exports = handle;

function handle(options) {
  var _gm = util.gm(), iconPath = {
    circle: _gm.SymbolPath.CIRCLE,
    forward_closed_arrow: _gm.SymbolPath.FORWARD_CLOSED_ARROW
  }, _gcj02 = options.gcj20, self;

  function add(map) {
    if (!self._m) {
      self._m = map._m;
      if (map.gcj02) {
        _gcj02 = map.gcj02();
      }
      self._l.setMap(map._m);
    }
    return self;
  }

  function remove() {
    if (self._m) {
      self._l.setMap(null);
      delete self._m;
    }
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return self._l.get(key);
    }
    self._l.set(key, value);
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

  function zindex(zi) {
    if (zi === undefined) {
      return self._l.getZIndex();
    }
    self._l.setZIndex(zi);
  }

  function position(p) {
    if (p === undefined) {
      return util.gll2ll(self._l.getPosition(), _gcj02);
    }
    self._l.setPosition(util.ll2gll(p, _gcj02));
  }

  self = object({
    add: add,
    option: option,
    position: position,
    remove: remove,
    zindex: zindex
  });

  options = Object.assign({
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

  self._l = new _gm.Marker(options);

  return self;
}

},{"./object":14,"./util":19}],9:[function(require,module,exports){
var load = require('dynload');

function prepareUrl(url, params) {
  return url + '?' + Object.keys(params)
    .map(function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

function init(options, fn) {
  var protocol, util, opts = {
    v: options.v || '3',
    key: options.key,
    libraries: options.libraries,
    // always use our callback
    callback: '_google_maps_init'
  };
  if (typeof window !== 'undefined') {
    window._google_maps_init = function() {
      delete window._google_maps_init;
      window.google.maps.visualRefresh = true;
      if (typeof fn === 'function') {
        fn();
      }
    };

    protocol = window.location.protocol;
    if (protocol == 'file:') {
      protocol = 'http:';
    }
    load(prepareUrl(protocol + '//maps.googleapis.com/maps/api/js', opts));
  }

  util = require('./util');
  util.isGCJ02 = util.isGCJ02 || options.isGCJ02;

  return {
    circle: require('./circle'),
    handle: require('./handle'),
    info: require('./info'),
    map: require('./map'),
    marker: require('./marker'),
    polygon: require('./polygon'),
    polyline: require('./polyline'),
    projection: require('./projection'),
    styles: require('./styles'),
    util: util
  };
}

module.exports = init;

},{"./circle":7,"./handle":8,"./info":10,"./map":12,"./marker":13,"./polygon":15,"./polyline":16,"./projection":17,"./styles":18,"./util":19,"dynload":38}],10:[function(require,module,exports){
var util = require('./util');

module.exports = info;

function info(options) {
  var _gm = util.gm(), self;

  function open(map, marker) {
    self._m.open(map._m, marker._m);
    return self;
  }

  function content(node) {
    self._m.setContent(node);
    return self;
  }

  self = {
    open: open,
    content: content
  };
  options = Object.assign({
    maxWidth: 400
  }, options);

  self._m = new _gm.InfoWindow(options);

  return self;
}

},{"./util":19}],11:[function(require,module,exports){
var util = require('./util');

module.exports = label;

function label(options) {
  var _gm = util.gm(), self, span, div, listeners;

  function add(marker) {
    self._m.bindTo('map', marker._m, 'map');
    self._m.bindTo('position', marker._m, 'position');
    return self;
  }

  function remove() {
    self._m.unbind('map');
    self._m.unbind('position');
    self._m.setMap(null);
    return self;
  }

  function onAdd() {
    var _m = this, pane;

    pane = _m.getPanes().overlayImage;
    pane.appendChild(div);

    listeners = [
      _gm.event.addListener(this, 'position_changed', draw.bind(_m)),
      _gm.event.addListener(this, 'text_changed', draw.bind(_m)),
      _gm.event.addListener(this, 'zindex_changed', draw.bind(_m))
    ];
  }

  function onRemove() {
    div.parentNode.removeChild(div);
    listeners.forEach(_gm.event.removeListener);
  }

  function draw() {
    var _m = this, projection, position;
    projection = _m.getProjection();
    position = projection.fromLatLngToDivPixel(_m.get('position'));
    div.style.left = position.x + 'px';
    div.style.top = position.y + 'px';
    div.style.display = 'block';
    div.style.zIndex = 2000;
    span.innerHTML = options.text;

  }

  span = document.createElement('span');
  span.style.cssText = 'position: relative; left: -50%; line-height: 0;';

  div = document.createElement('div');
  div.setAttribute('class', 'marker-label');
  div.appendChild(span);
  div.style.cssText = 'position: absolute; display: none';

  self = {
    add: add,
    remove: remove
  };

  self._m = Object.assign(new _gm.OverlayView(), {
    onAdd: onAdd,
    onRemove: onRemove,
    draw: draw
  });

  if (options.marker) {
    self.add(options.marker);
  }
  return self;
}

},{"./util":19}],12:[function(require,module,exports){
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

  function destroy() {
    if (self._m) {
      self.off();
      delete self._m;
    }
  }

  options = Object.assign({
    streetViewControl: false,
    panControl: false,
    zoomControl: false,
    scaleControl: true,
    mapTypeControl: false,
    mapTypeId: _gm.MapTypeId.TERRAIN
  }, options);

  self = object({
    addControl: addControl,
    bounds: bounds,
    center: center,
    destroy: destroy,
    element: element,
    fitBounds: bounds, // obsolete; use bounds(b)
    gcj02: gcj02,
    mapType: mapType,
    panBy: panBy,
    panToBounds: panToBounds,
    refresh: refresh,
    zoom: zoom
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

},{"./object":14,"./util":19}],13:[function(require,module,exports){
var label = require('./label');
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
    self._m.setIcon(prepareIcon(Object.assign({}, i)));
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
  options = Object.assign({
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

},{"./label":11,"./object":14,"./util":19}],14:[function(require,module,exports){
var mouse = require('../events').mouse;
var util = require('./util');

module.exports = init;

function handleEvent(self, fn, e) {
  fn.call(self, e);
}

function handleMouseEvent(self, fn, e) {
  if (e && e.latLng) {
    e.ll = util.gll2ll(e.latLng, self.gcj02);
  }
  handleEvent(self, fn, e);
}

function init(self) {
  var _gm = util.gm(), listeners = {};

  function on(event, fn) {
    var handler;
    listeners[event] = listeners[event] || [];
    if (mouse[event]) {
      handler = handleMouseEvent.bind(undefined, self, fn);
    }
    else {
      handler = handleEvent.bind(undefined, self, fn);
    }
    listeners[event].push({
      handler: _gm.event.addListener(self._l || self._m, event, handler),
      fn: fn
    });
    return self;
  }

  function off(event, fn) {
    if (event === undefined) {
      _gm.event.clearInstanceListeners(self._l || self._m);
      listeners = {};
    }
    else {
      listeners[event].some(function (listener, i, listeners) {
        if (listener.fn === fn) {
          _gm.event.removeListener(listener.handler);
          listeners.splice(i, 1);
          if (!listeners.length) {
            delete listeners[event];
          }
          return true;
        }
      });
    }
    return self;
  }

  self.on = on;
  self.off = off;

  return self;
}

},{"../events":6,"./util":19}],15:[function(require,module,exports){
var object = require('./object');
var util = require('./util');

module.exports = polygon;

function polygon(options) {
  var _gm = util.gm(), _gcj02 = options.gcj20, self;

  function add(map) {
    if (map.gcj02) {
      _gcj02 = map.gcj02();
    }
    self._m.setMap(map._m);
    return self;
  }

  function remove() {
    self._m.setMap(null);
    return self;
  }

  function path(p) {
    if (p === undefined) {
      return self._m.getPath();
    }
    self._m.setPath(util.path2gpath(p, _gcj02));
  }

  self = object({
    add: add,
    remove: remove,
    path: path
  });

  options = Object.assign({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.path) {
    options.paths = util.path2gpath(options.path, _gcj02);
    delete options.path;
  }

  self._m = new _gm.Polygon(options);

  return self;
}

},{"./object":14,"./util":19}],16:[function(require,module,exports){
var object = require('./object');
var util = require('./util');

module.exports = polyline;

function dashes(options) {
  options.strokeOpacity = 0.1;
  options.icons = [{
    icon: {
      path: 'M 0,-0.75 0,0.75',
      fillOpacity: options.dashOpacity,
      strokeOpacity: options.dashOpacity
    },
    offset: '0',
    repeat: '15px'
  }];
}

function polyline(options) {
  var _gm = util.gm(), _gcj02 = options.gcj20, poly, self;

  function add(map) {
    if (map.gcj02) {
      _gcj02 = map.gcj02();
    }
    self._m.setMap(map._m);
    if (poly) {
      poly.setMap(map._m);
    }
    return self;
  }

  function remove() {
    self._m.setMap(null);
    if (poly) {
      poly.setMap(null);
    }
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return (poly || self._m).get(key);
    }
    if (key === 'dashOpacity') {
      value = {
        dashOpacity: value
      };
      dashes(value);
      (poly || self._m).setOptions(value);
      return;
    }
    (poly || self._m).set(key, value);
    if (poly) {
      if (key === 'strokeOpacity' || key === 'strokeWeight') {
        return;
      }
      else if (key === 'outlineZIndex') {
        key = 'zIndex';
      }
      self._m.set(key, value);
    }
  }

  function path(p) {
    if (p === undefined) {
      return self._m.getPath();
    }
    p = util.path2gpath(p, _gcj02);
    self._m.setPath(p);
    if (poly) {
      poly.setPath(p);
    }
  }

  self = object({
    add: add,
    remove: remove,
    option: option,
    path: path
  });

  options = Object.assign({
    strokeOpacity: 0.8,
    strokeWeight: 4,
    margin: 10,
    clickable: true
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.path) {
    options.path = util.path2gpath(options.path, _gcj02);
  }

  if (options.clickable) {
    poly = Object.assign({}, options);
    poly.strokeOpacity = 0;
    poly.strokeWeight = 2 * options.margin;
    poly.zIndex = options.outlineZIndex;
    options.clickable = false;
  }
  if (options.dashOpacity) {
    dashes(options);
  }

  if (poly) {
    self._m = new _gm.Polyline(poly);
    poly = new _gm.Polyline(options);
  }
  else {
    self._m = new _gm.Polyline(options);
  }

  return self;
}

},{"./object":14,"./util":19}],17:[function(require,module,exports){
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

},{"./util":19}],18:[function(require,module,exports){
var off = [
  { "visibility": "off" }
], on = [
  { "visibility": "on" }
], light = [
  { "saturation": -40 }
];

var styles = [
  {
    "featureType": "all",
    "elementType": "labels",
    "stylers": light
  },{
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      { "saturation": -100 },
      { "lightness": 60 }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "saturation": -40 },
      { "lightness": -10 }
    ]
  },{
    "featureType": "poi",
    "stylers": off
  },{
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      { "color": "#d0d0d0" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#707070" }
    ]
  },{
    "featureType": "administrative.locality",
    "stylers": off
  },{
    "featureType": "administrative.neighborhood",
    "stylers": off
  },{
    "featureType": "administrative.land_parcel",
    "stylers": off
  },{
    "featureType": "landscape.man_made",
    "stylers": off
  },{
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": light
  },{
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": on.concat(light)
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text",
    "stylers": off
  }
];

module.exports = styles;

},{}],19:[function(require,module,exports){
var eviltransform = require('eviltransform');

function gll2ll(gll, gcj02) {
  var ll;
  if (!gll) {
    return;
  }
  ll = [gll.lng(), gll.lat()];
  if (!(gcj02 && this.isGCJ02(ll))) {
    return ll;
  }
  ll = eviltransform.gcj2wgs(ll[1], ll[0]);
  return [ll.lng, ll.lat];
}

function ll2gll(ll, gcj02) {
  var LatLng = gm().LatLng;
  if (!(gcj02 && this.isGCJ02(ll))) {
    return new LatLng(ll[1], ll[0]);
  }
  ll = eviltransform.wgs2gcj(ll[1], ll[0]);
  return new LatLng(ll.lat, ll.lng);
}

function bounds2gbounds(b, gcj02) {
  var LatLngBounds = gm().LatLngBounds;
  b = b.map(function (ll) {
    return ll2gll.call(this, ll, gcj02);
  }, this);
  return new LatLngBounds(b[0], b[1]);
}

function gbounds2bounds(gb, gcj02) {
  return gb && [
    gb.getSouthWest(),
    gb.getNorthEast()
  ].map(function (gll) {
    return gll2ll.call(this, gll, gcj02);
  }, this);
}

function decodePath(path) {
  return gm().geometry.encoding.decodePath(path);
}

function path2gpath(path, gcj02) {
  if (path.gmPath) {
    path = path.gmPath;
  }
  else if (Array.isArray(path)) {
    if (Array.isArray(path[0])) {
      path = path.gmPath = path.map(function (ll) {
        return ll2gll(ll, gcj02);
      });
    }
  }
  else if (typeof path === 'string') {
    path = decodePath(path);
  }
  return path;
}

function gm() {
  if (!window.google || !window.google.maps) {
    throw 'Google Maps not initialized properly: call maps.init()';
  }
  return window.google.maps;
}

module.exports = {
  decodePath: decodePath,
  gll2ll: gll2ll,
  ll2gll: ll2gll,
  bounds2gbounds: bounds2gbounds,
  gbounds2bounds: gbounds2bounds,
  path2gpath: path2gpath,
  gm: gm
};
},{"eviltransform":39}],20:[function(require,module,exports){
module.exports = circle;

var paint = {
  radius: 'circle-radius',
  fillColor: 'circle-color',
  fillOpacity: 'circle-opacity',
  strokeColor: 'circle-stroke-color',
  strokeOpacity: 'circle-stroke-opacity',
  strokeWeight: 'circle-stroke-width'
};

function create(self, id, options) {
  options = Object.assign({
    editable: true
  }, options);

  options.fillColor = options.fillColor || '#FFFFFF';
  options.strokeColor = options.strokeColor || '#FFFFFF';

  self._l = {
    id: '' + id,
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: options.center || [0, 0]
        }
      }
    },
    paint: {
      'circle-radius': options.radius || 0,
      'circle-color': options.fillColor,
      'circle-opacity': options.fillOpacity || 0,
      'circle-stroke-color': options.strokeColor,
      'circle-stroke-opacity': options.strokeOpacity || 1,
      'circle-stroke-width': options.strokeWeight
    }
  };
  return options;
}

var layer = require('./layer')(paint, create);

function circle(options) {
  var self;

  function center(c) {
    if (!c) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = c;
    self.update();
  }

  function radius(r) {
    return self.option('radius', r);
  }

  self = layer({
    center: center,
    radius: radius
  }, options);

  return self;
}

},{"./layer":25}],21:[function(require,module,exports){

module.exports = draggable;

function draggable(self, options) {
  var draggable = false, events, inside, dragging, mousedown;

  function mousemove(e) {
    if (!dragging) {
      if (mousedown) {
        dragging = true;
        mousedown = undefined;
        self.fire('dragstart', e);
      }
      return;
    }
    self.fire('drag', e);
  }

  function mouseup(e) {
    mousedown = undefined;
    if (!dragging) {
      return;
    }
    dragging = undefined;
    if (!inside) {
      events.mouseleave();
    }
    self._m.off('mousemove', mousemove);
    self.fire('dragend', e);
  }

  function changeDraggable(d) {
    var prop;
    d = Boolean(d);
    if (draggable === d) {
      return;
    }
    draggable = d;
    prop = draggable ? 'on' : 'off';
    Object.keys(events).forEach(function (type) {
      self[prop](type, events[type]);
    });
  }

  events = {
    mouseenter: function () {
      inside = true;
      if (dragging) {
        return;
      }
      self._m.dragPan.disable();
    },
    mouseleave: function () {
      inside = undefined;
      if (dragging) {
        return;
      }
      self._m.dragPan.enable();
    },
    mousedown: function () {
      if (!inside || dragging) {
        return;
      }
      mousedown = true;
      self._m.on('mousemove', mousemove);
      self._m.once('mouseup', mouseup);
    }
  };

  self.changeDraggable = changeDraggable;

  if (options.draggable) {
    self.changeDraggable(true);
  }

  return self;
}

},{}],22:[function(require,module,exports){
var draggable = require('./draggable');

module.exports = handle;

var paint = {
  fillColor: 'circle-color',
  fillOpacity: 'circle-opacity',
  strokeColor: 'circle-stroke-color',
  strokeOpacity: 'circle-stroke-opacity',
  strokeWeight: 'circle-stroke-width',
  scale: function (value) {
    return {
      'circle-radius': value - 1
    };
  }
};

function create(self, id, options) {
  options = Object.assign({}, options.icon);

  options.fillColor = options.fillColor || '#FFFFFF';
  options.strokeColor = options.strokeColor || '#FFFFFF';

  self._l = {
    id: '' + id,
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: options.position || [0, 0]
        }
      }
    },
    layout: {},
    paint: Object.assign({
      'circle-color': options.fillColor,
      'circle-opacity': options.fillOpacity || 0,
      'circle-stroke-color': options.strokeColor,
      'circle-stroke-opacity': options.strokeOpacity || 1,
      'circle-stroke-width': options.strokeWeight
    }, paint.scale(options.scale || 2))
  };
  return options;
}

var layer = require('./layer')(paint, create);

function handle(options) {
  var self;

  function position(c) {
    if (!c) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = c;
    self.update();
  }

  self = layer({
    eventTarget: true,
    position: position,
    zindexLevel: 1000000
  }, options);
  self = draggable(self, options);

  return self;
}

},{"./draggable":21,"./layer":25}],23:[function(require,module,exports){

var images = {};
var imageQueue = {};
var pixelRatio = window.devicePixelRatio || 1;

function destroy() {
  images = {};
  imageQueue = {};
}

function addImage(map, name, img, url) {

  function handler() {
    if (map._m) {
      map._m.addImage(name, img);
    }
    img.removeEventListener('load', handler);
  }

  img.addEventListener('load', handler);
  img.setAttribute('src', url);
}

function add(map, name, url, size) {
  var img;
  if (images[name]) {
    return;
  }
  if (map._m && map.ready) {
    images[name] = true;
    img = document.createElement('img');
    if (size) {
      img.setAttribute('width', (size[0] * pixelRatio) + 'px');
      img.setAttribute('height', (size[1] * pixelRatio) + 'px');
    }
    addImage(map, name, img, url);
  }
  else {
    imageQueue[name] = {
      url: url,
      size: size
    };
  }
}

function init(map) {
  Object.keys(imageQueue).forEach(function (name) {
    add(map, name, imageQueue[name].url, imageQueue[name].size);
  });
  imageQueue = {};
}

module.exports = {
    add: add,
    destroy: destroy,
    init: init
};

},{}],24:[function(require,module,exports){
module.exports = init;

function init() {
  return {
    circle: require('./circle'),
    handle: require('./handle'),
    map: require('./map'),
    marker: require('./marker'),
    polygon: require('./polygon'),
    polyline: require('./polyline'),
    projection: require('./projection')
  };
}

},{"./circle":20,"./handle":22,"./map":26,"./marker":27,"./polygon":29,"./polyline":30,"./projection":31}],25:[function(require,module,exports){
var images = require('./images');
var object = require('./object');

module.exports = layer;

var id = 0;
var loaded;
var layers = [];

function updateProperty(key) {
  var params = this;
  params.m[params.set](params.id, key, params.values[key]);
}

function updateProperties(m, layer, prop, set) {
  Object.keys(layer[prop]).forEach(updateProperty, {
    id: layer.id,
    values: layer[prop],
    m: m,
    set: set,
  });
}

function afterLayer(l) {
  var zi, before;
  zi = l.metadata.zindex;
  if (layers[zi] && layers[zi].length) {
    return layers[zi][0];
  }
  layers.some(function (ids, i) {
    if (i > zi && ids.length) {
      before = ids[0];
      return true;
    }
  });
  return before;
}

function layer(paint, create) {

  return function (self, options) {
    var added, waiting;

    function data() {
      return (self._s || self._l.source).data;
    }

    function addLayer(l, before, moving) {
      var zi = l.metadata.zindex;
      layers[zi] = layers[zi] || [];
      layers[zi].unshift(l.id);
      if (!moving) {
        self._m.addLayer(Object.assign({}, l), before);
      }
    }

    function removeLayer(l, moving) {
      var zi = l.metadata.zindex;
      layers[zi].splice(layers[zi].indexOf(l.id), 1);
      if (!layers[zi].length) {
        delete layers[zi];
      }
      if (!moving) {
        self._m.removeLayer(l.id);
      }
    }

    function doAdd() {
      if (!self._m) {
        // object removed from map before it was rendered
        return;
      }
      if (self._s) {
        self._m.addSource(self._l.id, self._s);
      }
      if (self._under) {
        addLayer(self._under, afterLayer(self._under));
      }
      addLayer(self._l, afterLayer(self._l));
      added = true;
      images.init({
        _m: self._m,
        ready: true
      });
    }

    function onadd() {
      if (added) {
        return;
      }
      loaded = loaded || self._m.loaded();
      if (loaded) {
        return doAdd();
      }
      waiting = true;
      self._m.once('load', doAdd);
    }

    function onremove() {
      if (!added) {
        if (waiting) {
          waiting = undefined;
          self._m.off('load', doAdd);
        }
        return;
      }
      added = undefined;
      removeLayer(self._l);
      if (self._under) {
        removeLayer(self._under);
      }
      self._m.removeSource(self._l.id);
    }

    function update(layer) {
      if (self._m && added) {
        if (layer) {
          updateProperties(self._m, self._l, 'paint', 'setPaintProperty');
          updateProperties(self._m, self._l, 'layout', 'setLayoutProperty');
          return;
        }
        self._m.getSource(self._l.id).setData(data());
      }
    }

    function option(key, value) {
      var prop = paint[key], l = self._under || self._l;
      if (value === undefined) {
        if (prop) {
          return l.paint[prop];
        }
        if (key === 'visible') {
          return self._l.layout.visibility !== 'none';
        }
        if (key === 'zIndex') {
          return self.zindex();
        }
        return options[key];
      }

      if (prop) {
        if (typeof prop === 'function') {
          value = prop(value);
          Object.assign(l.paint, value);
          if (self._m && added) {
            Object.keys(value).forEach(function (prop) {
              self._m.setPaintProperty(l.id, prop, value[prop]);
            });
          }
          return;
        }
        l.paint[prop] = value;
        if (self._m && added) {
          self._m.setPaintProperty(l.id, prop, value);
        }
        return;
      }
      if (key === 'visible') {
        self._l.layout.visibility = value ? 'visible' : 'none';
        if (self._m && added) {
          self._m.setLayoutProperty(self._l.id, 'visibility', self._l.layout.visibility);
        }
      }
      else if (key === 'draggable' && self.changeDraggable) {
        self.changeDraggable(value);
      }
      else if (key === 'zIndex') {
        self.zindex(value);
      }
      else if (key === 'outlineZIndex' && self._under) {
        self.zindex(value, self._under);
      }
      options[key] = value;
    }

    function image(name, url, size) {
      images.add({
        _m: self._m,
        ready: true
      }, name, url, size);
    }

    function zindex(zi, l) {
      l = l || self._l;
      if (zi === undefined) {
        return l.metadata.zindex - self.zindexLevel;
      }
      zi = Math.round(zi + self.zindexLevel);
      if (zi !== l.metadata.zindex) {
        if (self._m && added) {
          removeLayer(l, true);
        }
        self._l.metadata.zindex = zi;
        if (self._m && added) {
          self._m.moveLayer(l.id, afterLayer(l));
          addLayer(l, undefined, true);
        }
      }
    }

    self = object(Object.assign(self, {
      image: image,
      option: option,
      update: update,
      zindex: zindex
    }), {
      onadd: onadd,
      onremove: onremove
    });

    id += 1;
    options = create(self, id, options);
    data().properties.map_facade = true;

    self.zindexLevel = self.zindexLevel || 0;
    self._l.metadata = self._l.metadata || {};
    self._l.metadata.zindex = Math.round((options.zIndex || 0) + self.zindexLevel);

    if (options.map) {
      self.add(options.map);
    }

    return self;
  };

}

},{"./images":23,"./object":28}],26:[function(require,module,exports){
var images = require('./images');
var object = require('./object');
var util = require('./util');

module.exports = map;

/* global mapboxgl */

function customControl(options) {
  return {
    onAdd: function (map) {
      var ctrl = this;
      ctrl._map = map;
      ctrl._container = document.createElement('div');
      ctrl._container.className = 'mapboxgl-ctrl';
      if (options.el) {
        ctrl._container.appendChild(options.el);
      }
      if (options.onAdd) {
        options.onAdd.call(ctrl, map);
      }
      return ctrl._container;
    },
    onRemove: function () {
      var ctrl = this;
      if (options.el) {
        ctrl._container.removeChild(options.el);
      }
      if (options.onRemove) {
        options.onRemove.call(ctrl);
      }
      ctrl._container.parentNode.removeChild(ctrl._container);
      delete ctrl._container;
      delete ctrl._map;
    }
  };
}

function mapTypeControl(mapTypeControlOptions, customMapTypes, fn) {
  return customControl({
    onAdd: function () {
      var ctrl = this;
      ctrl._events = [];
      mapTypeControlOptions.mapTypeIds.forEach(function (id) {
        var type = ctrl._container.appendChild(document.createElement('div')),
          ev = {
            el: type,
            event: 'click',
            fn: fn.bind(undefined, id)
          };
        type.className = 'map-type';
        type.innerHTML = '<div>' + customMapTypes[id].name + '</div>';
        type.addEventListener(ev.event, ev.fn);
        ctrl._events.push(ev);
      });
    },
    onRemove: function () {
      var ctrl = this;
      ctrl._events.forEach(function (ev) {
        ev.type.removeEventListener(ev.event, ev.fn);
      });
      delete ctrl._events;
    }
  });
}

function getAttribution(map) {
  var sourceCaches, attributions;
  if (!map.style) {
    return '';
  }
  sourceCaches = map.style.sourceCaches;
  attributions = Object.keys(sourceCaches).reduce(function (attributions, id) {
    var source = sourceCaches[id].getSource();
    if (source.attribution && attributions.indexOf(source.attribution) < 0) {
      attributions.push(source.attribution);
    }
    return attributions;
  }, []);

  // remove any entries that are substrings of another entry.
  // first sort by length so that substrings come first
  attributions.sort(function (a, b) {
    return a.length - b.length;
  });
  attributions = attributions.filter(function(attrib, i) {
    var j;
    for (j = i + 1; j < attributions.length; j += 1) {
      if (attributions[j].indexOf(attrib) >= 0) {
        return false;
      }
    }
    return true;
  });
  return attributions.join(' ');
}

function transition(prop) {
  var _m = this;
  _m[prop] = Object.assign(function (options) {
    if (options.zoom) {
      options.zoom = Math.floor(options.zoom);
    }
    _m[prop].superior.apply(this, arguments);
  }, {
    superior: _m[prop]
  });
}

function map(node, options) {
  var controlPosition = {
      BL: 'bottom-left',
      LB: 'bottom-left',
      BR: 'bottom-right',
      RB: 'bottom-right',
      TL: 'top-left',
      LT: 'top-left',
      TR: 'top-right',
      RT: 'top-right'
    }, self, mapTypeId;

  function element() {
    return node;
  }

  function center(c) {
    if (!c) {
      return util.mll2ll(self._m.getCenter());
    }
    self._m.setCenter(c);
  }

  function zoom(z) {
    if (z === undefined) {
      return Math.round(self._m.getZoom() + 1);
    }
    self._m.setZoom(z - 1);
  }

  function bounds(b) {
    if (b === undefined) {
      return util.mbounds2bounds(self._m.getBounds());
    }
    self._m.fitBounds(b, {
      padding: 100
    });
  }

  function panToBounds(bounds) {
    // display north-west corner
    self._m.panTo([bounds[1][0], bounds[0][1]]);
    return self;
  }

  function panBy(x, y) {
    self._m.panBy([x, y]);
    return self;
  }

  function mapType() {
    return mapTypeId;
  }

  function refresh() {
    self._m.resize();
  }

  function callback() {
    self.off('styledata', callback);
    options.onReady();
  }

  function addControl(el, position) {
    self._m.addControl(customControl({
      el: el
    }), controlPosition[position]);
    return self;
  }

  function ll(e) {
    var features;
    if (e.type === 'click') {
      features = self._m.queryRenderedFeatures(e.point, {
        filter: ['has', 'map_facade']
      });
      if (features && features.length) {
        // swallow clicks on layers (for the same behavior as Google maps)
        return;
      }
    }
    if (e && e.lngLat) {
      e.ll = util.mll2ll(e.lngLat);
    }
  }

  function destroy() {
    if (self._m) {
      self.off();
      self._m.remove();
      images.destroy();
      delete self._m;
    }
  }

  options = Object.assign({
    container: node,
    scaleControl: true,
    mapTypeControl: false
  }, options);

  self = object({
    addControl: addControl,
    bounds: bounds,
    center: center,
    destroy: destroy,
    element: element,
    fitBounds: bounds, // obsolete; use bounds(b)
    ll: ll,
    mapType: mapType,
    panBy: panBy,
    panToBounds: panToBounds,
    refresh: refresh,
    zoom: zoom
  });

  if (options.zoom) {
    options.zoom -= 1;
  }
  if (options.scaleControl === true) {
    options.scaleControl = {};
  }

  ['mapTypeControlOptions', 'scaleControlOptions', 'zoomControlOptions'].forEach(function (ctrlOptions) {
    ctrlOptions = options[ctrlOptions];
    if (ctrlOptions && ctrlOptions.position) {
      ctrlOptions.position = controlPosition[ctrlOptions.position] || ctrlOptions.position;
    }
  });

  self._m = new mapboxgl.Map(options);

  // ensure integral zoom
  ['flyTo', 'easeTo'].forEach(transition, self._m);

  if (options.onReady) {
    self.on('styledata', callback);
  }

  if (options.mapTypeControl) {
    self._m.addControl(mapTypeControl(options.mapTypeControlOptions, options.customMapTypes, function (id) {
      mapTypeId = id;
      self._m.fire('maptypeid_changed');
    }), (options.mapTypeControlOptions && options.mapTypeControlOptions.position) || 'bottom-left');
  }
  if (options.scaleControl) {
    self._m.addControl(new mapboxgl.ScaleControl(options.scaleControl),
        (options.scaleControlOptions && options.scaleControlOptions.position) || 'bottom-right');
  }
  if (options.zoomControl) {
    self._m.addControl(new mapboxgl.NavigationControl(),
        (options.zoomControlOptions && options.zoomControlOptions.position) || 'bottom-right');
  }
  if (options.attribution) {
    self._m.on('data', function () {
      options.attribution.innerHTML = getAttribution(self._m);
    });
  }
  return self;
}

},{"./images":23,"./object":28,"./util":32}],27:[function(require,module,exports){
// marker implemented as layer (without using Mapbox Marker)

var draggable = require('./draggable');

module.exports = marker;

var paint = {
};

function create(self, id, options) {
  options = Object.assign({}, options.icon);

  self._l = {
    id: '' + id,
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          marker: true
        },
        geometry: {
          type: 'Point',
          coordinates: options.position || [0, 0]
        }
      }
    },
    metadata: {
      marker: true
    },
    layout: {},
    paint: {}
  };
  return options;
}

var layer = require('./layer')(paint, create);

var SIZE = [16, 16];
var pixelRatio = window.devicePixelRatio || 1;

function offset(icon) {
  var r, scale = icon.scale || 1, size = icon.size;
  if (icon.anchor) {
    size = size || SIZE;
    return [Math.round(pixelRatio * (size[0] / 2 / scale - icon.anchor[0])),
            Math.round(pixelRatio * (size[1] / 2 / scale - icon.anchor[1]))];
  }
  if (size) {
    return [0, - Math.round(pixelRatio * size[1] / 2 / scale)];
  }
  r = - scale - Math.round(icon.strokeWeight / 2);
  return [r, r];
}

function marker(options) {
  var self, iconPath = {
    circle: setIcon.bind(undefined, circle, 'circle'),
    forward_closed_arrow: forwardClosedArrow
  }, animating, interval;

  function remove() {
    self.remove();
    self._l.layout = {};
    self._l.paint = {};
  }

  function position(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = p;
    self.update();
  }

  function nextFrame(params) {
    params.counter += params.delta;
    if (params.counter === params.range || !params.counter) {
      params.delta = - params.delta;
    }
  }

  function animateSymbol(params) {
    if (self._m._loaded) {
      self._m.setPaintProperty(self._l.id, 'icon-translate', [0, - params.counter]);
      nextFrame(params);
    }
  }

  function animateCircle(params) {
    if (self._m._loaded) {
      self._m.setPaintProperty(self._l.id, 'circle-translate', [0, - params.counter]);
      nextFrame(params);
    }
  }

  function startBounce() {
    var fn, params;
    if (interval) {
      return;
    }
    params = {
      counter: 0,
      delta: 4
    };
    if (self._l.type === 'symbol') {
      params.range = Math.abs(self._l.layout['icon-offset'][1] * self._l.layout['icon-size']);
      fn = animateSymbol;
    }
    else {
      params.range = self._l.paint['circle-radius'] * 8;
      fn = animateCircle;
    }
    params.range += params.delta - params.range % params.delta;
    interval = setInterval(fn.bind(undefined, params), 200);
  }

  function stopBounce() {
    if (!interval) {
      return;
    }
    clearInterval(interval);
    self._m.setPaintProperty(self._l.id,
        self._l.type === 'symbol' ? 'icon-translate' : 'circle-translate', [0, 0]);
    interval = undefined;
    return true;
  }

  function animation(type) {
    if (animating !== type) {
      animating = type;
      setTimeout(self.fire.bind(self, 'animation_changed'), 1);
      if (type === 'bounce') {
        startBounce();
      }
      else if (!type) {
        stopBounce();
      }
    }
  }

  function image(icon, off) {
    var name;
    if (!icon.url) {
      return;
    }
    name = icon.path || icon.url;
    self.image(name, icon.url, icon.size);
    self._l.type = 'symbol';
    self._l.layout['icon-image'] = name;
    self._l.layout['icon-size'] = (icon.scale || 1) / pixelRatio;
    self._l.layout['icon-rotate'] = icon.rotation || 0;
    self._l.layout['icon-offset'] = off;
  }

  function circle(icon) {
    self._l.type = 'circle';
    self._l.paint['circle-radius'] = (icon.scale || 2) - 1;
    self._l.paint['circle-color'] = icon.fillColor || '#FFFFFF';
    self._l.paint['circle-opacity'] = icon.fillOpacity || 0;
    self._l.paint['circle-stroke-color'] = icon.strokeColor;
    self._l.paint['circle-stroke-opacity'] = icon.strokeOpacity || 1;
    self._l.paint['circle-stroke-width'] = icon.strokeWeight;
  }

  function setIcon(fn, type, icon, off) {
    var m, bounce;
    if (self._l.type  && self._l.type !== type && self._m) {
      m = self._m;
      bounce = stopBounce();
      remove();
      fn(icon, off);
      self.add({
        _m: m
      });
      if (bounce) {
        startBounce();
      }
    }
    else {
      fn(icon, off);
      self.update(true);
    }
  }

  function forwardClosedArrow(icon) {
    var d = 2 * (icon.scale + icon.strokeWeight + 1),
      w = icon.strokeWeight,
      r = icon.scale + w + 1,
      s = Math.floor(w / 2),
      points = [
        [r, s].join(','),
        [2 * r - w, 2 * r - s].join(','),
        [r, 2 * r - w - s].join(','),
        [w, 2 * r - s].join(',')
      ].join(' '),
      size = [d, 2 * d],
      url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0]
        + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(' ')
        + '"><polygon points="' + points + '" stroke="' + icon.strokeColor
        + '" stroke-width="' + (icon.strokeWeight - 1) + '"';

    if (icon.fillColor) {
     url += ' fill="' + icon.fillColor + '"';
    }
    if (icon.fillOpacity !== undefined) {
      url += ' fill-opacity="' + icon.fillOpacity + '"';
    }
    url += '/></svg>';

    return {
      url: 'data:image/svg+xml;base64,' + btoa(url),
      path: icon.path,
      anchor: [d / 2, 0],
      size: size,
      scale: 1,
      rotation: icon.rotation
    };
  }

  function path(icon) {
    var size = icon.size || SIZE,
      scale = icon.scale || 1,
      anchor = icon.anchor,
      url;
    if (icon.scale !== 1) {
      size = [Math.round(size[0] * scale), Math.round(size[1] * scale)];
    }
    url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0]
      + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(' ')
      + '"><path d="' + icon.path + '" stroke="' + icon.strokeColor
      + '" stroke-width="' + icon.strokeWeight + '"';

    if (icon.fillColor) {
     url += ' fill="' + icon.fillColor + '"';
    }
    if (icon.fillOpacity !== undefined) {
      url += ' fill-opacity="' + icon.fillOpacity + '"';
    }
    if (scale !== 1) {
      url += ' transform="scale(' + scale + ')"';
    }
    url += '/></svg>';

    if (anchor) {
      anchor = [Math.round(anchor[0] * scale), Math.round(anchor[1] * scale)];
    }
    return {
      url: 'data:image/svg+xml;base64,' + btoa(url),
      path: url,
      anchor: anchor,
      size: size,
      scale: 1,
      rotation: icon.rotation
    };
  }

  function icon(i) {
    var fn;
    if (i === undefined) {
      //TODO implement getter
      return;
    }
    if (i.path && !i.url) {
      fn = iconPath[i.path] || path;
      if (fn) {
        i = fn(i);
        if (!i) {
          return;
        }
      }
    }
    setIcon(image, 'symbol', i, offset(i));
  }

  options = Object.assign({
    clickable: true,
    flat: true,
    icon: {}
  }, options);
  options.icon = Object.assign(options.icon.url ? {
    scale: 1
  } : {
    path: 'circle',
    strokeColor:  '#555555',
    strokeWeight: 2,
    scale: 7
  }, options.icon);
  if (options.color !== undefined) {
    options.icon.fillColor = options.color;
    options.icon.fillOpacity = options.icon.fillOpacity || 1;
  }
  else {
    options.icon.fillOpacity = options.icon.fillOpacity || 0;
  }
  self = layer({
    animation: animation,
    icon: icon,
    position: position,
    zindexLevel: 1000000
  }, options);
  self = draggable(self, options);

  self.icon(options.icon);

  if (options.position) {
    self.position(options.position);
  }

  if (options.map) {
    self.add(options.map);
  }

  return self;
}

},{"./draggable":21,"./layer":25}],28:[function(require,module,exports){
var drag = require('../events').drag;
var mouse = require('../events').mouse;
var util = require('./util');

module.exports = init;

var events = {
  bounds_changed: 'moveend',
  center_changed: 'moveend',
  zoom_changed: 'zoomend'
};

function handleEvent(self, fn, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  fn.call(self, e);
}

function handleMouseEvent(self, fn, e) {
  self.ll(e);
  if (!e.ll) {
    // mouse events are expected to have location
    return;
  }
  handleEvent(self, fn, e);
}

function ll(e) {
  if (e && e.lngLat) {
    e.ll = util.mll2ll(e.lngLat);
  }
}

function init(self, options) {
  var listeners = {};

  function on(event, fn) {
    var handler, layer;
    event = events[event] || event;
    if (mouse[event]) {
      handler = handleMouseEvent.bind(undefined, self, fn);
    }
    else {
      handler = handleEvent.bind(undefined, self, fn);
    }
    if (!drag[event]) {
      if (self._l) {
        layer = self._l && self._l.id;
        if (self._m) {
          self._m.on(event, self._l.id, handler);
        }
      }
      else if (self._m) {
        self._m.on(event, handler);
      }
    }
    listeners[event] = listeners[event] || [];
    listeners[event].push({
      event: event,
      layer: layer,
      fn: fn,
      handler: handler
    });
    return self;
  }

  function off(event, fn) {
    if (event === undefined) {
      Object.keys(listeners).forEach(function(event) {
        listeners[event].forEach(function (listener) {
          off(listener.event, listener.handler);
        });
      });
      listeners = {};
    }
    else {
      event = events[event] || event;
      listeners[event].some(function (listener, i, listeners) {
        if (listener.fn === fn) {
          if (!drag[event]) {
            if (listener.layer) {
              if (self._m) {
                self._m.off(event, listener.layer, listener.handler);
              }
            }
            else {
              self._m.off(event, listener.handler);
            }
          }
          listeners.splice(i, 1);
          if (!listeners.length) {
            delete listeners[event];
          }
          return true;
        }
      });
    }
    return self;
  }

  function fire(event, e) {
    if (listeners[event]) {
      listeners[event].forEach(function (listener) {
        listener.handler(e);
      });
    }
  }

  function add(map) {
    if (!self._m) {
      self._m = map._m;
      Object.keys(listeners).forEach(function(event) {
        if (!drag[event]) {
          listeners[event].forEach(function (listener) {
            if (listener.layer) {
              self._m.on(listener.event, listener.layer, listener.handler);
            }
            else {
              self._m.on(listener.event, listener.handler);
            }
          });
        }
      });
      options.onadd();
    }
    return self;
  }

  function remove() {
    if (self._m) {
      Object.keys(listeners).forEach(function(event) {
        if (!drag[event]) {
          listeners[event].forEach(function (listener) {
            if (listener.layer) {
              self._m.off(listener.event, listener.layer, listener.handler);
            }
            else {
              self._m.off(listener.event, listener.handler);
            }
          });
        }
      });
      options.onremove();
      delete self._m;
    }
    return self;
  }

  self.on = on;
  self.off = off;
  self.fire = fire;
  self.ll = self.ll || ll;

  if (options) {
    if (options.onadd) {
      self.add = add;
    }
    if (options.onremove) {
      self.remove = remove;
    }
  }

  return self;
}

},{"../events":6,"./util":32}],29:[function(require,module,exports){
var util = require('./util');

module.exports = polygon;

var paint = {
  fillColor: 'fill-color',
  fillOpacity: 'fill-opacity',
  strokeColor: 'fill-outline-color'
};

function create(self, id, options) {
  options = Object.assign({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.fillColor = options.fillColor || '#FFFFFF';
  options.strokeColor = options.strokeColor || '#FFFFFF';

  if (typeof options.path === 'string') {
    options.path = util.decodePath(options.path);
  }
  self._l = {
    id: '' + id,
    type: 'fill',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [options.path]
        }
      }
    },
    paint: {
      'fill-color': options.fillColor,
      'fill-opacity': options.fillOpacity || 0,
      'fill-outline-color': options.strokeColor
    }
  };

  return options;
}

var layer = require('./layer')(paint, create);

function polygon(options) {
  var self;

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = [p];
    self.update();
  }

  self = layer({
    path: path
  }, options);

  return self;
}

},{"./layer":25,"./util":32}],30:[function(require,module,exports){
var findPoint = require('../../util').findPoint;
var util = require('./util');

module.exports = polyline;

var paint = {
  strokeColor: 'line-color',
  strokeOpacity: 'line-opacity',
  strokeWeight: 'line-width',
  dashOpacity: function (value) {
    return {
      'line-opacity': value,
      'line-dasharray': [2, 3]
    };
  }
};

// Mapbox implementation of LineString expects 2 points
function validate(path) {
  if (path && path.length >= 2) {
    return path;
  }
  if (path && path.length === 1) {
    return [path[0], path[0]];
  }
  return [[0, 0], [0, 0]];
}

function create(self, id, options) {
  var prop = '_l', s, zindex;

  options = Object.assign({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color || '#FFFFFF';

  if (typeof options.path === 'string') {
    options.path = util.decodePath(options.path);
  }
  self._s = {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: validate(options.path)
      }
    }
  };
  s = id = '' + id;
  if (options.clickable) {
    self._l = {
      id: id,
      type: 'line',
      source: s,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': options.strokeColor,
        'line-opacity': 0,
        'line-width': 2 * options.margin
      }
    };
    id += '-';
    prop = '_under';
    zindex = options.zIndex;
    options.zIndex = options.outlineZIndex;
    if (options.zIndex === undefined) {
      if (zindex === undefined) {
        zindex = 0;
      }
      options.zIndex = zindex + 1;
    }
    else if (zindex === undefined) {
      zindex = options.zIndex - 1;
    }
  }
  self[prop] = {
    id: id,
    type: 'line',
    source: s,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': options.strokeColor,
      'line-opacity': options.strokeOpacity,
      'line-width': options.strokeWeight
    }
  };
  if (zindex !== undefined) {
    self[prop].metadata = {
      zindex: zindex
    };
  }

  if (options.dashOpacity) {
    Object.assign(self[prop].paint, paint.dashOpacity(options.dashOpacity));
  }

  return options;
}

var layer = require('./layer')(paint, create);

function polyline(options) {
  var self;

  function path(p) {
    if (p === undefined) {
      return self._s.data.geometry.coordinates;
    }
    self._s.data.geometry.coordinates = validate(p);
    self.update();
  }

  function ll(e) {
    var point;
    if (e && e.lngLat) {
      point = findPoint(util.mll2ll(e.lngLat), self.path());
      if (point) {
        e.ll = point.p;
        e.pointOnPath = point;
      }
    }
  }

  options = Object.assign({
    margin: 10,
    clickable: true
  }, options);

  self = layer({
    ll: ll,
    path: path
  }, options);

  return self;
}

},{"../../util":34,"./layer":25,"./util":32}],31:[function(require,module,exports){
var util = require('./util');

module.exports = projection;

function projection(options) {

  function position(p) {
    if (p.position) {
      p = p.position();
    }
    return options.map._m.project(p);
  }

  function location(x, y) {
    var p = y === undefined ? x : [ x, y ];
    return options.map._m.unproject(p);
  }

  function toMap(x, y) {
    return util.mll2ll(options.map._m.unproject(y === undefined ? x : [ x, y ]));
  }

  function toScreen(ll) {
    var xy = options.map._m.project(ll);
    return [xy.x, xy.y];
  }

  function isReady() {
    return true;
  }

  function remove() {
  }

  if (options.calculate) {
    setTimeout(options.calculate.bind(options.calculate), 0);
  }

  return {
    position: position, // obsolete, use toScreen
    location: location, // obsolete, use to Map
    toMap: toMap,
    toScreen: toScreen,
    isReady: isReady,
    remove: remove
  };
}
},{"./util":32}],32:[function(require,module,exports){
var polyline = require('@pirxpilot/google-polyline');

function mll2ll(mll) {
  return mll.toArray();
}

function mbounds2bounds(mb) {
  return mb && [
    mb.getSouthWest(),
    mb.getNorthEast()
  ].map(mll2ll);
}

function decodePath(path) {
  return polyline.decode(path);
}

module.exports = {
  mll2ll: mll2ll,
  mbounds2bounds: mbounds2bounds,
  decodePath: decodePath
};

},{"@pirxpilot/google-polyline":35}],33:[function(require,module,exports){
var distance = require('./util').distance;
var posSeq = [ [0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-2, -1], [-2, 0],
    [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -2],
    [-2, -2], [-3, -2], [-3, -1], [-3, 0], [-3, 1], [-3, 2], [-3, 3], [-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3],
    [3, 3], [3, 2], [3, 1], [3, 0], [3, -1], [3, -2], [3, -3], [2, -3], [1, -3], [0, -3], [-1, -3], [-2, -3], [-3, -3],
    [-4, -3], [-4, -2], [-4, -1], [-4, 0], [-4, 1], [-4, 2], [-4, 3], [-4, 4], [-3, 4], [-2, 4], [-1, 4], [0, 4],
    [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [4, -1], [4, -2], [4, -3], [4, -4], [3, -4],
    [2, -4], [1, -4], [0, -4], [-1, -4], [-2, -4], [-3, -4], [-4, -4]];

module.exports = spread;

function spread(options) {
  var regions, markers = [], threshold = options.threshold || 18, proj, service = this;

  function reset() {
    markers = [];
    regions = undefined;
  }

  function add(marker) {
    markers.push(marker);
  }

  function calculate() {
    if (!proj.isReady()) {
      return;
    }
    if (markers[0] && !markers[0].originalPosition) {
      markers.forEach(function (m) {
        m.originalPosition = m.position();
      });
    }
    regions = [];
    prepareRegions();
    combineRegions();
    moveMarkers();
  }

  function prepareRegions() {
    markers.forEach(function (m) {
      if (!regions.some(function (r) {
        if (addToRegion(r, m)) {
          return true;
        }
      })) {
        regions.push(createRegion(m));
      }
    });
  }

  function createRegion(m) {
    return {
      center: proj.position(m.originalPosition),
      threshold: threshold,
      markers: [ m ]
    };
  }

  function addToRegion(r, m) {
    if (distance(r.center, proj.position(m.originalPosition)) < r.threshold) {
      r.markers.push(m);
      r.threshold = calcThreshold(r.markers.length) * threshold;
      return true;
    }
  }

  function combineRegions() {
    regions.forEach(function (r, i) {
      for (i = i + 1; i < regions.length; i++) {
        if (distance(r.center, regions[i].center) < (r.threshold + regions[i].threshold) / 2) {
          regions[i].markers = regions[i].markers.concat(r.markers);
          regions[i].threshold = calcThreshold(regions[i].markers.length) * threshold;
          r.markers = [];
        }
      }
    });
  }

  function calcThreshold(len) {
    if (len < 2) {
      return 1;
    }
    if (len < 10) {
      return 2;
    }
    if (len < 26) {
      return 3;
    }
    if (len < 50) {
      return 4;
    }
    if (len < 82) {
      return 5;
    }
    return 6;
  }

  function moveMarkers() {
    regions.forEach(function (r) {
      r.markers.some(function (m, i) {
        if (i === posSeq.length) {
          return true;
        }
        m.position(proj.location(r.center.x + posSeq[i][0] * threshold, r.center.y + posSeq[i][1] * threshold));
      });
    });
  }

  proj = options.projection || service.projection({
    map: options.map,
    calculate: calculate
  });

  return {
    add: add,
    reset: reset,
    calculate: calculate
  };
}
},{"./util":34}],34:[function(require,module,exports){

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function between(p, p1, p2, l) {
  if (p1[l] <= p2[l]) {
    return p[l] >= p1[l] && p[l] <= p2[l];
  }
  return p[l] >= p2[l] && p[l] <= p1[l];
}

function distanceSquare(p1, p2) {
  return Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2);
}

// http://stackoverflow.com/questions/5204619/how-to-find-the-point-on-an-edge-which-is-the-closest-point-to-another-point
function pointOnLine(p, p1, p2) {
  var m1, m2, x, y;
  if (p1[0] === p2[0]) {
    return [p1[0], p[1]];
  }
  if (p1[1] === p2[1]) {
    return [p[0], p1[1]];
  }
  m1 = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  m2 = -1 / m1;
  x = (m1 * p1[0] - m2 * p[0] + p[1] - p1[1]) / (m1 - m2);
  y = m2 * (x - p[0]) + p[1];
  return [x, y];
}

function closestPoint(res, p1, i, path) {
  var p2, p, dist;
  if (Math.abs(res.point[0] - p1[0]) < 1e-5 && Math.abs(res.point[1] - p1[1]) < 1e-5) {
    p = p1;
  }
  else if (i < path.length - 1) {
    p2 = path[i + 1];
    p = pointOnLine(res.point, p1, p2);
    p = between(p, p1, p2, 0) && between(p, p1, p2, 1) && p;
  }
  if (p) {
    dist = distanceSquare(res.point, p);
    if (dist < res.dist) {
      res.dist = dist;
      res.idx = i;
      res.p = p;
    }
  }
  return res;
}

function findPointOnPath(point, path) {
  var result;
  if (point && path) {
    result = path.reduce(closestPoint, {
      dist: Number.MAX_VALUE,
      point: point
    });
    if (result.idx !== undefined) {
      point = path[result.idx];
      result.pol = result.p !== path[result.idx] && result.p !== path[result.idx];
      return result;
    }
  }
}

module.exports = {
  distance: distance,
  findPoint: findPointOnPath
};

},{}],35:[function(require,module,exports){
module.exports = {
  encode: require( './lib/encode' ),
  decode: require( './lib/decode' ),
}

},{"./lib/decode":36,"./lib/encode":37}],36:[function(require,module,exports){
module.exports = decode

function decode( value, factor ) {

  var points = []
  var x, y, px = 0, py = 0

  if (factor === undefined) {
    factor = 1e5
  }

  integers(value, function(v) {
    if (y === undefined) {
      // y (as in longitude) comes first
      y = v;
      return;
    }
    x = v

    x = x + px
    y = y + py

    points.push( [ x / factor, y / factor ] )

    px = x
    py = y

    x = y = undefined
  });

  return points

}

function sign( value ) {
  return value & 1 ? ~( value >>> 1 ) : ( value >>> 1 )
}

function integers( value, fn ) {

  var byte = 0
  var current = 0
  var bits = 0

  for( var i = 0; i < value.length; i++ ) {

    byte = value.charCodeAt( i ) - 63
    current = current | (( byte & 0x1F ) << bits )
    bits += 5

    if( byte < 0x20 ) {
      if (byte === -1 && bits === 5) {
          // special case - single byte 0 encoded as -1
          current = 0
      }
      fn( sign( current ) )
      current = 0
      bits = 0
    }

  }
}

},{}],37:[function(require,module,exports){
module.exports = encode


function encode( points ) {

  var x, y
  var px = 0, py = 0
  var str = []

  for( var i = 0; i < points.length; ++i ) {
    x = points[i][0];
    y = points[i][1];

    // note the reverse order
    chars( str, sign( y - py ) )
    chars( str, sign( x - px ) )

    px = x
    py = y
  }

  return str.join('')
}

function sign( value ) {
  value *= 1e5
  if ( value < 0 ) {
    // Google's polyline algorithm uses round to -∞ for negative numbers
    value = Math.floor( 0.5 - value )
    if (value !== 0) {
      value = ~( -value << 1 )
    }
  } else {
    value = Math.round( value )
    value = value << 1
  }
  return value
}


function chars( str, value ) {
  while( value >= 0x20 ) {
    str.push(String.fromCharCode( (( value & 0x1F ) | 0x20 ) + 63 ))
    value = value >> 5
  }
  str.push(String.fromCharCode( value + 63 ))
}

},{}],38:[function(require,module,exports){
module.exports = function load(src, async) {
  var s = document.createElement('script');
  s.src = src;
  if (typeof async === 'boolean') {
    s.async = async;
  }
  (document.head || document.body).appendChild(s);
  return s;
};

},{}],39:[function(require,module,exports){
"use strict";

var exports;
if (typeof module === "object" && exports) {
	exports = module.exports;
} else if (typeof window !== "undefined") {
	exports = window["eviltransform"] = {};
}

var earthR = 6378137.0;

function outOfChina(lat, lng) {
	if ((lng < 72.004) || (lng > 137.8347)) {
		return true;
	}
	if ((lat < 0.8293) || (lat > 55.8271)) {
		return true;
	}
	return false;
}

function transform(x, y) {
	var xy = x * y;
	var absX = Math.sqrt(Math.abs(x));
	var xPi = x * Math.PI;
	var yPi = y * Math.PI;
	var d = 20.0*Math.sin(6.0*xPi) + 20.0*Math.sin(2.0*xPi);

	var lat = d;
	var lng = d;

	lat += 20.0*Math.sin(yPi) + 40.0*Math.sin(yPi/3.0);
	lng += 20.0*Math.sin(xPi) + 40.0*Math.sin(xPi/3.0);

	lat += 160.0*Math.sin(yPi/12.0) + 320*Math.sin(yPi/30.0);
	lng += 150.0*Math.sin(xPi/12.0) + 300.0*Math.sin(xPi/30.0);

	lat *= 2.0 / 3.0;
	lng *= 2.0 / 3.0;

	lat += -100.0 + 2.0*x + 3.0*y + 0.2*y*y + 0.1*xy + 0.2*absX;
	lng += 300.0 + x + 2.0*y + 0.1*x*x + 0.1*xy + 0.1*absX;

	return {lat: lat, lng: lng}
}

function delta(lat, lng) {
	var ee = 0.00669342162296594323;
	var d = transform(lng-105.0, lat-35.0);
	var radLat = lat / 180.0 * Math.PI;
	var magic = Math.sin(radLat);
	magic = 1 - ee*magic*magic;
	var sqrtMagic = Math.sqrt(magic);
	d.lat = (d.lat * 180.0) / ((earthR * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
	d.lng = (d.lng * 180.0) / (earthR / sqrtMagic * Math.cos(radLat) * Math.PI);
	return d;
}

function wgs2gcj(wgsLat, wgsLng) {
	if (outOfChina(wgsLat, wgsLng)) {
		return {lat: wgsLat, lng: wgsLng};
	}
	var d = delta(wgsLat, wgsLng);
	return {lat: wgsLat + d.lat, lng: wgsLng + d.lng};
}
exports.wgs2gcj = wgs2gcj;

function gcj2wgs(gcjLat, gcjLng) {
	if (outOfChina(gcjLat, gcjLng)) {
		return {lat: gcjLat, lng: gcjLng};
	}
	var d = delta(gcjLat, gcjLng);
	return {lat: gcjLat - d.lat, lng: gcjLng - d.lng};
}
exports.gcj2wgs = gcj2wgs;

function gcj2wgs_exact(gcjLat, gcjLng) {
	// newCoord = oldCoord = gcjCoord
	var newLat = gcjLat, newLng = gcjLng;
	var oldLat = newLat, oldLng = newLng;
	var threshold = 1e-6; // ~0.55 m equator & latitude

	for (var i = 0; i < 30; i++) {
		// oldCoord = newCoord
		oldLat = newLat;
		oldLng = newLng;
		// newCoord = gcjCoord - wgs_to_gcj_delta(newCoord)
		var tmp = wgs2gcj(newLat, newLng);
		// approx difference using gcj-space difference
		newLat -= gcjLat - tmp.lat;
		newLng -= gcjLng - tmp.lng;
		// diffchk
		if (Math.max(Math.abs(oldLat - newLat), Math.abs(oldLng - newLng)) < threshold) {
			break;
		}
	}
	return {lat: newLat, lng: newLng};
}
exports.gcj2wgs_exact = gcj2wgs_exact;

function distance(latA, lngA, latB, lngB) {
	var pi180 = Math.PI / 180;
	var arcLatA = latA * pi180;
 	var arcLatB = latB * pi180;
	var x = Math.cos(arcLatA) * Math.cos(arcLatB) * Math.cos((lngA-lngB)*pi180);
	var y = Math.sin(arcLatA) * Math.sin(arcLatB);
	var s = x + y;
	if (s > 1) {
		s = 1;
	}
	if (s < -1) {
		s = -1;
	}
	var alpha = Math.acos(s);
	var distance = alpha * earthR;
	return distance;
}
exports.distance = distance;

function gcj2bd(gcjLat, gcjLng) {
	if (outOfChina(gcjLat, gcjLng)) {
		return {lat: gcjLat, lng: gcjLng};
	}

	var x = gcjLng, y = gcjLat;
	var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * Math.PI);
	var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * Math.PI);
	var bdLng = z * Math.cos(theta) + 0.0065;
	var bdLat = z * Math.sin(theta) + 0.006;
	return {lat: bdLat, lng: bdLng};
}
exports.gcj2bd = gcj2bd;

function bd2gcj(bdLat, bdLng) {
	if (outOfChina(bdLat, bdLng)) {
		return {lat: bdLat, lng: bdLng};
	}

	var x = bdLng - 0.0065, y = bdLat - 0.006;
	var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI);
	var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI);
	var gcjLng = z * Math.cos(theta);
	var gcjLat = z * Math.sin(theta);
	return {lat: gcjLat, lng: gcjLng};
}
exports.bd2gcj = bd2gcj;

function wgs2bd(wgsLat, wgsLng) {
	var gcj = wgs2gcj(wgsLat, wgsLng);
	return gcj2bd(gcj.lat, gcj.lng);
}
exports.wgs2bd = wgs2bd;

function bd2wgs(bdLat, bdLng) {
	var gcj = bd2gcj(bdLat, bdLng);
	return gcj2wgs(gcj.lat, gcj.lng);
}
exports.bd2wgs = bd2wgs;

},{}],"maps":[function(require,module,exports){
module.exports = require('./lib');

},{"./lib":2}]},{},[]);
window.google_map_key_for_example = '';
window.osm_map_style_url_for_example = '';
