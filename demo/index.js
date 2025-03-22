/* global maplibregl */
global.mapboxgl = maplibregl;

const { decode } = require('@pirxpilot/google-polyline');
const { bounds, merge } = require('./common');
const {
  addedDirectly,
  addedWithCollator,
  addedWithCollatorAndSpreader,
  addedWithSpreader,
  sampleChina,
  sampleMarkers
} = require('./samples');
const maps = require('..').init();

if (maps) {

  const dataEl = document.querySelector('#data');
  const points = JSON.parse(dataEl.getAttribute('data-markers'));
  const bnds = bounds(points);
  const path = decode(dataEl.getAttribute('data-polyline'));

  const attribution = document.getElementById('attribution');

  const onReady = [
    [ addedDirectly, '_data' ],
    [ addedWithSpreader, '_spreader' ],
    [ addedWithCollator, '_collator' ],
    [ addedWithCollatorAndSpreader, '_collator_spreader' ],
    [ sampleMarkers, '_markers' ],
    [ sampleChina, '_china' ]
  ];

  const styleArray = require('./map-style.json');
  Array.prototype.slice.call(document.querySelectorAll('.example .map')).forEach((mapEl, i, els) => {
    const { layers, sources } = styleArray[i + 1];
    const style = Object.assign(styleArray[i + 1], styleArray[0]);
    style.layers = style.layers.concat(layers);
    style.sources = Object.assign(style.sources, sources);
    const map = maps.map(mapEl, merge({
      mapboxgl: maplibregl,
      style: createUrl(style),
      zoomControl: true,
      zoomControlOptions: {
        position: 'RB'
      },
      fullscreenControl: i > 2,
      backgroundColor: '#e5c7e6',
      onReady: () => onReady[i][0](maps, map, onReady[i][1], points, path)
    }, i ? {
      attributionControl: false,
      attribution: attribution
    } : {}));
    if (i > els.length - 3) {
      return;
    }
    map.bounds(bnds);
  });
}

function createUrl(obj) {
  return `data:text/plain;base64,${btoa(JSON.stringify(obj))}`;
}
