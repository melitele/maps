var object = require('./object');
var merge = require('lodash.assign');

module.exports = layer;

var id = 0;

function layer(paint, create) {

  return function (options) {
    var self;

    function onadd() {
      self._m.addLayer(merge({}, self._l));
    }

    function onremove() {
      self._m.removeLayer(self._l.id);
      self._m.removeSource(self._l.id);
    }

    function update() {
      if (self._m) {
        self._m.getSource(self._l.id).setData(self._l.source.data);
      }
    }

    function option(key, value) {
      var prop = paint[key];
      if (value === undefined) {
        if (prop) {
          return self._l.paint[prop];
        }
        if (key === 'visible') {
          return self._l.layout.visibility !== 'none';
        }
        return options[key];
      }

      if (prop) {
        if (typeof prop === 'function') {
          value = prop(value);
          merge(self._l.paint, value);
          Object.keys(value).forEach(function (prop) {
            self._m.setPaintProperty(self._l.id, prop, value[prop]);
          });
          return;
        }
        self._l.paint[prop] = value;
        if (self._m) {
          self._m.setPaintProperty(self._l.id, prop, value);
        }
        return;
      }
      if (key === 'visible') {
        self._l.layout.visibility = value ? 'visible' : 'none';
        if (self._m) {
          self._m.setLayoutProperty(self._l.id, 'visibility', self._l.layout.visibility);
        }
      }
      options[key] = value;
    }

    self = object({
      update: update,
      option: option
    }, {
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