var merge = require('lodash.assign');
var object = require('./object');
var util = require('./util');

module.exports = marker;

var svgNS = "http://www.w3.org/2000/svg";

/* global mapboxgl */

function marker(options) {
  var self, el;

  function offset(icon) {
    var r = - icon.scale - 1;
    return [r, r];
  }

  function circle(icon) {
    var sEl, cEl, d = 2 * (icon.scale + 1), r = - icon.scale - 1;
    sEl = document.createElementNS(svgNS, 'svg');
    sEl.setAttribute('width', d);
    sEl.setAttribute('height', d);
    sEl.setAttribute('viewBox', [r, r, d, d].join(' '));

    cEl = sEl.appendChild(document.createElementNS(svgNS, 'circle'));
    cEl.setAttribute('cx', 0);
    cEl.setAttribute('cy', 0);
    cEl.setAttribute('r', icon.scale);
    cEl.setAttribute('fill', icon.fillColor);
    cEl.setAttribute('fill-opacity', icon.fillOpacity);
    cEl.setAttribute('stroke', icon.strokeColor);
    cEl.setAttribute('stroke-width', icon.strokeWeight);

    return sEl;
  }

  function add(map) {
    self._m.addTo(map._m);
    return self;
  }

  function remove() {
    self._m.remove();
    return self;
  }

  function position(p) {
    if (p === undefined) {
      return util.mll2ll(self._m.setLngLat());
    }
    self._m.setLngLat(p);
  }

  function animation() {
    //TODO implement bounce as a CSS transformation
  }

  function zindex() {
    return el.style.zIndex;
  }

  options = merge({
    flat: true,
    icon: {
      path: 'circle',
      fillColor: options.color,
      fillOpacity: 1,
      strokeColor:  '#555555',
      strokeWeight: 2,
      scale: 7
    }
  }, options);

  el = document.createElement('div');
  if (options.icon.path === 'circle') {
    el.appendChild(circle(options.icon));
  }

  self = object({
    add: add,
    remove: remove,
    position: position,
    animation: animation,
    zindex: zindex
  }, el);

  self._m = new mapboxgl.Marker(el, {
    offset: offset(options.icon)
  });

  if (options.position) {
    self.position(options.position);
  }

  if (options.map) {
    self.add(options.map);
  }

  return self;
}
