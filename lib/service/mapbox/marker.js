/*global global */

// marker implemented as layer (without using Mapbox Marker)

var draggable = require('./draggable');

module.exports = marker;

var iconPath = {
  circle: circleIcon,
  forward_closed_arrow: forwardClosedArrow
};

var SIZE = [16, 16];
var pixelRatio = global.devicePixelRatio || 1;

var LAYOUT = {
  circle: {},
  symbol: {
    'icon-image': [ 'get', 'iconImage' ],
    'icon-size': [ 'get', 'iconSize' ],
    'icon-rotate': [ 'get', 'iconRotate' ],
    'icon-offset': [ 'get', 'iconOffset' ],
    'icon-allow-overlap': true
  },
  label: {
    'icon-image': [ 'get', 'iconImage' ],
    'icon-size': [ 'get', 'iconSize' ],
    'icon-rotate': [ 'get', 'iconRotate' ],
    'icon-offset': [ 'get', 'iconOffset' ],
    'icon-allow-overlap': true,
    'text-field': [ 'get', 'label' ],
    'text-allow-overlap': true,
    'text-max-width': 100,
    'text-size': [ 'get', 'textSize' ]
  }
}, PAINT = {
  circle: {
    'circle-radius': [ 'get', 'circleRadius' ],
    'circle-color': [ 'get', 'fillColor' ],
    'circle-opacity': [ 'get', 'fillOpacity' ],
    'circle-stroke-color': [ 'get', 'strokeColor' ],
    'circle-stroke-opacity': [ 'get', 'strokeOpacity' ],
    'circle-stroke-width': [ 'get', 'strokeWeight' ],
    'circle-translate': [0, 0]
  },
  animateCircle: {
    'circle-radius': [ 'get', 'circleRadius' ],
    'circle-color': [ 'get', 'fillColor' ],
    'circle-opacity': [ 'get', 'fillOpacity' ],
    'circle-stroke-color': [ 'get', 'strokeColor' ],
    'circle-stroke-opacity': [ 'get', 'strokeOpacity' ],
    'circle-stroke-width': [ 'get', 'strokeWeight' ],
    'circle-translate': [0, 0]
  },
  symbol: {
    'icon-opacity': [ 'get', 'fillOpacity' ],
    'icon-translate': [0, 0]
  },
  animateSymbol: {
    'icon-opacity': [ 'get', 'fillOpacity' ],
    'icon-translate': [0, 0]
  },
  label: {
    'icon-opacity': [ 'get', 'fillOpacity' ],
    'icon-translate': [0, 0],
    'text-color': [ 'get', 'textColor' ],
    'text-halo-width': 0.25,
    'text-halo-color': 'rgba(255,255,255,1)'
  },
  below: {
    'icon-opacity': [ 'get', 'fillOpacity' ],
    'icon-translate': [0, 0],
    'text-color': [ 'get', 'textColor' ],
    'text-translate': [0, SIZE[1] / 2 + 2]
  }
};

function image(icon) {
  return {
    type: 'symbol',
    image: {
      name: icon.iconImage,
      url: icon.url,
      size: icon.size
    },
    data: icon,
    layout: LAYOUT[icon.label ? 'label' : 'symbol'],
    paint: PAINT[icon.label ? (icon.textBelow ? 'below' : 'label') : 'symbol']
  };
}

function circle(icon) {
  return {
    type: 'circle',
    data: icon,
    layout: LAYOUT.circle,
    paint: PAINT.circle
  };
}

function circleIcon(icon) {
  return Object.assign(icon, {
    circleRadius: (icon.scale || 2) - 1
  });
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
  url += '/></svg>';

  return Object.assign(icon, {
    url: 'data:image/svg+xml;base64,' + btoa(url),
    path: icon.path,
    anchor: [d / 2, 0],
    size: size,
    scale: 1,
    rotation: icon.rotation
  });
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
  if (scale !== 1) {
    url += ' transform="scale(' + scale + ')"';
  }
  url += '/></svg>';

  if (anchor) {
    anchor = [Math.round(anchor[0] * scale), Math.round(anchor[1] * scale)];
  }
  return Object.assign(icon, {
    url: 'data:image/svg+xml;base64,' + btoa(url),
    path: url,
    anchor: anchor,
    size: size,
    scale: 1,
    rotation: icon.rotation
  });
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
    if (icon.fillOpacity === undefined) {
      icon.fillOpacity = 1;
    }
  }
  else if (icon.path === 'circle') {
    icon.fillOpacity = icon.fillOpacity || 0;
  }
  else if (icon.fillOpacity === undefined) {
    icon.fillOpacity = 1;
  }
  icon.fillColor = icon.fillColor || '#FFFFFF';
  icon.strokeOpacity = icon.strokeOpacity || 1;
  icon.textColor = icon.textColor || '#FFFFFF';
  icon.textSize = icon.textSize || 10;
  return icon;
}

