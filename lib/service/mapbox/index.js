module.exports = init;

function init() {
  return {
    map: require('./map'),
    marker: require('./marker'),
    polyline: require('./polyline'),
    projection: require('./projection')
  };
}
