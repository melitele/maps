function mll2ll(mll) {
  return mll.toArray();
}

function mbounds2bounds(mb) {
  return mb && [
    mb.getSouthWest(),
    mb.getNorthEast()
  ].map(mll2ll);
}

function getProp(result, key) {
  result.out[key] = result.in[key];
  return result;
}

function getProperties(keys, object) {
  return keys.reduce(getProp, {
    in: object,
    out: {}
  }).out;
}

module.exports = {
  mll2ll,
  mbounds2bounds,
  getProperties
};
