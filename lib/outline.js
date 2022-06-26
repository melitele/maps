module.exports = outline;

// finds a smallest possible bounding rectangle for a set of points
function outline(points) {
  let self, se, nw;

  function include(points) {
    if (!points || !points.length) {
      return self;
    }
    se = se || points[0].slice();
    nw = nw || points[0].slice();
    points.forEach(function(point) {
      const x = point[0], y = point[1];
      if (x < se[0]) {
        se[0] = x;
      }
      if (x > nw[0]) {
        nw[0] = x;
      }
      if (y < se[1]) {
        se[1] = y;
      }
      if (y > nw[1]) {
        nw[1] = y;
      }
    });
    return self;
  }

  function bounds() {
    return [se, nw];
  }

  self = {
    include,
    bounds
  };

  return include(points);
}
