var merge = require('lodash.assign');
var object = require('./object');

module.exports = layer;

var id = 0;

function layer(paint, create) {

  return function (self, options) {

    function addLayer(l) {
      self._m.addLayer(merge({}, l));
    }

    function removeLayer(l) {
      self._m.removeLayer(l.id);
    }

    function onadd() {
      if (self._s) {
        self._m.addSource(self._l.id, self._s);
      }
      if (self._under) {
        addLayer(self._under);
      }
      addLayer(self._l);
    }

    function onremove() {
      removeLayer(self._l);
      if (self._under) {
        removeLayer(self._under);
      }
      self._m.removeSource(self._l.id);
    }

    function update() {
      if (self._m) {
        self._m.getSource(self._l.id).setData((self._s || self._l.source).data);
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
        return options[key];
      }

      if (prop) {
        if (typeof prop === 'function') {
          value = prop(value);
          merge(l.paint, value);
          Object.keys(value).forEach(function (prop) {
            self._m.setPaintProperty(l.id, prop, value[prop]);
          });
          return;
        }
        l.paint[prop] = value;
        if (self._m) {
          self._m.setPaintProperty(l.id, prop, value);
        }
        return;
      }
      if (key === 'visible') {
        self._l.layout.visibility = value ? 'visible' : 'none';
        if (self._m) {
          self._m.setLayoutProperty(self._l.id, 'visibility', self._l.layout.visibility);
        }
      }
      if (key === 'draggable' && self.changeDraggable) {
        self.changeDraggable(value);
      }
      options[key] = value;
    }

    self = object(merge(self, {
      update: update,
      option: option
    }), {
      onadd: onadd,
      onremove: onremove
    });

    id += 1;
    options = create(self, id, options);

    if (options.map) {
      self.add(options.map);
    }

    return self;
  };

}