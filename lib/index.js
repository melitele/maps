function init() {
  return {
    collate: require('./collate'),
    map: require('./map'),
    outline: require('./outline'),
    projection: require('./projection'),
    spread: require('./spread'),
    util: require('./util')
  };
}

module.exports = {
  init
};
