function init() {
  return {
    collate: require('./collate'),
    feature: require('./feature'),
    isSupported,
    map: require('./map'),
    outline: require('./outline'),
    projection: require('./projection'),
    spread: require('./spread'),
    util: require('./util')
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
  const gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
  return !!gl;
}

module.exports = {
  init
};
