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
  var protocol;
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
  protocol = window.location.protocol;
  if (protocol == 'file:') {
    protocol = 'http:';
  }
  load(prepareUrl(protocol + '//maps.googleapis.com/maps/api/js', opts));
}

module.exports = {
  init: init,
  collate: require('./lib/collate'),
  info: require('./lib/info'),
  map: require('./lib/map'),
  marker: require('./lib/marker'),
  outline: require('./lib/outline'),
  polyline: require('./lib/polyline'),
  projection: require('./lib/projection'),
  spread: require('./lib/spread'),
  styles: require('./lib/styles'),
  util: require('./lib/util')
};