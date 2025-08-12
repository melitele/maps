const MAPLIBRE = false; // Set to true if using MapLibre instead of Mapwhit GL JS

const mapwhitgl = require('@mapwhit/tilerenderer');
const maplibregl = require('maplibre-gl');

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

// Make sure mapboxgl is globally available
let mapboxgl;
if (MAPLIBRE) {
  mapboxgl = global.mapboxgl = maplibregl; // Use MapLibre GL JS if MAPLIBRE is true
} else {
  mapboxgl = global.mapboxgl = mapwhitgl; // Use Mapwhit GL JS if MAP
  mapboxgl.config.WORKER_URL = 'build/worker.js'; // Set the worker URL
}

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
    let style = Object.assign(styleArray[i + 1], styleArray[0]);
    style.layers = style.layers.concat(layers);
    style.sources = Object.assign(style.sources, sources);
    if (!MAPLIBRE) {
      style = await mapStyle(createUrl(style))
    }
    const map = await maps.map(mapEl, {
      mapboxgl,
      style,
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
