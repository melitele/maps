var distance = require('./util').distance;

module.exports = collate;

function collate(options) {
  var proj, regions, markers = [], threshold = options.threshold || 18, service = this;

  function reset() {
    markers = [];
    regions = undefined;
  }

  function add(marker, referenceOnly) {
    marker.referenceOnly = referenceOnly;
    markers.push(marker);
  }

  function calculate() {
    if (!proj.isReady()) {
      return;
    }
    regions = [];
    prepareRegions();
    hideMarkers();
  }

  function prepareRegions() {
    markers.forEach(function (m) {
      if (!regions.some(function (r) {
        return addToRegion(r, m);
      })) {
        regions.push(createRegion(m));
      }
    });
  }

  function createRegion(m) {
    return {
      show: m,
      hide: []
    };
  }

  function position(m) {
    return proj.position(m._g.getPosition());
  }

  function addToRegion(r, m) {
    if (distance(position(r.show), position(m)) < threshold) {
      if (r.show._g.getZIndex() < m._g.getZIndex()) {
        r.hide.push(r.show);
        r.show = m;
      }
      else {
        r.hide.push(m);
      }
      return true;
    }
  }

  function hideMarkers() {
    regions.forEach(function (r) {
      if (!r.show.referenceOnly) {
        r.show._g.setMap(options.map._g);
      }
      r.hide.forEach(function (m) {
        if (!m.referenceOnly) {
          m._g.setMap();
        }
      });
    });
  }

  proj = options.projection || service.projection({
    map: options.map,
    calculate: calculate
  });

  return {
    add: add,
    reset: reset,
    calculate: calculate
  };
}