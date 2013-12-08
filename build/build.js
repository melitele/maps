

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-object/index.js", Function("exports, require, module",
"\n/**\n * HOP ref.\n */\n\nvar has = Object.prototype.hasOwnProperty;\n\n/**\n * Return own keys in `obj`.\n *\n * @param {Object} obj\n * @return {Array}\n * @api public\n */\n\nexports.keys = Object.keys || function(obj){\n  var keys = [];\n  for (var key in obj) {\n    if (has.call(obj, key)) {\n      keys.push(key);\n    }\n  }\n  return keys;\n};\n\n/**\n * Return own values in `obj`.\n *\n * @param {Object} obj\n * @return {Array}\n * @api public\n */\n\nexports.values = function(obj){\n  var vals = [];\n  for (var key in obj) {\n    if (has.call(obj, key)) {\n      vals.push(obj[key]);\n    }\n  }\n  return vals;\n};\n\n/**\n * Merge `b` into `a`.\n *\n * @param {Object} a\n * @param {Object} b\n * @return {Object} a\n * @api public\n */\n\nexports.merge = function(a, b){\n  for (var key in b) {\n    if (has.call(b, key)) {\n      a[key] = b[key];\n    }\n  }\n  return a;\n};\n\n/**\n * Return length of `obj`.\n *\n * @param {Object} obj\n * @return {Number}\n * @api public\n */\n\nexports.length = function(obj){\n  return exports.keys(obj).length;\n};\n\n/**\n * Check if `obj` is empty.\n *\n * @param {Object} obj\n * @return {Boolean}\n * @api public\n */\n\nexports.isEmpty = function(obj){\n  return 0 == exports.length(obj);\n};//@ sourceURL=component-object/index.js"
));
require.register("code42day-load/index.js", Function("exports, require, module",
"module.exports = function load(src, async) {\n  var s = document.createElement('script');\n  s.src = src;\n  if (typeof async === 'boolean') {\n    s.async = async;\n  }\n  (document.head || document.body).appendChild(s);\n  return s;\n};\n//@ sourceURL=code42day-load/index.js"
));
require.register("maps/index.js", Function("exports, require, module",
"var load = require('load');\nvar object = require('object');\nvar merge = object.merge;\nvar keys = object.keys;\n\nfunction prepareUrl(url, params) {\n  return url + '?' + keys(params)\n    .map(function(key) {\n      return key + '=' + encodeURIComponent(params[key]);\n    })\n    .join('&');\n}\n\nfunction init(opts, fn) {\n  var protocol;\n  if (!fn) {\n    fn = opts;\n    opts = {};\n  }\n  window._google_maps_init = function() {\n    delete window._google_maps_init;\n    window.google.maps.visualRefresh = true;\n    if (typeof fn === 'function') {\n      fn();\n    }\n  };\n\n  opts = merge({\n    sensor: false,\n    v: '3.13'\n  }, opts);\n  // always use our callback\n  opts.callback = \"_google_maps_init\";\n  protocol = window.location.protocol;\n  if (protocol == 'file:') {\n    protocol = 'http:';\n  }\n  load(prepareUrl(protocol + '//maps.googleapis.com/maps/api/js', opts));\n}\n\nmodule.exports = {\n  init: init,\n  collate: require('./lib/collate'),\n  info: require('./lib/info'),\n  map: require('./lib/map'),\n  marker: require('./lib/marker'),\n  polyline: require('./lib/polyline'),\n  projection: require('./lib/projection'),\n  spread: require('./lib/spread'),\n  util: require('./lib/util')\n};//@ sourceURL=maps/index.js"
));
require.register("maps/lib/collate.js", Function("exports, require, module",
"var util = require('./util'),\n  projection = require('./projection');\n\nmodule.exports = collate;\n\nfunction collate(options) {\n  var proj, regions, markers = [], threshold = options.threshold || 18;\n  \n  function add(marker, referenceOnly) {\n    marker.referenceOnly = referenceOnly;\n    markers.push(marker);\n  }\n\n  function calculate() {\n    if (!proj.isReady()) {\n      return;\n    }\n    regions = [];\n    prepareRegions();\n    hideMarkers();\n  }\n\n  function prepareRegions() {\n    markers.forEach(function (m) {\n      if (!regions.some(function (r) {\n        return addToRegion(r, m);\n      })) {\n        regions.push(createRegion(m));\n      }\n    });\n  }\n\n  function createRegion(m) {\n    return {\n      show: m,\n      hide: []\n    };\n  }\n\n  function position(m) {\n    return proj.position(m._g.getPosition());\n  }\n\n  function addToRegion(r, m) {\n    if (util.distance(position(r.show), position(m)) < threshold) {\n      if (r.show._g.getZIndex() < m._g.getZIndex()) {\n        r.hide.push(r.show);\n        r.show = m;\n      }\n      else {\n        r.hide.push(m);\n      }\n      return true;\n    }\n  }\n\n  function hideMarkers() {\n    regions.forEach(function (r) {\n      if (!r.show.referenceOnly) {\n        r.show._g.setMap(options.map._g);\n      }\n      r.hide.forEach(function (m) {\n        if (!m.referenceOnly) {\n          m._g.setMap();\n        }\n      });\n    });\n  }\n\n  proj = options.projection || projection({\n    map: options.map,\n    calculate: calculate\n  });\n\n  return {\n    add: add,\n    calculate: calculate\n  };\n}//@ sourceURL=maps/lib/collate.js"
));
require.register("maps/lib/info.js", Function("exports, require, module",
"var util = require('./util');\nvar merge = require('object').merge;\n\nmodule.exports = info;\n\nfunction info(options) {\n  var _gm = util.gm(), self;\n\n  function open(map, marker) {\n    self._g.open(map._g, marker._g);\n    return self;\n  }\n\n  function content(node) {\n    self._g.setContent(node);\n    return self;\n  }\n\n  self = {\n    open: open,\n    content: content\n  };\n  options = merge({\n    maxWidth: 400\n  }, options);\n\n  self._g = new _gm.InfoWindow(options);\n\n  return self;\n}\n//@ sourceURL=maps/lib/info.js"
));
require.register("maps/lib/map.js", Function("exports, require, module",
"var util = require('./util');\nvar merge = require('object').merge;\n\nmodule.exports = map;\n\nfunction map(node, options) {\n  var _gm = util.gm(), self;\n\n  function on(event, fn) {\n    _gm.event.addListener(self._g, event, fn);\n    return self;\n  }\n\n  function bounds() {\n    return util.gbounds2bounds(self._g.getBounds());\n  }\n\n  function fitBounds(bounds) {\n    self._g.fitBounds(util.bounds2gbounds(bounds));\n    return self;\n  }\n\n  function panToBounds(bounds) {\n    self._g.panToBounds(util.bounds2gbounds(bounds));\n    return self;\n  }\n\n  function zoom() {\n    return self._g.getZoom();\n  }\n\n  function zoomIn() {\n    self._g.setZoom(zoom() + 1);\n    return self;\n  }\n\n  function zoomOut() {\n    self._g.setZoom(zoom() - 1);\n    return self;\n  }\n\n  function center() {\n    return util.gll2ll(self._g.getCenter());\n  }\n\n  options = merge({\n    streetViewControl: false,\n    panControl: false,\n    zoomControl: false,\n    scaleControl: true,\n    mapTypeControl: false,\n    mapTypeId: _gm.MapTypeId.TERRAIN\n  }, options);\n\n  if (options.center) {\n    options.center = util.ll2gll(options.center);\n  }\n\n  self = {\n    on: on,\n    bounds: bounds,\n    fitBounds: fitBounds,\n    panToBounds: panToBounds,\n    center: center,\n    zoom: zoom,\n    zoomIn: zoomIn,\n    zoomOut: zoomOut\n  };\n  self._g = new _gm.Map(node, options);\n\n  return self;\n}\n//@ sourceURL=maps/lib/map.js"
));
require.register("maps/lib/marker.js", Function("exports, require, module",
"var util = require('./util');\nvar label = require('./label');\nvar merge = require('object').merge;\n\nmodule.exports = marker;\n\nfunction marker(options) {\n  var _gm = util.gm(), self;\n\n  function add(map) {\n    self._g.setMap(map._g);\n    return self;\n  }\n\n  function remove() {\n    self._g.setMap(null);\n    return self;\n  }\n\n  function animation(type) {\n    var gtype = type && _gm.Animation[type.toUpperCase()];\n    self._g.setAnimation(gtype);\n    return self;\n  }\n\n  function on(event, fn) {\n    _gm.event.addListener(self._g, event, fn);\n    return self;\n  }\n\n  self = {\n    animation: animation,\n    add: add,\n    remove: remove,\n    on: on\n  };\n\n  options = merge({\n    flat: true,\n    icon: {\n      path: _gm.SymbolPath.CIRCLE,\n      fillColor: options.color,\n      fillOpacity: 1,\n      strokeColor:  '#555555',\n      strokeWeight: 2,\n      scale: 7\n    }\n  }, options);\n  if (options.map) {\n    options.map = options.map._g;\n  }\n  if (options.position) {\n    options.position = util.ll2gll(options.position);\n  }\n\n  self._g = new _gm.Marker(options);\n\n  if (options.label) {\n    label({\n      marker: self,\n      text: options.label\n    });\n  }\n\n  return self;\n}\n//@ sourceURL=maps/lib/marker.js"
));
require.register("maps/lib/label.js", Function("exports, require, module",
"var util = require('./util'),\n  merge = require('object').merge;\n\nmodule.exports = label;\n\nfunction label(options) {\n  var _gm = util.gm(), self, span, div, listeners;\n\n  function add(marker) {\n    self._g.bindTo('map', marker._g, 'map');\n    self._g.bindTo('position', marker._g, 'position');\n    return self;\n  }\n\n  function remove() {\n    self._g.unbind('map');\n    self._g.unbind('position');\n    self._g.setMap(null);\n    return self;\n  }\n\n  function onAdd() {\n    var _g = this, pane;\n\n    pane = _g.getPanes().overlayImage;\n    pane.appendChild(div);\n\n    listeners = [\n      _gm.event.addListener(this, 'position_changed', draw.bind(_g)),\n      _gm.event.addListener(this, 'text_changed', draw.bind(_g)),\n      _gm.event.addListener(this, 'zindex_changed', draw.bind(_g))\n    ];\n  }\n\n  function onRemove() {\n    div.parentNode.removeChild(div);\n    listeners.forEach(_gm.event.removeListener);\n  }\n\n  function draw() {\n    var _g = this, projection, position;\n    projection = _g.getProjection();\n    position = projection.fromLatLngToDivPixel(_g.get('position'));\n    div.style.left = position.x + 'px';\n    div.style.top = position.y + 'px';\n    div.style.display = 'block';\n    div.style.zIndex = 2000;\n    span.innerHTML = options.text;\n\n  }\n\n  span = document.createElement('span');\n  span.style.cssText = 'position: relative; left: -50%; line-height: 0;';\n\n  div = document.createElement('div');\n  div.setAttribute('class', 'marker-label');\n  div.appendChild(span);\n  div.style.cssText = 'position: absolute; display: none';\n\n  self = {\n    add: add,\n    remove: remove\n  };\n\n  self._g = merge(new _gm.OverlayView(), {\n    onAdd: onAdd,\n    onRemove: onRemove,\n    draw: draw\n  });\n\n  if (options.marker) {\n    self.add(options.marker);\n  }\n}//@ sourceURL=maps/lib/label.js"
));
require.register("maps/lib/polyline.js", Function("exports, require, module",
"var util = require('./util');\nvar merge = require('object').merge;\n\nmodule.exports = polyline;\n\nfunction polyline(options) {\n  var _gm = util.gm(), self;\n\n  function add(map) {\n    self._g.setMap(map._g);\n    return self;\n  }\n\n  function remove() {\n    self._g.setMap(null);\n    return self;\n  }\n\n  function on(event, fn) {\n    _gm.event.addListener(self._g, event, fn);\n    return self;\n  }\n\n  self = {\n    add: add,\n    remove: remove,\n    on: on\n  };\n\n  options = merge({\n    strokeOpacity: 0.8,\n    strokeWeight: 4\n  }, options);\n\n  options.strokeColor = options.strokeColor || options.color;\n  if (options.map) {\n    options.map = options.map._g;\n  }\n  if (Array.isArray(options.path)) {\n    options.path = options.path.map(util.ll2gll);\n  } else if (typeof options.path === 'string') {\n    options.path = util.decodePath(options.path);\n  }\n\n  self._g = new _gm.Polyline(options);\n\n  return self;\n}\n//@ sourceURL=maps/lib/polyline.js"
));
require.register("maps/lib/projection.js", Function("exports, require, module",
"var util = require('./util'),\n  merge = require('object').merge;\n\nmodule.exports = projection;\n\nfunction projection(options) {\n  var _gm = util.gm(), _g;\n  \n  function position(p) {\n    return _g.fromLatLngToContainerPixel(p);\n  }\n\n  function location(p) {\n    return _g.fromContainerPixelToLatLng(p);\n  }\n\n  merge(new _gm.OverlayView(), {\n    onAdd: function() {\n      _g = this.getProjection();\n    },\n    onRemove: function () {},\n    draw: function () {\n      options.calculate();\n    }\n  }).setMap(options.map._g);\n\n  function isReady() {\n    return Boolean(_g);\n  }\n\n  return {\n    position: position,\n    location: location,\n    isReady: isReady\n  };\n}//@ sourceURL=maps/lib/projection.js"
));
require.register("maps/lib/spread.js", Function("exports, require, module",
"var util = require('./util'),\n  projection = require('./projection'),\n  posSeq = [ [0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-2, -1], [-2, 0],\n    [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -2],\n    [-2, -2], [-3, -2], [-3, -1], [-3, 0], [-3, 1], [-3, 2], [-3, 3], [-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3],\n    [3, 3], [3, 2], [3, 1], [3, 0], [3, -1], [3, -2], [3, -3], [2, -3], [1, -3], [0, -3], [-1, -3], [-2, -3], [-3, -3],\n    [-4, -3], [-4, -2], [-4, -1], [-4, 0], [-4, 1], [-4, 2], [-4, 3], [-4, 4], [-3, 4], [-2, 4], [-1, 4], [0, 4],\n    [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [4, -1], [4, -2], [4, -3], [4, -4], [3, -4],\n    [2, -4], [1, -4], [0, -4], [-1, -4], [-2, -4], [-3, -4], [-4, -4]];\n\nmodule.exports = spread;\n\nfunction spread(options) {\n  var _gm = util.gm(), regions, markers = [], threshold = options.threshold || 18, proj;\n  \n  function add(marker) {\n    markers.push(marker);\n  }\n\n  function calculate() {\n    if (!proj.isReady()) {\n      return;\n    }\n    if (markers[0] && !markers[0].originalPosition) {\n      markers.forEach(function (m) {\n        m.originalPosition = m._g.getPosition();\n      });\n    }\n    regions = [];\n    prepareRegions();\n    combineRegions();\n    moveMarkers();\n  }\n\n  function prepareRegions() {\n    markers.forEach(function (m) {\n      if (!regions.some(function (r) {\n        if (addToRegion(r, m)) {\n          return true;\n        }\n      })) {\n        regions.push(createRegion(m));\n      }\n    });\n  }\n\n  function createRegion(m) {\n    return {\n      center: proj.position(m.originalPosition),\n      threshold: threshold,\n      markers: [ m ]\n    };\n  }\n\n  function addToRegion(r, m) {\n    if (util.distance(r.center, proj.position(m.originalPosition)) < r.threshold) {\n      r.markers.push(m);\n      r.threshold = calcThreshold(r.markers.length) * threshold;\n      return true;\n    }\n  }\n\n  function combineRegions() {\n    regions.forEach(function (r, i) {\n      for (i = i + 1; i < regions.length; i++) {\n        if (util.distance(r.center, regions[i].center) < (r.threshold + regions[i].threshold) / 2) {\n          regions[i].markers = regions[i].markers.concat(r.markers);\n          regions[i].threshold = calcThreshold(regions[i].markers.length) * threshold;\n          r.markers = [];\n        }\n      }\n    });\n  }\n\n  function calcThreshold(len) {\n    if (len < 2) {\n      return 1;\n    }\n    if (len < 10) {\n      return 2;\n    }\n    if (len < 26) {\n      return 3;\n    }\n    if (len < 50) {\n      return 4;\n    }\n    if (len < 82) {\n      return 5;\n    }\n    return 6;\n  }\n\n  function moveMarkers() {\n    regions.forEach(function (r) {\n      r.markers.some(function (m, i) {\n        var p;\n        if (i === posSeq.length) {\n          return true;\n        }\n        p = new _gm.Point(r.center.x + posSeq[i][0] * threshold, r.center.y + posSeq[i][1] * threshold);\n        m._g.setPosition(proj.location(p));\n      });\n    });\n  }\n\n  proj = options.projection || projection({\n    map: options.map,\n    calculate: calculate\n  });\n\n  return {\n    add: add,\n    calculate: calculate\n  };\n}//@ sourceURL=maps/lib/spread.js"
));
require.register("maps/lib/util.js", Function("exports, require, module",
"function gll2ll(gll) {\n  return [gll.lng(), gll.lat()];\n}\n\nfunction ll2gll(ll) {\n  var LatLng = gm().LatLng;\n  return new LatLng(ll[1], ll[0]);\n}\n\nfunction bounds2gbounds(b) {\n  var LatLngBounds = gm().LatLngBounds;\n  b = b.map(ll2gll);\n  return new LatLngBounds(b[0], b[1]);\n}\n\nfunction gbounds2bounds(gb) {\n  return [\n    gb.getSouthWest(),\n    gb.getNorthEast()\n  ].map(gll2ll);\n}\n\nfunction decodePath(path) {\n  return gm().geometry.encoding.decodePath(path);\n}\n\nfunction gm() {\n  if (!window.google || !window.google.maps) {\n    throw 'Google Maps not initialized properly: call maps.init()';\n  }\n  return window.google.maps;\n}\n\nfunction distance(p1, p2) {\n  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));\n}\n\nmodule.exports = {\n  decodePath: decodePath,\n  gll2ll: gll2ll,\n  ll2gll: ll2gll,\n  bounds2gbounds: bounds2gbounds,\n  gbounds2bounds: gbounds2bounds,\n  gm: gm,\n  distance: distance\n};//@ sourceURL=maps/lib/util.js"
));
require.alias("component-object/index.js", "maps/deps/object/index.js");

require.alias("code42day-load/index.js", "maps/deps/load/index.js");
require.alias("code42day-load/index.js", "maps/deps/load/index.js");
require.alias("code42day-load/index.js", "code42day-load/index.js");

require.alias("maps/index.js", "maps/index.js");

