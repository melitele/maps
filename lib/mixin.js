module.exports = mixin;

function mixin(superior, mixin) {
  return function () {
    const self = superior.apply(this, arguments);
    Object.keys(mixin).forEach(function (m) {
      self[m] = self[m] || mixin[m];
    });
    return self;
  };
}
