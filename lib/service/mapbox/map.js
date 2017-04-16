var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = map;

/* global mapboxgl */

function mapTypeControl(mapTypeControlOptions, customMapTypes, fn) {
  return {
    onAdd: function (map) {
      var ctrl = this;
      ctrl._map = map;
      ctrl._container = document.createElement('div');
      ctrl._container.className = 'mapboxgl-ctrl';
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
      return ctrl._container;
    },
    onRemove: function () {
      var ctrl = this;
      ctrl._events.forEach(function (ev) {
        ev.type.removeEventListener(ev.event, ev.fn);
      });
      delete ctrl._events;
      ctrl._container.parentNode.removeChild(this._container);
      delete ctrl._container;
      delete ctrl._map;
    }
  };
}

function map(node, options, fn) {
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
      return self._m.getZoom() + 1;
    }
    self._m.setZoom(z - 1);
  }

  function bounds() {
    return util.mbounds2bounds(self._m.getBounds());
  }

  function fitBounds(bounds) {
    self._m.fitBounds(bounds, {
      padding: 100
    });
    return self;
  }

  function panToBounds(bounds) {
    // display north-west corner
    self._m.panTo([bounds[1][0], bounds[0][1]]);
    return self;
  }

  function mapType() {
    return mapTypeId;
  }

  function refresh() {
    self._m.resize();
  }

  function callback() {
    self.off('styledata', callback);
    fn();
  }

  options = merge({
    container: node,
    scaleControl: true,
    mapTypeControl: false
  }, options);

  self = object({
    element: element,
    center: center,
    zoom: zoom,
    bounds: bounds,
    fitBounds: fitBounds,
    panToBounds: panToBounds,
    mapType: mapType,
    refresh: refresh
  });

  if (options.zoom) {
    options.zoom -= 1;
  }
  if (options.scaleControl === true) {
    options.scaleControl = {};
  }

  ['mapTypeControlOptions', 'scaleControlOptions', 'zoomControlOptions'].forEach(function (ctrlOptions) {
    ctrlOptions = options[ctrlOptions];
    if (ctrlOptions && ctrlOptions.position) {
      ctrlOptions.position = controlPosition[ctrlOptions.position] || ctrlOptions.position;
    }
  });

  self._m = new mapboxgl.Map(options);

  if (fn) {
    self.on('styledata', callback);
  }

  if (options.mapTypeControl) {
    self._m.addControl(mapTypeControl(options.mapTypeControlOptions, options.customMapTypes, function (id) {
      mapTypeId = id;
      self._m.fire('maptypeid_changed');
    }), (options.mapTypeControlOptions && options.mapTypeControlOptions.position) || 'bottom-left');
  }
  if (options.scaleControl) {
    self._m.addControl(new mapboxgl.ScaleControl(options.scaleControl),
        (options.scaleControlOptions && options.scaleControlOptions.position) || 'bottom-right');
  }
  if (options.zoomControl) {
    self._m.addControl(new mapboxgl.NavigationControl(),
        (options.zoomControlOptions && options.zoomControlOptions.position) || 'bottom-right');
  }
  return self;
}
