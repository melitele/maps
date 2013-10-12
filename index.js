var load = require('load');
var object = require('object');
var merge = object.merge;
var keys = object.keys;

function prepareUrl(url, params) {
  return url + '?' + keys(params)
    .map(function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
}

function init(opts, fn) {
  if (!fn) {
    fn = opts;
    opts = {};
  }
  window._google_maps_init = function() {
    delete window._google_maps_init;
    window.google.maps.visualRefresh = true;
    if (typeof fn === 'function') {
      fn();
    }
  };

  opts = merge({
    sensor: false,
    v: '3.13'
  }, opts);
  // always use our callback
  opts.callback = "_google_maps_init";
  load(prepareUrl('http://maps.googleapis.com/maps/api/js', opts));
}

module.exports = {
  init: init,
  map: require('./lib/map'),
  marker: require('./lib/marker'),
  info: require('./lib/info')
};