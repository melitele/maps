var util = require('./util'),
  merge = require('object').merge;

module.exports = label;

function label(options) {
  var _gm = util.gm(), self, span, div, listeners;

  function add(marker) {
    self._g.bindTo('map', marker._g, 'map');
    self._g.bindTo('position', marker._g, 'position');
    return self;
  }

  function remove() {
    self._g.unbind('map');
    self._g.unbind('position');
    self._g.setMap(null);
    return self;
  }

  function onAdd() {
    var _g = this, pane;

    pane = _g.getPanes().overlayImage;
    pane.appendChild(div);

    listeners = [
      _gm.event.addListener(this, 'position_changed', draw.bind(_g)),
      _gm.event.addListener(this, 'text_changed', draw.bind(_g)),
      _gm.event.addListener(this, 'zindex_changed', draw.bind(_g))
    ];
  }

  function onRemove() {
    div.parentNode.removeChild(div);
    listeners.forEach(_gm.event.removeListener);
  }

  function draw() {
    var _g = this, projection, position;
    projection = _g.getProjection();
    position = projection.fromLatLngToDivPixel(_g.get('position'));
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

  self._g = merge(new _gm.OverlayView(), {
    onAdd: onAdd,
    onRemove: onRemove,
    draw: draw
  });

  if (options.marker) {
    self.add(options.marker);
  }
  return self;
}