
function zoomIn() {
  const self = this;
  self.zoom(self.zoom() + 1);
  return self;
}

function zoomOut() {
  const self = this;
  self.zoom(self.zoom() - 1);
  return self;
}

module.exports = {
  zoomIn,
  zoomOut
};
