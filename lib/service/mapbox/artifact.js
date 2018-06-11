// artifact added to map implemented as layer

var object = require('./object');

module.exports = artifact;

function artifact(options) {
  var self, feature;

  function onadd() {
    var source;
    if (options.init) {
      options.init(self);
    }
    feature = {
      type: 'Feature',
      properties: options.properties,
      geometry: options.geometry
    };
    source = self._m.getSource(options.layer);
    source._data.features.push(feature);
    source.setData(source._data);
  }

  function onremove() {
    var source = self._m.getSource(options.layer);
    if (source._data.features.some(function (f, i, features) {
      if (f.properties === feature.properties) {
        features.splice(i, 1);
        return true;
      }
    })) {
      source.setData(source._data);
    }
  }

  function geometry(g) {
    var source;
    if (g === undefined) {
      return feature.geometry;
    }
    source = self._m.getSource(options.layer);
    feature.geometry = g;
    source.setData(source._data);
  }

  function properties(p) {
    var source;
    if (p === undefined) {
      return feature.properties;
    }
    source = self._m.getSource(options.layer);
    feature.properties = p;
    source.setData(source._data);
  }

  self = object(Object.assign({}, options, {
    properties: properties,
    geometry: geometry
  }), {
    onadd: onadd,
    onremove: onremove,
  });

  if (options.map) {
    self.add(options.map);
  }

  return self;
}
