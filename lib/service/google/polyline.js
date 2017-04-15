var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

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

  self = object({
    add: add,
    remove: remove
  });

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
