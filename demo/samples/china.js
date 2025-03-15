module.exports = sampleChina;

function sampleChina(srv, map, source) {
  const center = [116.383473, 39.903331];
  const path = [
    center,
    [center[0] - 0.001, center[1] + 0.001],
    [center[0] + 0.001, center[1] + 0.001],
    center
  ], poly = [
    center,
    [center[0] - 0.001, center[1] - 0.001],
    [center[0] + 0.001, center[1] - 0.001],
    center
  ];
  map.zoom(17);
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
    map.center(center);
  }, 1)
}
