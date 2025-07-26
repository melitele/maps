const mapboxgl = require('@mapwhit/tilerenderer');

const { decode } = require('@pirxpilot/google-polyline');
const { bounds } = require('./common');
const {
  addedDirectly,
  addedWithCollator,
  addedWithCollatorAndSpreader,
  addedWithSpreader,
  sampleChina,
  sampleMarkers
} = require('./samples');
const { mapStyle } = require('@mapwhit/map-style');
const maps = require('..').init();

global.mapboxgl = mapboxgl; // Make sure mapboxgl is globally available

mapboxgl.config.WORKER_URL = 'build/worker.js'; // Set the worker URL

if (maps) {
  const dataEl = document.querySelector('#data');
  const points = JSON.parse(dataEl.getAttribute('data-markers'));
  const bnds = bounds(points);
  const path = decode(dataEl.getAttribute('data-polyline'));

  const onReady = [
    [addedDirectly, '_data'],
    [addedWithSpreader, '_spreader'],
    [addedWithCollator, '_collator'],
    [addedWithCollatorAndSpreader, '_collator_spreader'],
    [sampleMarkers, '_markers'],
    [sampleChina, '_china']
  ];

  const styleArray = require('./map-style.json');
  Array.prototype.slice.call(document.querySelectorAll('.example .map')).forEach(async (mapEl, i, els) => {
    const { layers, sources } = styleArray[i + 1];
    const style = Object.assign(styleArray[i + 1], styleArray[0]);
    style.layers = style.layers.concat(layers);
    style.sources = Object.assign(style.sources, sources);
    const map = await maps.map(mapEl, {
      mapboxgl,
      style: await mapStyle(createUrl(style)),
      backgroundColor: '#e5c7e6'
    });
    onReady[i][0](maps, map, onReady[i][1], points, path);
    if (i > els.length - 3) {
      return;
    }
    map.bounds(bnds);
  });
}

function createUrl(obj) {
  return `data:text/plain;base64,${btoa(JSON.stringify(obj))}`;
}
