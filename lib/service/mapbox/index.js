module.exports = init;

function init(options, fn) {
  if (fn) {
    setTimeout(fn, 1);
  }
  return {
    artifact: require('./artifact'),
    circle: require('./circle'),
    handle: require('./handle'),
    map: require('./map'),
    marker: require('./marker'),
    marker_: require('./marker_'),
    polygon: require('./polygon'),
    polyline: require('./polyline'),
    projection: require('./projection')
  };
}
