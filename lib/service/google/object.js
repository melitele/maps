var mouse = require('../events').mouse;
var util = require('./util');

module.exports = init;

function handleEvent(self, fn, e) {
  fn.call(self, e);
}

function handleMouseEvent(self, fn, e) {
  if (e && e.latLng) {
    e.ll = util.gll2ll(e.latLng, self.gcj02);
  }
  handleEvent(self, fn, e);
}

function init(self) {
  var _gm = util.gm(), listeners = {};

  function on(event, fn) {
    var handler;
    listeners[event] = listeners[event] || [];
    if (mouse[event]) {
      handler = handleMouseEvent.bind(undefined, self, fn);
    }
    else {
      handler = handleEvent.bind(undefined, self, fn);
    }
    listeners[event].push({
      handler: _gm.event.addListener(self._l || self._m, event, handler),
      fn: fn
    });
    return self;
  }

  function off(event, fn) {
    if (event === undefined) {
      _gm.event.clearInstanceListeners(self._l || self._m);
      listeners = {};
    }
    else {
      listeners[event].some(function (listener, i, listeners) {
        if (listener.fn === fn) {
          _gm.event.removeListener(listener.handler);
          listeners.splice(i, 1);
          if (!listeners.length) {
            delete listeners[event];
          }
          return true;
        }
      });
    }
    return self;
  }

  self.on = on;
  self.off = off;

  return self;
}
