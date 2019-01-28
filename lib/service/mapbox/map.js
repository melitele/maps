const images = require('./images');
const object = require('./object');
const updater = require('./updater');
const util = require('./util');
const makeFeatureEventHandler = require('./feature-event-handler');
const query = require('./query');
const { initCaching, evalCaching } = require('./style/caching');
const { initVisibility, evalVisibility } = require('./style/visibility');

module.exports = map;

/* global mapboxgl */

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

function getAttribution(result, attr) {
  attr = attr.slice(6).match(/(?:http:|https:)?\/\/([^\/?]+)/);
  if (attr) {
    attr = attr[1].split('.');
    if (attr.length > 1) {
      attr = attr[attr.length - 2];
    }
    if (attr) {
      result.push(attr);
    }
  }
  return result;
}

function preprocessDataEvent(event) {
  if (!(event.dataType === 'source' &&
      event.tile &&
      (event.tile.state === 'loaded' || event.tile.state === 'unloaded'))) {
    return true;
  }
  if (event.style &&
      event.style.sourceCaches &&
      event.sourceId) {
    // collect attributions
    let source = event.style.sourceCaches[event.sourceId];
    if (source.used) {
      let attribution = source.getSource().attribution;
      if (attribution) {
        attribution = attribution.match(/href="[^"]+/g);
        if (attribution) {
          event.attribution = attribution.reduce(getAttribution, []);
          event.attribution.metadata = event.source && event.source.metadata;
        }
      }
    }
  }
  if (event.source) {
    // track tile loading
    let source = event.source.url || (event.source.tiles && event.source.tiles[0]);
    if (source) {
      event.sourceHostname = new URL(source).hostname;
    }
  }
  return true;
}

function map(node, options) {
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

  function getSourceDefinition(source, deactivate) {
    const sourceDef = source.serialize();
    // when source is defined by url in metadata, it'll be loaded only once
    //   (the first time it is activated)
    // when source is defined by url, it'll be loaded everytime it is activated
    //   but not when it is deactivated
    if (!sourceDef.tiles) {
      if (deactivate) {
        if (!(sourceDef.metadata && sourceDef.metadata.url)) {
          // store source url in metadata so it won't be reloaded when deactivated
          sourceDef.metadata = sourceDef.metadata || {};
          sourceDef.metadata.copyUrl = sourceDef.url;
        }
        else if (source.tiles) {
          // reuse tile urls next time source is activated
          // note: sourceDef.tiles cannot be 'undefined' or mapbox-gl will throw exception
          sourceDef.tiles = source.tiles;
        }
        delete sourceDef.url;
      }
      else if (!sourceDef.url) {
        // copy source url from metadata first time source is activated
        sourceDef.url = sourceDef.metadata && (sourceDef.metadata.url || sourceDef.metadata.copyUrl);
      }
    }
    return sourceDef;
  }

  function refresh(source, deactivate) {
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
    const sourceDef = getSourceDefinition(self._m.getSource(source), deactivate);
    self._m.removeSource(source);
    self._m.addSource(source, sourceDef);
    layers.forEach(function ({ layer, before }) {
      self._m.addLayer(layer, before);
    });
  }

  function initStyles() {
    if (!styles) {
      let style = self._m.getStyle();
      if (style.layers) {
        styles = style.layers.reduce((result, layer) => {
          if (layer.metadata) {
            let visibility = initVisibility(layer.id, layer.metadata.visibility);
            if (visibility) {
              result.visibility.push(visibility);
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
        evalVisibility(self._m, styles.visibility, options.visibility);
      }
      if (style.metadata && style.metadata.caching) {
        let caching = initCaching('*', style.metadata.caching);
        if (caching) {
          styles.caching = [caching];
        }
      }
      if (style.sources) {
        styles.caching = Object.keys(style.sources).reduce((result, source) => {
          var metadata = style.sources[source].metadata;
          if (metadata) {
            let caching = initCaching(source, metadata.caching);
            if (caching) {
              result.push(caching);
            }
          }
          return result;
        }, styles.caching || []);
      }
      if (styles.caching) {
        evalCaching(self, mapboxgl.config, styles.caching, options.caching);
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
    evalVisibility(self._m, styles.visibility, options.visibility);
  }

  function caching(key, value) {
    if (key === undefined) {
      return options.caching;
    }
    if (typeof key === 'object') {
      options.caching = key;
    }
    else {
      options.caching[key] = value;
    }
    evalCaching(self, mapboxgl.config, styles.caching, options.caching);
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
    style: {
      version: 8,
      sources: {},
      layers: []
    },
    caching: {},
    visibility: {}
  }, options);

  self = object({
    bounds,
    caching,
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
  }, {
    preprocessEvent: {
      data: preprocessDataEvent
    }
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

  self._m = new options.mapboxgl.Map(options);
  self._m.touchZoomRotate.disableRotation();
  self._featureEventHandler = makeFeatureEventHandler(self._m);
  self._images = images();
  self._layers = {};
  self._updater = updater();

  // ensure integral zoom
  ['flyTo', 'easeTo'].forEach(transition, self._m);

  self._m.once('styledata', callback);

  return self;
}
