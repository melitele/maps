module.exports = featureCollector;

function featureCollector(_m) {
  let oldFeatures = new Map();
  let layers;

  function getLayers() {
    if (!layers) {
      layers = new Map(_m.getStyle().layers.map(({ id }, i) => [id, i]));
    }
    return layers;
  }

  function getZIndex(id) {
    return getLayers().get(id) ?? 0;
  }

  function onmove(newFeatures) {
    let mouseenter = [];
    let mouseover = [];
    let zindexEnter = 0;
    let zindexOver = 0;

    for (const f of newFeatures) {
      const {
        layer: { id }
      } = f;
      const zindex = getZIndex(id);
      if (oldFeatures.delete(f.id)) {
        mouseover.push(f);
        zindexOver = Math.max(zindex, zindexOver);
      } else {
        mouseenter.push(f);
        zindexEnter = Math.max(zindex, zindexEnter);
      }
    }

    // whatever remains in old we just left
    const mouseleave = Array.from(oldFeatures.values());

    if (zindexOver > zindexEnter) {
      mouseenter = [];
    } else {
      mouseleave.push(...mouseover);
      mouseover = [];
    }

    // and new is old...
    oldFeatures = new Map(newFeatures.map(f => [f.id, f]));

    return { mouseenter, mouseover, mouseleave };
  }

  function onout() {
    const mouseleave = Array.from(oldFeatures.values());
    oldFeatures = new Map();
    return { mouseleave };
  }

  return {
    onmove,
    onout
  };
}
