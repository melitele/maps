
module.exports = draggable;

function draggable(self, options) {
  var draggable = false, events, inside, dragging, mousedown;

  function mousemove(e) {
    if (!dragging) {
      if (mousedown) {
        dragging = true;
        mousedown = undefined;
        e.drag = true;
        self.fire('dragstart', e);
      }
      return;
    }
    e.drag = true;
    self.fire('drag', e);
  }

  function mouseup(e) {
    mousedown = undefined;
    if (!dragging) {
      return;
    }
    dragging = undefined;
    if (!inside) {
      events.mouseleave();
    }
    self._m.off('mousemove', mousemove);
    e.drag = true;
    self.fire('dragend', e);
  }

  function changeDraggable(d) {
    var prop;
    d = Boolean(d);
    if (draggable === d) {
      return;
    }
    draggable = d;
    prop = draggable ? 'on' : 'off';
    Object.keys(events).forEach(function (type) {
      self[prop](type, events[type]);
    });
  }

  events = {
    mouseenter: function () {
      inside = true;
      if (dragging) {
        return;
      }
      self._m.dragPan.disable();
    },
    mouseleave: function () {
      inside = undefined;
      if (dragging) {
        return;
      }
      self._m.dragPan.enable();
    },
    mousedown: function () {
      if (!inside || dragging) {
        return;
      }
      mousedown = true;
      self._m.on('mousemove', mousemove);
      self._m.once('mouseup', mouseup);
    }
  };

  self.changeDraggable = changeDraggable;

  if (options.draggable) {
    self.changeDraggable(true);
  }

  return self;
}
