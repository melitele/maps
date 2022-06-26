module.exports = check;

function checkSingleProperty(property, object) {
  return object[property];
}

function checkProperty(property) {
  const object = this;
  return checkSingleProperty(property, object);
}

function checkAnyProperty(properties, object) {
  return properties.some(checkProperty, object);
}

function checkAllProperties(properties, object) {
  return properties.every(checkProperty, object);
}

function check(expr) {
  if (Array.isArray(expr)) {
    if (expr[0] === 'all') {
      return checkAllProperties.bind(undefined, expr.slice(1));
    }
    return checkAnyProperty.bind(undefined, expr.slice(1));
  }
  return checkSingleProperty.bind(undefined, expr);
}
