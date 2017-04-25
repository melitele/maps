module.exports = init;

function init() {
  return {
    circle: require('./circle'),
    map: require('./map'),
    marker: require('./marker'),
    polyline: require('./polyline'),
    projection: require('./projection')
  };
}
