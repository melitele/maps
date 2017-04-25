var load = require('load');

function prepareUrl(url, params) {
  return url + '?' + Object.keys(params)
    .map(function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

function init(options, fn) {
  var protocol, util, opts = {
    v: options.v || '3',
    key: options.key,
    libraries: options.libraries,
    // always use our callback
    callback: '_google_maps_init'
  };
  if (typeof window !== 'undefined') {
    window._google_maps_init = function() {
      delete window._google_maps_init;
      window.google.maps.visualRefresh = true;
      if (typeof fn === 'function') {
        fn();
      }
    };

    protocol = window.location.protocol;
    if (protocol == 'file:') {
      protocol = 'http:';
    }
    load(prepareUrl(protocol + '//maps.googleapis.com/maps/api/js', opts));
  }

  util = require('./util');
  util.isGCJ02 = util.isGCJ02 || options.isGCJ02;

  return {
    circle: require('./circle'),
    info: require('./info'),
    map: require('./map'),
    marker: require('./marker'),
    polygon: require('./polygon'),
    polyline: require('./polyline'),
    projection: require('./projection'),
    styles: require('./styles'),
    util: util
  };
}

module.exports = init;
