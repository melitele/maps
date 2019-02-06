// shape based on a layer predefined in map style
module.exports = artifact;

function getChangedProperties() {}

function create(self, id, options) {

  self._l = {
    id: options.style.layer,
    source: {
      type: 'geojson',
      data: {
        id: '' + id,
        type: 'Feature',
        properties: options.style.properties || {},
        geometry: options.path ? {
          type: 'LineString',
          coordinates: options.path
        } : {
          type: 'Point',
          coordinates: options.position || [0, 0]
        }
      }
    }
  };

  return options;
}

const layer = require('./layer')(getChangedProperties, create);

function artifact(options) {
  let self;

  function path(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = p;
    self.update();
  }

  self = layer({
    path
  }, options);

  return self;
}
