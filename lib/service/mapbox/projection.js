
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

  function isReady() {
    return true;
  }

  function remove() {
  }

  if (options.calculate) {
    setTimeout(options.calculate.bind(options.calculate), 0);
  }

  return {
    position: position,
    location: location,
    isReady: isReady,
    remove: remove
  };
}