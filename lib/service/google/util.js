var eviltransform = require('eviltransform');

function gll2ll(gll, gcj02) {
  var ll = [gll.lng(), gll.lat()];
  if (!(gcj02 && this.isGCJ02(ll))) {
    return ll;
  }
  ll = eviltransform.gcj2wgs(ll[1], ll[0]);
  return [ll.lng, ll.lat];
}

function ll2gll(ll, gcj02) {
  var LatLng = gm().LatLng;
  if (!(gcj02 && this.isGCJ02(ll))) {
    return new LatLng(ll[1], ll[0]);
  }
  ll = eviltransform.wgs2gcj(ll[1], ll[0]);
  return new LatLng(ll.lat, ll.lng);
}

function bounds2gbounds(b, gcj02) {
  var LatLngBounds = gm().LatLngBounds;
  b = b.map(function (ll) {
    return ll2gll.call(this, ll, gcj02);
  }, this);
  return new LatLngBounds(b[0], b[1]);
}

function gbounds2bounds(gb, gcj02) {
  return gb && [
    gb.getSouthWest(),
    gb.getNorthEast()
  ].map(function (gll) {
    return gll2ll.call(this, gll, gcj02);
  }, this);
}

function decodePath(path) {
  return gm().geometry.encoding.decodePath(path);
}

function path2gpath(path, gcj02) {
  if (path.gmPath) {
    path = path.gmPath;
  }
  else if (Array.isArray(path)) {
    if (Array.isArray(path[0])) {
      path = path.gmPath = path.map(function (ll) {
        return ll2gll(ll, gcj02);
      });
    }
  }
  else if (typeof path === 'string') {
    path = decodePath(path);
  }
  return path;
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
  gbounds2bounds: gbounds2bounds,
  path2gpath: path2gpath,
  gm: gm
};