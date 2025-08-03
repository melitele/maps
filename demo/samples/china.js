const { default: initFeatures } = require('@mapwhit/features');

module.exports = sampleChina;

function sampleChina(_, map, source) {
  const center = [116.383473, 39.903331];
  const path = [center, [center[0] - 0.001, center[1] + 0.001], [center[0] + 0.001, center[1] + 0.001], center];
  const poly = [center, [center[0] - 0.001, center[1] - 0.001], [center[0] + 0.001, center[1] - 0.001], center];
  const features = initFeatures({ map: map._m });
  features.add({
    source,
    data: {
      properties: {
        type: 'china_circle'
      },
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: center
      }
    }
  });
  features.add({
    source,
    data: {
      properties: {
        type: 'china_line'
      },
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: path
      }
    }
  });
  features.add({
    source,
    data: {
      properties: {
        type: 'china_polygon'
      },
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [poly]
      }
    }
  });
  setTimeout(function () {
    map.move({ zoom: 17, center: center }, false);
  }, 0);
  setTimeout(function () {
    map._m.setGlobalStateProperty('lineColor', '#ff0000');
  }, 5000);
}
