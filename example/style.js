var pinsStyle = {
  layers: [{
    id: 'circle',
    type: 'circle',
    paint: {
      'circle-color': '#FFFFFF',
      'circle-opacity': 0,
      'circle-radius': {
        property: 'scale',
        type: 'identity'
      },
      'circle-stroke-color': '#0074D9', // azure
      'circle-stroke-opacity': 1,
      'circle-stroke-width': 5
    }
  }, {
      id: 'compass',
      type: 'symbol',
      layout: {
        'icon-image': 'symbol:forward_closed_arrow',
        'icon-rotate': {
          property: 'rotation',
          type: 'identity'
        }
      },
      paint: {
        'icon-color': '#0074D9' // azure
      }
  }, {
    id: 'flag',
    type: 'symbol',
    layout: {
      'icon-image': 'path:M 2 0 L 2 0.28125 L 2 13.6875 L 2 14 L 0.59375 14 L 0 14 L 0 14.59375 L 0 15.375 L 0 16 '
        + 'L 0.59375 16 L 4.40625 16 L 5 16 L 5 15.375 L 5 14.59375 L 5 14 L 4.40625 14 L 3 14 L 3 13.6875 '
        + 'L 3 9 L 16 5.5 L 3 2 L 3 0.28125 L 3 0 L 2.6875 0 L 2.3125 0 L 2 0 z',
      'icon-offset': [1, 16],
      'icon-size': {
        property: 'scale',
        type: 'identity'
      }
    },
    paint: {
      'icon-color': 'orange',
    }
  }, {
    id: 'marker-1',
    type: 'symbol',
    metadata: {
      'facade:icon-size': [26, 30]
    },
    layout: {
      'icon-image': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=',
      'icon-offset': [0, -45],
      'icon-size': {
        property: 'scale',
        type: 'identity'
      }
    }
  }, {
    id: 'marker-2',
    type: 'symbol',
    layout: {
      'icon-image': {
        property: 'image',
        type: 'identity'
      }
    }
  }]
};

var chinaStyle = {
  layers: [{
    id: 'circle',
    type: 'circle',
    paint: {
      'circle-color': '#FFFFFF',
      'circle-opacity': 0,
      'circle-radius': 8,
      'circle-stroke-color': '#0074D9', // azure
      'circle-stroke-opacity': 1,
      'circle-stroke-width': 5
    }
  }, {
    id: 'polyline',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#a21bab',
      'line-width': 4,
      'line-opacity': 0.8
    }
  }, {
    id: 'polygon',
    type: 'fill',
    paint: {
      'fill-color': '#a21bab',
      'fill-opacity': 0.5,
      'fill-outline-color': '#0074D9'
    }
  }]
};
