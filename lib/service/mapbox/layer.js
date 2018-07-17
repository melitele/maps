var object = require('./object');

module.exports = layer;

var id = 0;

function updateProperty(key) {
  var params = this;
  params.m[params.set](params.id, key, params.values[key]);
}

function updateProperties(m, layer, prop, set) {
  Object.keys(layer[prop]).forEach(updateProperty, {
    id: layer.id,
    values: layer[prop],
    m: m,
    set: set,
  });
}

function noop() {
}

function layer(getChangedProperties, create) {

  getChangedProperties = getChangedProperties || noop;

  return function (self, options) {
    var added, images, layers;

    function afterLayer(l) {
      var zi, before;
      zi = l.metadata.zindex;
      if (layers[zi] && layers[zi].length) {
        return layers[zi][0];
      }
      layers.some(function (ids, i) {
        if (i > zi && ids.length) {
          before = ids[0];
          return true;
        }
      });
      return before;
    }

    function addLayer(l, before, moving) {
      var zi = l.metadata.zindex;
      layers[zi] = layers[zi] || [];
      layers[zi].unshift(l.id);
      if (!moving) {
        self._m.addLayer(Object.assign({}, l), before);
      }
    }

    function removeLayer(l, moving) {
      var zi = l.metadata.zindex;
      layers[zi].splice(layers[zi].indexOf(l.id), 1);
      if (!layers[zi].length) {
        delete layers[zi];
      }
      if (!moving) {
        self._m.removeLayer(l.id);
      }
    }

    function onadd(map) {
      if (added) {
        return;
      }
      if (!self._m) {
        // object removed from map before it was rendered
        return;
      }
      layers = layers || map._layers;
      addLayer(self._l, afterLayer(self._l));
      added = true;
      images = images || map._images;
      images.init({
        _m: self._m,
        ready: true
      });
    }

    function onremove() {
      if (!added) {
        return;
      }
      added = undefined;
      removeLayer(self._l);
      self._m.removeSource(self._l.id);
      images = undefined;
      layers = undefined;
    }

    function update(layer) {
      if (self._m && added) {
        if (layer) {
          updateProperties(self._m, self._l, 'paint', 'setPaintProperty');
          updateProperties(self._m, self._l, 'layout', 'setLayoutProperty');
        }
        self._m.getSource(self._l.id).setData(self._l.source.data);
      }
    }

    function option(key, value) {
      var props;
      if (value === undefined) {
        if (key === 'visible') {
          return self._l.layout.visibility !== 'none';
        }
        if (key === 'zIndex') {
          return self.zindex();
        }
        return self._l.source.data.properties[key] || options[key];
      }

      if (key === 'visible') {
        self._l.layout.visibility = value ? 'visible' : 'none';
        if (self._m && added) {
          self._m.setLayoutProperty(self._l.id, 'visibility', self._l.layout.visibility);
        }
      }
      else if (key === 'draggable' && self.changeDraggable) {
        self.changeDraggable(value);
      }
      else if (key === 'zIndex') {
        self.zindex(value);
      }
      else {
        if (options[key] === value) {
          return;
        }
        props = getChangedProperties(key, value);
        options[key] = value;
        if (self._l.source.data.properties.hasOwnProperty(key)) {
          self._l.source.data.properties[key] = value;
        }
        if (!props) {
          update();
          return;
        }
        // changing this property requires changing the layer
        if (props.paint) {
          self._l.paint = props.paint;
        }
        if (props.layout) {
          self._l.layout = props.layout;
        }
        if (props.data) {
          self._l.source.data.properties = props.data;
        }
        if (props.image) {
          self.image(props.image.name,
              props.image.url,
              props.image.size,
              options.map && options.map._images,
              self.update);
        }
        if (props.type && props.type !== self._l.type) {
          self._l.type = props.type;
          if (self._m) {
            self.remove();
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

    function zindex(zi, l) {
      l = l || self._l;
      if (zi === undefined) {
        return l.metadata.zindex - self.zindexLevel;
      }
      zi = Math.round(zi + self.zindexLevel);
      if (zi !== l.metadata.zindex) {
        if (self._m && added) {
          removeLayer(l, true);
        }
        self._l.metadata.zindex = zi;
        if (self._m && added) {
          self._m.moveLayer(l.id, afterLayer(l));
          addLayer(l, undefined, true);
        }
      }
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
