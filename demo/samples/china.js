module.exports = sampleChina;

function sampleChina(srv, map, source) {
  const center = [116.383473, 39.903331];
  const path = [center, [center[0] - 0.001, center[1] + 0.001], [center[0] + 0.001, center[1] + 0.001], center];
  const poly = [center, [center[0] - 0.001, center[1] - 0.001], [center[0] + 0.001, center[1] - 0.001], center];
  srv.feature({
    map,
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
  srv.feature({
    map,
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
  srv.feature({
    map,
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
}
