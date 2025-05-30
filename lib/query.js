module.exports = queryRenderedFeatures;

function createQueryGeometry(point, fat, transform) {
  if (fat === 0) {
    return {
      viewport: [point],
      worldCoordinate: [transform.pointCoordinate(point)]
    };
  }

  const pointMin = { x: point.x - fat, y: point.y - fat };
  const pointMax = { x: point.x + fat, y: point.y + fat };

  const worldMin = transform.pointCoordinate(pointMin);
  const worldMax = transform.pointCoordinate(pointMax);

  const viewport = [
    pointMin,
    { x: pointMax.x, y: pointMin.y }, // like world1
    pointMax,
    { x: pointMin.x, y: pointMax.y }, // like world3
    pointMin
  ];

  const world1 = worldMax.clone();
  world1.column = worldMin.column; // take y/column from Min

  const world3 = worldMin.clone();
  world3.row = worldMax.row; // take x/row from Max

  const worldCoordinate = [worldMin, world1, worldMax, world3, worldMin];

  return { viewport, worldCoordinate };
}

function queryRenderedFeatures(_m, point, fat, options) {
  const geometry = createQueryGeometry(point, fat, _m.transform);
  return _m.style.queryRenderedFeatures(geometry, options, _m.transform) || [];
}
