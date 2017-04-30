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
