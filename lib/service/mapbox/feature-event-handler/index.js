const makeFeatureCollector = require('./feature-collector');
const makeListenersBag = require('./listeners-bag');

module.exports = featureEventHandler;

const mouseEvents = asMap([
  'mouseenter',
  'mouseover',
  'mouseleave'
]);

const touchEvents = asMap([
  'touchstart',
  'touchend',
  'touchmove',
  'touchcancel'
]);

// FIXME: we only support 'mouseover', 'mouseleave, and 'mouseenter' here
function translateEventType(type) {
    switch(type) {
      case 'mousemove': return 'mouseover';
      case 'mouseout': return 'mouseleave';
      default: return type;
    }
}

function createQueryGeometry(point, fat, transform) {
  if (fat === 0) {
    return {
      viewport: [ point ],
      worldCoordinate: [ transform.pointCoordinate(point) ]
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
  world3.row = worldMax.row;      // take x/row from Max

  const worldCoordinate = [
    worldMin,
    world1,
    worldMax,
    world3,
    worldMin
  ];

  return { viewport, worldCoordinate };
}


function featureEventHandler(_m) {
  const listenersBag = makeListenersBag();
  let mouseHandlerActive = 0;
  let featureCollector = makeFeatureCollector();

  function on(type, layerId, featureId, listener) {
    type = translateEventType(type);
    if (listenersBag.add(type, layerId, featureId, listener)) {
      addMapListener(type);
    }
  }

  function off(type, layerId, featureId, listener) {
    type = translateEventType(type);
    if (listenersBag.remove(type, layerId, featureId, listener)) {
      removeMapListener(type);
    }
  }

  function addMapListener(type) {
    if (mouseEvents[type]) {
      if (0 === mouseHandlerActive++) {
        _m.on('mousemove', onmousemove);
        _m.on('mouseout', onmouseout);
      }
    } else {
      _m.on(type, onevent);
    }
  }

  function removeMapListener(type) {
    if (mouseEvents[type]) {
      if (0 === --mouseHandlerActive) {
        _m.off('mousemove', onmousemove);
        _m.off('mouseout', onmouseout);
      }
    } else {
      _m.off(type, onevent);
    }
  }

  function getCurrentLayers(type) {
    return listenersBag.forType(type).filter(l => _m.getLayer(l));
  }

  function getCurrentMouseLayers() {
    let all = {};
    return Object.keys(mouseEvents)
      .reduce((all, type) => all.concat(listenersBag.forType(type)), [])
      .filter(function(l) {
        if (!_m.getLayer(l)) {
          return false;
        }
        if (all[l]) {
          return false;
        }
        all[l] = true;
        return true;
      });
  }

  function filterByZIndex(features) {
    let zindexTop = 0;
    let results = [];
    features.forEach(function(feature) {
      let { layer: { metadata: { zindex = 0  } } } = feature;
      if (zindex >= zindexTop) {
        zindexTop = zindex;
        results[0] = feature;
      }
    });
    return results;
  }

  function fireEvent(type, e, features, filterByZ) {
    if (features.length === 0) {
      return;
    }
    if (filterByZ) {
      features = filterByZIndex(features);
    }
    features.forEach(function(feature) {
      let { id } = feature;
      e.feature = feature;
      listenersBag.getListeners(type, id).forEach(listener => listener.call(_m, e));
      delete e.feature;
    });
  }

  function onmousemove(e) {
    const { point } = e;
    let layers = getCurrentMouseLayers();
    let features = queryRenderedFeatures('mousemove', point, { layers });
    let result = featureCollector.onmove(features);
    Object.entries(result).forEach(function([type, features]) {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features, type !== 'mouseleave');
    });
  }

  function onmouseout(e) {
    let result = featureCollector.onout();
    Object.entries(result).forEach(function([type, features]) {
      e.type = type; // need to modify original event type
      fireEvent(type, e, features);
    });
  }

  function onevent(e) {
    const { type, point  } = e;
    const layers = getCurrentLayers(type);
    if (layers.length === 0) {
      return;
    }
    const features = queryRenderedFeatures(type, point, { layers });
    fireEvent(type, e, features, true); // true - only for top zindex
  }

  function queryRenderedFeatures(type, point, options) {
    const fat = touchEvents[type] ? 10 : 3; // more fat for touch events
    const geometry = createQueryGeometry(point, fat, _m.transform);
    return _m.style.queryRenderedFeatures(geometry, options, _m.transform) || [];
  }

  return {
    on,
    off
  };
}

function asMap(arr) {
  return arr.reduce(function(obj, type) {
    obj[type] = true;
    return obj;
  }, Object.create(null));
}
