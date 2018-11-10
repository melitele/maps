const zoomControl = require('map-zoom-control');

const images = require('./images');
const object = require('./object');
const updater = require('./updater');
const util = require('./util');
const makeFeatureEventHandler = require('./feature-event-handler');
const query = require('./query');

module.exports = map;

/* global mapboxgl */

function customControl(options) {
  return {
    onAdd(map) {
      const ctrl = this;
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
    onRemove() {
      const ctrl = this;
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
    onAdd() {
      const ctrl = this;
      ctrl._events = [];
      mapTypeControlOptions.mapTypeIds.forEach(function (id) {
        const type = ctrl._container.appendChild(document.createElement('div'));
        const ev = {
          el: type,
          event: 'click',
          fn: fn.bind(undefined, id)
        };
        type.className = 'map-type';
        type.innerHTML = `<div>${customMapTypes[id].name}</div>`;
        type.addEventListener(ev.event, ev.fn);
        ctrl._events.push(ev);
      });
    },
    onRemove() {
      const ctrl = this;
      ctrl._events.forEach(ev => ev.type.removeEventListener(ev.event, ev.fn));
      delete ctrl._events;
    }
  });
}

function getAttribution(style) {
  if (!style) {
    return [];
  }
  let sourceCaches = style.sourceCaches;
  let attributions = Object.values(sourceCaches).reduce(function (attributions, sourceCache) {
    const source = sourceCache.getSource();
    if (source.attribution && attributions.indexOf(source.attribution) < 0) {
      attributions.push(source.attribution);
    }
    return attributions;
  }, []);

  // remove any entries that are substrings of another entry.
  // first sort by length so that substrings come first
  attributions.sort((a, b) => a.length - b.length);
  attributions = attributions.filter(function (attrib, i) {
    for (let j = i + 1; j < attributions.length; j += 1) {
      if (attributions[j].indexOf(attrib) >= 0) {
        return false;
      }
    }
    return true;
  });
  return attributions.join(' ');
}

function transition(prop) {
  const _m = this;
  _m[prop] = Object.assign(function (options) {
    if (options.zoom) {
      options.zoom = Math.floor(options.zoom);
    }
    _m[prop].superior.apply(this, arguments);
  }, {
    superior: _m[prop]
  });
}

function map(node, options) {
  const controlPosition = {
    BL: 'bottom-left',
    LB: 'bottom-left',
    BR: 'bottom-right',
    RB: 'bottom-right',
    TL: 'top-left',
    LT: 'top-left',
    TR: 'top-right',
    RT: 'top-right'
  };

  let self;
  let mapTypeId;
  let styles;

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
    if (b === undefined) {
      return util.mbounds2bounds(self._m.getBounds());
    }
    let opt = {
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

  function refresh(source) {
    if (!source) {
      return self._m.resize();
    }
    var layers = [];
    layers.source = source;
    layers._layers = self._m.style._layers;
    layers = self._m.style._order.reduce(function (result, key, i, layers) {
      var layer = result._layers[key];
      if (layer.source === result.source) {
        result.unshift({
          layer: layer.serialize(),
          before: layers[i + 1]
        });
      }
      return result;
    }, layers);
    layers.forEach(function ({ layer }) {
      self._m.removeLayer(layer.id);
    });
    var sourceDef = self._m.getSource(source).serialize();
    self._m.removeSource(source);
    self._m.addSource(source, sourceDef);
    layers.forEach(function ({ layer, before }) {
      self._m.addLayer(layer, before);
    });
  }

  function setVisibility(style) {
    var visibility = this;
    if (self._m.getLayer(style.layer.id)) {
      self._m.setLayoutProperty(style.layer.id, 'visibility',
          style.visibility(visibility) ? 'visible' : 'none');
    }
  }

  function applyVisibility(visibility) {
    styles.visibility.forEach(setVisibility, visibility);
  }

  function checkSingleProperty(property, object) {
    return object[property];
  }

  function checkProperty(property) {
    var object = this;
    return checkSingleProperty(property, object);
  }

  function checkAnyProperty(properties, object) {
    return properties.some(checkProperty, object);
  }

  function checkAllProperties(properties, object) {
    return properties.every(checkProperty, object);
  }

  function initStyles() {
    if (!styles) {
      let style = self._m.getStyle();
      if (style.layers) {
        styles = style.layers.reduce((result, layer) => {
          if (layer.metadata) {
            if (layer.metadata.visibility) {
              var visibility;
              if (Array.isArray(layer.metadata.visibility)) {
                if (layer.metadata.visibility[0] === 'all') {
                  visibility = checkAllProperties.bind(undefined, layer.metadata.visibility.slice(1));
                }
                else {
                  visibility = checkAnyProperty.bind(undefined, layer.metadata.visibility.slice(1));
                }
              }
              else {
                visibility = checkSingleProperty.bind(undefined, layer.metadata.visibility);
              }
              result.visibility.push({
                layer,
                visibility
              });
            }
            if (layer.metadata.zindex) {
              let zi = layer.metadata.zindex;
              self._layers[zi] = self._layers[zi] || [];
              self._layers[zi].unshift(layer);
            }
          }
          if (layer['source-layer'] === 'poi') {
            result.poi.push(layer.id);
          }
          return result;
        }, {
          poi: [],
          visibility: []
        });
        applyVisibility(options.visibility);
      }
    }
  }

  function callback(e) {
    if (e.dataType === 'style') {
      initStyles();
      if (options.onReady) {
        options.onReady(self);
      }
    }
  }

  function addControl(el, position) {
    self._m.addControl(customControl({
      el
    }), controlPosition[position]);
    return self;
  }

  function ll(e) {
    if (e && e.lngLat) {
      e.ll = util.mll2ll(e.lngLat);
    }
  }

  function queryRenderedFeatures(point, options = {}) {
    if (options.layers === undefined && styles) {
      options.layers = styles.poi;
    }
    return query(self._m, point, 3, options).map(({ properties }) => properties);
  }

  function visibility(key, value) {
    if (key === undefined) {
      return options.visibility;
    }
    if (typeof key === 'object') {
      options.visibility = key;
    }
    else {
      options.visibility[key] = value;
    }
    applyVisibility(options.visibility);
  }

  function destroy() {
    if (self._updater) {
      self._updater.destroy();
      delete self._updater;
    }
    if (self._m) {
      self.off();
      self._m.remove();
      self._images.destroy();
      delete self._m;
      delete self._images;
      delete self._layers;
    }
    styles = undefined;
  }

  options = Object.assign({
    mapboxgl,
    container: node,
    mapTypeControl: false,
    style: {
      version: 8,
      sources: {},
      layers: []
    },
    visibility: {}
  }, options);

  self = object({
    addControl,
    bounds,
    center,
    destroy,
    element,
    fitBounds: bounds, // obsolete; use bounds(b)
    ll,
    mapType,
    panBy,
    panToBounds,
    queryRenderedFeatures,
    refresh,
    visibility,
    zoom
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

  [
    'mapTypeControlOptions',
    'zoomControlOptions',
    'fullscreenControlOptions'
  ].forEach(function(ctrlOptions) {
    ctrlOptions = options[ctrlOptions];
    if (ctrlOptions && ctrlOptions.position) {
      ctrlOptions.position = controlPosition[ctrlOptions.position] || ctrlOptions.position;
    }
  });

  self._m = new options.mapboxgl.Map(options);
  self._m.touchZoomRotate.disableRotation();
  self._featureEventHandler = makeFeatureEventHandler(self._m);
  self._images = images();
  self._layers = {};
  self._updater = updater();

  // ensure integral zoom
  ['flyTo', 'easeTo'].forEach(transition, self._m);

  self._m.once('styledata', callback);

  if (options.mapTypeControl) {
    self._m.addControl(mapTypeControl(options.mapTypeControlOptions, options.customMapTypes, function(id) {
      mapTypeId = id;
      self._m.fire('maptypeid_changed');
    }), (options.mapTypeControlOptions && options.mapTypeControlOptions.position) || 'bottom-left');
  }
  if (options.zoomControl) {
    self._m.addControl(zoomControl(),
        (options.zoomControlOptions && options.zoomControlOptions.position) || 'bottom-right');
  }
  if (options.attribution) {
    self._m.on('data', function (event) {
      if (event.dataType !== 'source') {
        return;
      }
      const attribution = getAttribution(event.style);
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
