function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function between(p, p1, p2, l) {
  if (p1[l] <= p2[l]) {
    return p[l] >= p1[l] && p[l] <= p2[l];
  }
  return p[l] >= p2[l] && p[l] <= p1[l];
}

function distanceSquare(p1, p2) {
  return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
}

// http://stackoverflow.com/questions/5204619/how-to-find-the-point-on-an-edge-which-is-the-closest-point-to-another-point
function pointOnLine(p, p1, p2) {
  if (p1[0] === p2[0]) {
    return [p1[0], p[1]];
  }
  if (p1[1] === p2[1]) {
    return [p[0], p1[1]];
  }
  const m1 = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  const m2 = -1 / m1;
  const x = (m1 * p1[0] - m2 * p[0] + p[1] - p1[1]) / (m1 - m2);
  const y = m2 * (x - p[0]) + p[1];
  return [x, y];
}

function closestPoint(res, p1, i, path) {
  let p2;
  let p;
  if (Math.abs(res.point[0] - p1[0]) < res.margin[0] && Math.abs(res.point[1] - p1[1]) < res.margin[1]) {
    p = p1;
  } else if (i < path.length - 1) {
    p2 = path[i + 1];
    p = pointOnLine(res.point, p1, p2);
    p = between(p, p1, p2, 0) && between(p, p1, p2, 1) && p;
  }
  if (p) {
    const dist = distanceSquare(res.point, p);
    if (dist < res.dist) {
      res.dist = dist;
      res.idx = i;
      res.p = p;
    }
  }
  return res;
}

function findPointOnPath(point, path, margin) {
  if (point && path && margin) {
    const result = path.reduce(closestPoint, {
      dist: Number.MAX_VALUE,
      point,
      margin
    });
    if (result.idx !== undefined) {
      point = path[result.idx];
      result.pol =
        result.p !== path[result.idx] && (result.idx === path.length - 1 || result.p !== path[result.idx + 1]);
      return result;
    }
  }
}

function mll2ll(mll) {
  return mll.toArray();
}

function mbounds2bounds(mb) {
  return mb && [mb.getSouthWest(), mb.getNorthEast()].map(mll2ll);
}

module.exports = {
  distance,
  findPoint: findPointOnPath,
  mbounds2bounds,
  mll2ll
};
