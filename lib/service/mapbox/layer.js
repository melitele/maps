var images = require('./images');
var object = require('./object');

module.exports = layer;

var id = 0;
var layers = [];

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

function layer(paint, create) {

  return function (self, options) {
    var added;

    function data() {
      return (self._s || self._l.source).data;
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

    function onadd() {
      if (added) {
        return;
      }
      if (!self._m) {
        // object removed from map before it was rendered
        return;
      }
      if (self._s) {
        self._m.addSource(self._l.id, self._s);
      }
      if (self._under) {
        addLayer(self._under, afterLayer(self._under));
      }
      addLayer(self._l, afterLayer(self._l));
      added = true;
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
      if (self._under) {
        removeLayer(self._under);
      }
      self._m.removeSource(self._l.id);
    }

    function update(layer) {
      if (self._m && added) {
        if (layer) {
          updateProperties(self._m, self._l, 'paint', 'setPaintProperty');
          updateProperties(self._m, self._l, 'layout', 'setLayoutProperty');
          return;
        }
        self._m.getSource(self._l.id).setData(data());
      }
    }

    function option(key, value) {
      var prop = paint[key], l = self._under || self._l;
      if (value === undefined) {
        if (prop) {
          return l.paint[prop];
        }
        if (key === 'visible') {
          return self._l.layout.visibility !== 'none';
        }
        if (key === 'zIndex') {
          return self.zindex();
        }
        return options[key];
      }

      if (prop) {
        if (typeof prop === 'function') {
          value = prop(value);
          Object.assign(l.paint, value);
          if (self._m && added) {
            Object.keys(value).forEach(function (prop) {
              self._m.setPaintProperty(l.id, prop, value[prop]);
            });
          }
          return;
        }
        l.paint[prop] = value;
        if (self._m && added) {
          self._m.setPaintProperty(l.id, prop, value);
        }
        return;
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
      else if (key === 'outlineZIndex' && self._under) {
        self.zindex(value, self._under);
      }
      options[key] = value;
    }

    function image(name, url, size) {
      images.add({
        _m: self._m,
        ready: true
      }, name, url, size);
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

    id += 1;
    options = create(self, id, options);
    data().properties.map_facade = true;

    self.zindexLevel = self.zindexLevel || 0;
    self._l.metadata = self._l.metadata || {};
    self._l.metadata.zindex = Math.round((options.zIndex || 0) + self.zindexLevel);

    if (options.map) {
      self.add(options.map);
    }

    return self;
  };

}
