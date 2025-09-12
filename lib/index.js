function init() {
  return {
    collate: require('./collate'),
    map: require('./map'),
    projection: require('./projection'),
    spread: require('./spread'),
    util: require('./util')
  };
}

module.exports = {
  init
};
