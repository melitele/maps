var load = require('load');
var merge = require('lodash.assign');

function prepareUrl(url, params) {
  return url + '?' + Object.keys(params)
    .map(function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

function init(opts, fn) {
  var protocol, util;
  opts = merge({
    v: '3'
  }, opts);
  // always use our callback
  opts.callback = "_google_maps_init";
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
  util.isGCJ02 = util.isGCJ02 || opts.isGCJ02;

  return {
    info: require('./info'),
    map: require('./map'),
    marker: require('./marker'),
    polyline: require('./polyline'),
    projection: require('./projection'),
    styles: require('./styles'),
    util: util
  };
}

module.exports = init;
