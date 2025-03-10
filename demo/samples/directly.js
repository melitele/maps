module.exports = addedDirectly;

function addedDirectly(maps, map, points, path) {
  const poly = maps.polyline({
    map,
    color: '#a21bab',
    path
  });
  // add markers directly to map
  const markers = points.map(pt => {
    return maps.marker({
      map,
      position: pt
    });
  });
  setTimeout(() =>{
    markers.forEach((mk, i) => {
      if (i < 10) {
        mk.remove();
      }
      mk.icon((i === 12 || i === 11 || i === 5) ? {
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=',
        size: [26, 30]
      } : {
        color: 'violet'
      });
      if (i < 10) {
        mk.add(map);
      }
    });
    setTimeout(() => {
      markers[5].remove();
      markers[5].icon({
        color: 'violet'
      });
      markers[5].add(map);
      markers.forEach((mk, i) =>{
        if (i % 2 === 0) {
          mk.option('visible', false);
        }
      });
      poly.option('visible', false);
    }, 5000);
  }, 3000);
}