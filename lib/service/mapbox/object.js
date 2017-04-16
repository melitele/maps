module.exports = init;

var events = {
  bounds_changed: 'moveend'
};

function init(self, el) {
  var listeners = {};

  function on(event, fn) {
    event = events[event] || event;
    if (el) {
      el.addEventListener(event, fn);
    }
    else {
      self._m.on(event, fn);
    }
    listeners[event] = listeners[event] || [];
    listeners[event].push({
      event: event,
      fn: fn
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
    else if (el) {
      el.removeEventListener(event, fn);
    }
    else {
      self._m.off(event, fn);
    }
    return self;
  }

  self.on = on;
  self.off = off;

  return self;
}
