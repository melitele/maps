var draggable = require('./draggable');
var merge = require('lodash.assign');

module.exports = handle;

var paint = {
  fillColor: 'circle-color',
  fillOpacity: 'circle-opacity',
  strokeColor: 'circle-stroke-color',
  strokeOpacity: 'circle-stroke-opacity',
  strokeWeight: 'circle-stroke-width',
  scale: function (value) {
    return {
      'circle-radius': value - 1
    };
  }
};

function create(self, id, options) {
  options = merge({}, options.icon);

  options.fillColor = options.fillColor || '#FFFFFF';
  options.strokeColor = options.strokeColor || '#FFFFFF';

  self._l = {
    id: '' + id,
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: options.position || [0, 0]
        }
      }
    },
    layout: {},
    paint: merge({
      'circle-color': options.fillColor,
      'circle-opacity': options.fillOpacity || 0,
      'circle-stroke-color': options.strokeColor,
      'circle-stroke-opacity': options.strokeOpacity || 1,
      'circle-stroke-width': options.strokeWeight
    }, paint.scale(options.scale || 2))
  };
  return options;
}

var layer = require('./layer')(paint, create);

function handle(options) {
  var self;

  function position(c) {
    if (!c) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = c;
    self.update();
  }

  function zindex() {
    // do nothing
  }

  self = layer({
    eventTarget: true,
    position: position,
    zindex: zindex
  }, options);
  self = draggable(self, options);

  return self;
}
