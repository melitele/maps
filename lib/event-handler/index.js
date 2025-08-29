const makeMapListenersBag = require('./listeners-bag');
const makeCountingSet = require('./counting-set');

module.exports = eventHandler;

const mouseEvents = asMap(['mouseenter', 'mouseover', 'mouseleave']);

function eventHandler(_m) {
  const listenersBag = makeMapListenersBag();

  const activeTypes = makeCountingSet();

  function on(type, listener) {
    if (listenersBag.add(type, listener)) {
      addListener(type);
    }
  }

  function off(type, listener) {
    if (listenersBag.remove(type, listener)) {
      removeListener(type);
    }
  }

  function addListener(type) {
    if (mouseEvents[type]) {
      addListener('mousemove');
      addListener('mouseout');
    } else {
      if (activeTypes.inc(type)) {
        _m.on(type, getHandler(type));
      }
    }
  }

  function removeListener(type) {
    if (mouseEvents[type]) {
      removeListener('mousemove');
      removeListener('mouseout');
    } else {
      if (activeTypes.dec(type)) {
        _m.off(type, getHandler(type));
      }
    }
  }

  function getHandler(type) {
    switch (type) {
      case 'mousemove':
        return onmousemove;
      case 'mouseout':
        return onmouseout;
      default:
        return onevent;
    }
  }

  function fireEvent(type, e) {
    listenersBag.getListeners(type).forEach(listener => listener.call(_m, e));
  }

  function onmousemove(e) {
    fireEvent('mousemove', e);
  }

  function onmouseout(e) {
    fireEvent('mouseout', e);
  }

  function onevent(e) {
    const { type } = e;
    fireEvent(type, e);
  }

  return {
    on,
    off
  };
}

function asMap(arr) {
  return arr.reduce(function (obj, type) {
    obj[type] = true;
    return obj;
  }, Object.create(null));
}
