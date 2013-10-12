function gll2ll(gll) {
  return [gll.lng(), gll.lat()];
}

function ll2gll(ll) {
  var LatLng = gm().LatLng;
  return new LatLng(ll[1], ll[0]);
}

function bounds2gbounds(b) {
  var LatLngBounds = gm().LatLngBounds;
  b = b.map(ll2gll);
  return new LatLngBounds(b[0], b[1]);
}


function decodePath(path) {
  return gm().geometry.encoding.decodePath(path);
}

function gm() {
  if (!window.google || !window.google.maps) {
    throw 'Google Maps not initialized properly: call maps.init()';
  }
  return window.google.maps;
}

module.exports = {
  decodePath: decodePath,
  gll2ll: gll2ll,
  ll2gll: ll2gll,
  bounds2gbounds: bounds2gbounds,
  gm: gm
};