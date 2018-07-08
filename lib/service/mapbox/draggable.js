
module.exports = draggable;

function draggable(self, options) {
  var draggable = false, events, inside, dragging, mousedown, mousemoveEvent, mouseupEvent;

  function mousemove(e) {
    e.preventDefault();
    e.originalEvent.preventDefault();
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
    e.preventDefault();
    e.originalEvent.preventDefault();
    mousedown = undefined;
    if (!dragging) {
      return;
    }
    dragging = undefined;
    if (!inside) {
      events.mouseleave(e);
    }
    self._m.off(mousemoveEvent, mousemove);
    mousemoveEvent = mouseupEvent = undefined;
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
      self._m.on(mousemoveEvent, mousemove);
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

  if (options.draggable) {
    self.changeDraggable(true);
  }

  return self;
}
