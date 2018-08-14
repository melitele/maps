
module.exports = draggable;

function dragPosition(e) {
  return e;
}

function draggable(self, options) {
  let enabled = false;
  let dragging = false;
  let pending = false;
  let touchTimeout;

  function onmove(e) {
    e.preventDefault();
    e.originalEvent.preventDefault();
    if (!dragging) {
      if (pending) {
        pending = false;
        dragging = true;
        e.drag = true;
        self.fire('dragstart', self.dragPosition(e));
      }
      return;
    }
    e.drag = true;
    self.fire('drag', self.dragPosition(e));
  }

  function mouseup(e) {
    self._m.off('mousemove', onmove);

    e.preventDefault();
    e.originalEvent.preventDefault();

    dragging = false;

    e.drag = true;
    self.fire('dragend', self.dragPosition(e));
  }

  function touchend(e) {
    self._m.off('touchmove', onmove);

    e.preventDefault();
    e.originalEvent.preventDefault();

    if (!dragging) {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
        touchTimeout = undefined;
        self.fire('click', e);
      }
      return;
    }

    dragging = false;

    e.drag = true;
    self.fire('dragend', self.dragPosition(e));
  }

  function onmousedown(e) {
    if (!enabled || dragging || self._m.isMoving()) {
      return;
    }
    e.preventDefault();
    pending = true;

    self._m.once('mouseup', mouseup);
    self._m.on('mousemove', onmove);
  }

  function ontouchstart(e) {
    if (!enabled || dragging || self._m.isMoving() ||
        e.originalEvent.touches.length > 1) {
      return;
    }
    e.preventDefault();

    self._m.once('touchend', touchend);

    // delay drag to check if user intends to select instead
    touchTimeout = setTimeout(function () {
        touchTimeout = undefined;
        pending = true;
        self._m.on('touchmove', onmove);
    }, 300);

    // FIXME: this is needed for map-drag-handle
    self.fire('mouseenter', e);
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    self.on('mousedown', onmousedown);
    self.on('touchstart', ontouchstart);
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    self.off('mousedown', onmousedown);
    self.off('touchstart', ontouchstart);
  }

  function changeDraggable(d) {
    return d ? enable() : disable();
  }

  self.changeDraggable = changeDraggable;
  self.dragPosition = self.dragPosition || dragPosition;

  if (options.draggable) {
    enable();
  }

  return self;
}
