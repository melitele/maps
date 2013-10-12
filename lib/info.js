var util = require('./util');
var merge = require('object').merge;

module.exports = info;

function info(options) {
  var _gm = util.gm(), self;

  function open(map, marker) {
    self._g.open(map._g, marker._g);
    return self;
  }

  function content(node) {
    self._g.setContent(node);
    return self;
  }

  self = {
    open: open,
    content: content
  };
  options = merge({
    maxWidth: 400
  }, options);

  self._g = new _gm.InfoWindow(options);

  return self;
}
