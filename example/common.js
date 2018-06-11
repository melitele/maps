function merge(to, from) {
  Object.keys(from).forEach(function (key) {
    to[key] = from[key];
  });
  return to;
}

function bounds(points) {
  return points.reduce(function(points, pt) {
    var i;
    for (i = 0; i < 2; i++) {
      if(pt[i] < points[0][i]) {
        points[0][i] = pt[i];
      } else if (pt[i] > points[1][i]) {
        points[1][i] = pt[i];
      }
    }
    return points;
  }, [points[0].slice(), points[0].slice()]);
}

function samplePins(srv, mp) {
  var i, mk;
  mp.center([0.5, 0]);
  mp.zoom(9);
  mp.addStyle(pinsStyle);
  for (i = 0; i <= 8; i += 1) {
    srv.marker_({
      map: mp,
      layer: 'marker',
      properties: {
        path: 'forward_closed_arrow',
        strokeColor: '#0074D9', // azure
        strokeWeight: 5,
        rotation: 45 * i,
        scale: 5
      },
      geometry: {
        type: 'Point',
        coordinates: [i / 8, 3 / 8]
      },
    });
    mk = srv.artifact({
      map: mp,
      layer: 'circle',
      properties: {
        scale: i
      },
      geometry: {
        type: 'Point',
        coordinates: [i / 8, 1 / 8]
      }
    });
    srv.marker_({
      map: mp,
      layer: 'marker',
      properties: {
        color: 'orange',
        path: 'M 2 0 L 2 0.28125 L 2 13.6875 L 2 14 L 0.59375 14 L 0 14 L 0 14.59375 L 0 15.375 L 0 16 '
          + 'L 0.59375 16 L 4.40625 16 L 5 16 L 5 15.375 L 5 14.59375 L 5 14 L 4.40625 14 L 3 14 L 3 13.6875 '
          + 'L 3 9 L 16 5.5 L 3 2 L 3 0.28125 L 3 0 L 2.6875 0 L 2.3125 0 L 2 0 z ',
        strokeColor: 'orange',
        strokeWeight: 1,
        scale: (i + 1) / 3,
        anchor: [1, 16]
      },
      geometry: {
        type: 'Point',
        coordinates: [i / 8, -1 / 8],
      }
    });
    mk = srv.marker_({
      map: mp,
      layer: 'marker',
      properties: {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=',
        size: [26, 30]
      },
      geometry: {
        type: 'Point',
        coordinates: [i / 8, -3 / 8],
      }
    });
  }
}

function sampleMarkers(srv, mp) {
  var i, mk;
  mp.center([0.5, 0]);
  mp.zoom(9);
  for (i = 0; i <= 8; i += 1) {
    srv.marker({
      map: mp,
      position: [i / 8, 3 / 8],
      icon: {
        strokeColor: '#0074D9', // azure
        strokeWeight: 5,
        path: 'forward_closed_arrow',
        rotation: 45 * i,
        scale: 5
      }
    });
    mk = srv.marker({
      map: mp,
      position: [i / 8, 1 / 8],
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
      map: mp,
      position: [i / 8, -1 / 8],
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
      map: mp,
      position: [i / 8, -3 / 8],
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

function drawCircle(srv, mp, center) {
  mp.center(center);
  mp.zoom(10);
  srv.circle({
    map: mp,
    center: center,
    radius: 10000,
    strokeColor: 'blue',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: 'yellow',
    fillOpacity: 0.5
  });
}

function sampleChina(srv, mp, adhocStyle) {
  var center = [116.383473, 39.903331], path = [
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
  if (mp.gcj02) {
    mp.gcj02(true);
  }
  mp.zoom(17);
  if (adhocStyle) {
    srv.marker({
      map: mp,
      icon: {
        strokeColor: '#0074D9', // azure
        strokeWeight: 5,
        path: 'circle',
        scale: 8
      }
    }).position(center);
    srv.polyline({
      map: mp,
      color: '#a21bab'
    }).path(path);
    srv.polygon({
      map: mp,
      fillColor: '#a21bab',
      fillOpacity: 0.5,
      strokeColor: '#0074D9'
    }).path(poly);
  }
  else {
    mp.addStyle(chinaStyle);
    srv.artifact({
      map: mp,
      layer: 'circle'
    }).geometry({
      type: 'Point',
      coordinates: center
    });
    srv.artifact({
      map: mp,
      layer: 'polyline'
    }).geometry({
      type: 'LineString',
      coordinates: path
    });
    srv.artifact({
      map: mp,
      layer: 'polygon'
    }).geometry({
      type: 'Polygon',
      coordinates: [poly]
    });
  }
  setTimeout(function () {
    mp.center(center);
  }, 1)
}
