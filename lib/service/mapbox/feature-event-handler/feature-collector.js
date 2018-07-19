module.exports = featureCollector;

function featureCollector() {
  let oldFeatures = [];

  // TODO: maybe make it a Set (needs polyfill)
  function checkAndRemove({ id }, features) {
    const index = features.findIndex(feature => feature.id === id);
    const found = index >= 0;
    if (found) {
      features.splice(index, 1);
    }
    return found;
  }

  function onmove(newFeatures) {
    let mouseenter = [];
    let mouseover = [];

    for (const f of newFeatures) {
      let collection = checkAndRemove(f, oldFeatures) ? mouseover : mouseenter;
      collection.push(f);
    }

    // whatever remains in old we just left
    let mouseleave = oldFeatures;
    // and new is old...
    oldFeatures = newFeatures;

    return { mouseenter, mouseover, mouseleave };
  }

  function onout() {
    let mouseleave = oldFeatures;
    oldFeatures = [];
    return { mouseleave };
  }

  return {
    onmove,
    onout
  };
}
