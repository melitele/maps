
function expand(result, e) {
  result[e] = e;
  return result;
}

module.exports = {
  drag: [
    'dragstart',
    'drag',
    'dragend'
  ].reduce(expand, {}),
  mouse: [
    'click',
    'mousemove',
    'mouseover',
    'mouseout',
    'dragstart',
    'drag',
    'dragend'
  ].reduce(expand, {})
};
