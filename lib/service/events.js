
var mouse = [
  'click',
  'mousemove',
  'mouseover',
  'mouseout',
  'dragstart',
  'drag',
  'dragend'
].reduce(function (result, e) {
  result[e] = e;
  return result;
}, {});

module.exports = {
  mouse: mouse
};
