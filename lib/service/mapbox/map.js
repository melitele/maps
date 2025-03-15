const images = require('./images');
const object = require('./object');
const updater = require('./updater');
const util = require('./util');
const makeFeatureEventHandler = require('./feature-event-handler');
const query = require('./query');
const { initVisibility, evalVisibility } = require('./style/visibility');

module.exports = map;

/* global mapboxgl */

const SIZE = [16, 16];

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
  let sourceAttribution;
  if (event.style &&
      event.style.sourceCaches &&
      event.sourceId) {
    // collect attributions
    let source = event.style.sourceCaches[event.sourceId];
    if (source.used) {
      sourceAttribution = source.getSource().attribution;
      if (sourceAttribution) {
        const attribution = sourceAttribution.match(/href="[^"]+/g);
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
    event.source.attribution = event.source.attribution || sourceAttribution;
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
    let layers = [];
    layers.source = source;
    layers._layers = self._m.style._layers;
    layers = self._m.style._order.reduce(function (result, key, i, layers) {
      const layer = result._layers[key];
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
      layer.layout = self._sources[source][layer.id].layout;
      self._m.addLayer(layer, before);
    });
  }

  function initStyles() {
    if (!styles) {
      let style = self._m.getStyle();
      if (style.layers) {
        styles = style.layers.reduce((result, layer) => {
          if (layer.source) {
            self._sources[layer.source] = self._sources[layer.source] || {};
            self._sources[layer.source][layer.id] = layer;
          }
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
    return query(self._m, point, 3, options).map(({ properties, geometry }) => {
      if (geometry && geometry.type === 'Point') {
        return Object.assign({
          ll: geometry.coordinates
        }, properties);
      }
      return properties;
    });
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

  function path2url(url) {
    if (typeof url === 'string') {
      return url;
    }
    let {
      path,
      fillColor,
      strokeColor,
      strokeWeight,
      scale = 1,
      size = SIZE
    } = url;
    if (scale !== 1) {
      size = [Math.round(size[0] * scale), Math.round(size[1] * scale)];
    }
    url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0]
      + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(' ')
      + '"><path d="' + path + '" stroke="' + strokeColor
      + '" stroke-width="' + strokeWeight + '"';

    if (fillColor) {
     url += ' fill="' + fillColor + '"';
    }
    if (scale !== 1) {
      url += ' transform="scale(' + scale + ')"';
    }
    url += '/></svg>';
    return 'data:image/svg+xml;base64,' + btoa(url);
  }

  function registerImage(name, url, size = SIZE) {
    const map = {
      _m: self._m,
      ready: true
    };
    self._images.init(map);
    return self._images.add(map, name, path2url(url), size);
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
    visibility: {}
  }, options);

  self = object({
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
    zoom,
    registerImage
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
  self._sources = {};

  self._m.once('styledata', callback);

  return self;
}
