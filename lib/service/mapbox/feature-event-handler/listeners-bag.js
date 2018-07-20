module.exports = listenersBag;

function isEmpty(o) {
  return Object.keys(o).length === 0;
}

function listenersBag() {
  // event type -> featureId -> array of listeners
  let bag = Object.create(null);
  // event type -> layerId -> counter
  let types2layers = Object.create(null);

  function getListeners(type, featureId) {
    const features = bag[type];
    if (!features) {
      return [];
    }
    return features[featureId] || [];
  }

  function forType(type) {
    const layers = types2layers[type];
    return layers ? Object.keys(layers) : [];
  }

  function addLayer(type, layerId) {
    let layers = types2layers[type];
    if (!layers) {
      types2layers[type] = layers = Object.create(null);
      layers[layerId] = 1;
      return true;
    }
    layers[layerId] += 1;
  }

  function removeLayer(type, layerId) {
    let layers = types2layers[type];
    if (0 === --layers[layerId]) {
      delete layers[layerId];
      return true;
    }
  }

  function addListener(type, featureId, listener) {
    let features = bag[type];
    if (!features) {
      bag[type] = features = Object.create(null);
    }
    let listeners = features[featureId];
    if (!listeners) {
      features[featureId] = listeners = [];
    }
    listeners.push(listener);
  }

  function removeListener(type, featureId, listener) {
    let listeners = bag[type][featureId];
    let index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
    if (listeners.length === 0) {
      let features = bag[type];
      delete features[featureId];
      if (isEmpty(features)) {
          delete bag[type];
      }
    }
  }

  function add(type, layerId, featureId, listener) {
    addListener(type, featureId, listener);
    return addLayer(type, layerId);
  }

  function remove(type, layerId, featureId, listener) {
    removeListener(type, featureId, listener);
    return removeLayer(type, layerId);
  }

  return {
    getListeners,
    add,
    remove,
    forType
  };
}
