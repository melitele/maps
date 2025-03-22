module.exports = init;

function init() {
  return {
    map: require('./map'),
    feature: require('./feature'),
    projection: require('./projection'),
    isSupported
  };
}

function isSupported() {
  const attributes = {
    antialias: false,
    alpha: true,
    stencil: true,
    depth: true
  };
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', attributes)
          || canvas.getContext('experimental-webgl', attributes);
  return !!gl;
}
