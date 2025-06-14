const expression = require('./expression');

module.exports = {
  initVisibility,
  evalVisibility
};

function initVisibility(id, visibility) {
  if (!visibility) {
    return;
  }
  const check = expression(visibility);
  return {
    id,
    check
  };
}

function setVisibility(style) {
  const { _m, object } = this;
  if (_m.getLayer(style.id)) {
    _m.setLayoutProperty(style.id, 'visibility', style.check(object) ? 'visible' : 'none');
  }
}

function evalVisibility(_m, visibility, object) {
  visibility.forEach(setVisibility, {
    _m,
    object
  });
}
