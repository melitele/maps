// marker implemented as layer (without using Mapbox Marker)

var draggable = require('./draggable');

module.exports = marker;

var paint = {
};

function create(self, id, options) {
  var label = options.label,
    clickable = options.clickable,
    s;
  options = Object.assign({
    zIndex: options.zIndex
  }, options.icon);

  self._s = {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        marker: true
      },
      geometry: {
        type: 'Point',
        coordinates: options.position || [0, 0]
      }
    }
  };
  s = id = '' + id;
  self.layerField = '_l';
  if (clickable) {
    self._l = {
      id: id,
      source: s,
      layout: {},
      paint: {}
    };
    id += '-';
    self.layerField = '_under';
  }
  self[self.layerField] = {
    id: id,
    source: s,
    metadata: {
      marker: true
    },
    layout: {},
    paint: {}
  };
  if (label) {
    self[self.layerField].layout['text-field'] = '' + label;
    self[self.layerField].layout['text-allow-overlap'] = true;
    self[self.layerField].layout['text-max-width'] = 100;
    self[self.layerField].paint['text-color'] = options.textColor || '#FFFFFF';
    self[self.layerField].layout['text-size'] = options.textSize || 10;
    if (options.textBelow) {
      self[self.layerField].paint['text-translate'] = [0, SIZE[1] / 2 + 2];
    }
    else {
      self[self.layerField].paint['text-halo-width'] = 0.25;
      self[self.layerField].paint['text-halo-color'] = 'rgba(255,255,255,1)';
    }
  }
  return options;
}

var layer = require('./layer')(paint, create);

var SIZE = [16, 16];
var pixelRatio = window.devicePixelRatio || 1;

function offset(icon) {
  var r, scale = icon.scale || 1, size = icon.size;
  if (icon.anchor) {
    size = size || SIZE;
    icon.offset = [Math.round(pixelRatio * (size[0] / 2 / scale - icon.anchor[0])),
      Math.round(pixelRatio * (size[1] / 2 / scale - icon.anchor[1]))];
    return icon.offset;
  }
  if (size) {
    icon.offset = [- Math.round(pixelRatio * size[0] / 4 / scale),
      - Math.round(pixelRatio * size[1] / 2 / scale)];
    return [0, icon.offset[1]];
  }
  r = - scale - Math.round(icon.strokeWeight / 2);
  icon.offset = [r, r];
  return icon.offset;
}

