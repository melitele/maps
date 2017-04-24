var merge = require('lodash.assign');
var object = require('./object');
var q = require('query');
var util = require('./util');

module.exports = marker;

var svgNS = "http://www.w3.org/2000/svg";
var iconPath = {
   circle: {
     el: 'circle',
     attributes: {
       cx: zero,
       cy: zero,
       scale: 'r',
       fillColor: 'fill',
       fillOpacity: 'fill-opacity',
       strokeColor: 'stroke',
       strokeWeight: 'stroke-width'
     },
     viewBox: circle
   },
   forward_closed_arrow: {
     el: 'polygon',
     attributes: {
       scale: points,
       rotation: rotate,
       fillColor: 'fill',
       fillOpacity: 'fill-opacity',
       strokeColor: 'stroke',
       strokeWeight: strokeWidth
     },
     viewBox: polygon
   },
   path: {
     el: 'path',
     attributes: {
       path: 'd',
       scale: scale,
       fillColor: 'fill',
       fillOpacity: 'fill-opacity',
       strokeColor: 'stroke',
       strokeWeight: 'stroke-width'
     },
     viewBox: path
   }
};

/* global mapboxgl */

function offset(icon) {
  var r;
  if (icon.anchor) {
    return [- Math.round(icon.anchor[0] * icon.scale), - Math.round(icon.anchor[1] * icon.scale)];
  }
  r = - icon.scale - Math.round(icon.strokeWeight / 2);
  return [r, r];
}

function drawIcon(iEl, icon, attributes) {
  Object.keys(attributes).forEach(function (attr) {
    var name, value = icon[attr];
    if (value !== undefined) {
      name = attributes[attr];
      if (typeof name === 'function') {
        name = name(icon, attr);
        value = name.value;
        name = name.name;
      }
      iEl.setAttribute(name, value);
    }
  });
}

function draw(icon) {
  var iP, vB, sEl, cEl;

  iP = iconPath[icon.path] || iconPath.path;
  vB = iP.viewBox(icon);

  sEl = document.createElementNS(svgNS, 'svg');
  sEl.setAttribute('width', vB[2]);
  sEl.setAttribute('height', vB[3]);
  sEl.setAttribute('viewBox', vB.join(' '));

  cEl = sEl.appendChild(document.createElementNS(svgNS, iP.el));
  drawIcon(cEl, icon, iP.attributes);

  return sEl;
}

function circle(icon) {
  var w = Math.round(icon.strokeWeight / 2), d = 2 * (icon.scale + w), r = - icon.scale - w;
  return [r, r, d, d];
}

function polygon(icon) {
  var d = 2 * (icon.scale + icon.strokeWeight + 1);
  return [0, 0, d, d];
}

function path(icon) {
  var d = Math.round(16 * icon.scale);
  return [0, 0, d, d];
}

function zero(icon, attr) {
  return {
    name: attr,
    value: 0
  };
}

function points(icon) {
  var w = icon.strokeWeight, r = icon.scale + w + 1, s = Math.floor(w / 2);
  return {
    name: 'points',
    value: [
      [r, s].join(','),
      [2 * r - w, 2 * r - s].join(','),
      [r, 2 * r - w - s].join(','),
      [w, 2 * r - s].join(',')
    ].join(' ')
  };
}

function rotate(icon) {
  var w = icon.strokeWeight, r = icon.scale + w + 1;
  return {
    name: 'transform',
    value: 'rotate(' + [icon.rotation, r, r].join(' ') + ')'
  };
}

function scale(icon) {
  return {
    name: 'transform',
    value: 'scale(' + icon.scale + ')'
  };
}

function strokeWidth(icon) {
  return {
    name: 'stroke-width',
    value: icon.strokeWeight - 1
  };
}

function marker(options) {
  var self, el, map;

  function add(mp) {
    if (self.position()) {
      self._m.addTo(mp._m);
    }
    else {
      map = mp;
    }
    return self;
  }

  function remove() {
    map = undefined;
    self._m.remove();
    return self;
  }

  function option(key, value) {
    if (value === undefined) {
      return options[key];
    }
    options[key] = value;
  }

  function position(p) {
    if (p === undefined) {
      p = self._m.getLngLat();
      if (!p) {
        return;
      }
      return util.mll2ll(p);
    }
    self._m.setLngLat(p);
    if (map) {
      self.add(map);
      map = undefined;
    }
  }

  function animation() {
    //TODO implement bounce as a CSS transformation
  }

  function image(icon) {
    var img;
    if (!icon.url) {
      return;
    }
    img = q('img', el);
    if (!img) {
      el.innerHTML = '';
      img = el.appendChild(document.createElement('img'));
    }
    img.setAttribute('src', icon.url);
  }

  function icon(i) {
    var iEl, path;
    if (i === undefined) {
      //TODO implement getter
      return;
    }
    if (!i.path) {
      return image(i);
    }
    path = iconPath[i.path] || iconPath.path;
    iEl = q(path.el, el);
    if (iEl) {
      drawIcon(iEl, i, path.attributes);
    }
    else {
      el.innerHTML = '';
      i = merge(merge({}, options.icon), i);
      el.appendChild(draw(i));
    }
  }

  function zindex() {
    return el.style.zIndex;
  }

  options = merge({
    flat: true,
    icon: {}
  }, options);
  options.icon = merge({
    path: 'circle',
    strokeColor:  '#555555',
    strokeWeight: 2,
    scale: 7
  }, options.icon);
  if (options.color !== undefined) {
    options.icon.fillColor = options.color;
    options.icon.fillOpacity = 1;
  }
  else {
    options.icon.fillOpacity = 0;
  }

  el = document.createElement('div');

  self = object({
    animation: animation,
    add: add,
    icon: icon,
    option: option,
    position: position,
    remove: remove,
    zindex: zindex
  }, {
    el: el
  });

  self._m = new mapboxgl.Marker(el, {
    offset: offset(options.icon)
  });

  self.icon(options.icon);

  if (options.position) {
    self.position(options.position);
  }

  if (options.map) {
    self.add(options.map);
  }

  return self;
}
