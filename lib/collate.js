const { distance } = require('./util');
const zindex = require('./zindex');

module.exports = collate;

function collate(options) {
  let regions;
  let markers = [];
  const threshold = options.threshold || 18;
  const proj =
    options.projection ||
    this.projection({
      map: options.map,
      calculate
    });

  return {
    add,
    reset,
    calculate
  };

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
      if (
        !regions.some(function (r) {
          return addToRegion(r, m);
        })
      ) {
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
    return proj.position(m);
  }

  function addToRegion(r, m) {
    if (distance(position(r.show), position(m)) < threshold) {
      if (zindex(r.show) < zindex(m)) {
        r.hide.push(r.show);
        r.show = m;
      } else {
        r.hide.push(m);
      }
      return true;
    }
  }

  function hideMarkers() {
    regions.forEach(function (r) {
      if (!r.show.referenceOnly) {
        r.show.add(options.map);
      }
      r.hide.forEach(function (m) {
        if (!m.referenceOnly) {
          m.remove();
        }
      });
    });
  }
}
