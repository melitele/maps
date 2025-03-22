function mll2ll(mll) {
  return mll.toArray();
}

function mbounds2bounds(mb) {
  return mb && [
    mb.getSouthWest(),
    mb.getNorthEast()
  ].map(mll2ll);
}

module.exports = {
  mll2ll,
  mbounds2bounds
};
