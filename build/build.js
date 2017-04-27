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
},{"./util":30}],2:[function(require,module,exports){
var merge = require('lodash.assign');
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
  merge(service, {
    collate: require('./collate'),
    outline: require('./outline'),
    spread: require('./spread')
  });
  service.map = mixin(service.map, require('./map'));
  merge(service.util, require('./util'));
  if (!module.collate) {
    merge(module, service); // compatibility with old interface
  }
  return service;
}

module.exports = {
  init: init
};

},{"./collate":1,"./map":3,"./mixin":4,"./outline":5,"./service/google":8,"./service/mapbox":20,"./spread":29,"./util":30,"lodash.assign":37}],3:[function(require,module,exports){

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

var mouse = [
  'click',
  'mousemove',
  'mouseover',
  'mouseout',
  'dragstart',
  'drag',
  'dragend'
].reduce(function (result, e) {
  result[e] = e;
  return result;
}, {});

module.exports = {
  mouse: mouse
};

},{}],7:[function(require,module,exports){
var merge = require('lodash.assign');
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

  options = merge({
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

},{"./object":13,"./util":18,"lodash.assign":37}],8:[function(require,module,exports){
var load = require('load');

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

},{"./circle":7,"./info":9,"./map":11,"./marker":12,"./polygon":14,"./polyline":15,"./projection":16,"./styles":17,"./util":18,"load":35}],9:[function(require,module,exports){
var merge = require('lodash.assign');
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
  options = merge({
    maxWidth: 400
  }, options);

  self._m = new _gm.InfoWindow(options);

  return self;
}

},{"./util":18,"lodash.assign":37}],10:[function(require,module,exports){
var merge = require('lodash.assign');
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

  self._m = merge(new _gm.OverlayView(), {
    onAdd: onAdd,
    onRemove: onRemove,
    draw: draw
  });

  if (options.marker) {
    self.add(options.marker);
  }
  return self;
}
},{"./util":18,"lodash.assign":37}],11:[function(require,module,exports){
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

},{"./object":13,"./util":18,"lodash.assign":37}],12:[function(require,module,exports){
var label = require('./label');
var merge = require('lodash.assign');
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
    self._m.setIcon(prepareIcon(merge({}, i)));
  }

  function zindex() {
    return self._m.getZIndex();
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
  options = merge({
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

},{"./label":10,"./object":13,"./util":18,"lodash.assign":37}],13:[function(require,module,exports){
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
      handler: _gm.event.addListener(self._m, event, handler),
      fn: fn
    });
    return self;
  }

  function off(event, fn) {
    if (event === undefined) {
      _gm.event.clearInstanceListeners(self._m);
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

},{"../events":6,"./util":18}],14:[function(require,module,exports){
var merge = require('lodash.assign');
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

  options = merge({
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

},{"./object":13,"./util":18,"lodash.assign":37}],15:[function(require,module,exports){
var merge = require('lodash.assign');
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
    if (key === 'dashOpacity') {
      value = {
        dashOpacity: value
      };
      dashes(value);
      self._m.setOptions(value);
      return;
    }
    self._m.set(key, value);
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
    option: option,
    path: path
  });

  options = merge({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.dashOpacity) {
    dashes(options);
  }
  if (options.map) {
    if (options.map.gcj02) {
      _gcj02 = options.map.gcj02();
    }
    options.map = options.map._m;
  }
  if (options.path) {
    options.path = util.path2gpath(options.path, _gcj02);
  }

  self._m = new _gm.Polyline(options);

  return self;
}

},{"./object":13,"./util":18,"lodash.assign":37}],16:[function(require,module,exports){
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

  overlay = merge(new _gm.OverlayView(), {
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
},{"./util":18,"lodash.assign":37}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
var eviltransform = require('eviltransform');

function gll2ll(gll, gcj02) {
  var ll = [gll.lng(), gll.lat()];
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
},{"eviltransform":36}],19:[function(require,module,exports){
var merge = require('lodash.assign');

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
  options = merge({
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

  self = merge(layer(options), {
    center: center,
    radius: radius
  });

  return self;
}

},{"./layer":21,"lodash.assign":37}],20:[function(require,module,exports){
module.exports = init;

function init() {
  return {
    circle: require('./circle'),
    map: require('./map'),
    marker: require('./marker'),
    polygon: require('./polygon'),
    polyline: require('./polyline'),
    projection: require('./projection')
  };
}

},{"./circle":19,"./map":22,"./marker":23,"./polygon":25,"./polyline":26,"./projection":27}],21:[function(require,module,exports){
var object = require('./object');
var merge = require('lodash.assign');

module.exports = layer;

var id = 0;

function layer(paint, create) {

  return function (options) {
    var self;

    function onadd() {
      self._m.addLayer(merge({}, self._l));
    }

    function onremove() {
      self._m.removeLayer(self._l.id);
      self._m.removeSource(self._l.id);
    }

    function update() {
      if (self._m) {
        self._m.getSource(self._l.id).setData(self._l.source.data);
      }
    }

    function option(key, value) {
      var prop = paint[key];
      if (value === undefined) {
        if (prop) {
          return self._l.paint[prop];
        }
        return options[key];
      }

      if (prop) {
        if (typeof prop === 'function') {
          value = prop(value);
          merge(self._l.paint, value);
          Object.keys(value).forEach(function (prop) {
            self._m.setPaintProperty(self._l.id, prop, value[prop]);
          });
          return;
        }
        self._l.paint[prop] = value;
        if (self._m) {
          self._m.setPaintProperty(self._l.id, prop, value);
        }
        return;
      }
      options[key] = value;
    }

    self = object({
      update: update,
      option: option
    }, {
      onadd: onadd,
      onremove: onremove
    });

    id += 1;
    options = create(self, id, options);

    if (options.map) {
      self.add(options.map);
    }

    return self;
  };

}
},{"./object":24,"lodash.assign":37}],22:[function(require,module,exports){
var merge = require('lodash.assign');
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
  _m[prop] = merge(function (options) {
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

  options = merge({
    container: node,
    scaleControl: true,
    mapTypeControl: false
  }, options);

  self = object({
    element: element,
    center: center,
    zoom: zoom,
    bounds: bounds,
    fitBounds: bounds, // obsolete; use bounds(b)
    panToBounds: panToBounds,
    panBy: panBy,
    mapType: mapType,
    addControl: addControl,
    refresh: refresh
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

},{"./object":24,"./util":28,"lodash.assign":37}],23:[function(require,module,exports){
var merge = require('lodash.assign');
var object = require('./object');
var q = require('query');
var util = require('./util');

module.exports = marker;

var svgNS = "http://www.w3.org/2000/svg";
var iconPath = {
   circle: {
     el: 'circle',
     attributes: {
       cx: zero,
       cy: zero,
       scale: 'r',
       fillColor: 'fill',
       fillOpacity: 'fill-opacity',
       strokeColor: 'stroke',
       strokeWeight: 'stroke-width'
     },
     viewBox: circle
   },
   forward_closed_arrow: {
     el: 'polygon',
     attributes: {
       scale: points,
       rotation: rotate,
       fillColor: 'fill',
       fillOpacity: 'fill-opacity',
       strokeColor: 'stroke',
       strokeWeight: strokeWidth
     },
     viewBox: polygon
   },
   path: {
     el: 'path',
     attributes: {
       path: 'd',
       scale: scale,
       fillColor: 'fill',
       fillOpacity: 'fill-opacity',
       strokeColor: 'stroke',
       strokeWeight: 'stroke-width'
     },
     viewBox: path
   }
};

/* global mapboxgl */

function offset(icon) {
  var r;
  if (icon.anchor) {
    return [- Math.round(icon.anchor[0] * icon.scale), - Math.round(icon.anchor[1] * icon.scale)];
  }
  r = - icon.scale - Math.round(icon.strokeWeight / 2);
  return [r, r];
}

function drawIcon(iEl, icon, attributes) {
  Object.keys(attributes).forEach(function (attr) {
    var name, value = icon[attr];
    if (value !== undefined) {
      name = attributes[attr];
      if (typeof name === 'function') {
        name = name(icon, attr);
        value = name.value;
        name = name.name;
      }
      iEl.setAttribute(name, value);
    }
  });
}

function draw(icon) {
  var iP, vB, sEl, cEl;

  iP = iconPath[icon.path] || iconPath.path;
  vB = iP.viewBox(icon);

  sEl = document.createElementNS(svgNS, 'svg');
  sEl.setAttribute('width', vB[2]);
  sEl.setAttribute('height', vB[3]);
  sEl.setAttribute('viewBox', vB.join(' '));

  cEl = sEl.appendChild(document.createElementNS(svgNS, iP.el));
  drawIcon(cEl, icon, iP.attributes);

  return sEl;
}

function circle(icon) {
  var w = Math.round(icon.strokeWeight / 2), d = 2 * (icon.scale + w), r = - icon.scale - w;
  return [r, r, d, d];
}

function polygon(icon) {
  var d = 2 * (icon.scale + icon.strokeWeight + 1);
  return [0, 0, d, d];
}

function path(icon) {
  var d = Math.round(16 * icon.scale);
  return [0, 0, d, d];
}

function zero(icon, attr) {
  return {
    name: attr,
    value: 0
  };
}

function points(icon) {
  var w = icon.strokeWeight, r = icon.scale + w + 1, s = Math.floor(w / 2);
  return {
    name: 'points',
    value: [
      [r, s].join(','),
      [2 * r - w, 2 * r - s].join(','),
      [r, 2 * r - w - s].join(','),
      [w, 2 * r - s].join(',')
    ].join(' ')
  };
}

function rotate(icon) {
  var w = icon.strokeWeight, r = icon.scale + w + 1;
  return {
    name: 'transform',
    value: 'rotate(' + [icon.rotation, r, r].join(' ') + ')'
  };
}

function scale(icon) {
  return {
    name: 'transform',
    value: 'scale(' + icon.scale + ')'
  };
}

function strokeWidth(icon) {
  return {
    name: 'stroke-width',
    value: icon.strokeWeight - 1
  };
}

function marker(options) {
  var self, el, map;

  function add(mp) {
    if (self.position()) {
      self._m.addTo(mp._m);
    }
    else {
      map = mp;
    }
    return self;
  }

  function remove() {
    map = undefined;
    self._m.remove();
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return options[key];
    }
    options[key] = value;
  }

  function position(p) {
    if (p === undefined) {
      p = self._m.getLngLat();
      if (!p) {
        return;
      }
      return util.mll2ll(p);
    }
    self._m.setLngLat(p);
    if (map) {
      self.add(map);
      map = undefined;
    }
  }

  function animation() {
    //TODO implement bounce as a CSS transformation
  }

  function image(icon) {
    var img;
    if (!icon.url) {
      return;
    }
    img = q('img', el);
    if (!img) {
      el.innerHTML = '';
      img = el.appendChild(document.createElement('img'));
    }
    img.setAttribute('src', icon.url);
  }

  function icon(i) {
    var iEl, path;
    if (i === undefined) {
      //TODO implement getter
      return;
    }
    if (!i.path) {
      return image(i);
    }
    path = iconPath[i.path] || iconPath.path;
    iEl = q(path.el, el);
    if (iEl) {
      drawIcon(iEl, i, path.attributes);
    }
    else {
      el.innerHTML = '';
      i = merge(merge({}, options.icon), i);
      el.appendChild(draw(i));
    }
  }

  function zindex() {
    return el.style.zIndex;
  }

  options = merge({
    flat: true,
    icon: {}
  }, options);
  options.icon = merge({
    path: 'circle',
    strokeColor:  '#555555',
    strokeWeight: 2,
    scale: 7
  }, options.icon);
  if (options.color !== undefined) {
    options.icon.fillColor = options.color;
    options.icon.fillOpacity = 1;
  }
  else {
    options.icon.fillOpacity = 0;
  }

  el = document.createElement('div');

  self = object({
    animation: animation,
    add: add,
    icon: icon,
    option: option,
    position: position,
    remove: remove,
    zindex: zindex
  }, {
    el: el
  });

  self._m = new mapboxgl.Marker(el, {
    offset: offset(options.icon)
  });

  self.icon(options.icon);

  if (options.position) {
    self.position(options.position);
  }

  if (options.map) {
    self.add(options.map);
  }

  return self;
}

},{"./object":24,"./util":28,"lodash.assign":37,"query":34}],24:[function(require,module,exports){
var mouse = require('../events').mouse;
var util = require('./util');

module.exports = init;

var events = {
  bounds_changed: 'moveend',
  center_changed: 'moveend',
  zoom_changed: 'zoomend'
};

function handleEvent(self, fn, e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  fn.call(self, e);
}

function handleMouseEvent(self, fn, e) {
  if (e && e.lngLat) {
    e.ll = util.mll2ll(e.lngLat);
  }
  else if (self._l) {
    // layers are expected to have location
    return;
  }
  handleEvent(self, fn, e);
}

function init(self, options) {
  var listeners = {}, el = options && options.el;

  function on(event, fn) {
    var handler;
    event = events[event] || event;
    if (el) {
      handler = handleEvent.bind(undefined, self, fn);
      el.addEventListener(event, handler);
    }
    else {
      if (mouse[event]) {
        handler = handleMouseEvent.bind(undefined, self, fn);
      }
      else {
        handler = handleEvent.bind(undefined, self, fn);
      }
      if (self._l) {
        if (self._m) {
          self._m.on(event, self._l.id, handler);
        }
      }
      else {
        self._m.on(event, handler);
      }
    }
    listeners[event] = listeners[event] || [];
    listeners[event].push({
      event: event,
      layer: self._l && self._l.id,
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
          if (el) {
            el.removeEventListener(event, listener.handler);
          }
          else if (listener.layer) {
            if (self._m) {
              self._m.off(event, listener.layer, listener.handler);
            }
          }
          else {
            self._m.off(event, listener.handler);
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

  function add(map) {
    if (!self._m) {
      self._m = map._m;
      Object.keys(listeners).forEach(function(event) {
        listeners[event].forEach(function (listener) {
          if (listener.layer) {
            self._m.on(listener.event, listener.layer, listener.handler);
          }
        });
      });      
      options.onadd();
    }
    return self;
  }

  function remove() {
    if (self._m) {      
      Object.keys(listeners).forEach(function(event) {
        listeners[event].forEach(function (listener) {
          if (listener.layer) {
            self._m.off(listener.event, listener.layer, listener.handler);
          }
        });
      });
      options.onremove();
      delete self._m;
    }
    return self;
  }

  self.on = on;
  self.off = off;

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

},{"../events":6,"./util":28}],25:[function(require,module,exports){
var merge = require('lodash.assign');
var util = require('./util');

module.exports = polygon;

var paint = {
  fillColor: 'fill-color',
  fillOpacity: 'fill-opacity',
  strokeColor: 'fill-outline-color'
};

function create(self, id, options) {
  options = merge({
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

  self = layer(options);

  self.path = path;

  return self;
}

},{"./layer":21,"./util":28,"lodash.assign":37}],26:[function(require,module,exports){
var merge = require('lodash.assign');
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
  options = merge({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color || '#FFFFFF';

  if (typeof options.path === 'string') {
    options.path = util.decodePath(options.path);
  }
  self._l = {
    id: '' + id,
    type: 'line',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: validate(options.path)
        }
      }
    },
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

  if (options.dashOpacity) {
    merge(self._l.paint, paint.dashOpacity(options.dashOpacity));
  }

  return options;
}

var layer = require('./layer')(paint, create);

function polyline(options) {
  var self;

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = validate(p);
    self.update();
  }

  self = layer(options);

  self.path = path;

  return self;
}

},{"./layer":21,"./util":28,"lodash.assign":37}],27:[function(require,module,exports){
var util = require('./util');

module.exports = projection;

function projection(options) {

  function position(p) {
    if (p._m) {
      p = p._m.getLngLat();
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
},{"./util":28}],28:[function(require,module,exports){
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

},{"@pirxpilot/google-polyline":31}],29:[function(require,module,exports){
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
},{"./util":30}],30:[function(require,module,exports){
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

module.exports = {
  distance: distance
};

},{}],31:[function(require,module,exports){
module.exports = {
  encode: require( './lib/encode' ),
  decode: require( './lib/decode' ),
}

},{"./lib/decode":32,"./lib/encode":33}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

},{}],35:[function(require,module,exports){
module.exports = function load(src, async) {
  var s = document.createElement('script');
  s.src = src;
  if (typeof async === 'boolean') {
    s.async = async;
  }
  (document.head || document.body).appendChild(s);
  return s;
};

},{}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/** Detect if properties shadowing those on `Object.prototype` are non-enumerable. */
var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = createAssigner(function(object, source) {
  if (nonEnumShadows || isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = assign;

},{}],"maps":[function(require,module,exports){
module.exports = require('./lib');

},{"./lib":2}]},{},[]);
window.google_map_key_for_example = '';
window.osm_map_style_url_for_example = '';
