module.exports = sampleMarkers;

function sampleMarkers(srv, map, source) {
  let i;
  let mk;
  map.center([0.5, 0]);
  map.zoom(9);
  map.registerImage('markers_circle', {
    path: 'M 15 8 A 7 7 0 1 0 1 8 A 7 7 0 1 0 15 8',
    fillColor: 'transparent',
    strokeColor: '#0074D9',
    strokeWeight: 2
  });
  map.registerImage('markers_flag', {
    path:
      'M 2 0 L 2 0.28125 L 2 13.6875 L 2 14 L 0.59375 14 L 0 14 L 0 14.59375 L 0 15.375 L 0 16 ' +
      'L 0.59375 16 L 4.40625 16 L 5 16 L 5 15.375 L 5 14.59375 L 5 14 L 4.40625 14 L 3 14 L 3 13.6875 ' +
      'L 3 9 L 16 5.5 L 3 2 L 3 0.28125 L 3 0 L 2.6875 0 L 2.3125 0 L 2 0 z ',
    fillColor: 'orange',
    strokeColor: 'orange',
    strokeWeight: 1
  });
  map.registerImage(
    'markers_icon',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=',
    [26, 30]
  );
  for (i = 0; i <= 8; i += 1) {
    let animate = i === 3;
    mk = srv.feature({
      map,
      source,
      animation: animate && 'offset',
      data: {
        properties: {
          type: 'markers_symbol',
          image: 'markers_circle',
          offset: [0, 0],
          range: animate && 64,
          size: (1 + i) / 8
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [i / 8, 3 / 8]
        }
      }
    });
    if (animate) {
      mk.animation('bounce');
      setTimeout(mk.animation, 15 * 1000);
    }
    srv.feature({
      map,
      source,
      data: {
        properties: {
          type: 'markers_symbol',
          image: 'markers_flag',
          offset: [16, -16],
          size: (1 + i) / 7
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [i / 8, 1 / 8]
        }
      }
    });
    animate = i === 4;
    mk = srv.feature({
      map,
      source,
      animation: animate && 'offset',
      data: {
        properties: {
          type: 'markers_symbol',
          image: 'markers_icon',
          size: 0.5,
          offset: [0, -30]
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [i / 8, -1 / 8]
        }
      }
    });
    if (animate) {
      mk.animation('bounce');
      setTimeout(mk.animation, 15 * 1000);
    }
  }
}
