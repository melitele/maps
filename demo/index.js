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
    addedDirectly,
    addedWithSpreader,
    addedWithCollator,
    addedWithCollatorAndSpreader,
    sampleMarkers,
    sampleChina
  ];

    Array.prototype.slice.call(document.querySelectorAll('.example .map')).forEach((mapEl, i) => {
    const map = maps.map(mapEl, merge({
      mapboxgl: maplibregl,
      style: createUrl(require('./map-style.json')),
      zoomControl: true,
      zoomControlOptions: {
        position: 'RB'
      },
      fullscreenControl: i > 2,
      backgroundColor: '#e5c7e6',
      onReady: () => onReady[i](maps, map, points, path)
    }, i ? {
      attributionControl: false,
      attribution: attribution
    } : {}));
    if (i > 3) {
      return map;
    }
    map.fitBounds(bnds);
  });
}

function createUrl(obj) {
  return `data:text/plain;base64,${btoa(JSON.stringify(obj))}`;
}
