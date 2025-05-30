const util = require('./util');

module.exports = projection;

function projection(options) {
  function position(p) {
    if (p.position) {
      p = p.position();
    }
    return options.map._m.project(p);
  }

  function location(x, y) {
    const p = y === undefined ? x : [x, y];
    return options.map._m.unproject(p);
  }

  function toMap(x, y) {
    return util.mll2ll(options.map._m.unproject(y === undefined ? x : [x, y]));
  }

  function toScreen(ll) {
    const xy = options.map._m.project(ll);
    return [xy.x, xy.y];
  }

  function isReady() {
    return true;
  }

  function remove() {}

  if (options.calculate) {
    setTimeout(options.calculate.bind(options.calculate), 0);
    options.map.on('bounds_changed', options.calculate.bind(options));
  }

  return {
    position, // obsolete, use toScreen
    location, // obsolete, use to Map
    toMap,
    toScreen,
    isReady,
    remove
  };
}
