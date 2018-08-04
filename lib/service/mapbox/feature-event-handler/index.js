const makeFeatureCollector = require('./feature-collector');
const makeListenersBag = require('./listeners-bag');
const makeMapListenersBag = require('./map-listeners-bag');
const makeCountingSet = require('./counting-set');

const query = require('../query');

module.exports = featureEventHandler;

const mouseEvents = asMap([
  'mouseenter',
  'mouseover',
  'mouseleave'
]);

const touchEvents = asMap([
  'touchstart',
  'touchend',
  'touchmove',
  'touchcancel'
]);

// FIXME: we only support 'mouseover', 'mouseleave, and 'mouseenter' here
function translateEventType(type) {
    switch(type) {
      case 'mousemove': return 'mouseover';
      case 'mouseout': return 'mouseleave';
      default: return type;
    }
}

function featureEventHandler(_m) {
  const listenersBag = makeListenersBag();
  const mapListenersBag = makeMapListenersBag();

  let activeTypes = makeCountingSet();
  let featureCollector = makeFeatureCollector();

  function on(type, layerId, featureId, listener) {
    type = translateEventType(type);
    listenersBag.add(type, layerId, featureId, listener);
    addMapListener(type);
  }

  function off(type, layerId, featureId, listener) {
    type = translateEventType(type);
    listenersBag.remove(type, layerId, featureId, listener);
    removeMapListener(type);
  }

  function mapOn(type, listener) {
    if (mapListenersBag.add(type, listener)) {
      addMapListener(type);
    }
  }

  function mapOff(type, listener) {
    if (mapListenersBag.remove(type, listener)) {
      removeMapListener(type);
    }
  }

  function addMapListener(type) {
    if (mouseEvents[type]) {
      addMapListener('mousemove');
      addMapListener('mouseout');
    } else {
      if (activeTypes.inc(type)) {
        _m.on(type, getHandler(type));
      }
    }
  }

  function removeMapListener(type) {
    if (mouseEvents[type]) {
      removeMapListener('mousemove');
      removeMapListener('mouseout');
    } else {
      if (activeTypes.dec(type)) {
        _m.off(type, getHandler(type));
      }
    }
  }

  function getHandler(type) {
    switch(type) {
      case 'mousemove': return onmousemove;
      case 'mouseout': return onmouseout;
      default: return onevent;
    }
  }

  function getCurrentLayers(type) {
    return listenersBag.forType(type).filter(l => _m.getLayer(l));
  }

  function getCurrentMouseLayers() {
    let all = {};
    return Object.keys(mouseEvents)
      .reduce((all, type) => all.concat(listenersBag.forType(type)), [])
      .filter(function(l) {
        if (!_m.getLayer(l)) {
          return false;
        }
        if (all[l]) {
          return false;
        }
        all[l] = true;
        return true;
      });
  }

  function filterByZIndex(features) {
    let zindexTop = 0;
    let results = [];
    features.forEach(function(feature) {
      let { layer: { metadata: { zindex = 0  } } } = feature;
      if (zindex >= zindexTop) {
        zindexTop = zindex;
        results[0] = feature;
      }
    });
    return results;
  }

  function fireEvent(type, e, features, filterByZ) {
    if (features.length === 0) {
      return;
    }
    if (filterByZ) {
      features = filterByZIndex(features);
    }
    features.forEach(function(feature) {
      let { id } = feature;
      e.feature = feature;
      listenersBag.getListeners(type, id).forEach(listener => listener.call(_m, e));
      delete e.feature;
    });
  }

  function fireMapEvent(type, e) {
    mapListenersBag.getListeners(type).forEach(listener => listener.call(_m, e));
  }

  function onmousemove(e) {
    const { point } = e;
    let layers = getCurrentMouseLayers();
    let features = queryRenderedFeatures('mousemove', point, { layers });
    let result = featureCollector.onmove(features);
    Object.entries(result).forEach(function([type, features]) {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features, type !== 'mouseleave');
    });
    if (0 === features.length) {
      fireMapEvent('mousemove', e);
    }
  }

  function onmouseout(e) {
    let result = featureCollector.onout();
    Object.entries(result).forEach(function([type, features]) {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features);
    });
    fireMapEvent('mouseout', e);
  }

  function onevent(e) {
    const { type, point  } = e;
    const layers = getCurrentLayers(type);
    const features = layers.length > 0 ? queryRenderedFeatures(type, point, { layers }) : [];
    if (features.length > 0) {
      fireEvent(type, e, features, true); // true - only for top zindex
    } else {
      fireMapEvent(type, e);
    }
  }

  function queryRenderedFeatures(type, point, options) {
    const fat = touchEvents[type] ? 10 : 3; // more fat for touch events
    return query(_m, point, fat, options);
  }

  function moveFeature(featureId, fromLayerId, toLayerId) {
    listenersBag.move(featureId, fromLayerId, toLayerId);
  }

  return {
    on,
    off,
    mapOn,
    mapOff,
    moveFeature
  };
}

function asMap(arr) {
  return arr.reduce(function(obj, type) {
    obj[type] = true;
    return obj;
  }, Object.create(null));
}
