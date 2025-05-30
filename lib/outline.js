module.exports = outline;

// finds a smallest possible bounding rectangle for a set of points
function outline(points) {
  let se;
  let nw;

  const self = {
    include,
    bounds
  };

  return include(points);

  function include(points) {
    if (!points || !points.length) {
      return self;
    }
    se ??= points[0].slice();
    nw ??= points[0].slice();
    points.forEach(function (point) {
      const x = point[0];
      const y = point[1];
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
}
