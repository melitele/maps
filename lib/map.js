
function zoomIn() {
  var self = this;
  self.zoom(self.zoom() + 1);
  return self;
}

function zoomOut() {
  var self = this;
  self.zoom(self.zoom() - 1);
  return self;
}

module.exports = {
  zoomIn: zoomIn,
  zoomOut: zoomOut
};
