module.exports = addedWithCollator;

function addedWithCollator(maps, map, source, points, path) {
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
  // collate markers on map
  const collate = maps.collate({
    map
  });
  points.forEach(pt => {
    const ft = maps.feature({
      map,
      source,
      data: {
        properties: {
          type: 'circle'
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pt
        }
      }
    });
    ft.zindex = () => 1;
    collate.add(ft);
  });
  collate.calculate();
}