function marker(options) {
  var self, iconPath = {
    circle: setIcon.bind(undefined, circle, 'circle'),
    forward_closed_arrow: forwardClosedArrow
  }, animating, interval;

  function remove() {
    self.remove();
    self[self.layerField].layout = {};
    self[self.layerField].paint = {};
    if (self._under) {
      self._l.layout = {};
      self._l.paint = {};
    }
  }

  function position(p) {
    if (p === undefined) {
      return self._s.data.geometry.coordinates;
    }
    self._s.data.geometry.coordinates = p;
    self.update();
  }

  function nextFrame(params) {
    params.counter += params.delta;
    if (params.counter === params.range || !params.counter) {
      params.delta = - params.delta;
    }
  }

  function animateSymbol(params) {
    if (self._m._loaded) {
      self._m.setPaintProperty(self[self.layerField].id, 'icon-translate', [0, - params.counter]);
      nextFrame(params);
    }
  }

  function animateCircle(params) {
    if (self._m._loaded) {
      self._m.setPaintProperty(self[self.layerField].id, 'circle-translate', [0, - params.counter]);
      nextFrame(params);
    }
  }

  function startBounce() {
    var fn, params;
    if (interval) {
      return;
    }
    params = {
      counter: 0,
      delta: 4
    };
    if (self[self.layerField].type === 'symbol') {
      params.range = Math.abs(self[self.layerField].layout['icon-offset'][1] * self[self.layerField].layout['icon-size']);
      fn = animateSymbol;
    }
    else {
      params.range = self[self.layerField].paint['circle-radius'] * 8;
      fn = animateCircle;
    }
    params.range += params.delta - params.range % params.delta;
    interval = setInterval(fn.bind(undefined, params), 200);
  }

  function stopBounce() {
    if (!interval) {
      return;
    }
    clearInterval(interval);
    self._m.setPaintProperty(self[self.layerField].id,
        self[self.layerField].type === 'symbol' ? 'icon-translate' : 'circle-translate', [0, 0]);
    interval = undefined;
    return true;
  }

  function animation(type) {
    if (animating !== type) {
      animating = type;
      setTimeout(self.fire.bind(self, 'animation_changed'), 1);
      if (type === 'bounce') {
        startBounce();
      }
      else if (!type) {
        stopBounce();
      }
    }
  }

  function updateLayer() {
    self.update(true);
  }

  function image(icon, off, images) {
    var name = icon.path || icon.url;
    if (!name) {
      return;
    }
    self.image(name, icon.url, icon.size, images, updateLayer);
    if (self._under) {
      self._l.type = 'symbol';
      self._l.layout['icon-image'] = name;
      self._l.paint['icon-opacity'] = 0;
      self._l.layout['icon-size'] = (icon.scale || 1) / pixelRatio;
      self._l.layout['icon-rotate'] = icon.rotation || 0;
      self._l.layout['icon-offset'] = off;
      self._l.layout['icon-allow-overlap'] = true;
    }
    self[self.layerField].type = 'symbol';
    self[self.layerField].layout['icon-image'] = name;
    self[self.layerField].paint['icon-opacity'] = 1;
    self[self.layerField].layout['icon-size'] = (icon.scale || 1) / pixelRatio;
    self[self.layerField].layout['icon-rotate'] = icon.rotation || 0;
    self[self.layerField].layout['icon-offset'] = off;
    self[self.layerField].layout['icon-allow-overlap'] = true;
  }

  function circle(icon) {
    if (self._under) {
      self._l.type = 'circle';
      self._l.paint['circle-opacity'] = 0;
      self._l.paint['circle-radius'] = options.margin;
      self._l.paint['circle-translate'] = [0, 0];
    }
    self[self.layerField].type = 'circle';
    self[self.layerField].paint['circle-radius'] = (icon.scale || 2) - 1;
    self[self.layerField].paint['circle-color'] = icon.fillColor || '#FFFFFF';
    self[self.layerField].paint['circle-opacity'] = icon.fillOpacity || 0;
    self[self.layerField].paint['circle-stroke-color'] = icon.strokeColor;
    self[self.layerField].paint['circle-stroke-opacity'] = icon.strokeOpacity || 1;
    self[self.layerField].paint['circle-stroke-width'] = icon.strokeWeight;
  }

  function setIcon(fn, type, icon, off) {
    var bounce;
    if (self[self.layerField].type  && self[self.layerField].type !== type && self._m) {
      bounce = stopBounce();
      remove();
      fn(icon, off, options.map && options.map._images);
      self.add(options.map);
      if (bounce) {
        startBounce();
      }
    }
    else {
      if (self[self.layerField].type  && self[self.layerField].type !== type) {
        self[self.layerField].layout = {};
        self[self.layerField].paint = {};
        if (self._under) {
          self._l.layout = {};
          self._l.paint = {};
        }
      }
      fn(icon, off, options.map && options.map._images);
      updateLayer();
    }
  }

  function forwardClosedArrow(icon) {
    var d = 2 * (icon.scale + icon.strokeWeight + 1),
      w = icon.strokeWeight,
      r = icon.scale + w + 1,
      s = Math.floor(w / 2),
      points = [
        [r, s].join(','),
        [2 * r - w, 2 * r - s].join(','),
        [r, 2 * r - w - s].join(','),
        [w, 2 * r - s].join(',')
      ].join(' '),
      size = [d, 2 * d],
      url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0]
        + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(' ')
        + '"><polygon points="' + points + '" stroke="' + icon.strokeColor
        + '" stroke-width="' + (icon.strokeWeight - 1) + '"';

    if (icon.fillColor) {
     url += ' fill="' + icon.fillColor + '"';
    }
    if (icon.fillOpacity !== undefined) {
      url += ' fill-opacity="' + icon.fillOpacity + '"';
    }
    url += '/></svg>';

    return {
      url: 'data:image/svg+xml;base64,' + btoa(url),
      path: icon.path,
      anchor: [d / 2, 0],
      size: size,
      scale: 1,
      rotation: icon.rotation
    };
  }

  function path(icon) {
    var size = icon.size || SIZE,
      scale = icon.scale || 1,
      anchor = icon.anchor,
      url;
    if (icon.scale !== 1) {
      size = [Math.round(size[0] * scale), Math.round(size[1] * scale)];
    }
    url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0]
      + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(' ')
      + '"><path d="' + icon.path + '" stroke="' + icon.strokeColor
      + '" stroke-width="' + icon.strokeWeight + '"';

    if (icon.fillColor) {
     url += ' fill="' + icon.fillColor + '"';
    }
    if (icon.fillOpacity !== undefined) {
      url += ' fill-opacity="' + icon.fillOpacity + '"';
    }
    if (scale !== 1) {
      url += ' transform="scale(' + scale + ')"';
    }
    url += '/></svg>';

    if (anchor) {
      anchor = [Math.round(anchor[0] * scale), Math.round(anchor[1] * scale)];
    }
    return {
      url: 'data:image/svg+xml;base64,' + btoa(url),
      path: url,
      anchor: anchor,
      size: size,
      scale: 1,
      rotation: icon.rotation
    };
  }

  function initIcon(color, icon) {
    icon = Object.assign(icon.url ? {
      scale: 1
    } : {
      path: 'circle',
      strokeColor:  '#555555',
      strokeWeight: 2,
      scale: 7
    }, icon);
    if (color !== undefined) {
      icon.fillColor = color;
      icon.fillOpacity = icon.fillOpacity || 1;
    }
    else {
      icon.fillOpacity = icon.fillOpacity || 0;
    }
    return icon;
  }

  function icon(i) {
    var fn;
    if (i === undefined) {
      return options.icon;
    }
    i = options.icon = initIcon(i.color, i);

    if (i.path === 'circle' && self[self.layerField].layout['text-field']) {
      // circle doesn't support text properties
      i.path = 'M 15 8 A 7 7 0 1 0 1 8 A 7 7 0 1 0 15 8';
      if (i.scale) {
        if (i.strokeWeight) {
          i.scale -= i.strokeWeight;
        }
        i.scale *= 0.14;
      }
      else {
        i.scale = 1;
      }
      i.anchor = [SIZE[0] / 2, SIZE[1] / 2];
    }
    if (i.path && !i.url) {
      fn = iconPath[i.path] || path;
      if (fn) {
        i = options.icon = fn(i);
        if (!i) {
          return;
        }
      }
    }
    setIcon(image, 'symbol', i, offset(i));
  }

  options = Object.assign({
    margin: 10,
    clickable: true,
    flat: true,
    icon: {}
  }, options);
  options.icon = initIcon(options.color, options.icon);

  self = layer({
    animation: animation,
    icon: icon,
    position: position,
    zindexLevel: 1000000
  }, options);
  self = draggable(self, options);

  self.icon(options.icon);

  if (options.position) {
    self.position(options.position);
  }

  if (options.map) {
    self.add(options.map);
  }

  return self;
}
