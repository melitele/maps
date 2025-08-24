module.exports = addedWithSpreader;

function addedWithSpreader(maps, map, source, points, path) {
  maps.feature({
    map,
    source,
    data: {
      properties: {
        type: 'polyline'
      },
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: path
      }
    }
  });
  // spread markers on map
  const spread = maps.spread({
    map,
    threshold: 20
  });

  map.registerImage('circle_label', {
    path: 'M 15 8 A 7 7 0 1 0 1 8 A 7 7 0 1 0 15 8',
    fillColor: 'teal',
    strokeColor: '#0074D9',
    strokeWeight: 0,
    scale: 10
  });
  points.forEach((pt, i) => {
    spread.add(
      maps.feature({
        map,
        source,
        data: {
          properties: {
            type: 'circle_label',
            label: '' + (i + 1)
          },
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: pt
          }
        }
      })
    );
  });
  spread.calculate();
}
