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
  e.alreadyHandledByFeature = true;
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
    let feature;
    event = events[event] || event;
    if (event === 'click' && self._data) {
      handler = handleClickEvent.bind(undefined, self, fn);
    } else if (mouse[event]) {
      handler = handleMouseEvent.bind(undefined, self, fn);
    } else {
      handler = handleEvent.bind(undefined, self, fn);
    }
    if (!drag[event]) {
      if (self._data) {
        feature = self._data.id;
        if (self._m) {
          self._featureEventHandler.on(event, self._layers, feature, handler);
        }
      } else if (self._m) {
        self._featureEventHandler.mapOn(event, handler);
      }
    }
    listeners[event] = listeners[event] || [];
    listeners[event].push({
      event,
      feature,
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
              if (listener.feature) {
                if (self._m) {
                  self._featureEventHandler.off(event, self._layers, listener.feature, listener.handler);
                }
              } else {
                self._featureEventHandler?.mapOff(event, listener.handler);
              }
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
      self._featureEventHandler = map._featureEventHandler;
      Object.keys(listeners).forEach(function (event) {
        if (!drag[event]) {
          listeners[event].forEach(function (listener) {
            if (listener.feature) {
              self._featureEventHandler.on(listener.event, self._layers, listener.feature, listener.handler);
            } else {
              self._featureEventHandler.mapOn(listener.event, listener.handler);
            }
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
            if (listener.feature) {
              self._featureEventHandler.off(listener.event, self._layers, listener.feature, listener.handler);
            } else {
              self._featureEventHandler.mapOff(listener.event, listener.handler);
            }
          });
        }
      });
      delete self._featureEventHandler;
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
