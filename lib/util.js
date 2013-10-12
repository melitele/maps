function gll2ll(gll) {
  return [gll.lng(), gll.lat()];
}

function ll2gll(ll) {
  var LatLng = gm().LatLng;
  return new LatLng(ll[1], ll[0]);
}

function gm() {
  if (!window.google || !window.google.maps) {
    throw 'Google Maps not initialized properly: call maps.init()';
  }
  return window.google.maps;
}

module.exports = {
  gll2ll: gll2ll,
  ll2gll: ll2gll,
  gm: gm
};