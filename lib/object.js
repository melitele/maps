const { drag, mouse } = require('./events');
const util = require('./util');

module.exports = init;

const events = {
  bounds_changed: 'moveend',
  center_changed: 'moveend',
  zoom_changed: 'zoomend'
};

function handleEvent(self, fn, e) {
  if (e?.stopPropagation) {
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

function handleClickEvent(self, fn, e) {
  if (e?.stopPropagation) {
    e.stopPropagation();
  }
  self.ll(e);
  if (!e.ll) {
    // mouse events are expected to have location
    return;
  }
  fn.call(self, e);
}

function ll(e) {
  if (e?.lngLat) {
    e.ll = util.mll2ll(e.lngLat);
  }
}

function init(self, options) {
  let listeners = {};

  function on(event, fn) {
    let handler;
    event = events[event] || event;
    if (event === 'click') {
      handler = handleClickEvent.bind(undefined, self, fn);
    } else if (mouse[event]) {
      handler = handleMouseEvent.bind(undefined, self, fn);
    } else {
      handler = handleEvent.bind(undefined, self, fn);
    }
    if (!drag[event]) {
      if (self._m) {
        self._eventHandler.on(event, handler);
      }
    }
    listeners[event] = listeners[event] || [];
    listeners[event].push({
      event,
      fn,
      handler
    });
    return self;
  }

  function off(event, fn) {
    if (event === undefined) {
      Object.keys(listeners).forEach(function (event) {
        listeners[event].forEach(function (listener) {
          off(listener.event, listener.fn);
        });
      });
      listeners = {};
    } else {
      event = events[event] || event;
      if (
        listeners[event]?.some(function (listener, i, listeners) {
          if (listener.fn === fn) {
            if (!drag[event]) {
              self._eventHandler?.off(event, listener.handler);
            }
            listeners.splice(i, 1);
            return true;
          }
        }) &&
        !listeners[event].length
      ) {
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
      options.onadd(map);
      self._eventHandler = map._eventHandler;
      Object.keys(listeners).forEach(function (event) {
        if (!drag[event]) {
          listeners[event].forEach(function (listener) {
            self._eventHandler.on(listener.event, listener.handler);
          });
        }
      });
    }
    return self;
  }

  function remove() {
    if (self._m) {
      Object.keys(listeners).forEach(function (event) {
        if (!drag[event]) {
          listeners[event].forEach(function (listener) {
            self._eventHandler.off(listener.event, listener.handler);
          });
        }
      });
      delete self._eventHandler;
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
