var merge = require('lodash.assign');
var util = require('./util');

module.exports = info;

function info(options) {
  var _gm = util.gm(), self;

  function open(map, marker) {
    self._m.open(map._m, marker._m);
    return self;
  }

  function content(node) {
    self._m.setContent(node);
    return self;
  }

  self = {
    open: open,
    content: content
  };
  options = merge({
    maxWidth: 400
  }, options);

  self._m = new _gm.InfoWindow(options);

  return self;
}
