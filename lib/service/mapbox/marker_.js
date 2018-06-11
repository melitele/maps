// artifact added to map implemented as layer

var artifact = require('./artifact');
var images = require('./images');

module.exports = marker;

/*global global */
var pixelRatio = global.devicePixelRatio || 1;
var SIZE = [16, 16];

function image(self, name, url, size) {
  images.add({
    _m: self.map._m,
    ready: true
  }, name, url, size);
}

function offset(scale, size, anchor) {
  if (anchor) {
    size = size || SIZE;
    return [Math.round(pixelRatio * (size[0] / 2 / scale - anchor[0])),
            Math.round(pixelRatio * (size[1] / 2 / scale - anchor[1]))];
  }
  if (size) {
    return [0, - Math.round(pixelRatio * size[1] / 2 / scale)];
  }
}

function forwardClosedArrow(self, properties) {
  var d = 2 * (properties.scale + properties.strokeWeight + 1),
    w = properties.strokeWeight,
    r = properties.scale + w + 1,
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
      + '"><polygon points="' + points + '" stroke="' + properties.strokeColor
      + '" stroke-width="' + (properties.strokeWeight - 1) + '"';

  if (properties.fillColor) {
   url += ' fill="' + properties.fillColor + '"';
  }
  if (properties.fillOpacity !== undefined) {
    url += ' fill-opacity="' + properties.fillOpacity + '"';
  }
  url += '/></svg>';

  properties.path = url;
  properties.offset = offset(1, size, [d / 2, 0]);
  properties.rotation = properties.rotation || 0;
  properties.scale = 1 / pixelRatio;

  image(self, properties.path, 'data:image/svg+xml;base64,' + btoa(url), size);
}

function path(self, properties) {
  var size = properties.size || SIZE,
    scale = properties.scale || 1,
    anchor = properties.anchor,
    url;
  if (properties.scale !== 1) {
    size = [Math.round(size[0] * scale), Math.round(size[1] * scale)];
  }
  url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0]
    + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(' ')
    + '"><path d="' + properties.path + '" stroke="' + properties.strokeColor
    + '" stroke-width="' + properties.strokeWeight + '"';

  if (properties.fillColor) {
   url += ' fill="' + properties.fillColor + '"';
  }
  if (properties.fillOpacity !== undefined) {
    url += ' fill-opacity="' + properties.fillOpacity + '"';
  }
  if (scale !== 1) {
    url += ' transform="scale(' + scale + ')"';
  }
  url += '/></svg>';

  if (anchor) {
    anchor = [Math.round(anchor[0] * scale), Math.round(anchor[1] * scale)];
  }

  properties.path = url;
  properties.offset = offset(1, size, anchor);
  properties.rotation = properties.rotation || 0;
  properties.scale = 1 / pixelRatio;

  image(self, properties.path, 'data:image/svg+xml;base64,' + btoa(url), size);
}

function icon(properties) {
  properties.scale = 1 / pixelRatio;
  properties.offset = offset(1, properties.size, properties.anchor);
}

function marker(options) {

  function init(self) {
    var layer = self._m.getLayer(options.layer), iconImage = layer.layout && layer.layout['icon-image'];
    if (iconImage) {
      if (typeof(iconImage) === 'string') {
        image(self, iconImage, iconImage, (layer.metadata && layer.metadata['facade:icon-size']) || SIZE, true);
        options.properties.scale = (options.properties.scale || 1);// / pixelRatio;
      }
    }
    if (options.properties.url) {
      icon(options.properties);
    }
    else if (options.properties.path === 'forward_closed_arrow') {
      forwardClosedArrow(self, options.properties);
    }
    else if (options.properties.path) {
      path(self, options.properties);
    }
  }

  options = Object.assign({
    clickable: true,
    properties: {},
    init: init
  }, options);

  if (options.properties.color !== undefined) {
    options.properties.fillColor = options.properties.color;
    options.properties.fillOpacity = options.properties.fillOpacity || 1;
  }
  else {
    options.properties.fillOpacity = options.properties.fillOpacity || 0;
  }

  return artifact(options);
}
