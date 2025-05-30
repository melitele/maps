function zoomIn() {
  this.zoom(this.zoom() + 1);
  return this;
}

function zoomOut() {
  this.zoom(this.zoom() - 1);
  return this;
}

module.exports = {
  zoomIn,
  zoomOut
};
