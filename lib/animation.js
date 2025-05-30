module.exports = init;

function init(self, { animation: animationProperty }) {
  let animating;
  let interval;
  let savedProperty;

  function nextFrame(params) {
    params.counter += params.delta;
    if (params.counter >= params.range || params.counter <= 0) {
      params.delta = -params.delta;
    }
  }

  function animateMarker(params) {
    if (self._m._loaded) {
      const data = self.data();
      data.properties[animationProperty] = [savedProperty[0], savedProperty[1] - params.counter];
      self.data(data);
      nextFrame(params);
    }
  }

  function startBounce() {
    if (interval) {
      return;
    }
    const params = {
      counter: 0,
      delta: 4
    };
    const { properties } = self.data();
    savedProperty = properties[animationProperty];
    params.range = properties.range ?? Math.abs(savedProperty[1]);
    params.range += params.delta - (params.range % params.delta);
    interval = setInterval(animateMarker.bind(undefined, params), 100);
  }

  function stopBounce() {
    if (!interval) {
      return;
    }
    clearInterval(interval);
    interval = undefined;
    const data = self.data();
    data.properties[animationProperty] = savedProperty;
    self.data(data);
    return true;
  }

  function animation(type) {
    if (animating !== type) {
      animating = type;
      setTimeout(self.fire.bind(self, 'animation_changed'), 1);
      if (type === 'bounce') {
        startBounce();
      } else if (!type) {
        stopBounce();
      }
    }
  }

  self.animation = animation;

  return self;
}
