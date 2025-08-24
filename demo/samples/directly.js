module.exports = addedDirectly;

function addedDirectly(maps, map, source, points, path) {
  const poly = maps.feature({
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
  map.registerImage(
    'marker_icon',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=',
    [26, 30]
  );
  // add markers directly to map
  const markers = points.map(pt => {
    return maps.feature({
      map,
      source,
      data: {
        properties: {
          type: 'marker',
          opacity: 1
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pt
        }
      }
    });
  });
  setTimeout(() => {
    markers.forEach((mk, i) => {
      if (i < 10) {
        mk.remove();
      }
      const data = mk.data();
      data.properties =
        i === 12 || i === 11 || i === 5
          ? {
              type: 'marker',
              icon: true,
              opacity: 1
            }
          : {
              type: 'marker',
              color: 'violet',
              opacity: 1
            };
      mk.data(data);
      if (i < 10) {
        mk.add(map);
      }
    });
    setTimeout(() => {
      markers[5].remove();
      const mData = markers[5].data();
      mData.properties = {
        type: 'marker',
        color: 'violet',
        opacity: 1
      };
      markers[5].data(mData);
      markers[5].add(map);
      markers.forEach((mk, i) => {
        if (i % 2 === 0) {
          const data = mk.data();
          data.properties.opacity = 0;
          mk.data(data);
        }
      });
      const data = poly.data();
      delete data.type;
      poly.data(data);
    }, 5000);
  }, 3000);
}
