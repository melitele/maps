var merge = require('lodash.assign');

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
  service = service(opts, fn);
  merge(service, {
    collate: require('./collate'),
    outline: require('./outline'),
    spread: require('./spread')
  });
  merge(service.util, require('./util'));
  merge(module, service); // compatibility with old interface
  return service;
}

module.exports = {
  init: init
};
