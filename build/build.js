require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require('./util'),
  projection = require('./projection');

module.exports = collate;

function collate(options) {
  var proj, regions, markers = [], threshold = options.threshold || 18;

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
    return proj.position(m._g.getPosition());
  }

  function addToRegion(r, m) {
    if (util.distance(position(r.show), position(m)) < threshold) {
      if (r.show._g.getZIndex() < m._g.getZIndex()) {
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
        r.show._g.setMap(options.map._g);
      }
      r.hide.forEach(function (m) {
        if (!m.referenceOnly) {
          m._g.setMap();
        }
      });
    });
  }

  proj = options.projection || projection({
    map: options.map,
    calculate: calculate
  });

  return {
    add: add,
    reset: reset,
    calculate: calculate
  };
}
},{"./projection":8,"./util":11}],2:[function(require,module,exports){
var util = require('./util');
var merge = require('object').merge;

module.exports = info;

function info(options) {
  var _gm = util.gm(), self;

  function open(map, marker) {
    self._g.open(map._g, marker._g);
    return self;
  }

  function content(node) {
    self._g.setContent(node);
    return self;
  }

  self = {
    open: open,
    content: content
  };
  options = merge({
    maxWidth: 400
  }, options);

  self._g = new _gm.InfoWindow(options);

  return self;
}

},{"./util":11,"object":13}],3:[function(require,module,exports){
var util = require('./util'),
  merge = require('object').merge;

module.exports = label;

function label(options) {
  var _gm = util.gm(), self, span, div, listeners;

  function add(marker) {
    self._g.bindTo('map', marker._g, 'map');
    self._g.bindTo('position', marker._g, 'position');
    return self;
  }

  function remove() {
    self._g.unbind('map');
    self._g.unbind('position');
    self._g.setMap(null);
    return self;
  }

  function onAdd() {
    var _g = this, pane;

    pane = _g.getPanes().overlayImage;
    pane.appendChild(div);

    listeners = [
      _gm.event.addListener(this, 'position_changed', draw.bind(_g)),
      _gm.event.addListener(this, 'text_changed', draw.bind(_g)),
      _gm.event.addListener(this, 'zindex_changed', draw.bind(_g))
    ];
  }

  function onRemove() {
    div.parentNode.removeChild(div);
    listeners.forEach(_gm.event.removeListener);
  }

  function draw() {
    var _g = this, projection, position;
    projection = _g.getProjection();
    position = projection.fromLatLngToDivPixel(_g.get('position'));
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

  self._g = merge(new _gm.OverlayView(), {
    onAdd: onAdd,
    onRemove: onRemove,
    draw: draw
  });

  if (options.marker) {
    self.add(options.marker);
  }
  return self;
}
},{"./util":11,"object":13}],4:[function(require,module,exports){
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

},{"./util":11,"object":13}],5:[function(require,module,exports){
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

  lbl = options.label;
  delete options.label;
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

  if (lbl) {
    lbl = label({
      marker: self,
      text: lbl
    });
  }

  return self;
}

},{"./label":3,"./util":11,"object":13}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
var util = require('./util');
var merge = require('object').merge;

module.exports = polyline;

function polyline(options) {
  var _gm = util.gm(), self;

  function add(map) {
    self._g.setMap(map._g);
    return self;
  }

  function remove() {
    self._g.setMap(null);
    return self;
  }

  function on(event, fn) {
    _gm.event.addListener(self._g, event, fn);
    return self;
  }

  self = {
    add: add,
    remove: remove,
    on: on
  };

  options = merge({
    strokeOpacity: 0.8,
    strokeWeight: 4
  }, options);

  options.strokeColor = options.strokeColor || options.color;
  if (options.map) {
    options.map = options.map._g;
  }
  if (Array.isArray(options.path)) {
    options.path = options.path.map(util.ll2gll);
  } else if (typeof options.path === 'string') {
    options.path = util.decodePath(options.path);
  }

  self._g = new _gm.Polyline(options);

  return self;
}

},{"./util":11,"object":13}],8:[function(require,module,exports){
var util = require('./util'),
  merge = require('object').merge;

module.exports = projection;

function projection(options) {
  var _gm = util.gm(), _g;

  function position(p) {
    return _g.fromLatLngToContainerPixel(p);
  }

  function location(p) {
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
},{"./util":11,"object":13}],9:[function(require,module,exports){
var util = require('./util'),
  projection = require('./projection'),
  posSeq = [ [0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-2, -1], [-2, 0],
    [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -2],
    [-2, -2], [-3, -2], [-3, -1], [-3, 0], [-3, 1], [-3, 2], [-3, 3], [-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3],
    [3, 3], [3, 2], [3, 1], [3, 0], [3, -1], [3, -2], [3, -3], [2, -3], [1, -3], [0, -3], [-1, -3], [-2, -3], [-3, -3],
    [-4, -3], [-4, -2], [-4, -1], [-4, 0], [-4, 1], [-4, 2], [-4, 3], [-4, 4], [-3, 4], [-2, 4], [-1, 4], [0, 4],
    [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [4, -1], [4, -2], [4, -3], [4, -4], [3, -4],
    [2, -4], [1, -4], [0, -4], [-1, -4], [-2, -4], [-3, -4], [-4, -4]];

module.exports = spread;

function spread(options) {
  var _gm = util.gm(), regions, markers = [], threshold = options.threshold || 18, proj;
  
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
        m.originalPosition = m._g.getPosition();
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
    if (util.distance(r.center, proj.position(m.originalPosition)) < r.threshold) {
      r.markers.push(m);
      r.threshold = calcThreshold(r.markers.length) * threshold;
      return true;
    }
  }

  function combineRegions() {
    regions.forEach(function (r, i) {
      for (i = i + 1; i < regions.length; i++) {
        if (util.distance(r.center, regions[i].center) < (r.threshold + regions[i].threshold) / 2) {
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
        var p;
        if (i === posSeq.length) {
          return true;
        }
        p = new _gm.Point(r.center.x + posSeq[i][0] * threshold, r.center.y + posSeq[i][1] * threshold);
        m._g.setPosition(proj.location(p));
      });
    });
  }

  proj = options.projection || projection({
    map: options.map,
    calculate: calculate
  });

  return {
    add: add,
    reset: reset,
    calculate: calculate
  };
}
},{"./projection":8,"./util":11}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
function gll2ll(gll) {
  return [gll.lng(), gll.lat()];
}

function ll2gll(ll) {
  var LatLng = gm().LatLng;
  return new LatLng(ll[1], ll[0]);
}

function bounds2gbounds(b) {
  var LatLngBounds = gm().LatLngBounds;
  b = b.map(ll2gll);
  return new LatLngBounds(b[0], b[1]);
}

function gbounds2bounds(gb) {
  return [
    gb.getSouthWest(),
    gb.getNorthEast()
  ].map(gll2ll);
}

function decodePath(path) {
  return gm().geometry.encoding.decodePath(path);
}

function gm() {
  if (!window.google || !window.google.maps) {
    throw 'Google Maps not initialized properly: call maps.init()';
  }
  return window.google.maps;
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

module.exports = {
  decodePath: decodePath,
  gll2ll: gll2ll,
  ll2gll: ll2gll,
  bounds2gbounds: bounds2gbounds,
  gbounds2bounds: gbounds2bounds,
  gm: gm,
  distance: distance
};
},{}],12:[function(require,module,exports){
module.exports = function load(src, async) {
  var s = document.createElement('script');
  s.src = src;
  if (typeof async === 'boolean') {
    s.async = async;
  }
  (document.head || document.body).appendChild(s);
  return s;
};

},{}],13:[function(require,module,exports){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
},{}],"maps":[function(require,module,exports){
var load = require('load');
var object = require('object');
var merge = object.merge;
var keys = object.keys;

function prepareUrl(url, params) {
  return url + '?' + keys(params)
    .map(function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

function init(opts, fn) {
  var protocol;
  if (!fn) {
    fn = opts;
    opts = {};
  }
  window._google_maps_init = function() {
    delete window._google_maps_init;
    window.google.maps.visualRefresh = true;
    if (typeof fn === 'function') {
      fn();
    }
  };

  opts = merge({
    v: '3'
  }, opts);
  // always use our callback
  opts.callback = "_google_maps_init";
  protocol = window.location.protocol;
  if (protocol == 'file:') {
    protocol = 'http:';
  }
  load(prepareUrl(protocol + '//maps.googleapis.com/maps/api/js', opts));
}

module.exports = {
  init: init,
  collate: require('./lib/collate'),
  info: require('./lib/info'),
  map: require('./lib/map'),
  marker: require('./lib/marker'),
  outline: require('./lib/outline'),
  polyline: require('./lib/polyline'),
  projection: require('./lib/projection'),
  spread: require('./lib/spread'),
  styles: require('./lib/styles'),
  util: require('./lib/util')
};

},{"./lib/collate":1,"./lib/info":2,"./lib/map":4,"./lib/marker":5,"./lib/outline":6,"./lib/polyline":7,"./lib/projection":8,"./lib/spread":9,"./lib/styles":10,"./lib/util":11,"load":12,"object":13}]},{},[]);
