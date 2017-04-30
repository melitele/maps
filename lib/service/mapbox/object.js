var drag = require('../events').drag;
var mouse = require('../events').mouse;
var util = require('./util');

module.exports = init;

var events = {
  bounds_changed: 'moveend',
  center_changed: 'moveend',
  zoom_changed: 'zoomend'
};

function handleEvent(self, fn, e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  fn.call(self, e);
}

function handleMouseEvent(self, fn, e) {
  self.ll(e);
  if (!e.ll) {
    // mouse events are expected to have location
    return;
  }
  handleEvent(self, fn, e);
}

function ll(e) {
  if (e && e.lngLat) {
    e.ll = util.mll2ll(e.lngLat);
  }
}

function init(self, options) {
  var listeners = {}, el = options && options.el;

  function on(event, fn, mapEvent) {
    var handler, layer;
    event = events[event] || event;
    if (mouse[event]) {
      handler = handleMouseEvent.bind(undefined, self, fn);
    }
    else {
      handler = handleEvent.bind(undefined, self, fn);
    }
    if (el) {
      el.addEventListener(event, handler);
    }
    else {
      mapEvent = mapEvent || drag[event];
      if (self._l && !mapEvent) {
        layer = self._l && self._l.id;
        if (self._m) {
          self._m.on(event, self._l.id, handler);
        }
      }
      else if (self._m) {
        self._m.on(event, handler);
      }
    }
    listeners[event] = listeners[event] || [];
    listeners[event].push({
      event: event,
      layer: layer,
      fn: fn,
      handler: handler
    });
    return self;
  }

  function off(event, fn) {
    if (event === undefined) {
      Object.keys(listeners).forEach(function(event) {
        listeners[event].forEach(function (listener) {
          off(listener.event, listener.handler);
        });
      });
      listeners = {};
    }
    else {
      event = events[event] || event;
      listeners[event].some(function (listener, i, listeners) {
        if (listener.fn === fn) {
          if (el) {
            el.removeEventListener(event, listener.handler);
          }
          else if (listener.layer) {
            if (self._m) {
              self._m.off(event, listener.layer, listener.handler);
            }
          }
          else {
            self._m.off(event, listener.handler);
          }
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

  function add(map) {
    if (!self._m) {
      self._m = map._m;
      if (!el) {
        Object.keys(listeners).forEach(function(event) {
          listeners[event].forEach(function (listener) {
            if (listener.layer) {
              self._m.on(listener.event, listener.layer, listener.handler);
            }
            else {
              self._m.on(listener.event, listener.handler);
            }
          });
        });
      }
      options.onadd();
    }
    return self;
  }

  function remove() {
    if (self._m) {
      if (!el) {
        Object.keys(listeners).forEach(function(event) {
          listeners[event].forEach(function (listener) {
            if (listener.layer) {
              self._m.off(listener.event, listener.layer, listener.handler);
            }
            else {
              self._m.off(listener.event, listener.handler);
            }
          });
        });
      }
      options.onremove();
      delete self._m;
    }
    return self;
  }

  self.on = on;
  self.off = off;
  self.ll = self.ll || ll;

  if (options) {
    if (options.onadd) {
      self.add = add;
    }
    if (options.onremove) {
      self.remove = remove;
    }
  }

  return self;
}
