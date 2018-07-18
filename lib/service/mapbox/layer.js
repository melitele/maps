var object = require('./object');

module.exports = layer;

var id = 0;

function updateProperty(key) {
  var params = this;
  params.m[params.set](params.id, key, params.values[key]);
}

function updateProperties(m, id, layer, prop, set) {
  Object.keys(layer[prop]).forEach(updateProperty, {
    id: id,
    values: layer[prop],
    m: m,
    set: set,
  });
}

function noop() {
}

function inLayer(searchedLayer, layer) {
  return layer.type === searchedLayer.type
      && layer.layout === searchedLayer.layout
      && layer.paint === searchedLayer.paint;
}

function isFeature(id, feature) {
  return id === feature.id;
}

function layer(getChangedProperties, create) {

  getChangedProperties = getChangedProperties || noop;

  return function (self, options) {
    var added, images, layers;

    function afterLayer(l) {
      var zi, before;
      zi = l.metadata.zindex;
      if (layers[zi] && layers[zi].length) {
        return layers[zi][0].id;
      }
      Object.keys(layers).some(function (zindex) {
        if (zindex > zi && layers[zindex].length) {
          before = layers[zindex][0].id;
          return true;
        }
      });
      return before;
    }

    function addLayer(l, before) {
      var zi = l.metadata.zindex;
      layers[zi] = layers[zi] || [];
      layers[zi].unshift(l);
      self._m.addLayer(Object.assign({}, l), before);
    }

    function findLayer(l) {
      var zi = l.metadata.zindex, idx;
      if (!layers[zi]) {
        return;
      }
      idx = layers[zi].findIndex(inLayer.bind(undefined, l));
      if (idx > -1) {
        return layers[zi][idx];
      }
    }

    function onadd(map) {
      var l;
      if (added) {
        return;
      }
      if (!self._m) {
        // object removed from map before it was rendered
        return;
      }
      layers = layers || map._layers;
      self._l.source.data.id = self._l.source.data.id || self._l.id;
      l = findLayer(self._l);
      if (l) {
        l.source.data.features.unshift(self._l.source.data);
        self._m.getSource(l.id).setData(l.source.data);
      }
      else {
        id += 1;
        l = {
          id: '' + id,
          type: self._l.type,
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [self._l.source.data]
            }
          },
          metadata: {
            zindex: self._l.metadata.zindex
          },
          layout: self._l.layout,
          paint: self._l.paint
        };
        addLayer(l, afterLayer(l));
      }
      added = true;
      images = images || map._images;
      images.init({
        _m: self._m,
        ready: true
      });
    }

    function onremove() {
      var l, idx;
      if (!added) {
        return;
      }
      added = undefined;
      l = findLayer(self._l);
      if (l) {
        idx = l.source.data.features.findIndex(isFeature.bind(undefined, self._l.source.data.id));
        if (idx > -1) {
          l.source.data.features.splice(idx, 1);
          self._m.getSource(l.id).setData(l.source.data);
        }
      }
      images = undefined;
      layers = undefined;
    }

    function update(layer) {
      var l, idx;
      if (self._m && added) {
        l = findLayer(self._l);
        if (l) {
          if (layer) {
            updateProperties(self._m, l.id, self._l, 'paint', 'setPaintProperty');
            updateProperties(self._m, l.id, self._l, 'layout', 'setLayoutProperty');
          }
          idx = l.source.data.features.findIndex(isFeature.bind(undefined, self._l.source.data.id));
          if (idx > -1) {
            l.source.data.features[idx].properties = self._l.source.data.properties;
            self._m.getSource(l.id).setData(l.source.data);
          }
        }
      }
    }

    function option(key, value) {
      var props, addBack;
      if (value === undefined) {
        if (key === 'zIndex') {
          return self._l.metadata.zindex - self.zindexLevel;
        }
        return self._l.source.data.properties[key] || options[key];
      }

      if (key === 'draggable' && self.changeDraggable) {
        self.changeDraggable(value);
      }
      else {
        if (key === 'zIndex') {
          value = Math.round(value + self.zindexLevel);
          if (value === self._l.metadata.zindex) {
            return;
          }
          props = {
            zindex: value
          };
        }
        else {
          if (options[key] === value) {
            return;
          }
          props = getChangedProperties(key, value, options);
          options[key] = value;
          if (self._l.source.data.properties.hasOwnProperty(key)) {
            self._l.source.data.properties[key] = value;
          }
          if (!props) {
            update();
            return;
          }
        }
        if (props.data) {
          if (props.update) {
            Object.assign(self._l.source.data.properties, props.data);
          }
          else {
            self._l.source.data.properties = props.data;
          }
        }
        if (props.image) {
          self.image(props.image.name,
              props.image.url,
              props.image.size,
              options.map && options.map._images,
              self.update);
        }
        if ((props.type && props.type !== self._l.type)
            || (props.paint && props.paint !== self._l.paint)
            || (props.layout && props.layout !== self._l.layout)
            || (props.zindex !== undefined && props.zindex !== self._l.metadata.zindex)) {
          if (self._m) {
            self.remove();
            addBack = true;
          }
          self._l.type = props.type || self._l.type;
          self._l.paint = props.paint || self._l.paint;
          self._l.layout = props.layout || self._l.layout;
          self._l.metadata.zindex = props.zindex || self._l.metadata.zindex;
          if (addBack) {
            self.add(options.map);
          }
          return;
        }
        if (props.paint || props.layout || props.data) {
          update(!props.data);
        }
      }
    }

    function image(name, url, size, _images, fn) {
      (_images || images).add({
        _m: self._m,
        ready: true
      }, name, url, size, fn);
    }

    function zindex(zi) {
      return option('zIndex', zi);
    }

    self = object(Object.assign(self, {
      image: image,
      option: option,
      update: update,
      zindex: zindex
    }), {
      onadd: onadd,
      onremove: onremove
    });

    if (options.map) {
      images = options.map._images;
      layers = options.map._layers;
    }

    id += 1;
    options = create(self, id, options);
    self._l.source.data.properties.map_facade = true;

    self.zindexLevel = self.zindexLevel || 0;
    self._l.metadata = self._l.metadata || {};
    self._l.metadata.zindex = Math.round((options.zIndex || 0) + self.zindexLevel);

    if (options.map) {
      self.add(options.map);
    }

    return self;
  };

}
