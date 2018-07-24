
module.exports = draggable;

function dragPosition(e) {
    return e;
}

function draggable(self, options) {
  var draggable = false, events, inside, dragging, mousedown, mousemoveEvent, mouseupEvent, touchTimeout;

  function mousemove(e) {
    e.preventDefault();
    e.originalEvent.preventDefault();
    if (!dragging) {
      if (mousedown) {
        dragging = true;
        mousedown = undefined;
        e.drag = true;
        self.fire('dragstart', self.dragPosition(e));
      }
      return;
    }
    e.drag = true;
    self.fire('drag', self.dragPosition(e));
  }

  function mouseup(e) {
    e.preventDefault();
    e.originalEvent.preventDefault();
    mousedown = undefined;
    if (!dragging) {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
        touchTimeout = undefined;
        self.fire('click', e);
      }
      return;
    }
    dragging = undefined;
    if (!inside) {
      events.mouseleave(e);
    }
    self._m.off(mousemoveEvent, mousemove);
    mousemoveEvent = mouseupEvent = undefined;
    e.drag = true;
    self.fire('dragend', self.dragPosition(e));
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
    mouseenter: function (e) {
      e.preventDefault();
      inside = true;
      if (dragging) {
        return;
      }
    },
    mouseleave: function (e) {
      e.preventDefault();
      inside = undefined;
      if (dragging) {
        return;
      }
    },
    mousedown: function (e) {
      e.preventDefault();
      if (!inside || dragging) {
        return;
      }
      mousedown = true;
      mousemoveEvent = mousemoveEvent || 'mousemove';
      if (mousemoveEvent === 'touchmove') {
        // delay drag to check if user intends to select instead
        touchTimeout = setTimeout(function () {
          touchTimeout = undefined;
          self._m.on(mousemoveEvent, mousemove);
        }, 300);
      }
      else {
        self._m.on(mousemoveEvent, mousemove);
      }
      mouseupEvent = mouseupEvent || 'mouseup';
      self._m.once(mouseupEvent, mouseup);
    },
    touchstart: function (e) {
      e.preventDefault();
      e.originalEvent.preventDefault();
      mousemoveEvent = 'touchmove';
      mouseupEvent = 'touchend';
      self.fire('mouseenter', e);
      self.fire('mousedown', e);
    }

  };

  self.changeDraggable = changeDraggable;
  self.dragPosition = self.dragPosition || dragPosition;

  if (options.draggable) {
    self.changeDraggable(true);
  }

  return self;
}
