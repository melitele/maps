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