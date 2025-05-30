module.exports = zindex;

function zindex(feature) {
  const {
    _data: { id: featureId },
    _layers,
    _m,
    _source
  } = feature;
  const zIndexValues = new Map(_layers.map((layer, i) => [layer, i]));
  let zi = 0;
  _m?.queryRenderedFeatures({ _layers }).forEach(({ id, layer: { id: layerId }, source }) => {
    if (id === featureId && source === _source) {
      zi = Math.max(zi, zIndexValues.get(layerId));
    }
  });
  return zi;
}
