module.exports = addedWithCollatorAndSpreader;

function addedWithCollatorAndSpreader(maps, map, points, path) {
  maps.polyline({
    map,
    color: '#a21bab',
    path
  });
  // spread AND collate markers on map
  function calculate() {
    if (spread && collate) {
      spread.calculate();
      collate.calculate();
    }
  }
  const proj = maps.projection({
    map,
    calculate
  });
  const spread = maps.spread({
    map,
    projection: proj
  });
  const collate = maps.collate({
    map,
    projection: proj
  });
  points.forEach((pt, i) => {
    let m;
    if (i % 2) {
      m = maps.marker({
        map,
        color: 'orange',
        position: pt,
        zIndex: 1
      });
      collate.add(m);
    }
    else {
      m = maps.marker({
        map,
        color: 'teal',
        position: pt,
        zIndex: 2
      });
      spread.add(m);
      collate.add(m, true);
    }
  });
  calculate();
}