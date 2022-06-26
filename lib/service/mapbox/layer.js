const object = require('./object');

module.exports = layer;

let id = 0;

function updateProperty(key) {
  const params = this;
  params.m[params.set](params.id, key, params.values[key]);
}

function updateProperties(m, id, layer, prop, set) {
  Object.keys(layer[prop]).forEach(updateProperty, {
    id,
    values: layer[prop],
    m,
    set,
  });
}

function noop() {
}

function inLayer(searchedLayer, layer) {
  return layer.id === searchedLayer.id ||
    (layer.type === searchedLayer.type
      && layer.layout === searchedLayer.layout
      && layer.paint === searchedLayer.paint);
}

function isFeature(id, feature) {
  return id === feature.id;
}

function doUpdate(data) {
  let { m, l } = data;
  delete l._updateCounter;
  m.getSource(l.source.data.id).setData(l.source.data);
}

function checkUpdate(data) {
  data.l._updateCounter += 1;
  return data.l._updateCounter > 500;
}

function updateLayer(updater, m, l) {
  if (!updater) {
    return;
  }
  l._updateCounter = l._updateCounter || 0;
  updater.reschedule(l.id, doUpdate, {
    m,
    l
  }, checkUpdate, 200);
}

function layer(getChangedProperties, create) {

  getChangedProperties = getChangedProperties || noop;

  return function (self, options) {
    let added, addBack, images, layers, updater;

    function afterLayer(l) {
      let zi, before;
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
      const zi = l.metadata.zindex;
      layers[zi] = layers[zi] || [];
      layers[zi].unshift(l);
      self._m.addLayer(Object.assign({}, l), before);
    }

    function findLayer(l) {
      const zi = l.metadata.zindex;
      let idx;
      if (!layers[zi]) {
        return;
      }
      idx = layers[zi].findIndex(inLayer.bind(undefined, l));
      if (idx > -1) {
        return layers[zi][idx];
      }
    }

    function onadd(map) {
      let l;
      if (added) {
        return;
      }
      if (!self._m) {
        // object removed from map before it was rendered
        return;
      }
      options.map = map;
      updater = updater || map._updater;
      layers = layers || map._layers;
      self._l.source.data.id = self._l.source.data.id || self._l.id;
      l = findLayer(self._l);
      if (l) {
        if (typeof l.source === 'string') {
          l.source = {
            data: {
              id: l.source,
              type: 'FeatureCollection',
              features: []
            }
          };
        }
        l.source.data.features.unshift(self._l.source.data);
        updateLayer(updater, self._m, l);
      }
      else {
        id += 1;
        l = {
          id: '' + id,
          type: self._l.type,
          source: {
            type: 'geojson',
            data: {
              id: '' + id,
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
      self.layerId = l.id;
      added = true;
      images = images || map._images;
      images.init({
        _m: self._m,
        ready: true
      });
    }

    function onremove() {
      let l, idx;
      if (!added) {
        return;
      }
      added = undefined;
      if (!addBack && self.cancelDrag) {
        self.cancelDrag();
      }
      l = findLayer(self._l);
      if (l) {
        idx = l.source.data.features.findIndex(isFeature.bind(undefined, self._l.source.data.id));
        if (idx > -1) {
          l.source.data.features.splice(idx, 1);
          updateLayer(updater, self._m, l);
        }
      }
      delete self.layerId;
      images = undefined;
      layers = undefined;
    }

    function update(layer) {
      let l, idx;
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
            updateLayer(updater, self._m, l);
          }
        }
      }
    }

    function option(key, value) {
      let props;
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
            addBack = options.map;
            self.remove();
          }
          self._l.type = props.type || self._l.type;
          self._l.paint = props.paint || self._l.paint;
          self._l.layout = props.layout || self._l.layout;
          self._l.metadata.zindex = props.zindex || self._l.metadata.zindex;
          if (addBack) {
            self.add(options.map);
            addBack = undefined;
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
      image,
      option,
      update,
      zindex
    }), {
      onadd,
      onremove
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
