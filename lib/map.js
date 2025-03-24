const images = require('./images');
const object = require('./object');
const util = require('./util');
const makeFeatureEventHandler = require('./feature-event-handler');
const query = require('./query');
const { initVisibility, evalVisibility } = require('./style/visibility');
const { refresh: refreshFeatures } = require('./feature/source');

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

async function map(node, options) {
  let self;
  let mapTypeId;
  let styles;
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });


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

  function wait4style(wait = true) {
    if (wait) {
      self._m.on('styledata', callback);
      self._m.on('data', callback);
      return;
    }
    self._m.off('styledata', callback);
    self._m.off('data', callback);
  }

  function refresh(style) {
    if (!style) {
      return self._m.resize();
    }
    styles = undefined;
    wait4style();
    self._m.setStyle(style);
  }

  function initStyles() {
    if (styles) {
      return;
    }
    const style = self._m.getStyle();
    if (!style.layers) {
      return;
    }
    styles = style.layers.reduce((result, layer) => {
      if (layer.metadata) {
        let visibility = initVisibility(layer.id, layer.metadata.visibility);
        if (visibility) {
          result.visibility.push(visibility);
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
    self._images.refresh({
      _m: self._m,
      ready: true
    }).then(() => refreshFeatures(self));
  }

  function callback() {
    if (!self._m?.isStyleLoaded()) {
      return;
    }
    initStyles();
    resolve(self);
    wait4style(false);
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
    if (self._m) {
      self.off();
      self._m.remove();
      self._images.destroy();
      delete self._m;
      delete self._images;
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

  Object.assign(self, require('./zoom'));

  self._m = new options.mapboxgl.Map(options);
  self._m.touchZoomRotate.disableRotation();
  self._featureEventHandler = makeFeatureEventHandler(self._m);
  self._images = images();

  wait4style();

  return promise;
}
