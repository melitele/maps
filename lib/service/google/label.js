var merge = require('lodash.assign');
var util = require('./util');

module.exports = label;

function label(options) {
  var _gm = util.gm(), self, span, div, listeners;

  function add(marker) {
    self._m.bindTo('map', marker._m, 'map');
    self._m.bindTo('position', marker._m, 'position');
    return self;
  }

  function remove() {
    self._m.unbind('map');
    self._m.unbind('position');
    self._m.setMap(null);
    return self;
  }

  function onAdd() {
    var _m = this, pane;

    pane = _m.getPanes().overlayImage;
    pane.appendChild(div);

    listeners = [
      _gm.event.addListener(this, 'position_changed', draw.bind(_m)),
      _gm.event.addListener(this, 'text_changed', draw.bind(_m)),
      _gm.event.addListener(this, 'zindex_changed', draw.bind(_m))
    ];
  }

  function onRemove() {
    div.parentNode.removeChild(div);
    listeners.forEach(_gm.event.removeListener);
  }

  function draw() {
    var _m = this, projection, position;
    projection = _m.getProjection();
    position = projection.fromLatLngToDivPixel(_m.get('position'));
    div.style.left = position.x + 'px';
    div.style.top = position.y + 'px';
    div.style.display = 'block';
    div.style.zIndex = 2000;
    span.innerHTML = options.text;

  }

  span = document.createElement('span');
  span.style.cssText = 'position: relative; left: -50%; line-height: 0;';

  div = document.createElement('div');
  div.setAttribute('class', 'marker-label');
  div.appendChild(span);
  div.style.cssText = 'position: absolute; display: none';

  self = {
    add: add,
    remove: remove
  };

  self._m = merge(new _gm.OverlayView(), {
    onAdd: onAdd,
    onRemove: onRemove,
    draw: draw
  });

  if (options.marker) {
    self.add(options.marker);
  }
  return self;
}