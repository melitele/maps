function init() {
  return {
    map: require('./map'),
    projection: require('./projection'),
    util: require('./util')
  };
}

module.exports = {
  init
};
