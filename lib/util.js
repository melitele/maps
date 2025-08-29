function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function mll2ll(mll) {
  return mll.toArray();
}

function mbounds2bounds(mb) {
  return mb && [mb.getSouthWest(), mb.getNorthEast()].map(mll2ll);
}

module.exports = {
  distance,
  mbounds2bounds,
  mll2ll
};