function animationPaint(translate, options) {
  var circle = options.icon && options.icon.path === 'circle' && !options.label,
    paint = PAINT[circle ? 'animateCircle' : 'animateSymbol'];
  if (translate) {
    paint[circle ? 'circle-translate' : 'icon-translate'] = translate;
    return paint;
  }
  // clear translate in animated style
  paint[circle ? 'circle-translate' : 'icon-translate'] = [0, 0];
  // return non-aninmated paint spec
  return PAINT[circle
    ? 'circle'
    : (options.label
        ? ((options.icon && options.icon.textBelow) ? 'below' : 'label')
        : 'symbol')];
}

function getChangedProperties(key, i, options) {
  if (key === 'icon') {
    i = initIcon(i.color, i);
    if (i.path === 'circle' && i.label) {
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
      i = (iconPath[i.path] || path)(i);
      if (!i) {
        return;
      }
    }
    i.iconOffset = offset(i);
    if (i.path === 'circle') {
      return circle(i);
    }
    i.iconImage = i.path || i.url;
    if (!i.iconImage) {
      return;
    }
    i.iconSize = (i.scale || 1) / pixelRatio;
    i.iconRotate = i.rotation || 0;
    return image(i);
  }
  if (key === 'animation') {
    return {
      paint: animationPaint(i, options)
    };
  }
  if (key === 'visible') {
    if (i) {
      return {
        update: true,
        data: {
          fillOpacity: options.fillOpacity,
          strokeOpacity: options.strokeOpacity
        }
      };
    }
    else {
      return {
        update: true,
        data: {
          fillOpacity: 0,
          strokeOpacity: 0
        }
      };
    }
  }}

function create(self, id, options) {
  var icon = Object.assign({
    color: options.color,
    label: (options.label && ('' + options.label)),
    zIndex: options.zIndex
  }, options.icon);

  self._l = {
    id: '' + id,
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: options.position || [0, 0]
        }
      }
    },
    metadata: {
      marker: true
    },
  };
  icon = getChangedProperties('icon', icon);
  self._l.source.data.properties = icon.data;
  self._l.type = icon.type;
  self._l.layout = icon.layout;
  self._l.paint = icon.paint;
  if (icon.image) {
    self.image(icon.image.name,
        icon.image.url,
        icon.image.size,
        options.map && options.map._images,
        self.update);
  }
  return options;
}

var layer = require('./layer')(getChangedProperties, create);

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
  var self, animating, interval;

  function position(p) {
    if (p === undefined) {
      return self._l.source.data.geometry.coordinates;
    }
    self._l.source.data.geometry.coordinates = p;
    self.update();
  }

  function nextFrame(params) {
    params.counter += params.delta;
    if (params.counter >= params.range || params.counter <= 0) {
      params.delta = - params.delta;
    }
  }

  function animateMarker(params) {
    if (self._m._loaded) {
      self.option('animation', [0, - params.counter]);
      nextFrame(params);
    }
  }

  function startBounce() {
    var params, properties;
    if (interval) {
      return;
    }
    params = {
      counter: 0,
      delta: 4
    };
    properties = self._l.source.data.properties;
    if (self._l.type === 'symbol') {
      params.range = Math.abs(properties.iconOffset[1] * properties.iconSize);
    }
    else {
      params.range = properties.circleRadius * 8;
    }
    params.range += params.delta - params.range % params.delta;
    interval = setInterval(animateMarker.bind(undefined, params), 200);
  }

  function stopBounce() {
    if (!interval) {
      return;
    }
    clearInterval(interval);
    interval = undefined;
    self.option('animation', false);
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

  function icon(i) {
    var bounce;
    if (i === undefined) {
      return self.option('icon', i);
    }
    bounce = stopBounce();
    if (options.label) {
      i.label = '' + options.label;
    }
    self.option('icon', i);
    if (bounce) {
      startBounce();
    }
  }

  // adjust position when dragging to associate tip of the marker with active spot
  function dragPosition(e) {
    var properties = self._l.source.data.properties;
    if (properties.url && properties.iconOffset) {
      e.lngLat = self._m.unproject({
        x: e.point.x - properties.iconOffset[0] / 2,
        y: e.point.y - properties.iconOffset[1] / 2
      });
      self.ll(e);
    }
    return e;
  }

  options = Object.assign({
    margin: 10,
    clickable: true,
    flat: true,
    icon: {}
  }, options);

  self = layer({
    animation: animation,
    dragPosition: dragPosition,
    icon: icon,
    position: position,
    zindexLevel: 1000000
  }, options);
  self = draggable(self, options);

  if (options.position) {
    self.position(options.position);
  }

  if (options.map) {
    self.add(options.map);
  }

  return self;
}
