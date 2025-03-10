module.exports = addedWithSpreader;

function addedWithSpreader(maps, map, points, path) {
  maps.polyline({
    map,
    color: '#a21bab',
    path
  });
  // spread markers on map
  const spread = maps.spread({
    map,
    threshold: 20
  });
  points.forEach((pt, i) => {
    spread.add(maps.marker({
      map,
      icon: {
        path: 'circle',
        fillColor: 'teal',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 10
      },
      position: pt,
      label: i + 1
    }));
  });
  spread.calculate();
}
