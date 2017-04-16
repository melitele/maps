var merge = require('lodash.assign');
var mixin = require('./mixin');

function init(opts, fn) {
  var service, module = this;

  if (!fn) {
    fn = opts;
    opts = {};
  }
  opts.service = opts.service || 'google'; // default service
  if (opts.service === 'google') {
    service = require('./service/google');
  }
  else if (opts.service === 'mapbox') {
    service = require('./service/mapbox');
  }
  service = service(opts, fn);
  merge(service, {
    collate: require('./collate'),
    outline: require('./outline'),
    spread: require('./spread')
  });
  service.map = mixin(service.map, require('./map'));
  merge(service.util, require('./util'));
  if (!module.collate) {
    merge(module, service); // compatibility with old interface
  }
  return service;
}

module.exports = {
  init: init
};
