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
  if (e && e.stopPropagation) {
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

function delayHandleEvent(self, e) {
  var fn = e.handler.fn, event = e.handler.e;
  delete e.handler;
  fn.call(self, event);
}

function handleClickEvent(self, fn, e) {
  var layer, zindex;
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  self.ll(e);
  if (!e.ll) {
    // mouse events are expected to have location
    return;
  }
  // FIXME: implement zindex in mapbox-gl
  if (e.features && e.features.length) {
    layer = e.features[0].layer;
    if (layer && layer.metadata) {
      zindex = layer.metadata.zindex || 0;
      // call handler for the layer of the highest zindex when object overlap
      if (!e.handler || zindex > e.handler.zindex) {
        e.handler = {
          zindex: zindex,
          fn: fn,
          e: e
        };
      }
      if (!e.timeout) {
        e.timeout = setTimeout(delayHandleEvent.bind(undefined, self, e), 0);
      }
      return;
    }
  }
  fn.call(self, e);
}

function ll(e) {
  if (e && e.lngLat) {
    e.ll = util.mll2ll(e.lngLat);
  }
}

function init(self, options) {
  var listeners = {};

  function on(event, fn) {
    var handler, layer;
    event = events[event] || event;
    if (event === 'click' && self._l) {
      handler = handleClickEvent.bind(undefined, self, fn);
    }
    else if (mouse[event]) {
      handler = handleMouseEvent.bind(undefined, self, fn);
    }
    else {
      handler = handleEvent.bind(undefined, self, fn);
    }
    if (!drag[event]) {
      if (self._l) {
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
          off(listener.event, listener.fn);
        });
      });
      listeners = {};
    }
    else {
      event = events[event] || event;
      if (listeners[event] && listeners[event].some(function (listener, i, listeners) {
        if (listener.fn === fn) {
          if (!drag[event]) {
            if (listener.layer) {
              if (self._m) {
                self._m.off(event, listener.layer, listener.handler);
              }
            }
            else {
              self._m.off(event, listener.handler);
            }
          }
          listeners.splice(i, 1);
          return true;
        }
      }) && !listeners[event].length) {
        delete listeners[event];
      }
    }
    return self;
  }

  function fire(event, e) {
    if (listeners[event]) {
      listeners[event].forEach(function (listener) {
        listener.handler(e);
      });
    }
  }

  function add(map) {
    if (!self._m) {
      self._m = map._m;
      Object.keys(listeners).forEach(function(event) {
        if (!drag[event]) {
          listeners[event].forEach(function (listener) {
            if (listener.layer) {
              self._m.on(listener.event, listener.layer, listener.handler);
            }
            else {
              self._m.on(listener.event, listener.handler);
            }
          });
        }
      });
      options.onadd(map);
    }
    return self;
  }

  function remove() {
    if (self._m) {
      Object.keys(listeners).forEach(function(event) {
        if (!drag[event]) {
          listeners[event].forEach(function (listener) {
            if (listener.layer) {
              self._m.off(listener.event, listener.layer, listener.handler);
            }
            else {
              self._m.off(listener.event, listener.handler);
            }
          });
        }
      });
      options.onremove();
      delete self._m;
    }
    return self;
  }

  self.on = on;
  self.off = off;
  self.fire = fire;
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
