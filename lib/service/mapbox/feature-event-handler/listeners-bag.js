module.exports = listenersBag;

function isEmpty(o) {
  return Object.keys(o).length === 0;
}

// event type -> layerId -> featureId -> array of listeners
function listenersBag() {
  let bag = Object.create(null);

  function getListeners(type, layerId, featureId) {
    const layers = bag[type];
    if (!layers) {
      return [];
    }
    const features = layers[layerId];
    if (!features) {
      return [];
    }
    return features[featureId] || [];
  }

  function forType(type) {
    const layers = bag[type];
    return layers ? Object.keys(layers) : [];
  }

  function add(type, layerId, featureId, listener) {
    let newType = false;
    let layers = bag[type];
    if (!layers) {
      newType = true;
      bag[type] = layers = Object.create(null);
    }
    let features = layers[layerId];
    if (!features) {
      layers[layerId] = features = Object.create(null);
    }
    let listeners = features[featureId];
    if (!listeners) {
      features[featureId] = listeners = [];
    }
    listeners.push(listener);
    return newType;
  }

  function remove(type, layerId, featureId, listener) {
    let listeners = bag[type][layerId][featureId];
    let index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
    if (listeners.length === 0) {
      let layers = bag[type];
      let features = layers[layerId];
      delete features[featureId];
      if (isEmpty(features)) {
        delete layers[layerId];
        if (isEmpty(layers)) {
          delete bag[type];
          return true;
        }
      }
    }
  }

  return {
    getListeners,
    add,
    remove,
    forType
  };
}
