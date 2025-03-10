module.exports = sampleMarkers;

function sampleMarkers(srv, map) {
  let i
  let mk;
  map.center([0.5, 0]);
  map.zoom(9);
  for (i = 0; i <= 8; i += 1) {
    mk = srv.marker({
      map,
      position: [i / 8, 3 / 8],
      icon: {
        strokeColor: '#0074D9', // azure
        strokeWeight: 5,
        path: 'circle',
        scale: 1 + i
      }
    });
    if (i === 3) {
      mk.animation('bounce');
      setTimeout(mk.animation, 15 * 1000);
    }
    srv.marker({
      map,
      position: [i / 8, 1 / 8],
      color: 'orange',
      icon: {
        path: 'M 2 0 L 2 0.28125 L 2 13.6875 L 2 14 L 0.59375 14 L 0 14 L 0 14.59375 L 0 15.375 L 0 16 '
            + 'L 0.59375 16 L 4.40625 16 L 5 16 L 5 15.375 L 5 14.59375 L 5 14 L 4.40625 14 L 3 14 L 3 13.6875 '
            + 'L 3 9 L 16 5.5 L 3 2 L 3 0.28125 L 3 0 L 2.6875 0 L 2.3125 0 L 2 0 z ',
        strokeColor: 'orange',
        strokeWeight: 1,
        scale: (i + 1) / 3,
        anchor: [1, 16]
      }
    });
    mk = srv.marker({
      map,
      position: [i / 8, -1 / 8],
      icon: {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=',
        size: [26, 30]
      },
      optimized: false
    });
    if (i === 4) {
      mk.animation('bounce');
      setTimeout(mk.animation, 15 * 1000);
    }
  }
}
