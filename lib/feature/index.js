const { addToSource, removeFromSource } = require('./source');
const animation = require('../animation');
const draggable = require('../draggable');
const { findPoint, mll2ll } = require('../util');
const object = require('../object');

// shape added to a source predefined in map style
module.exports = init;

let featureId = 0;

function margin(_m, p, margin) {
  const p1 = _m.unproject(p),
        p2 = _m.unproject({
        x: p.x + margin,
        y: p.y + margin
      });
  return [Math.abs(p1.lng - p2.lng), Math.abs(p1.lat - p2.lat)];
}

function init(options) {

  function onadd(map) {
    options.map = map;
    addToSource(map, self._source, self._data);
    self._layers.splice(0, self._layers.length, ...self._m.getStyle().layers
      .filter(({ source }) => source === options.source)
      .map(({ id }) => id));
  }

  function onremove() {
    removeFromSource(options.map, self._source, self._data.id);
  }

  function position(p) {
    if (p === undefined) {
      return self._data.geometry?.coordinates;
    }
    if (self._data.geometry) {
      self._data.geometry.coordinates = p;
      data(self._data);
    }
  }

  function data(data) {
    if (data === undefined) {
      return self._data;
    }
    const { map } = options;
    self.remove();
    data.id ??= self._data.id;
    self._data = data;
    if (map && data.type) {
      self.add(map);
    }
  }

  function ll(e) {
    if (!e?.lngLat) {
      return;
    }
    e.ll = mll2ll(e.lngLat);
    if (e.drag || self._data.geometry?.type !== 'LineString') {
      return;
    }
    const path = self._data.geometry?.coordinates;
    if (!path) {
      return;
    }
    const point = findPoint(e.ll, path, margin(self._m, e.point, self._margin));
    if (!point) {
      return;
    }
    e.ll = point.p;
    e.pointOnPath = point;
    e.featurePoint = self._m.project(e.ll);
    if (point.idx || point.pol) {
      e.featurePoint.prev = self._m.project(path[point.pol ? point.idx : (point.idx - 1)]);
    }
    if (point.idx < path.length - 1) {
      e.featurePoint.next = self._m.project(path[point.idx + 1]);
    }
  }

  if (!options.data.id) {
    featureId += 1;
    options.data.id = featureId;
  }

  let self = object({
    _source: options.source,
    _data: options.data,
    _margin: options.margin ?? 10,
    _layers: [],
    data,
    ll,
    position
  }, {
    onadd,
    onremove
  });
  if (!options.stationary) {
    self = draggable(self, options);
  }
  if (options.animation) {
    self = animation(self, options);
  }

  if (options.map && options.data.type) {
    self.add(options.map);
  }

  return self;
}
