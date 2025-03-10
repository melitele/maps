module.exports = addedWithCollator;

function addedWithCollator(maps, map, points, path) {
  maps.polyline({
    map,
    color: '#a21bab',
    path
  });
  // collate markers on map
  const collate = maps.collate({
    map
  });
  points.forEach(pt => {
    collate.add(maps.marker({
      map,
      color: 'orange',
      position: pt
    }));
  });
  collate.calculate();
}
