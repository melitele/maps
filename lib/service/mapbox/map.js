var images = require('./images');
var object = require('./object');
var util = require('./util');

module.exports = map;

/* global mapboxgl */

function customControl(options) {
  return {
    onAdd: function (map) {
      var ctrl = this;
      ctrl._map = map;
      ctrl._container = document.createElement('div');
      ctrl._container.className = 'mapboxgl-ctrl';
      if (options.el) {
        ctrl._container.appendChild(options.el);
      }
      if (options.onAdd) {
        options.onAdd.call(ctrl, map);
      }
      return ctrl._container;
    },
    onRemove: function () {
      var ctrl = this;
      if (options.el) {
        ctrl._container.removeChild(options.el);
      }
      if (options.onRemove) {
        options.onRemove.call(ctrl);
      }
      ctrl._container.parentNode.removeChild(ctrl._container);
      delete ctrl._container;
      delete ctrl._map;
    }
  };
}

function mapTypeControl(mapTypeControlOptions, customMapTypes, fn) {
  return customControl({
    onAdd: function () {
      var ctrl = this;
      ctrl._events = [];
      mapTypeControlOptions.mapTypeIds.forEach(function (id) {
        var type = ctrl._container.appendChild(document.createElement('div')),
          ev = {
            el: type,
            event: 'click',
            fn: fn.bind(undefined, id)
          };
        type.className = 'map-type';
        type.innerHTML = '<div>' + customMapTypes[id].name + '</div>';
        type.addEventListener(ev.event, ev.fn);
        ctrl._events.push(ev);
      });
    },
    onRemove: function () {
      var ctrl = this;
      ctrl._events.forEach(function (ev) {
        ev.type.removeEventListener(ev.event, ev.fn);
      });
      delete ctrl._events;
    }
  });
}

function getAttribution(style) {
  var sourceCaches, attributions;
  if (!style) {
    return [];
  }
  sourceCaches = style.sourceCaches;
  attributions = Object.keys(sourceCaches).reduce(function (attributions, id) {
    var source = sourceCaches[id].getSource();
    if (source.attribution && attributions.indexOf(source.attribution) < 0) {
      attributions.push(source.attribution);
    }
    return attributions;
  }, []);

  // remove any entries that are substrings of another entry.
  // first sort by length so that substrings come first
  attributions.sort(function (a, b) {
    return a.length - b.length;
  });
  attributions = attributions.filter(function(attrib, i) {
    var j;
    for (j = i + 1; j < attributions.length; j += 1) {
      if (attributions[j].indexOf(attrib) >= 0) {
        return false;
      }
    }
    return true;
  });
  return attributions.join(' ');
}

function transition(prop) {
  var _m = this;
  _m[prop] = Object.assign(function (options) {
    if (options.zoom) {
      options.zoom = Math.floor(options.zoom);
    }
    _m[prop].superior.apply(this, arguments);
  }, {
    superior: _m[prop]
  });
}

function mapUnits(units) {
  return units === 'km' ? 'metric' : 'imperial';
}

