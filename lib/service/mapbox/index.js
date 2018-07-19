module.exports = init;

function init(options, fn) {
  if (fn) {
    setTimeout(fn, 1);
  }
  return {
    map: require('./map'),
    marker: require('./marker'),
    polygon: require('./polygon'),
    polyline: require('./polyline'),
    projection: require('./projection')
  };
}
