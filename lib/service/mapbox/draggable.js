
module.exports = draggable;

function draggable(self, options) {
  var events, inside, dragging, mousedown;

  function fire(type, e) {
    self._m.fire(type, e);
  }

  function mousemove(e) {
    if (!dragging) {
      if (mousedown) {
        dragging = true;
        mousedown = undefined;
        fire('dragstart', e);        
      }
      return;
    }
    fire('drag', e);
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
    fire('dragend', e);
  }

  function changeDraggable(draggable) {
    var prop = draggable ? 'on' : 'off';
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
