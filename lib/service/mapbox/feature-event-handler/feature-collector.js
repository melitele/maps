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
    let zindexEnter = 0;
    let zindexOver = 0;

    for (const f of newFeatures) {
      let { layer: { metadata: { zindex = 0  } } } = f;
      if (checkAndRemove(f, oldFeatures)) {
        mouseover.push(f);
        zindexOver = Math.max(zindex, zindexOver);
      }
      else {
        mouseenter.push(f);
        zindexEnter = Math.max(zindex, zindexEnter);
      }
    }

    // whatever remains in old we just left
    let mouseleave = oldFeatures;

    if (zindexOver > zindexEnter) {
      mouseenter = [];
    }
    else {
      mouseleave.push(...mouseover);
      mouseover = [];
    }

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
