var polyline = require('@pirxpilot/google-polyline');

function mll2ll(mll) {
  return mll.toArray();
}

function mbounds2bounds(mb) {
  return mb && [
    mb.getSouthWest(),
    mb.getNorthEast()
  ].map(mll2ll);
}

function decodePath(path) {
  return polyline.decode(path);
}

module.exports = {
  mll2ll: mll2ll,
  mbounds2bounds: mbounds2bounds,
  decodePath: decodePath
};
