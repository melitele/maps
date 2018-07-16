const makeFeatureCollector = require('./feature-collector');

module.exports = featureEventHandler;

const mouseEvents = [
  'mouseenter',
  'mouseover',
  'mouseleave'
].reduce(function(obj, type) {
  obj[type] = true;
  return obj;
}, Object.create(null));

// FIXME: we only support 'mouseover', 'mouseleave, and 'mouseenter' here
function translateEventType(type) {
    switch(type) {
      case 'mousemove': return 'mouseover';
      case 'mouseout': return 'mouseleave';
      default: return type;
    }
}

function featureEventHandler(_m) {
  const listeners = {}; // event type -> array of layers -> array of listeners
  let mouseHandlerActive = 0;
  let featureCollector = makeFeatureCollector();

  function getListenersFor(type, layer) {
    let layers = listeners[type] = listeners[type] || {};
    layers[layer] = layers[layer] || [];
    return layers[layer];
  }

  function on(type, layer, listener) {
    type = translateEventType(type);
    let layerListeners = getListenersFor(type, layer);
    layerListeners.push(listener);
    if (layerListeners.length === 1) {
      // first listener for layer
      if (Object.keys(listeners[type]).length === 1) {
        // fist listener for type
        addMapListener(type);
      }
    }
  }

  function off(type, layer, listener) {
    type = translateEventType(type);
    let layerListeners = getListenersFor(type, layer);
    let index = layerListeners.indexOf(listener);
    if (index < 0) {
      return;
    }
    layerListeners.splice(index, 1);
    if (layerListeners.length === 0) {
      // last listener for layer
      delete listeners[type][layer];
      if (Object.keys(listeners[type]).length === 0) {
        // last listener for type
        delete listeners[type];
        removeMapListener(type);
      }
    }
  }

  function addMapListener(type) {
    if (mouseEvents[type]) {
      if (0 === mouseHandlerActive++) {
        _m.on('mousemove', onmousemove);
        _m.on('mouseout', onmouseout);
      }
    } else {
      _m.on(type, onevent);
    }
  }

  function removeMapListener(type) {
    if (mouseEvents[type]) {
      if (0 === --mouseHandlerActive) {
        _m.off('mousemove', onmousemove);
        _m.off('mouseout', onmouseout);
      }
    } else {
      _m.off(type, onevent);
    }
  }

  function featuresByLayer(features) {
    return features.reduce(function(byLayer, feature) {
      const { id } = feature.layer;
      let collection = byLayer[id];
      if (!collection) {
        collection = [];
        byLayer[id] = collection;
      }
      collection.push(feature);
      return byLayer;
    }, Object.create(null));
  }

  function getCurrentLayers(type) {
    return Object.keys(listeners[type]).filter(l => _m.getLayer(l));
  }

  function getCurrentMouseLayers() {
    let all = {};
    return Object.keys(mouseEvents)
      .reduce((all, type) => all.concat(Object.keys(listeners[type])), [])
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

  function fireEvent(type, e, features) {
    if (features.length === 0) {
      return;
    }
    const byLayer = featuresByLayer(features);
    Object.entries(byLayer).forEach(function([layer, features]) {
      // mutate the original event, so that preventDefault works as expected.
      e.features = features;
      getListenersFor(type, layer).forEach(listener => listener.call(_m, e));
      delete e.features;
    });
  }

  function onmousemove(e) {
    const { point } = e;
    let layers = getCurrentMouseLayers();
    let features = queryRenderedFeatures(point, { layers });
    let result = featureCollector.onmove(features);
    Object.entries(result).forEach(function([type, features]) {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features);
    });
  }

  function onmouseout(e) {
    let result = featureCollector.onout();
    Object.entries(result).forEach(function([type, features]) {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features);
    });
  }

  function onevent(e) {
    const { type, point  } = e;
    const layers = getCurrentLayers(type);
    if (layers.length === 0) {
      return;
    }
    const features = queryRenderedFeatures(point, { layers });
    fireEvent(type, e, features);
  }

  function queryRenderedFeatures(point, options) {
    const geometry = {
      viewport: [ point ],
      worldCoordinate: [ _m.transform.pointCoordinate(point) ]
    };
    return _m.style.queryRenderedFeatures(geometry, options, _m.transform) || [];
  }

  return {
    on,
    off
  };

}
