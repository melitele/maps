// marker implemented as layer (without using Mapbox Marker)

var draggable = require('./draggable');

module.exports = marker;

var paint = {
};

function create(self, id, options) {
  var label = options.label;
  options = Object.assign({}, options.icon);

  self._l = {
    id: '' + id,
    source: {
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
    },
    metadata: {
      marker: true
    },
    layout: {},
    paint: {}
  };
  if (label) {
    self._l.layout['text-field'] = '' + label;
    self._l.layout['text-max-width'] = 100;
    self._l.paint['text-color'] = options.textColor || '#FFFFFF';
    self._l.layout['text-size'] = options.textSize || 10;
    if (options.textBelow) {
      self._l.paint['text-translate'] = [0, SIZE[1] / 2 + 2];
    }
    else {
      self._l.paint['text-halo-width'] = 0.25;
      self._l.paint['text-halo-color'] = 'rgba(255,255,255,1)';
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
    return [Math.round(pixelRatio * (size[0] / 2 / scale - icon.anchor[0])),
            Math.round(pixelRatio * (size[1] / 2 / scale - icon.anchor[1]))];
  }
  if (size) {
    return [0, - Math.round(pixelRatio * size[1] / 2 / scale)];
  }
  r = - scale - Math.round(icon.strokeWeight / 2);
  return [r, r];
}

function marker(options) {
  var self, iconPath = {
    circle: setIcon.bind(undefined, circle, 'circle'),
    forward_closed_arrow: forwardClosedArrow
  }, animating, interval;

  function remove() {
    self.remove();
    self._l.layout = {};
    self._l.paint = {};
  }

  function position(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = p;
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
      self._m.setPaintProperty(self._l.id, 'icon-translate', [0, - params.counter]);
      nextFrame(params);
    }
  }

  function animateCircle(params) {
    if (self._m._loaded) {
      self._m.setPaintProperty(self._l.id, 'circle-translate', [0, - params.counter]);
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
    if (self._l.type === 'symbol') {
      params.range = Math.abs(self._l.layout['icon-offset'][1] * self._l.layout['icon-size']);
      fn = animateSymbol;
    }
    else {
      params.range = self._l.paint['circle-radius'] * 8;
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
    self._m.setPaintProperty(self._l.id,
        self._l.type === 'symbol' ? 'icon-translate' : 'circle-translate', [0, 0]);
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

  function image(icon, off) {
    var name = icon.path || icon.url;
    if (!name) {
      return;
    }
    self.image(name, icon.url, icon.size);
    self._l.type = 'symbol';
    self._l.layout['icon-image'] = name;
    self._l.layout['icon-size'] = (icon.scale || 1) / pixelRatio;
    self._l.layout['icon-rotate'] = icon.rotation || 0;
    self._l.layout['icon-offset'] = off;
  }

  function circle(icon) {
    self._l.type = 'circle';
    self._l.paint['circle-radius'] = (icon.scale || 2) - 1;
    self._l.paint['circle-color'] = icon.fillColor || '#FFFFFF';
    self._l.paint['circle-opacity'] = icon.fillOpacity || 0;
    self._l.paint['circle-stroke-color'] = icon.strokeColor;
    self._l.paint['circle-stroke-opacity'] = icon.strokeOpacity || 1;
    self._l.paint['circle-stroke-width'] = icon.strokeWeight;
  }

  function setIcon(fn, type, icon, off) {
    var m, bounce;
    if (self._l.type  && self._l.type !== type && self._m) {
      m = self._m;
      bounce = stopBounce();
      remove();
      fn(icon, off);
      self.add({
        _m: m
      });
      if (bounce) {
        startBounce();
      }
    }
    else {
      fn(icon, off);
      self.update(true);
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

  function icon(i) {
    var fn;
    if (i === undefined) {
      //TODO implement getter
      return;
    }
    if (i.path === 'circle' && self._l.layout['text-field']) {
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
        i = fn(i);
        if (!i) {
          return;
        }
      }
    }
    setIcon(image, 'symbol', i, offset(i));
  }

  options = Object.assign({
    clickable: true,
    flat: true,
    icon: {}
  }, options);
  options.icon = Object.assign(options.icon.url ? {
    scale: 1
  } : {
    path: 'circle',
    strokeColor:  '#555555',
    strokeWeight: 2,
    scale: 7
  }, options.icon);
  if (options.color !== undefined) {
    options.icon.fillColor = options.color;
    options.icon.fillOpacity = options.icon.fillOpacity || 1;
  }
  else {
    options.icon.fillOpacity = options.icon.fillOpacity || 0;
  }
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
