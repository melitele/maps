module.exports = {
  merge,
  bounds
};

function merge(to, from) {
  Object.keys(from).forEach(function (key) {
    to[key] = from[key];
  });
  return to;
}

function bounds(points) {
  return points.reduce(
    function (points, pt) {
      let i;
      for (i = 0; i < 2; i++) {
        if (pt[i] < points[0][i]) {
          points[0][i] = pt[i];
        } else if (pt[i] > points[1][i]) {
          points[1][i] = pt[i];
        }
      }
      return points;
    },
    [points[0].slice(), points[0].slice()]
  );
}
