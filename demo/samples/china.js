module.exports = sampleChina;

function sampleChina(srv, map) {
  const center = [116.383473, 39.903331];
  const path = [
    center,
    [center[0] - 0.001, center[1] + 0.001],
    [center[0] + 0.001, center[1] + 0.001],
    center
  ], poly = [
    center,
    [center[0] - 0.001, center[1] - 0.001],
    [center[0] + 0.001, center[1] - 0.001],
    center
  ];
  map.zoom(17);
  srv.marker({
    map,
    icon: {
      strokeColor: '#0074D9', // azure
      strokeWeight: 5,
      path: 'circle',
      scale: 8
    }
  }).position(center);
  srv.polyline({
    map,
    color: '#a21bab',
    dashOpacity: 1
  }).path(path);
  srv.polygon({
    map,
    fillColor: '#a21bab',
    fillOpacity: 0.5,
    strokeColor: '#0074D9'
  }).path(poly);
  setTimeout(() =>{
    map.center(center);
  }, 1)
}
