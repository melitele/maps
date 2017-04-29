
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function between(p, p1, p2, l) {
  if (p1[l] <= p2[l]) {
    return p[l] >= p1[l] && p[l] <= p2[l];
  }
  return p[l] >= p2[l] && p[l] <= p1[l];
}

function distanceSquare(p1, p2) {
  return Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2);
}

// http://stackoverflow.com/questions/5204619/how-to-find-the-point-on-an-edge-which-is-the-closest-point-to-another-point
function pointOnLine(p, p1, p2) {
  var m1, m2, x, y;
  if (p1[0] === p2[0]) {
    return [p1[0], p[1]];
  }
  if (p1[1] === p2[1]) {
    return [p[0], p1[1]];
  }
  m1 = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  m2 = -1 / m1;
  x = (m1 * p1[0] - m2 * p[0] + p[1] - p1[1]) / (m1 - m2);
  y = m2 * (x - p[0]) + p[1];
  return [x, y];
}

function closestPoint(res, p1, i, path) {
  var p2, p, dist;
  if (Math.abs(res.point[0] - p1[0]) < 1e-5 && Math.abs(res.point[1] - p1[1]) < 1e-5) {
    p = p1;
  }
  else if (i < path.length - 1) {
    p2 = path[i + 1];
    p = pointOnLine(res.point, p1, p2);
    p = between(p, p1, p2, 0) && between(p, p1, p2, 1) && p;
  }
  if (p) {
    dist = distanceSquare(res.point, p);
    if (dist < res.dist) {
      res.dist = dist;
      res.idx = i;
      res.p = p;
    }
  }
  return res;
}

function findPointOnPath(point, path) {
  var result;
  if (point && path) {
    result = path.reduce(closestPoint, {
      dist: Number.MAX_VALUE,
      point: point
    });
    if (result.idx !== undefined) {
      point = path[result.idx];
      result.pol = result.p !== path[result.idx] && result.p !== path[result.idx];
      return result;
    }
  }
}

module.exports = {
  distance: distance,
  findPoint: findPointOnPath
};
