const expression = require('./expression');

module.exports = {
   initCaching,
   evalCaching
};

function initCaching(source, caching) {
  if (!caching) {
    return;
  }
  let checks = Object.keys(caching).reduce(transformCaching, {
    caching,
    checks: []
  }).checks;
  return {
    source,
    checks
  };
}

function checkStrategy(check) {
  let result = this;
  result.strategy = check(result.object);
  return result.strategy;
}

function evalStrategy(checks, object) {
  let result = {
    object
  };
  checks.some(checkStrategy, result);
  return result.strategy;
}

function setCaching({ source, checks }) {
  let { config, map, object } = this;
  let strategy = evalStrategy(checks, object);
  config.SOURCE_LOADER_STRATEGY = config.SOURCE_LOADER_STRATEGY ?? {
    '*': 'network-only'
  };
  if (config.SOURCE_LOADER_STRATEGY[source] !== strategy) {
    config.SOURCE_LOADER_STRATEGY[source] = strategy;
    config.notify();
    if (source !== '*') {
      map.refresh(source, strategy === 'do-nothing');
    }
  }
}

function evalCaching(map, config, caching, object) {
  caching.forEach(setCaching, {
    config,
    map,
    object
  });
}

function checkDefault(strategy) {
  return strategy;
}

function checkProperty(strategy, check, object) {
  if (check(object)) {
    return strategy;
  }
}

function transformCaching(result, key) {
  let { caching, checks } = result;
  if (key === 'default') {
    checks.push(checkDefault.bind(undefined, caching[key]));
  }
  else {
    checks.unshift(checkProperty.bind(undefined, key, expression(caching[key])));
  }
  return result;
}