function map(node, options) {
  var controlPosition = {
      BL: 'bottom-left',
      LB: 'bottom-left',
      BR: 'bottom-right',
      RB: 'bottom-right',
      TL: 'top-left',
      LT: 'top-left',
      TR: 'top-right',
      RT: 'top-right'
    }, self, mapTypeId;

  function element() {
    return node;
  }

  function center(c) {
    if (!c) {
      return util.mll2ll(self._m.getCenter());
    }
    self._m.setCenter(c);
  }

  function zoom(z) {
    if (z === undefined) {
      return Math.round(self._m.getZoom() + 1);
    }
    self._m[self._m.isStyleLoaded() ? 'zoomTo' : 'setZoom'](z - 1);
  }

  function bounds(b) {
    var opt;
    if (b === undefined) {
      return util.mbounds2bounds(self._m.getBounds());
    }
    opt = {
      padding: 100
    };
    if (!self._m.isStyleLoaded()) {
      opt.animate = false;
    }
    self._m.fitBounds(b, opt);
  }

  function panToBounds(bounds) {
    // display north-west corner
    self._m.panTo([bounds[1][0], bounds[0][1]]);
    return self;
  }

  function panBy(x, y) {
    self._m.panBy([x, y]);
    return self;
  }

  function mapType() {
    return mapTypeId;
  }

  function refresh() {
    self._m.resize();
  }

  function callback() {
    options.onReady(self);
  }

  function addControl(el, position) {
    self._m.addControl(customControl({
      el: el
    }), controlPosition[position]);
    return self;
  }

  function ll(e) {
    var features;
    if (e.type === 'click') {
      features = self._m.queryRenderedFeatures(e.point, {
        filter: ['has', 'map_facade']
      });
      if (features && features.length) {
        // swallow clicks on layers (for the same behavior as Google maps)
        return;
      }
    }
    if (e && e.lngLat) {
      e.ll = util.mll2ll(e.lngLat);
    }
  }

  function units(u) {
    if (u === undefined) {
      return options.units;
    }
    options.units = u;
    if (options.scaleControl) {
      self._m.removeControl(options.scaleControl);
      options.scaleControl = new mapboxgl.ScaleControl({
        unit: mapUnits(u)
      });
      self._m.addControl(options.scaleControl, options.scaleControlOptions.position);
    }
  }

  function destroy() {
    if (self._m) {
      self.off();
      self._m.remove();
      images.destroy();
      delete self._m;
    }
  }

  options = Object.assign({
    container: node,
    scaleControl: true,
    mapTypeControl: false,
    style: {
      version: 8,
      sources: {},
      layers: []
    }
  }, options);

  self = object({
    addControl: addControl,
    bounds: bounds,
    center: center,
    destroy: destroy,
    element: element,
    fitBounds: bounds, // obsolete; use bounds(b)
    ll: ll,
    mapType: mapType,
    panBy: panBy,
    panToBounds: panToBounds,
    refresh: refresh,
    units: units,
    zoom: zoom
  });

  if (options.zoom) {
    options.zoom -= 1;
  }
  if (options.minZoom) {
    options.minZoom -= 1;
  }
  if (options.maxZoom) {
    options.maxZoom -= 1;
  }
  if (options.scaleControl === true) {
    options.scaleControl = {};
  }
  if (options.units && options.scaleControl) {
    options.scaleControl.unit = mapUnits(options.units);
  }

  [
    'mapTypeControlOptions',
    'scaleControlOptions',
    'zoomControlOptions',
    'fullscreenControlOptions'
  ].forEach(function (ctrlOptions) {
    ctrlOptions = options[ctrlOptions];
    if (ctrlOptions && ctrlOptions.position) {
      ctrlOptions.position = controlPosition[ctrlOptions.position] || ctrlOptions.position;
    }
  });

  self._m = new mapboxgl.Map(options);

  // ensure integral zoom
  ['flyTo', 'easeTo'].forEach(transition, self._m);

  if (options.onReady) {
    self._m.once('styledata', callback);
  }

  if (options.mapTypeControl) {
    self._m.addControl(mapTypeControl(options.mapTypeControlOptions, options.customMapTypes, function (id) {
      mapTypeId = id;
      self._m.fire('maptypeid_changed');
    }), (options.mapTypeControlOptions && options.mapTypeControlOptions.position) || 'bottom-left');
  }
  if (options.scaleControl) {
    options.scaleControl = new mapboxgl.ScaleControl(options.scaleControl);
    options.scaleControlOptions = options.scaleControlOptions || {};
    options.scaleControlOptions.position = options.scaleControlOptions.position || 'bottom-right';
    self._m.addControl(options.scaleControl, options.scaleControlOptions.position);
  }
  if (options.zoomControl) {
    self._m.addControl(new mapboxgl.NavigationControl(),
        (options.zoomControlOptions && options.zoomControlOptions.position) || 'bottom-right');
  }
  if (options.fullscreenControl) {
    self._m.addControl(new mapboxgl.FullscreenControl(),
        (options.fullscreenControlOptions && options.fullscreenControlOptions.position) || 'top-right');
  }
  if (options.attribution) {
    self._m.on('data', function (event) {
      if (event.dataType !== 'source') {
        return;
      }
      var attribution = getAttribution(event.style);
      if (typeof options.attribution === 'function') {
        return options.attribution((attribution.match(/href="[^"]+/g) || []).map(function (attr) {
          attr = attr.slice(6);
          attr = attr.match(/(?:http:|https:)?\/\/([^\/?]+)/);
          if (attr) {
            attr = attr[1].split('.');
            if (attr.length > 1) {
              attr = attr[attr.length - 2];
            }
          }
          return attr;
        }));
      }
      options.attribution.innerHTML = attribution;
    });
  }
  return self;
}
