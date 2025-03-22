const mixin = require('./mixin');

function init() {
  // mapbox is default and only service for now
  const service = require('./service/mapbox')();
  Object.assign(service, {
    collate: require('./collate'),
    outline: require('./outline'),
    spread: require('./spread')
  });
  service.map = mixin(service.map, require('./map'));
  service.util = Object.assign(service.util || {}, require('./util'));
  return service;
}

module.exports = {
  init
};
