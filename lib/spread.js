const distance = require('./util').distance;
const posSeq = [ [0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-2, -1], [-2, 0],
    [-2, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -2],
    [-2, -2], [-3, -2], [-3, -1], [-3, 0], [-3, 1], [-3, 2], [-3, 3], [-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3],
    [3, 3], [3, 2], [3, 1], [3, 0], [3, -1], [3, -2], [3, -3], [2, -3], [1, -3], [0, -3], [-1, -3], [-2, -3], [-3, -3],
    [-4, -3], [-4, -2], [-4, -1], [-4, 0], [-4, 1], [-4, 2], [-4, 3], [-4, 4], [-3, 4], [-2, 4], [-1, 4], [0, 4],
    [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [4, -1], [4, -2], [4, -3], [4, -4], [3, -4],
    [2, -4], [1, -4], [0, -4], [-1, -4], [-2, -4], [-3, -4], [-4, -4]];

module.exports = spread;

function spread(options) {
  let regions;
  let markers = [];
  const threshold = options.threshold || 18;
  let proj;
  const service = this;

  function reset() {
    markers = [];
    regions = undefined;
  }

  function add(marker) {
    markers.push(marker);
  }

  function calculate() {
    if (!proj.isReady()) {
      return;
    }
    if (markers[0] && !markers[0].originalPosition) {
      markers.forEach(function (m) {
        m.originalPosition = m.position();
      });
    }
    regions = [];
    prepareRegions();
    combineRegions();
    moveMarkers();
  }

  function prepareRegions() {
    markers.forEach(function (m) {
      if (!regions.some(function (r) {
        if (addToRegion(r, m)) {
          return true;
        }
      })) {
        regions.push(createRegion(m));
      }
    });
  }

  function createRegion(m) {
    return {
      center: proj.position(m.originalPosition),
      threshold,
      markers: [ m ]
    };
  }

  function addToRegion(r, m) {
    if (distance(r.center, proj.position(m.originalPosition)) < r.threshold) {
      r.markers.push(m);
      r.threshold = calcThreshold(r.markers.length) * threshold;
      return true;
    }
  }

  function combineRegions() {
    regions.forEach(function (r, i) {
      for (i = i + 1; i < regions.length; i++) {
        if (distance(r.center, regions[i].center) < (r.threshold + regions[i].threshold) / 2) {
          regions[i].markers = regions[i].markers.concat(r.markers);
          regions[i].threshold = calcThreshold(regions[i].markers.length) * threshold;
          r.markers = [];
        }
      }
    });
  }

  function calcThreshold(len) {
    if (len < 2) {
      return 1;
    }
    if (len < 10) {
      return 2;
    }
    if (len < 26) {
      return 3;
    }
    if (len < 50) {
      return 4;
    }
    if (len < 82) {
      return 5;
    }
    return 6;
  }

  function moveMarkers() {
    regions.forEach(function (r) {
      r.markers.some(function (m, i) {
        let p;
        if (i === posSeq.length) {
          return true;
        }
        p = {
          x: r.center.x + posSeq[i][0] * threshold,
          y: r.center.y + posSeq[i][1] * threshold
        };
        p = proj.toMap(p.x, p.y);
        m.position(p);
      });
    });
  }

  proj = options.projection || service.projection({
    map: options.map,
    calculate
  });

  return {
    add,
    reset,
    calculate
  };
}