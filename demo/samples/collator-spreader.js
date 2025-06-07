module.exports = addedWithCollatorAndSpreader;

function addedWithCollatorAndSpreader(maps, map, source, points, path) {
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
      m = maps.feature({
        map,
        source,
        data: {
          properties: {
            type: 'circle_orange'
          },
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: pt
          }
        }
      });
      collate.add(m);
    } else {
      m = maps.feature({
        map,
        source,
        data: {
          properties: {
            type: 'circle_teal'
          },
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: pt
          }
        }
      });
      m.zindex = () => 2;
      spread.add(m);
      collate.add(m, true);
    }
  });
  calculate();
}
