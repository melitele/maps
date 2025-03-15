var demo = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/@pirxpilot/google-polyline/lib/encode.js
  var require_encode = __commonJS({
    "node_modules/@pirxpilot/google-polyline/lib/encode.js"(exports, module) {
      module.exports = encode;
      function encode(points, { factor = 1e5, prefix = "", mapFn } = {}) {
        let px = 0, py = 0;
        let str = prefix;
        for (let i = 0; i < points.length; ++i) {
          let point = points[i];
          if (mapFn) {
            point = mapFn(point, i, points);
          }
          let x = round(factor * point[0]);
          let y = round(factor * point[1]);
          str = chars(str, sign(y - py));
          str = chars(str, sign(x - px));
          px = x;
          py = y;
        }
        return str;
      }
      function round(v) {
        return v < 0 ? -Math.floor(0.5 - v) : Math.round(v);
      }
      function sign(v) {
        return v < 0 ? ~(v << 1) : v << 1;
      }
      function chars(str, value) {
        while (value >= 32) {
          str += String.fromCharCode((value & 31 | 32) + 63);
          value = value >> 5;
        }
        return str + String.fromCharCode(value + 63);
      }
    }
  });

  // node_modules/@pirxpilot/google-polyline/lib/decode.js
  var require_decode = __commonJS({
    "node_modules/@pirxpilot/google-polyline/lib/decode.js"(exports, module) {
      module.exports = decode2;
      function decode2(value, {
        factor = 1e5,
        mapFn,
        start = 0,
        end = value.length
      } = {}) {
        const points = [];
        let x, y, px = 0, py = 0;
        let point;
        integers(value, start, end, function(v) {
          if (y === void 0) {
            y = v;
            return;
          }
          x = v;
          x = x + px;
          y = y + py;
          point = [x / factor, y / factor];
          if (mapFn) {
            point = mapFn(point);
          }
          points.push(point);
          px = x;
          py = y;
          x = y = void 0;
        });
        return points;
      }
      function sign(value) {
        return value & 1 ? ~(value >>> 1) : value >>> 1;
      }
      function integers(value, start, end, fn) {
        let byte = 0;
        let current = 0;
        let bits = 0;
        for (let i = start; i < end; i++) {
          byte = value.charCodeAt(i) - 63;
          current = current | (byte & 31) << bits;
          bits += 5;
          if (byte < 32) {
            if (byte === -1 && bits === 5) {
              current = 0;
            }
            fn(sign(current));
            current = 0;
            bits = 0;
          }
        }
      }
    }
  });

  // node_modules/@pirxpilot/google-polyline/index.js
  var require_google_polyline = __commonJS({
    "node_modules/@pirxpilot/google-polyline/index.js"(exports, module) {
      module.exports = {
        encode: require_encode(),
        decode: require_decode()
      };
    }
  });

  // common.js
  var require_common = __commonJS({
    "common.js"(exports, module) {
      module.exports = {
        merge: merge2,
        bounds: bounds2
      };
      function merge2(to, from) {
        Object.keys(from).forEach(function(key) {
          to[key] = from[key];
        });
        return to;
      }
      function bounds2(points) {
        return points.reduce(function(points2, pt) {
          let i;
          for (i = 0; i < 2; i++) {
            if (pt[i] < points2[0][i]) {
              points2[0][i] = pt[i];
            } else if (pt[i] > points2[1][i]) {
              points2[1][i] = pt[i];
            }
          }
          return points2;
        }, [points[0].slice(), points[0].slice()]);
      }
    }
  });

  // samples/directly.js
  var require_directly = __commonJS({
    "samples/directly.js"(exports, module) {
      module.exports = addedDirectly2;
      function addedDirectly2(maps2, map, source, points, path) {
        const poly = maps2.feature({
          map,
          source,
          data: {
            properties: {
              type: "polyline"
            },
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: path
            }
          }
        });
        map.registerImage(
          "marker_icon",
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=",
          [26, 30]
        ).then(() => {
          const markers = points.map((pt) => {
            return maps2.feature({
              map,
              source,
              data: {
                properties: {
                  type: "marker",
                  opacity: 1
                },
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: pt
                }
              }
            });
          });
          setTimeout(() => {
            markers.forEach((mk, i) => {
              if (i < 10) {
                mk.remove();
              }
              const data = mk.data();
              data.properties = i === 12 || i === 11 || i === 5 ? {
                type: "marker",
                icon: true,
                opacity: 1
              } : {
                type: "marker",
                color: "violet",
                opacity: 1
              };
              mk.data(data);
              if (i < 10) {
                mk.add(map);
              }
            });
            setTimeout(() => {
              markers[5].remove();
              const mData = markers[5].data();
              mData.properties = {
                type: "marker",
                color: "violet",
                opacity: 1
              };
              markers[5].data(mData);
              markers[5].add(map);
              markers.forEach((mk, i) => {
                if (i % 2 === 0) {
                  const data2 = mk.data();
                  data2.properties.opacity = 0;
                  mk.data(data2);
                }
              });
              const data = poly.data();
              delete data.type;
              poly.data(data);
            }, 5e3);
          }, 3e3);
        });
      }
    }
  });

  // samples/collator.js
  var require_collator = __commonJS({
    "samples/collator.js"(exports, module) {
      module.exports = addedWithCollator2;
      function addedWithCollator2(maps2, map, source, points, path) {
        maps2.feature({
          map,
          source,
          data: {
            properties: {
              type: "polyline"
            },
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: path
            }
          }
        });
        const collate = maps2.collate({
          map
        });
        points.forEach((pt) => {
          const ft = maps2.feature({
            map,
            source,
            data: {
              properties: {
                type: "circle"
              },
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: pt
              }
            }
          });
          ft.zindex = () => 1;
          collate.add(ft);
        });
        collate.calculate();
      }
    }
  });

  // samples/collator-spreader.js
  var require_collator_spreader = __commonJS({
    "samples/collator-spreader.js"(exports, module) {
      module.exports = addedWithCollatorAndSpreader2;
      function addedWithCollatorAndSpreader2(maps2, map, source, points, path) {
        maps2.feature({
          map,
          source,
          data: {
            properties: {
              type: "polyline"
            },
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: path
            }
          }
        });
        function calculate() {
          if (spread && collate) {
            spread.calculate();
            collate.calculate();
          }
        }
        const proj = maps2.projection({
          map,
          calculate
        });
        const spread = maps2.spread({
          map,
          projection: proj
        });
        const collate = maps2.collate({
          map,
          projection: proj
        });
        points.forEach((pt, i) => {
          let m;
          if (i % 2) {
            m = maps2.feature({
              map,
              source,
              data: {
                properties: {
                  type: "circle_orange"
                },
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: pt
                }
              }
            });
            m.zindex = () => 1;
            collate.add(m);
          } else {
            m = maps2.feature({
              map,
              source,
              data: {
                properties: {
                  type: "circle_teal"
                },
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: pt
                }
              }
            });
            m.zindex = () => 2;
            spread.add(m);
            collate.add(m, true);
          }
        });
        calculate();
      }
    }
  });

  // samples/spreader.js
  var require_spreader = __commonJS({
    "samples/spreader.js"(exports, module) {
      module.exports = addedWithSpreader2;
      function addedWithSpreader2(maps2, map, source, points, path) {
        maps2.feature({
          map,
          source,
          data: {
            properties: {
              type: "polyline"
            },
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: path
            }
          }
        });
        const spread = maps2.spread({
          map,
          threshold: 20
        });
        map.registerImage("circle_label", {
          path: "M 15 8 A 7 7 0 1 0 1 8 A 7 7 0 1 0 15 8",
          fillColor: "teal",
          strokeColor: "#0074D9",
          strokeWeight: 0,
          scale: 10
        }).then(() => {
          points.forEach((pt, i) => {
            spread.add(maps2.feature({
              map,
              source,
              data: {
                properties: {
                  type: "circle_label",
                  label: "" + (i + 1)
                },
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: pt
                }
              }
            }));
          });
          spread.calculate();
        });
      }
    }
  });

  // samples/china.js
  var require_china = __commonJS({
    "samples/china.js"(exports, module) {
      module.exports = sampleChina2;
      function sampleChina2(srv, map, source) {
        const center = [116.383473, 39.903331];
        const path = [
          center,
          [center[0] - 1e-3, center[1] + 1e-3],
          [center[0] + 1e-3, center[1] + 1e-3],
          center
        ], poly = [
          center,
          [center[0] - 1e-3, center[1] - 1e-3],
          [center[0] + 1e-3, center[1] - 1e-3],
          center
        ];
        map.zoom(17);
        srv.feature({
          map,
          source,
          data: {
            properties: {
              type: "china_circle"
            },
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: center
            }
          }
        });
        srv.feature({
          map,
          source,
          data: {
            properties: {
              type: "china_line"
            },
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: path
            }
          }
        });
        srv.feature({
          map,
          source,
          data: {
            properties: {
              type: "china_polygon"
            },
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [poly]
            }
          }
        });
        setTimeout(function() {
          map.center(center);
        }, 1);
      }
    }
  });

  // samples/markers.js
  var require_markers = __commonJS({
    "samples/markers.js"(exports, module) {
      module.exports = sampleMarkers2;
      function sampleMarkers2(srv, map, source) {
        let i;
        let mk;
        map.center([0.5, 0]);
        map.zoom(9);
        Promise.all([map.registerImage("markers_circle", {
          path: "M 15 8 A 7 7 0 1 0 1 8 A 7 7 0 1 0 15 8",
          fillColor: "transparent",
          strokeColor: "#0074D9",
          strokeWeight: 2
        }), map.registerImage("markers_flag", {
          path: "M 2 0 L 2 0.28125 L 2 13.6875 L 2 14 L 0.59375 14 L 0 14 L 0 14.59375 L 0 15.375 L 0 16 L 0.59375 16 L 4.40625 16 L 5 16 L 5 15.375 L 5 14.59375 L 5 14 L 4.40625 14 L 3 14 L 3 13.6875 L 3 9 L 16 5.5 L 3 2 L 3 0.28125 L 3 0 L 2.6875 0 L 2.3125 0 L 2 0 z ",
          fillColor: "orange",
          strokeColor: "orange",
          strokeWeight: 1
        }), map.registerImage(
          "markers_icon",
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIvPjxwYXRoIGQ9Ik0yIDJIMjRWMjRIMloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjEuOCAxMC40TDcuNSA2LjZWNC40SDYuNFYxOS44SDQuMlYyMkg5LjdWMTkuOEg3LjVWMTQuM1oiIGZpbGw9IiNmODAwMTIiLz48L3N2Zz4=",
          [26, 30]
        )]).then(() => {
          for (i = 0; i <= 8; i += 1) {
            let animate = i === 3;
            mk = srv.feature({
              map,
              source,
              animation: animate && "offset",
              data: {
                properties: {
                  type: "markers_symbol",
                  image: "markers_circle",
                  offset: [0, 0],
                  range: animate && 64,
                  size: (1 + i) / 8
                },
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [i / 8, 3 / 8]
                }
              }
            });
            if (animate) {
              mk.animation("bounce");
              setTimeout(mk.animation, 15 * 1e3);
            }
            srv.feature({
              map,
              source,
              data: {
                properties: {
                  type: "markers_symbol",
                  image: "markers_flag",
                  offset: [16, -16],
                  size: (1 + i) / 7
                },
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [i / 8, 1 / 8]
                }
              }
            });
            animate = i === 4;
            mk = srv.feature({
              map,
              source,
              animation: animate && "offset",
              data: {
                properties: {
                  type: "markers_symbol",
                  image: "markers_icon",
                  size: 0.5,
                  offset: [0, -30]
                },
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [i / 8, -1 / 8]
                }
              }
            });
            if (animate) {
              mk.animation("bounce");
              setTimeout(mk.animation, 15 * 1e3);
            }
          }
        });
      }
    }
  });

  // samples/index.js
  var require_samples = __commonJS({
    "samples/index.js"(exports, module) {
      module.exports = {
        addedDirectly: require_directly(),
        addedWithCollator: require_collator(),
        addedWithCollatorAndSpreader: require_collator_spreader(),
        addedWithSpreader: require_spreader(),
        sampleChina: require_china(),
        sampleMarkers: require_markers()
      };
    }
  });

  // ../lib/mixin.js
  var require_mixin = __commonJS({
    "../lib/mixin.js"(exports, module) {
      module.exports = mixin;
      function mixin(superior, mixin2) {
        return function() {
          const self = superior.apply(this, arguments);
          Object.keys(mixin2).forEach(function(m) {
            self[m] = self[m] || mixin2[m];
          });
          return self;
        };
      }
    }
  });

  // ../lib/service/mapbox/images.js
  var require_images = __commonJS({
    "../lib/service/mapbox/images.js"(exports, module) {
      module.exports = create;
      var pixelRatio = globalThis.devicePixelRatio || 1;
      function create() {
        let images = /* @__PURE__ */ Object.create(null);
        let imageQueue = /* @__PURE__ */ Object.create(null);
        function destroy() {
          Object.values(images).forEach(({ img, handler }) => img && img.removeEventListener("load", handler));
          images = /* @__PURE__ */ Object.create(null);
          imageQueue = /* @__PURE__ */ Object.create(null);
        }
        function addImage(map, name, img, url, fn) {
          function handler() {
            if (map._m) {
              map._m.addImage(name, img);
              if (fn) {
                fn();
              }
            }
            img.removeEventListener("load", handler);
            delete images[name].img;
            delete images[name].handler;
          }
          img.addEventListener("load", handler);
          images[name].img = img;
          images[name].handler = handler;
          img.setAttribute("src", url);
        }
        function add(map, name, url, size, fn) {
          let resolve;
          const promise = new Promise((res) => {
            resolve = res;
          });
          let img;
          if (images[name]) {
            resolve();
            return promise;
          }
          if (map._m && map.ready) {
            images[name] = /* @__PURE__ */ Object.create(null);
            img = document.createElement("img");
            if (size) {
              img.setAttribute("width", size[0] * pixelRatio + "px");
              img.setAttribute("height", size[1] * pixelRatio + "px");
            }
            addImage(map, name, img, url, () => {
              fn?.();
              resolve();
            });
          } else {
            imageQueue[name] = {
              url,
              size
            };
            resolve();
          }
          return promise;
        }
        function init(map) {
          const names = Object.keys(imageQueue);
          if (!names.length) {
            return;
          }
          names.forEach(function(name) {
            add(map, name, imageQueue[name].url, imageQueue[name].size);
          });
          imageQueue = /* @__PURE__ */ Object.create(null);
        }
        return {
          add,
          destroy,
          init
        };
      }
    }
  });

  // ../lib/service/events.js
  var require_events = __commonJS({
    "../lib/service/events.js"(exports, module) {
      function expand(result, e) {
        result[e] = e;
        return result;
      }
      module.exports = {
        drag: [
          "dragstart",
          "drag",
          "dragend"
        ].reduce(expand, {}),
        mouse: [
          "click",
          "mouseenter",
          "mouseleave",
          "mousemove",
          "mouseover",
          "mouseout",
          "dragstart",
          "drag",
          "dragend",
          "touchstart",
          "touchmove",
          "touchend"
        ].reduce(expand, {})
      };
    }
  });

  // ../lib/service/mapbox/util.js
  var require_util = __commonJS({
    "../lib/service/mapbox/util.js"(exports, module) {
      function mll2ll(mll) {
        return mll.toArray();
      }
      function mbounds2bounds(mb) {
        return mb && [
          mb.getSouthWest(),
          mb.getNorthEast()
        ].map(mll2ll);
      }
      function getProp(result, key) {
        result.out[key] = result.in[key];
        return result;
      }
      function getProperties(keys, object) {
        return keys.reduce(getProp, {
          in: object,
          out: {}
        }).out;
      }
      module.exports = {
        mll2ll,
        mbounds2bounds,
        getProperties
      };
    }
  });

  // ../lib/service/mapbox/object.js
  var require_object = __commonJS({
    "../lib/service/mapbox/object.js"(exports, module) {
      var drag = require_events().drag;
      var mouse = require_events().mouse;
      var util = require_util();
      module.exports = init;
      var events = {
        bounds_changed: "moveend",
        center_changed: "moveend",
        zoom_changed: "zoomend"
      };
      function handleEvent(self, fn, e) {
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        fn.call(self, e);
      }
      function handleMouseEvent(self, fn, e) {
        self.ll(e);
        if (!e.ll) {
          return;
        }
        handleEvent(self, fn, e);
      }
      function handleClickEvent(self, fn, e) {
        e.alreadyHandledByFeature = true;
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        self.ll(e);
        if (!e.ll) {
          return;
        }
        fn.call(self, e);
      }
      function handlePreprocessEvent(preprocessEvent, self, fn, e) {
        if (!preprocessEvent(e)) {
          return;
        }
        handleEvent(self, fn, e);
      }
      function ll(e) {
        if (e && e.lngLat) {
          e.ll = util.mll2ll(e.lngLat);
        }
      }
      function init(self, options) {
        let listeners = {};
        function on(event, fn) {
          let handler, feature;
          event = events[event] || event;
          if (event === "click" && self._l) {
            handler = handleClickEvent.bind(void 0, self, fn);
          } else if (mouse[event]) {
            handler = handleMouseEvent.bind(void 0, self, fn);
          } else if (options && options.preprocessEvent && options.preprocessEvent[event]) {
            handler = handlePreprocessEvent.bind(void 0, options.preprocessEvent[event], self, fn);
          } else {
            handler = handleEvent.bind(void 0, self, fn);
          }
          if (!drag[event]) {
            if (self._l) {
              feature = self._l.id;
              if (self._m) {
                self._featureEventHandler.on(event, self.layerId, feature, handler);
              }
            } else if (self._m) {
              self._featureEventHandler.mapOn(event, handler);
            }
          }
          listeners[event] = listeners[event] || [];
          listeners[event].push({
            event,
            feature,
            fn,
            handler
          });
          return self;
        }
        function off(event, fn) {
          if (event === void 0) {
            Object.keys(listeners).forEach(function(event2) {
              listeners[event2].forEach(function(listener) {
                off(listener.event, listener.fn);
              });
            });
            listeners = {};
          } else {
            event = events[event] || event;
            if (listeners[event] && listeners[event].some(function(listener, i, listeners2) {
              if (listener.fn === fn) {
                if (!drag[event]) {
                  if (listener.feature) {
                    if (self._m) {
                      self._featureEventHandler.off(event, self.layerId, listener.feature, listener.handler);
                    }
                  } else {
                    self._featureEventHandler?.mapOff(event, listener.handler);
                  }
                }
                listeners2.splice(i, 1);
                return true;
              }
            }) && !listeners[event].length) {
              delete listeners[event];
            }
          }
          return self;
        }
        function fire(event, e) {
          if (listeners[event]) {
            listeners[event].forEach(function(listener) {
              listener.handler(e);
            });
          }
        }
        function add(map) {
          if (!self._m) {
            self._m = map._m;
            options.onadd(map);
            self._featureEventHandler = map._featureEventHandler;
            Object.keys(listeners).forEach(function(event) {
              if (!drag[event]) {
                listeners[event].forEach(function(listener) {
                  if (listener.feature) {
                    self._featureEventHandler.on(listener.event, self.layerId, listener.feature, listener.handler);
                  } else {
                    self._featureEventHandler.mapOn(listener.event, listener.handler);
                  }
                });
              }
            });
          }
          return self;
        }
        function remove() {
          if (self._m) {
            Object.keys(listeners).forEach(function(event) {
              if (!drag[event]) {
                listeners[event].forEach(function(listener) {
                  if (listener.feature) {
                    self._featureEventHandler.off(listener.event, self.layerId, listener.feature, listener.handler);
                  } else {
                    self._featureEventHandler.mapOff(listener.event, listener.handler);
                  }
                });
              }
            });
            delete self._featureEventHandler;
            options.onremove();
            delete self._m;
          }
          return self;
        }
        self.on = on;
        self.off = off;
        self.fire = fire;
        self.ll = self.ll || ll;
        if (options) {
          if (options.onadd) {
            self.add = add;
          }
          if (options.onremove) {
            self.remove = remove;
          }
        }
        return self;
      }
    }
  });

  // ../lib/service/mapbox/updater.js
  var require_updater = __commonJS({
    "../lib/service/mapbox/updater.js"(exports, module) {
      module.exports = updater;
      function updater() {
        let tasks = {};
        function destroy() {
          Object.values(tasks).forEach((task) => clearTimeout(task));
          tasks = void 0;
        }
        function reschedule(id, task, data, update, timeout) {
          if (tasks[id]) {
            clearTimeout(tasks[id]);
          }
          if (update(data)) {
            delete tasks[id];
            task(data);
            return;
          }
          tasks[id] = setTimeout(() => {
            delete tasks[id];
            task(data);
          }, timeout);
        }
        return {
          reschedule,
          destroy
        };
      }
    }
  });

  // ../lib/service/mapbox/feature-event-handler/feature-collector.js
  var require_feature_collector = __commonJS({
    "../lib/service/mapbox/feature-event-handler/feature-collector.js"(exports, module) {
      module.exports = featureCollector;
      function featureCollector() {
        let oldFeatures = [];
        function checkAndRemove({ id }, features) {
          const index = features.findIndex((feature) => feature.id === id);
          const found = index >= 0;
          if (found) {
            features.splice(index, 1);
          }
          return found;
        }
        function onmove(newFeatures) {
          let mouseenter = [];
          let mouseover = [];
          let zindexEnter = 0;
          let zindexOver = 0;
          for (const f of newFeatures) {
            let { layer: { metadata: { zindex = 0 } } } = f;
            if (checkAndRemove(f, oldFeatures)) {
              mouseover.push(f);
              zindexOver = Math.max(zindex, zindexOver);
            } else {
              mouseenter.push(f);
              zindexEnter = Math.max(zindex, zindexEnter);
            }
          }
          let mouseleave = oldFeatures;
          if (zindexOver > zindexEnter) {
            mouseenter = [];
          } else {
            mouseleave.push(...mouseover);
            mouseover = [];
          }
          oldFeatures = newFeatures;
          return { mouseenter, mouseover, mouseleave };
        }
        function onout() {
          let mouseleave = oldFeatures;
          oldFeatures = [];
          return { mouseleave };
        }
        return {
          onmove,
          onout
        };
      }
    }
  });

  // ../lib/service/mapbox/feature-event-handler/listeners-bag.js
  var require_listeners_bag = __commonJS({
    "../lib/service/mapbox/feature-event-handler/listeners-bag.js"(exports, module) {
      module.exports = listenersBag;
      function isEmpty(o) {
        return Object.keys(o).length === 0;
      }
      function listenersBag() {
        let bag = /* @__PURE__ */ Object.create(null);
        let types2layers = /* @__PURE__ */ Object.create(null);
        function getListeners(type, featureId) {
          const features = bag[type];
          if (!features) {
            return [];
          }
          return features[featureId] || [];
        }
        function forType(type) {
          const layers = types2layers[type];
          return layers ? Object.keys(layers) : [];
        }
        function addLayer(type, layerId) {
          let layers = types2layers[type];
          if (!layers) {
            types2layers[type] = layers = /* @__PURE__ */ Object.create(null);
          }
          if (!layers[layerId]) {
            layers[layerId] = 1;
            return true;
          }
          layers[layerId] += 1;
        }
        function removeLayer(type, layerId) {
          let layers = types2layers[type];
          if (0 === --layers[layerId]) {
            delete layers[layerId];
            return true;
          }
        }
        function addListener(type, featureId, listener) {
          let features = bag[type];
          if (!features) {
            bag[type] = features = /* @__PURE__ */ Object.create(null);
          }
          let listeners = features[featureId];
          if (!listeners) {
            features[featureId] = listeners = [];
          }
          listeners.push(listener);
        }
        function removeListener(type, featureId, listener) {
          let listeners = bag[type][featureId];
          let index = listeners.indexOf(listener);
          if (index >= 0) {
            listeners.splice(index, 1);
          }
          if (listeners.length === 0) {
            let features = bag[type];
            delete features[featureId];
            if (isEmpty(features)) {
              delete bag[type];
            }
          }
        }
        function add(type, layerId, featureId, listener) {
          addListener(type, featureId, listener);
          if (!layerId.getLayers) {
            return addLayer(type, layerId);
          }
          layerId.getLayers()?.forEach((layerId2) => addLayer(type, layerId2));
        }
        function remove(type, layerId, featureId, listener) {
          removeListener(type, featureId, listener);
          if (!layerId.getLayers) {
            return removeLayer(type, layerId);
          }
          layerId.getLayers()?.forEach((layerId2) => removeLayer(type, layerId2));
        }
        return {
          getListeners,
          add,
          remove,
          forType
        };
      }
    }
  });

  // ../lib/service/mapbox/feature-event-handler/map-listeners-bag.js
  var require_map_listeners_bag = __commonJS({
    "../lib/service/mapbox/feature-event-handler/map-listeners-bag.js"(exports, module) {
      module.exports = mapListenersBag;
      function mapListenersBag() {
        let bag = /* @__PURE__ */ Object.create(null);
        function getListeners(type) {
          return bag[type] || [];
        }
        function add(type, listener) {
          let listeners = bag[type];
          if (!listeners) {
            bag[type] = listeners = [listener];
            return true;
          }
          listeners.push(listener);
        }
        function remove(type, listener) {
          let listeners = bag[type];
          let index = listeners.indexOf(listener);
          if (index >= 0) {
            listeners.splice(index, 1);
          }
          if (listeners.length === 0) {
            delete bag[type];
            return true;
          }
        }
        return {
          add,
          remove,
          getListeners
        };
      }
    }
  });

  // ../lib/service/mapbox/feature-event-handler/counting-set.js
  var require_counting_set = __commonJS({
    "../lib/service/mapbox/feature-event-handler/counting-set.js"(exports, module) {
      module.exports = countingSet;
      function countingSet() {
        const set = /* @__PURE__ */ Object.create(null);
        function inc(item) {
          if (!set[item]) {
            set[item] = 1;
            return true;
          }
          set[item] += 1;
        }
        function dec(item) {
          if (0 === --set[item]) {
            delete set[item];
            return true;
          }
        }
        return {
          inc,
          dec
        };
      }
    }
  });

  // ../lib/service/mapbox/query.js
  var require_query = __commonJS({
    "../lib/service/mapbox/query.js"(exports, module) {
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
          { x: pointMax.x, y: pointMin.y },
          // like world1
          pointMax,
          { x: pointMin.x, y: pointMax.y },
          // like world3
          pointMin
        ];
        const world1 = worldMax.clone();
        world1.column = worldMin.column;
        const world3 = worldMin.clone();
        world3.row = worldMax.row;
        const worldCoordinate = [
          worldMin,
          world1,
          worldMax,
          world3,
          worldMin
        ];
        return { viewport, worldCoordinate };
      }
      function queryRenderedFeatures(_m, point, fat, options) {
        const geometry = createQueryGeometry(point, fat, _m.transform);
        return _m.style.queryRenderedFeatures(geometry, options, _m.transform) || [];
      }
    }
  });

  // ../lib/service/mapbox/feature-event-handler/index.js
  var require_feature_event_handler = __commonJS({
    "../lib/service/mapbox/feature-event-handler/index.js"(exports, module) {
      var makeFeatureCollector = require_feature_collector();
      var makeListenersBag = require_listeners_bag();
      var makeMapListenersBag = require_map_listeners_bag();
      var makeCountingSet = require_counting_set();
      var query = require_query();
      module.exports = featureEventHandler;
      var mouseEvents = asMap([
        "mouseenter",
        "mouseover",
        "mouseleave"
      ]);
      var touchEvents = asMap([
        "touchstart",
        "touchend",
        "touchmove",
        "touchcancel"
      ]);
      function translateEventType(type) {
        switch (type) {
          case "mousemove":
            return "mouseover";
          case "mouseout":
            return "mouseleave";
          default:
            return type;
        }
      }
      function featureEventHandler(_m) {
        const listenersBag = makeListenersBag();
        const mapListenersBag = makeMapListenersBag();
        let activeTypes = makeCountingSet();
        let featureCollector = makeFeatureCollector();
        function on(type, layerId, featureId, listener) {
          type = translateEventType(type);
          listenersBag.add(type, layerId, featureId, listener);
          addMapListener(type);
        }
        function off(type, layerId, featureId, listener) {
          type = translateEventType(type);
          listenersBag.remove(type, layerId, featureId, listener);
          removeMapListener(type);
        }
        function mapOn(type, listener) {
          if (mapListenersBag.add(type, listener)) {
            addMapListener(type);
          }
        }
        function mapOff(type, listener) {
          if (mapListenersBag.remove(type, listener)) {
            removeMapListener(type);
          }
        }
        function addMapListener(type) {
          if (mouseEvents[type]) {
            addMapListener("mousemove");
            addMapListener("mouseout");
          } else {
            if (activeTypes.inc(type)) {
              _m.on(type, getHandler(type));
            }
          }
        }
        function removeMapListener(type) {
          if (mouseEvents[type]) {
            removeMapListener("mousemove");
            removeMapListener("mouseout");
          } else {
            if (activeTypes.dec(type)) {
              _m.off(type, getHandler(type));
            }
          }
        }
        function getHandler(type) {
          switch (type) {
            case "mousemove":
              return onmousemove;
            case "mouseout":
              return onmouseout;
            default:
              return onevent;
          }
        }
        function getCurrentLayers(type) {
          return listenersBag.forType(type).filter((l) => _m.getLayer(l));
        }
        function getCurrentMouseLayers() {
          let all = {};
          return Object.keys(mouseEvents).reduce((all2, type) => all2.concat(listenersBag.forType(type)), []).filter(function(l) {
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
            let { layer: { metadata: { zindex = 0 } } } = feature;
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
            listenersBag.getListeners(type, id).forEach((listener) => listener.call(_m, e));
            delete e.feature;
          });
        }
        function fireMapEvent(type, e) {
          mapListenersBag.getListeners(type).forEach((listener) => listener.call(_m, e));
        }
        function onmousemove(e) {
          const { point } = e;
          let layers = getCurrentMouseLayers();
          let features = queryRenderedFeatures("mousemove", point, { layers });
          let result = featureCollector.onmove(features);
          Object.entries(result).forEach(function([type, features2]) {
            e.type = type;
            fireEvent(type, e, features2, type !== "mouseleave");
          });
          if (0 === features.length) {
            fireMapEvent("mousemove", e);
          }
        }
        function onmouseout(e) {
          let result = featureCollector.onout();
          Object.entries(result).forEach(function([type, features]) {
            e.type = type;
            fireEvent(type, e, features);
          });
          fireMapEvent("mouseout", e);
        }
        function onevent(e) {
          const { type, point } = e;
          const layers = getCurrentLayers(type);
          const features = layers.length > 0 ? queryRenderedFeatures(type, point, { layers }) : [];
          if (features.length > 0) {
            fireEvent(type, e, features, true);
          } else {
            fireMapEvent(type, e);
          }
        }
        function queryRenderedFeatures(type, point, options) {
          const fat = touchEvents[type] ? 10 : 3;
          return query(_m, point, fat, options);
        }
        return {
          on,
          off,
          mapOn,
          mapOff
        };
      }
      function asMap(arr) {
        return arr.reduce(function(obj, type) {
          obj[type] = true;
          return obj;
        }, /* @__PURE__ */ Object.create(null));
      }
    }
  });

  // ../lib/service/mapbox/style/expression.js
  var require_expression = __commonJS({
    "../lib/service/mapbox/style/expression.js"(exports, module) {
      module.exports = check;
      function checkSingleProperty(property, object) {
        return object[property];
      }
      function checkProperty(property) {
        const object = this;
        return checkSingleProperty(property, object);
      }
      function checkAnyProperty(properties, object) {
        return properties.some(checkProperty, object);
      }
      function checkAllProperties(properties, object) {
        return properties.every(checkProperty, object);
      }
      function check(expr) {
        if (Array.isArray(expr)) {
          if (expr[0] === "all") {
            return checkAllProperties.bind(void 0, expr.slice(1));
          }
          return checkAnyProperty.bind(void 0, expr.slice(1));
        }
        return checkSingleProperty.bind(void 0, expr);
      }
    }
  });

  // ../lib/service/mapbox/style/visibility.js
  var require_visibility = __commonJS({
    "../lib/service/mapbox/style/visibility.js"(exports, module) {
      var expression = require_expression();
      module.exports = {
        initVisibility,
        evalVisibility
      };
      function initVisibility(id, visibility) {
        if (!visibility) {
          return;
        }
        let check = expression(visibility);
        return {
          id,
          check
        };
      }
      function setVisibility(style) {
        let { _m, object } = this;
        if (_m.getLayer(style.id)) {
          _m.setLayoutProperty(
            style.id,
            "visibility",
            style.check(object) ? "visible" : "none"
          );
        }
      }
      function evalVisibility(_m, visibility, object) {
        visibility.forEach(setVisibility, {
          _m,
          object
        });
      }
    }
  });

  // ../lib/service/mapbox/map.js
  var require_map = __commonJS({
    "../lib/service/mapbox/map.js"(exports, module) {
      var images = require_images();
      var object = require_object();
      var updater = require_updater();
      var util = require_util();
      var makeFeatureEventHandler = require_feature_event_handler();
      var query = require_query();
      var { initVisibility, evalVisibility } = require_visibility();
      module.exports = map;
      var SIZE = [16, 16];
      function getAttribution(result, attr) {
        attr = attr.slice(6).match(/(?:http:|https:)?\/\/([^\/?]+)/);
        if (attr) {
          attr = attr[1].split(".");
          if (attr.length > 1) {
            attr = attr[attr.length - 2];
          }
          if (attr) {
            result.push(attr);
          }
        }
        return result;
      }
      function preprocessDataEvent(event) {
        if (!(event.dataType === "source" && event.tile && (event.tile.state === "loaded" || event.tile.state === "unloaded"))) {
          return true;
        }
        let sourceAttribution;
        if (event.style && event.style.sourceCaches && event.sourceId) {
          let source = event.style.sourceCaches[event.sourceId];
          if (source.used) {
            sourceAttribution = source.getSource().attribution;
            if (sourceAttribution) {
              const attribution = sourceAttribution.match(/href="[^"]+/g);
              if (attribution) {
                event.attribution = attribution.reduce(getAttribution, []);
                event.attribution.metadata = event.source && event.source.metadata;
              }
            }
          }
        }
        if (event.source) {
          let source = event.source.url || event.source.tiles && event.source.tiles[0];
          if (source) {
            event.sourceHostname = new URL(source).hostname;
          }
          event.source.attribution = event.source.attribution || sourceAttribution;
        }
        return true;
      }
      function map(node, options) {
        let self;
        let mapTypeId;
        let styles;
        function element() {
          return node;
        }
        function center(c) {
          if (!c) {
            return util.mll2ll(self._m.getCenter());
          }
          self._m.setCenter(c);
        }
        function zoom(z) {
          if (z === void 0) {
            return Math.round(self._m.getZoom() + 1);
          }
          self._m[self._m.isStyleLoaded() ? "zoomTo" : "setZoom"](z - 1);
        }
        function bounds2(b) {
          if (b === void 0) {
            return util.mbounds2bounds(self._m.getBounds());
          }
          let opt = {
            padding: 100
          };
          if (!self._m.isStyleLoaded()) {
            opt.animate = false;
          }
          self._m.fitBounds(b, opt);
        }
        function panToBounds(bounds3) {
          self._m.panTo([bounds3[1][0], bounds3[0][1]]);
          return self;
        }
        function panBy(x, y) {
          self._m.panBy([x, y]);
          return self;
        }
        function mapType() {
          return mapTypeId;
        }
        function getSourceDefinition(source, deactivate) {
          const sourceDef = source.serialize();
          if (!sourceDef.tiles) {
            if (deactivate) {
              if (!(sourceDef.metadata && sourceDef.metadata.url)) {
                sourceDef.metadata = sourceDef.metadata || {};
                sourceDef.metadata.copyUrl = sourceDef.url;
              } else if (source.tiles) {
                sourceDef.tiles = source.tiles;
              }
              delete sourceDef.url;
            } else if (!sourceDef.url) {
              sourceDef.url = sourceDef.metadata && (sourceDef.metadata.url || sourceDef.metadata.copyUrl);
            }
          }
          return sourceDef;
        }
        function refresh(source, deactivate) {
          if (!source) {
            return self._m.resize();
          }
          let layers = [];
          layers.source = source;
          layers._layers = self._m.style._layers;
          layers = self._m.style._order.reduce(function(result, key, i, layers2) {
            const layer = result._layers[key];
            if (layer.source === result.source) {
              result.unshift({
                layer: layer.serialize(),
                before: layers2[i + 1]
              });
            }
            return result;
          }, layers);
          layers.forEach(function({ layer }) {
            self._m.removeLayer(layer.id);
          });
          const sourceDef = getSourceDefinition(self._m.getSource(source), deactivate);
          self._m.removeSource(source);
          self._m.addSource(source, sourceDef);
          layers.forEach(function({ layer, before }) {
            layer.layout = self._sources[source][layer.id].layout;
            self._m.addLayer(layer, before);
          });
        }
        function initStyles() {
          if (!styles) {
            let style = self._m.getStyle();
            if (style.layers) {
              styles = style.layers.reduce((result, layer) => {
                if (layer.source) {
                  self._sources[layer.source] = self._sources[layer.source] || {};
                  self._sources[layer.source][layer.id] = layer;
                }
                if (layer.metadata) {
                  let visibility2 = initVisibility(layer.id, layer.metadata.visibility);
                  if (visibility2) {
                    result.visibility.push(visibility2);
                  }
                  if (layer.metadata.zindex) {
                    let zi = layer.metadata.zindex;
                    self._layers[zi] = self._layers[zi] || [];
                    self._layers[zi].unshift(layer);
                  }
                }
                if (layer["source-layer"] === "poi") {
                  result.poi.push(layer.id);
                }
                return result;
              }, {
                poi: [],
                visibility: []
              });
              evalVisibility(self._m, styles.visibility, options.visibility);
            }
          }
        }
        function callback(e) {
          if (e.dataType === "style") {
            initStyles();
            if (options.onReady) {
              options.onReady(self);
            }
          }
        }
        function ll(e) {
          if (e && e.lngLat) {
            e.ll = util.mll2ll(e.lngLat);
          }
        }
        function queryRenderedFeatures(point, options2 = {}) {
          if (options2.layers === void 0 && styles) {
            options2.layers = styles.poi;
          }
          return query(self._m, point, 3, options2).map(({ properties, geometry }) => {
            if (geometry && geometry.type === "Point") {
              return Object.assign({
                ll: geometry.coordinates
              }, properties);
            }
            return properties;
          });
        }
        function visibility(key, value) {
          if (key === void 0) {
            return options.visibility;
          }
          if (typeof key === "object") {
            options.visibility = key;
          } else {
            options.visibility[key] = value;
          }
          evalVisibility(self._m, styles.visibility, options.visibility);
        }
        function path2url(url) {
          if (typeof url === "string") {
            return url;
          }
          let {
            path,
            fillColor,
            strokeColor,
            strokeWeight,
            scale = 1,
            size = SIZE
          } = url;
          if (scale !== 1) {
            size = [Math.round(size[0] * scale), Math.round(size[1] * scale)];
          }
          url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0] + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(" ") + '"><path d="' + path + '" stroke="' + strokeColor + '" stroke-width="' + strokeWeight + '"';
          if (fillColor) {
            url += ' fill="' + fillColor + '"';
          }
          if (scale !== 1) {
            url += ' transform="scale(' + scale + ')"';
          }
          url += "/></svg>";
          return "data:image/svg+xml;base64," + btoa(url);
        }
        function registerImage(name, url, size = SIZE) {
          const map2 = {
            _m: self._m,
            ready: true
          };
          self._images.init(map2);
          return self._images.add(map2, name, path2url(url), size);
        }
        function destroy() {
          if (self._updater) {
            self._updater.destroy();
            delete self._updater;
          }
          if (self._m) {
            self.off();
            self._m.remove();
            self._images.destroy();
            delete self._m;
            delete self._images;
            delete self._layers;
          }
          styles = void 0;
        }
        options = Object.assign({
          mapboxgl,
          container: node,
          style: {
            version: 8,
            sources: {},
            layers: []
          },
          visibility: {}
        }, options);
        self = object({
          bounds: bounds2,
          center,
          destroy,
          element,
          fitBounds: bounds2,
          // obsolete; use bounds(b)
          ll,
          mapType,
          panBy,
          panToBounds,
          queryRenderedFeatures,
          refresh,
          visibility,
          zoom,
          registerImage
        }, {
          preprocessEvent: {
            data: preprocessDataEvent
          }
        });
        if (options.zoom) {
          options.zoom -= 1;
        }
        if (options.minZoom) {
          options.minZoom -= 1;
        }
        if (options.maxZoom) {
          options.maxZoom -= 1;
        }
        self._m = new options.mapboxgl.Map(options);
        self._m.touchZoomRotate.disableRotation();
        self._featureEventHandler = makeFeatureEventHandler(self._m);
        self._images = images();
        self._layers = {};
        self._updater = updater();
        self._sources = {};
        self._m.once("styledata", callback);
        return self;
      }
    }
  });

  // ../lib/service/mapbox/layer.js
  var require_layer = __commonJS({
    "../lib/service/mapbox/layer.js"(exports, module) {
      var object = require_object();
      module.exports = layer;
      var id = 0;
      function updateProperty(key) {
        const params = this;
        params.m[params.set](params.id, key, params.values[key]);
      }
      function updateProperties(m, id2, layer2, prop, set) {
        Object.keys(layer2[prop]).forEach(updateProperty, {
          id: id2,
          values: layer2[prop],
          m,
          set
        });
      }
      function noop() {
      }
      function inLayer(searchedLayer, layer2) {
        return layer2.id === searchedLayer.id || layer2.type === searchedLayer.type && layer2.layout === searchedLayer.layout && layer2.paint === searchedLayer.paint;
      }
      function isFeature(id2, feature) {
        return id2 === feature.id;
      }
      function doUpdate(data) {
        let { m, l } = data;
        delete l._updateCounter;
        m.getSource(l.source.data.id).setData(l.source.data);
      }
      function checkUpdate(data) {
        data.l._updateCounter += 1;
        return data.l._updateCounter > 500;
      }
      function updateLayer(updater, m, l) {
        if (!updater) {
          return;
        }
        l._updateCounter = l._updateCounter || 0;
        updater.reschedule(l.id, doUpdate, {
          m,
          l
        }, checkUpdate, 200);
      }
      function layer(getChangedProperties, create) {
        getChangedProperties = getChangedProperties || noop;
        return function(self, options) {
          let added, addBack, images, layers, updater;
          function afterLayer(l) {
            let zi, before;
            zi = l.metadata.zindex;
            if (layers[zi] && layers[zi].length) {
              return layers[zi][0].id;
            }
            Object.keys(layers).some(function(zindex2) {
              if (zindex2 > zi && layers[zindex2].length) {
                before = layers[zindex2][0].id;
                return true;
              }
            });
            return before;
          }
          function addLayer(l, before) {
            const zi = l.metadata.zindex;
            layers[zi] = layers[zi] || [];
            layers[zi].unshift(l);
            self._m.addLayer(Object.assign({}, l), before);
          }
          function findLayer(l) {
            const zi = l.metadata.zindex;
            let idx;
            if (!layers[zi]) {
              return;
            }
            idx = layers[zi].findIndex(inLayer.bind(void 0, l));
            if (idx > -1) {
              return layers[zi][idx];
            }
          }
          function onadd(map) {
            let l;
            if (added) {
              return;
            }
            if (!self._m) {
              return;
            }
            options.map = map;
            updater = updater || map._updater;
            layers = layers || map._layers;
            self._l.source.data.id = self._l.source.data.id || self._l.id;
            l = findLayer(self._l);
            if (l) {
              if (typeof l.source === "string") {
                l.source = {
                  data: {
                    id: l.source,
                    type: "FeatureCollection",
                    features: []
                  }
                };
              }
              l.source.data.features.unshift(self._l.source.data);
              updateLayer(updater, self._m, l);
            } else {
              id += 1;
              l = {
                id: "" + id,
                type: self._l.type,
                source: {
                  type: "geojson",
                  data: {
                    id: "" + id,
                    type: "FeatureCollection",
                    features: [self._l.source.data]
                  }
                },
                metadata: {
                  zindex: self._l.metadata.zindex
                },
                layout: self._l.layout,
                paint: self._l.paint
              };
              addLayer(l, afterLayer(l));
            }
            self.layerId = l.id;
            added = true;
            images = images || map._images;
            images.init({
              _m: self._m,
              ready: true
            });
          }
          function onremove() {
            let l, idx;
            if (!added) {
              return;
            }
            added = void 0;
            if (!addBack && self.cancelDrag) {
              self.cancelDrag();
            }
            l = findLayer(self._l);
            if (l) {
              idx = l.source.data.features.findIndex(isFeature.bind(void 0, self._l.source.data.id));
              if (idx > -1) {
                l.source.data.features.splice(idx, 1);
                updateLayer(updater, self._m, l);
              }
            }
            delete self.layerId;
            images = void 0;
            layers = void 0;
          }
          function update(layer2) {
            let l, idx;
            if (self._m && added) {
              l = findLayer(self._l);
              if (l) {
                if (layer2) {
                  updateProperties(self._m, l.id, self._l, "paint", "setPaintProperty");
                  updateProperties(self._m, l.id, self._l, "layout", "setLayoutProperty");
                }
                idx = l.source.data.features.findIndex(isFeature.bind(void 0, self._l.source.data.id));
                if (idx > -1) {
                  l.source.data.features[idx].properties = self._l.source.data.properties;
                  updateLayer(updater, self._m, l);
                }
              }
            }
          }
          function option(key, value) {
            let props;
            if (value === void 0) {
              if (key === "zIndex") {
                return self._l.metadata.zindex - self.zindexLevel;
              }
              return self._l.source.data.properties[key] || options[key];
            }
            if (key === "draggable" && self.changeDraggable) {
              self.changeDraggable(value);
            } else {
              if (key === "zIndex") {
                value = Math.round(value + self.zindexLevel);
                if (value === self._l.metadata.zindex) {
                  return;
                }
                props = {
                  zindex: value
                };
              } else {
                if (options[key] === value) {
                  return;
                }
                props = getChangedProperties(key, value, options);
                options[key] = value;
                if (self._l.source.data.properties.hasOwnProperty(key)) {
                  self._l.source.data.properties[key] = value;
                }
                if (!props) {
                  update();
                  return;
                }
              }
              if (props.data) {
                if (props.update) {
                  Object.assign(self._l.source.data.properties, props.data);
                } else {
                  self._l.source.data.properties = props.data;
                }
              }
              if (props.image) {
                self.image(
                  props.image.name,
                  props.image.url,
                  props.image.size,
                  options.map && options.map._images,
                  self.update
                );
              }
              if (props.type && props.type !== self._l.type || props.paint && props.paint !== self._l.paint || props.layout && props.layout !== self._l.layout || props.zindex !== void 0 && props.zindex !== self._l.metadata.zindex) {
                if (self._m) {
                  addBack = options.map;
                  self.remove();
                }
                self._l.type = props.type || self._l.type;
                self._l.paint = props.paint || self._l.paint;
                self._l.layout = props.layout || self._l.layout;
                self._l.metadata.zindex = props.zindex || self._l.metadata.zindex;
                if (addBack) {
                  self.add(options.map);
                  addBack = void 0;
                }
                return;
              }
              if (props.paint || props.layout || props.data) {
                update(!props.data);
              }
            }
          }
          function image(name, url, size, _images, fn) {
            (_images || images).add({
              _m: self._m,
              ready: true
            }, name, url, size, fn);
          }
          function zindex(zi) {
            return option("zIndex", zi);
          }
          self = object(Object.assign(self, {
            image,
            option,
            update,
            zindex
          }), {
            onadd,
            onremove
          });
          if (options.map) {
            images = options.map._images;
            layers = options.map._layers;
          }
          id += 1;
          options = create(self, id, options);
          self._l.source.data.properties.map_facade = true;
          self.zindexLevel = self.zindexLevel || 0;
          self._l.metadata = self._l.metadata || {};
          self._l.metadata.zindex = Math.round((options.zIndex || 0) + self.zindexLevel);
          if (options.map) {
            self.add(options.map);
          }
          return self;
        };
      }
    }
  });

  // ../lib/service/mapbox/artifact.js
  var require_artifact = __commonJS({
    "../lib/service/mapbox/artifact.js"(exports, module) {
      module.exports = artifact;
      function getChangedProperties() {
      }
      function create(self, id, options) {
        self._l = {
          id: options.style.layer,
          source: {
            type: "geojson",
            data: {
              id: "" + id,
              type: "Feature",
              properties: options.style.properties || {},
              geometry: options.path ? {
                type: "LineString",
                coordinates: options.path
              } : {
                type: "Point",
                coordinates: options.position || [0, 0]
              }
            }
          }
        };
        return options;
      }
      var layer = require_layer()(getChangedProperties, create);
      function artifact(options) {
        let self;
        function path(p) {
          if (p === void 0) {
            return self._l.source.data.geometry.coordinates;
          }
          self._l.source.data.geometry.coordinates = p;
          self.update();
        }
        self = layer({
          path
        }, options);
        return self;
      }
    }
  });

  // ../lib/service/mapbox/feature/source.js
  var require_source = __commonJS({
    "../lib/service/mapbox/feature/source.js"(exports, module) {
      module.exports = {
        addToSource,
        removeFromSource
      };
      var sources = /* @__PURE__ */ new Map();
      var updates = /* @__PURE__ */ new Map();
      function updateMap(map, id, data) {
        if (updates.get(id)) {
          return;
        }
        updates.set(id, setTimeout(() => {
          updates.delete(id);
          map?._m?.getSource(id)?.setData(data);
        }, 0));
      }
      function addToSource(map, id, feature) {
        let data = sources.get(id);
        if (!data) {
          data = {
            type: "FeatureCollection",
            features: []
          };
          sources.set(id, data);
        }
        data.features.push(feature);
        updateMap(map, id, data);
      }
      function removeFromSource(map, id, featureId) {
        const data = sources.get(id);
        if (!data) {
          return;
        }
        const idx = data.features.findIndex((f) => f.id === featureId);
        if (idx === -1) {
          return;
        }
        data.features.splice(idx, 1);
        updateMap(map, id, data);
      }
    }
  });

  // ../lib/service/mapbox/animation.js
  var require_animation = __commonJS({
    "../lib/service/mapbox/animation.js"(exports, module) {
      module.exports = init;
      function init(self, { animation: animationProperty }) {
        let animating;
        let interval;
        let savedProperty;
        function nextFrame(params) {
          params.counter += params.delta;
          if (params.counter >= params.range || params.counter <= 0) {
            params.delta = -params.delta;
          }
        }
        function animateMarker(params) {
          if (self._m._loaded) {
            const data = self.data();
            data.properties[animationProperty] = [savedProperty[0], savedProperty[1] - params.counter];
            self.data(data);
            nextFrame(params);
          }
        }
        function startBounce() {
          if (interval) {
            return;
          }
          let params = {
            counter: 0,
            delta: 4
          };
          const { properties } = self.data();
          savedProperty = properties[animationProperty];
          params.range = properties.range ?? Math.abs(savedProperty[1]);
          params.range += params.delta - params.range % params.delta;
          interval = setInterval(animateMarker.bind(void 0, params), 100);
        }
        function stopBounce() {
          if (!interval) {
            return;
          }
          clearInterval(interval);
          interval = void 0;
          const data = self.data();
          data.properties[animationProperty] = savedProperty;
          self.data(data);
          return true;
        }
        function animation(type) {
          if (animating !== type) {
            animating = type;
            setTimeout(self.fire.bind(self, "animation_changed"), 1);
            if (type === "bounce") {
              startBounce();
            } else if (!type) {
              stopBounce();
            }
          }
        }
        self.animation = animation;
        return self;
      }
    }
  });

  // ../lib/service/mapbox/draggable.js
  var require_draggable = __commonJS({
    "../lib/service/mapbox/draggable.js"(exports, module) {
      module.exports = draggable;
      function dragPosition(e) {
        return e;
      }
      function draggable(self, options) {
        let enabled = false;
        let dragging = false;
        let pending = false;
        let touchTimeout;
        function onmove(e) {
          e.preventDefault();
          e.originalEvent.preventDefault();
          if (!dragging) {
            if (pending) {
              pending = false;
              dragging = true;
              e.drag = true;
              self.fire("dragstart", self.dragPosition(e));
            }
            return;
          }
          e.drag = true;
          self.fire("drag", self.dragPosition(e));
        }
        function cancel(e = {}) {
          if (!self._m) {
            return;
          }
          self._m.off("mouseup", mouseup);
          self._m.off("touchend", touchend);
          self._m.off("touchcancel", cancel);
          self._m.off("mousemove", onmove);
          self._m.off("touchmove", onmove);
          if (pending) {
            pending = false;
            return;
          }
          if (!dragging) {
            return;
          }
          dragging = false;
          e.drag = true;
          self.fire("dragcancel", e);
        }
        function mouseup(e) {
          self._m.off("mousemove", onmove);
          e.preventDefault();
          e.originalEvent.preventDefault();
          dragging = false;
          e.drag = true;
          self.fire("dragend", self.dragPosition(e));
        }
        function touchend(e) {
          self._m.off("movestart", cancel);
          self._m.off("touchmove", onmove);
          self._m.off("touchcancel", cancel);
          e.preventDefault();
          e.originalEvent.preventDefault();
          if (!dragging) {
            if (touchTimeout) {
              clearTimeout(touchTimeout);
              touchTimeout = void 0;
              self.fire("click", e);
            }
            return;
          }
          dragging = false;
          e.drag = true;
          self.fire("dragend", self.dragPosition(e));
        }
        function onmousedown(e) {
          if (!enabled) {
            return;
          }
          e.preventDefault();
          if (dragging || self._m.isMoving()) {
            return;
          }
          pending = true;
          self._m.once("mouseup", mouseup);
          self._m.on("mousemove", onmove);
        }
        function ontouchstart(e) {
          if (!enabled) {
            return;
          }
          e.preventDefault();
          if (dragging || self._m.isMoving() || e.originalEvent.touches.length > 1) {
            return;
          }
          self._m.once("touchend", touchend);
          self._m.once("touchcancel", cancel);
          self._m.once("movestart", cancel);
          touchTimeout = setTimeout(function() {
            touchTimeout = void 0;
            pending = true;
            self._m.on("touchmove", onmove);
          }, 300);
        }
        function enable() {
          if (enabled) {
            return;
          }
          enabled = true;
          self.on("mousedown", onmousedown);
          self.on("touchstart", ontouchstart);
        }
        function disable() {
          if (!enabled) {
            return;
          }
          enabled = false;
          self.off("mousedown", onmousedown);
          self.off("touchstart", ontouchstart);
          cancel();
        }
        function changeDraggable(d) {
          return d ? enable() : disable();
        }
        self.changeDraggable = changeDraggable;
        self.dragPosition = self.dragPosition || dragPosition;
        self.cancelDrag = cancel;
        if (options.draggable) {
          enable();
        }
        return self;
      }
    }
  });

  // ../lib/util.js
  var require_util2 = __commonJS({
    "../lib/util.js"(exports, module) {
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
        return Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2);
      }
      function pointOnLine(p, p1, p2) {
        let m1, m2, x, y;
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
        let p2, p, dist;
        if (Math.abs(res.point[0] - p1[0]) < res.margin[0] && Math.abs(res.point[1] - p1[1]) < res.margin[1]) {
          p = p1;
        } else if (i < path.length - 1) {
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
      function findPointOnPath(point, path, margin) {
        let result;
        if (point && path && margin) {
          result = path.reduce(closestPoint, {
            dist: Number.MAX_VALUE,
            point,
            margin
          });
          if (result.idx !== void 0) {
            point = path[result.idx];
            result.pol = result.p !== path[result.idx] && (result.idx === path.length - 1 || result.p !== path[result.idx + 1]);
            return result;
          }
        }
      }
      module.exports = {
        distance,
        findPoint: findPointOnPath
      };
    }
  });

  // ../lib/service/mapbox/feature/index.js
  var require_feature = __commonJS({
    "../lib/service/mapbox/feature/index.js"(exports, module) {
      var { addToSource, removeFromSource } = require_source();
      var animation = require_animation();
      var draggable = require_draggable();
      var { findPoint } = require_util2();
      var { mll2ll } = require_util();
      var object = require_object();
      module.exports = init;
      var featureId = 0;
      function margin(_m, p, margin2) {
        const p1 = _m.unproject(p), p2 = _m.unproject({
          x: p.x + margin2,
          y: p.y + margin2
        });
        return [Math.abs(p1.lng - p2.lng), Math.abs(p1.lat - p2.lat)];
      }
      function init(options) {
        let layers;
        function onadd(map) {
          options.map = map;
          addToSource(map, self._source, self._data);
          layers = self._m.getStyle().layers.filter(({ source }) => source === options.source).map(({ id }) => id);
        }
        function onremove() {
          removeFromSource(options.map, self._source, self._data.id);
        }
        function position(p) {
          if (p === void 0) {
            return self._data.geometry?.coordinates;
          }
          if (self._data.geometry) {
            self._data.geometry.coordinates = p;
            data(self._data);
          }
        }
        function data(data2) {
          if (data2 === void 0) {
            return self._data;
          }
          const { map } = options;
          self.remove();
          data2.id ??= self._data.id;
          self._data = data2;
          if (map && data2.type) {
            self.add(map);
          }
        }
        function ll(e) {
          if (!e?.lngLat) {
            return;
          }
          e.ll = mll2ll(e.lngLat);
          if (e.drag || self._data.geometry?.type !== "LineString") {
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
            e.featurePoint.prev = self._m.project(path[point.pol ? point.idx : point.idx - 1]);
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
          _l: {
            id: options.data.id
          },
          layerId: {
            getLayers: () => layers
          },
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
    }
  });

  // ../lib/service/mapbox/marker.js
  var require_marker = __commonJS({
    "../lib/service/mapbox/marker.js"(exports, module) {
      var draggable = require_draggable();
      module.exports = marker;
      var iconPath = {
        circle: circleIcon
      };
      var SIZE = [16, 16];
      var pixelRatio = globalThis.devicePixelRatio || 1;
      var LAYOUT = {
        circle: {},
        symbol: {
          "icon-image": ["get", "iconImage"],
          "icon-size": ["get", "iconSize"],
          "icon-rotate": ["get", "iconRotate"],
          "icon-offset": ["get", "iconOffset"],
          "icon-allow-overlap": true
        },
        label: {
          "icon-image": ["get", "iconImage"],
          "icon-size": ["get", "iconSize"],
          "icon-rotate": ["get", "iconRotate"],
          "icon-offset": ["get", "iconOffset"],
          "icon-allow-overlap": true,
          "text-field": ["get", "label"],
          "text-font": ["Noto Sans Regular"],
          "text-allow-overlap": true,
          "text-max-width": 100,
          "text-size": ["get", "textSize"]
        }
      };
      var PAINT = {
        circle: {
          "circle-radius": ["get", "circleRadius"],
          "circle-color": ["get", "fillColor"],
          "circle-opacity": ["get", "fillOpacity"],
          "circle-stroke-color": ["get", "strokeColor"],
          "circle-stroke-opacity": ["get", "strokeOpacity"],
          "circle-stroke-width": ["get", "strokeWeight"],
          "circle-translate": [0, 0]
        },
        animateCircle: {
          "circle-radius": ["get", "circleRadius"],
          "circle-color": ["get", "fillColor"],
          "circle-opacity": ["get", "fillOpacity"],
          "circle-stroke-color": ["get", "strokeColor"],
          "circle-stroke-opacity": ["get", "strokeOpacity"],
          "circle-stroke-width": ["get", "strokeWeight"],
          "circle-translate": [0, 0]
        },
        symbol: {
          "icon-opacity": ["get", "fillOpacity"],
          "icon-translate": [0, 0]
        },
        animateSymbol: {
          "icon-opacity": ["get", "fillOpacity"],
          "icon-translate": [0, 0]
        },
        label: {
          "icon-opacity": ["get", "fillOpacity"],
          "icon-translate": [0, 0],
          "text-color": ["get", "textColor"],
          "text-halo-width": 0.25,
          "text-halo-color": "rgba(255,255,255,1)"
        },
        below: {
          "icon-opacity": ["get", "fillOpacity"],
          "icon-translate": [0, 0],
          "text-color": ["get", "textColor"],
          "text-translate": [0, SIZE[1] / 2 + 2]
        }
      };
      function image(icon) {
        return {
          type: "symbol",
          image: {
            name: icon.iconImage,
            url: icon.url,
            size: icon.size
          },
          data: icon,
          layout: LAYOUT[icon.label ? "label" : "symbol"],
          paint: PAINT[icon.label ? icon.textBelow ? "below" : "label" : "symbol"]
        };
      }
      function circle(icon) {
        return {
          type: "circle",
          data: icon,
          layout: LAYOUT.circle,
          paint: PAINT.circle
        };
      }
      function circleIcon(icon) {
        return Object.assign(icon, {
          circleRadius: (icon.scale || 2) - 1
        });
      }
      function path(icon) {
        let size = icon.size || SIZE;
        const scale = icon.scale || 1;
        let anchor = icon.anchor;
        let url;
        if (icon.scale !== 1) {
          size = [Math.round(size[0] * scale), Math.round(size[1] * scale)];
        }
        url = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size[0] + '" height="' + size[1] + '" viewBox="0 0 ' + size.join(" ") + '"><path d="' + icon.path + '" stroke="' + icon.strokeColor + '" stroke-width="' + icon.strokeWeight + '"';
        if (icon.fillColor) {
          url += ' fill="' + icon.fillColor + '"';
        }
        if (scale !== 1) {
          url += ' transform="scale(' + scale + ')"';
        }
        url += "/></svg>";
        if (anchor) {
          anchor = [Math.round(anchor[0] * scale), Math.round(anchor[1] * scale)];
        }
        return Object.assign(icon, {
          url: "data:image/svg+xml;base64," + btoa(url),
          path: url,
          anchor,
          size,
          scale: 1,
          rotation: icon.rotation
        });
      }
      function initIcon(color, icon) {
        icon = Object.assign(icon.url ? {
          scale: 1
        } : {
          path: "circle",
          strokeColor: "#555555",
          strokeWeight: 2,
          scale: 7
        }, icon);
        if (color !== void 0) {
          icon.fillColor = color;
          if (icon.fillOpacity === void 0) {
            icon.fillOpacity = 1;
          }
        } else if (icon.path === "circle") {
          icon.fillOpacity = icon.fillOpacity || 0;
        } else if (icon.fillOpacity === void 0) {
          icon.fillOpacity = 1;
        }
        icon.fillColor = icon.fillColor || "#FFFFFF";
        icon.strokeOpacity = icon.strokeOpacity || 1;
        icon.textColor = icon.textColor || "#FFFFFF";
        icon.textSize = icon.textSize || 10;
        return icon;
      }
      function animationPaint(translate, options) {
        const circle2 = options.icon && (options.icon.path === "circle" && !options.label || !options.icon.url), paint = PAINT[circle2 ? "animateCircle" : "animateSymbol"];
        if (translate) {
          paint[circle2 ? "circle-translate" : "icon-translate"] = translate;
          return paint;
        }
        paint[circle2 ? "circle-translate" : "icon-translate"] = [0, 0];
        return PAINT[circle2 ? "circle" : options.label ? options.icon && options.icon.textBelow ? "below" : "label" : "symbol"];
      }
      function getChangedProperties(key, i, options) {
        if (key === "icon") {
          i = initIcon(i.color, i);
          if (i.path === "circle" && i.label) {
            i.path = "M 15 8 A 7 7 0 1 0 1 8 A 7 7 0 1 0 15 8";
            if (i.scale) {
              if (i.strokeWeight) {
                i.scale -= i.strokeWeight;
              }
              i.scale *= 0.14;
            } else {
              i.scale = 1;
            }
            i.anchor = [SIZE[0] / 2, SIZE[1] / 2];
          }
          if (i.path && !i.url) {
            i = (iconPath[i.path] || path)(i);
            if (!i) {
              return;
            }
          }
          i.iconOffset = offset(i);
          if (i.path === "circle") {
            return circle(i);
          }
          i.iconImage = i.path || i.url;
          if (!i.iconImage) {
            return;
          }
          i.iconSize = (i.scale || 1) / pixelRatio;
          i.iconRotate = i.rotation || 0;
          return image(i);
        }
        if (key === "animation") {
          return {
            paint: animationPaint(i, options)
          };
        }
        if (key === "visible") {
          if (i) {
            return {
              update: true,
              data: {
                fillOpacity: options.fillOpacity,
                strokeOpacity: options.strokeOpacity
              }
            };
          } else {
            return {
              update: true,
              data: {
                fillOpacity: 0,
                strokeOpacity: 0
              }
            };
          }
        }
      }
      function create(self, id, options) {
        let icon = Object.assign({
          color: options.color,
          label: options.label && "" + options.label,
          zIndex: options.zIndex
        }, options.icon);
        self._l = {
          id: "" + id,
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: options.position || [0, 0]
              }
            }
          },
          metadata: {
            marker: true
          }
        };
        icon = getChangedProperties("icon", icon);
        self._l.source.data.properties = icon.data;
        self._l.type = icon.type;
        self._l.layout = icon.layout;
        self._l.paint = icon.paint;
        if (icon.image) {
          self.image(
            icon.image.name,
            icon.image.url,
            icon.image.size,
            options.map && options.map._images,
            self.update
          );
        }
        return options;
      }
      var layer = require_layer()(getChangedProperties, create);
      function offset(icon) {
        let r;
        const scale = icon.scale || 1;
        let size = icon.size;
        if (icon.anchor) {
          size = size || SIZE;
          icon.offset = [
            Math.round(pixelRatio * (size[0] / 2 / scale - icon.anchor[0])),
            Math.round(pixelRatio * (size[1] / 2 / scale - icon.anchor[1]))
          ];
          return icon.offset;
        }
        if (size) {
          icon.offset = [
            -Math.round(pixelRatio * size[0] / 4 / scale),
            -Math.round(pixelRatio * size[1] / 2 / scale)
          ];
          return [0, icon.offset[1]];
        }
        r = -scale - Math.round(icon.strokeWeight / 2);
        icon.offset = [r, r];
        return icon.offset;
      }
      function marker(options) {
        let self, animating, interval;
        function position(p) {
          if (p === void 0) {
            return self._l.source.data.geometry.coordinates;
          }
          self._l.source.data.geometry.coordinates = p;
          self.update();
        }
        function nextFrame(params) {
          params.counter += params.delta;
          if (params.counter >= params.range || params.counter <= 0) {
            params.delta = -params.delta;
          }
        }
        function animateMarker(params) {
          if (self._m._loaded) {
            self.option("animation", [0, -params.counter]);
            nextFrame(params);
          }
        }
        function startBounce() {
          let params, properties;
          if (interval) {
            return;
          }
          params = {
            counter: 0,
            delta: 4
          };
          properties = self._l.source.data.properties;
          if (self._l.type === "symbol") {
            params.range = Math.abs(properties.iconOffset[1] * properties.iconSize);
          } else {
            params.range = properties.circleRadius * 8;
          }
          params.range += params.delta - params.range % params.delta;
          interval = setInterval(animateMarker.bind(void 0, params), 200);
        }
        function stopBounce() {
          if (!interval) {
            return;
          }
          clearInterval(interval);
          interval = void 0;
          self.option("animation", false);
          return true;
        }
        function animation(type) {
          if (animating !== type) {
            animating = type;
            setTimeout(self.fire.bind(self, "animation_changed"), 1);
            if (type === "bounce") {
              startBounce();
            } else if (!type) {
              stopBounce();
            }
          }
        }
        function icon(i) {
          let bounce;
          if (i === void 0) {
            return self.option("icon", i);
          }
          bounce = stopBounce();
          if (options.label) {
            i.label = "" + options.label;
          }
          self.option("icon", i);
          if (bounce) {
            startBounce();
          }
        }
        function dragPosition(e) {
          const properties = self._l.source.data.properties;
          if (properties.url && properties.iconOffset) {
            e.lngLat = self._m.unproject({
              x: e.point.x - properties.iconOffset[0] / 2,
              y: e.point.y - properties.iconOffset[1] / 2
            });
            self.ll(e);
          }
          return e;
        }
        options = Object.assign({
          margin: 10,
          clickable: true,
          flat: true,
          icon: {}
        }, options);
        self = layer({
          animation,
          dragPosition,
          icon,
          position,
          zindexLevel: 1e6
        }, options);
        self = draggable(self, options);
        if (options.position) {
          self.position(options.position);
        }
        if (options.map) {
          self.add(options.map);
        }
        return self;
      }
    }
  });

  // ../lib/service/mapbox/polygon.js
  var require_polygon = __commonJS({
    "../lib/service/mapbox/polygon.js"(exports, module) {
      var util = require_util();
      module.exports = polygon;
      var properties = [
        "fillColor",
        "fillOpacity",
        "strokeColor"
      ];
      var LAYOUT = {};
      var PAINT = {
        "fill-color": ["get", "fillColor"],
        "fill-opacity": ["get", "fillOpacity"],
        "fill-outline-color": ["get", "strokeColor"]
      };
      function getChangedProperties(key, value, options) {
        if (key === "visible") {
          if (value) {
            return {
              update: true,
              data: {
                fillOpacity: options.fillOpacity
              }
            };
          } else {
            return {
              update: true,
              data: {
                fillOpacity: 0
              }
            };
          }
        }
      }
      function getType(path) {
        if (typeof path[0][0] === "number") {
          return "Polygon";
        }
        return "MultiPolygon";
      }
      function getCoordinates(type, path) {
        if (type === "Polygon") {
          return [path];
        }
        return path;
      }
      function create(self, id, options) {
        options.fillColor = options.fillColor || "#FFFFFF";
        options.fillOpacity = options.fillOpacity || 0;
        options.strokeColor = options.strokeColor || "#FFFFFF";
        const path = options.path || [[0, 0], [0, 0]];
        const type = getType(path);
        self._l = {
          id: "" + id,
          type: "fill",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: util.getProperties(properties, options),
              geometry: {
                type,
                coordinates: getCoordinates(type, path)
              }
            }
          },
          layout: LAYOUT,
          paint: PAINT
        };
        return options;
      }
      var layer = require_layer()(getChangedProperties, create);
      function polygon(options) {
        let self;
        function path(p) {
          if (p === void 0) {
            return self._l.source.data.geometry.coordinates;
          }
          self._l.source.data.geometry.type = getType(p);
          self._l.source.data.geometry.coordinates = getCoordinates(self._l.source.data.geometry.type, p);
          self.update();
        }
        self = layer({
          path
        }, options);
        return self;
      }
    }
  });

  // ../lib/service/mapbox/polyline.js
  var require_polyline = __commonJS({
    "../lib/service/mapbox/polyline.js"(exports, module) {
      var draggable = require_draggable();
      var findPoint = require_util2().findPoint;
      var util = require_util();
      module.exports = polyline;
      var properties = [
        "dashOpacity",
        "strokeColor",
        "strokeOpacity",
        "strokeWeight"
      ];
      var LAYOUT = {
        "line-join": "round",
        "line-cap": "round"
      };
      var PAINT = {
        solid: {
          "line-color": ["get", "strokeColor"],
          "line-opacity": ["get", "strokeOpacity"],
          "line-width": ["get", "strokeWeight"]
        },
        dashed: {
          "line-color": ["get", "strokeColor"],
          "line-dasharray": [2, 3],
          "line-opacity": ["get", "dashOpacity"],
          "line-width": ["get", "strokeWeight"]
        }
      };
      function validate(path) {
        if (path && path.length >= 2) {
          return path;
        }
        if (path && path.length === 1) {
          return [path[0], path[0]];
        }
        return [[0, 0], [0, 0]];
      }
      function getChangedProperties(key, value, options) {
        if (key === "dashOpacity") {
          return {
            paint: PAINT[value ? "dashed" : "solid"]
          };
        }
        if (key === "visible") {
          if (value) {
            return {
              update: true,
              data: {
                dashOpacity: options.dashOpacity,
                strokeOpacity: options.strokeOpacity
              }
            };
          } else {
            return {
              update: true,
              data: {
                dashOpacity: 0,
                strokeOpacity: 0
              }
            };
          }
        }
      }
      function create(self, id, options) {
        options = Object.assign({
          dashOpacity: 0,
          strokeOpacity: 0.8,
          strokeWeight: 4
        }, options);
        options.strokeColor = options.strokeColor || options.color || "#FFFFFF";
        self._l = {
          id: "" + id,
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: util.getProperties(properties, options),
              geometry: {
                type: "LineString",
                coordinates: validate(options.path)
              }
            }
          },
          layout: LAYOUT,
          paint: getChangedProperties("dashOpacity", options.dashOpacity).paint
        };
        return options;
      }
      var layer = require_layer()(getChangedProperties, create);
      function polyline(options) {
        let self;
        function path(p) {
          if (p === void 0) {
            return self._l.source.data.geometry.coordinates;
          }
          self._l.source.data.geometry.coordinates = validate(p);
          self.update();
        }
        function ll(e) {
          let point;
          if (e && e.lngLat) {
            if (e.drag) {
              e.ll = util.mll2ll(e.lngLat);
              return;
            }
            point = findPoint(util.mll2ll(e.lngLat), self.path(), margin(self._m, e.point, options.margin));
            if (point) {
              e.ll = point.p;
              e.pointOnPath = point;
              e.featurePoint = self._m.project(e.ll);
              const path2 = self._l.source.data.geometry.coordinates;
              if (path2) {
                if (point.idx || point.pol) {
                  e.featurePoint.prev = self._m.project(path2[point.pol ? point.idx : point.idx - 1]);
                }
                if (point.idx < path2.length - 1) {
                  e.featurePoint.next = self._m.project(path2[point.idx + 1]);
                }
              }
            }
          }
        }
        options = Object.assign({
          margin: 10,
          clickable: true
        }, options);
        self = layer({
          ll,
          path
        }, options);
        self = draggable(self, options);
        return self;
      }
      function margin(_m, p, margin2) {
        const p1 = _m.unproject(p), p2 = _m.unproject({
          x: p.x + margin2,
          y: p.y + margin2
        });
        return [Math.abs(p1.lng - p2.lng), Math.abs(p1.lat - p2.lat)];
      }
    }
  });

  // ../lib/service/mapbox/projection.js
  var require_projection = __commonJS({
    "../lib/service/mapbox/projection.js"(exports, module) {
      var util = require_util();
      module.exports = projection;
      function projection(options) {
        function position(p) {
          if (p.position) {
            p = p.position();
          }
          return options.map._m.project(p);
        }
        function location(x, y) {
          const p = y === void 0 ? x : [x, y];
          return options.map._m.unproject(p);
        }
        function toMap(x, y) {
          return util.mll2ll(options.map._m.unproject(y === void 0 ? x : [x, y]));
        }
        function toScreen(ll) {
          const xy = options.map._m.project(ll);
          return [xy.x, xy.y];
        }
        function isReady() {
          return true;
        }
        function remove() {
        }
        if (options.calculate) {
          setTimeout(options.calculate.bind(options.calculate), 0);
          options.map.on("bounds_changed", options.calculate.bind(options));
        }
        return {
          position,
          // obsolete, use toScreen
          location,
          // obsolete, use to Map
          toMap,
          toScreen,
          isReady,
          remove
        };
      }
    }
  });

  // ../lib/service/mapbox/index.js
  var require_mapbox = __commonJS({
    "../lib/service/mapbox/index.js"(exports, module) {
      module.exports = init;
      function init() {
        return {
          map: require_map(),
          artifact: require_artifact(),
          feature: require_feature(),
          marker: require_marker(),
          polygon: require_polygon(),
          polyline: require_polyline(),
          projection: require_projection(),
          isSupported
        };
      }
      function isSupported() {
        const attributes = {
          antialias: false,
          alpha: true,
          stencil: true,
          depth: true
        };
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl", attributes) || canvas.getContext("experimental-webgl", attributes);
        return !!gl;
      }
    }
  });

  // ../lib/collate.js
  var require_collate = __commonJS({
    "../lib/collate.js"(exports, module) {
      var distance = require_util2().distance;
      module.exports = collate;
      function collate(options) {
        let proj;
        let regions;
        let markers = [];
        const threshold = options.threshold || 18;
        const service = this;
        function reset() {
          markers = [];
          regions = void 0;
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
          markers.forEach(function(m) {
            if (!regions.some(function(r) {
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
          return proj.position(m);
        }
        function addToRegion(r, m) {
          if (distance(position(r.show), position(m)) < threshold) {
            if (r.show.zindex() < m.zindex()) {
              r.hide.push(r.show);
              r.show = m;
            } else {
              r.hide.push(m);
            }
            return true;
          }
        }
        function hideMarkers() {
          regions.forEach(function(r) {
            if (!r.show.referenceOnly) {
              r.show.add(options.map);
            }
            r.hide.forEach(function(m) {
              if (!m.referenceOnly) {
                m.remove();
              }
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
    }
  });

  // ../lib/outline.js
  var require_outline = __commonJS({
    "../lib/outline.js"(exports, module) {
      module.exports = outline;
      function outline(points) {
        let self, se, nw;
        function include(points2) {
          if (!points2 || !points2.length) {
            return self;
          }
          se = se || points2[0].slice();
          nw = nw || points2[0].slice();
          points2.forEach(function(point) {
            const x = point[0], y = point[1];
            if (x < se[0]) {
              se[0] = x;
            }
            if (x > nw[0]) {
              nw[0] = x;
            }
            if (y < se[1]) {
              se[1] = y;
            }
            if (y > nw[1]) {
              nw[1] = y;
            }
          });
          return self;
        }
        function bounds2() {
          return [se, nw];
        }
        self = {
          include,
          bounds: bounds2
        };
        return include(points);
      }
    }
  });

  // ../lib/spread.js
  var require_spread = __commonJS({
    "../lib/spread.js"(exports, module) {
      var distance = require_util2().distance;
      var posSeq = [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-2, -1],
        [-2, 0],
        [-2, 1],
        [-2, 2],
        [-1, 2],
        [0, 2],
        [1, 2],
        [2, 2],
        [2, 1],
        [2, 0],
        [2, -1],
        [2, -2],
        [1, -2],
        [0, -2],
        [-1, -2],
        [-2, -2],
        [-3, -2],
        [-3, -1],
        [-3, 0],
        [-3, 1],
        [-3, 2],
        [-3, 3],
        [-2, 3],
        [-1, 3],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [3, 2],
        [3, 1],
        [3, 0],
        [3, -1],
        [3, -2],
        [3, -3],
        [2, -3],
        [1, -3],
        [0, -3],
        [-1, -3],
        [-2, -3],
        [-3, -3],
        [-4, -3],
        [-4, -2],
        [-4, -1],
        [-4, 0],
        [-4, 1],
        [-4, 2],
        [-4, 3],
        [-4, 4],
        [-3, 4],
        [-2, 4],
        [-1, 4],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [4, 3],
        [4, 2],
        [4, 1],
        [4, 0],
        [4, -1],
        [4, -2],
        [4, -3],
        [4, -4],
        [3, -4],
        [2, -4],
        [1, -4],
        [0, -4],
        [-1, -4],
        [-2, -4],
        [-3, -4],
        [-4, -4]
      ];
      module.exports = spread;
      function spread(options) {
        let regions;
        let markers = [];
        const threshold = options.threshold || 18;
        let proj;
        const service = this;
        function reset() {
          markers = [];
          regions = void 0;
        }
        function add(marker) {
          markers.push(marker);
        }
        function calculate() {
          if (!proj.isReady()) {
            return;
          }
          if (markers[0] && !markers[0].originalPosition) {
            markers.forEach(function(m) {
              m.originalPosition = m.position();
            });
          }
          regions = [];
          prepareRegions();
          combineRegions();
          moveMarkers();
        }
        function prepareRegions() {
          markers.forEach(function(m) {
            if (!regions.some(function(r) {
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
            markers: [m]
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
          regions.forEach(function(r, i) {
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
          regions.forEach(function(r) {
            r.markers.some(function(m, i) {
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
    }
  });

  // ../lib/map.js
  var require_map2 = __commonJS({
    "../lib/map.js"(exports, module) {
      function zoomIn() {
        const self = this;
        self.zoom(self.zoom() + 1);
        return self;
      }
      function zoomOut() {
        const self = this;
        self.zoom(self.zoom() - 1);
        return self;
      }
      module.exports = {
        zoomIn,
        zoomOut
      };
    }
  });

  // ../lib/index.js
  var require_lib = __commonJS({
    "../lib/index.js"(exports, module) {
      var mixin = require_mixin();
      function init() {
        let service = require_mapbox()();
        Object.assign(service, {
          collate: require_collate(),
          outline: require_outline(),
          spread: require_spread()
        });
        service.map = mixin(service.map, require_map2());
        service.util = Object.assign(service.util || {}, require_util2());
        const module2 = this;
        if (!module2.collate) {
          Object.assign(module2, service);
        }
        return service;
      }
      module.exports = {
        init
      };
    }
  });

  // ../index.js
  var require_index = __commonJS({
    "../index.js"(exports, module) {
      module.exports = require_lib();
    }
  });

  // map-style.json
  var require_map_style = __commonJS({
    "map-style.json"(exports, module) {
      module.exports = {
        version: 8,
        name: "Demo",
        sources: {
          _data: {
            data: {
              features: [],
              type: "FeatureCollection"
            },
            type: "geojson"
          },
          _spreader: {
            data: {
              features: [],
              type: "FeatureCollection"
            },
            type: "geojson"
          },
          _collator: {
            data: {
              features: [],
              type: "FeatureCollection"
            },
            type: "geojson"
          },
          _collator_spreader: {
            data: {
              features: [],
              type: "FeatureCollection"
            },
            type: "geojson"
          },
          _markers: {
            data: {
              features: [],
              type: "FeatureCollection"
            },
            type: "geojson"
          },
          _china: {
            data: {
              features: [],
              type: "FeatureCollection"
            },
            type: "geojson"
          },
          tiles: {
            type: "vector",
            url: "https://tiles.openfreemap.org/planet"
          }
        },
        sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
        glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
        layers: [
          {
            id: "background",
            paint: {
              "background-color": "rgb(242,243,240)"
            },
            type: "background"
          },
          {
            filter: [
              "==",
              "$type",
              "Polygon"
            ],
            id: "park",
            layout: {
              visibility: "visible"
            },
            paint: {
              "fill-color": "rgb(230, 233, 229)"
            },
            source: "tiles",
            "source-layer": "park",
            type: "fill"
          },
          {
            filter: [
              "==",
              "$type",
              "Polygon"
            ],
            id: "water",
            layout: {
              visibility: "visible"
            },
            paint: {
              "fill-antialias": true,
              "fill-color": "rgb(194, 200, 202)"
            },
            source: "tiles",
            "source-layer": "water",
            type: "fill"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Polygon"
              ],
              [
                "==",
                "subclass",
                "ice_shelf"
              ]
            ],
            id: "landcover_ice_shelf",
            layout: {
              visibility: "visible"
            },
            maxzoom: 8,
            paint: {
              "fill-color": "hsl(0, 0%, 98%)",
              "fill-opacity": 0.7
            },
            source: "tiles",
            "source-layer": "landcover",
            type: "fill"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Polygon"
              ],
              [
                "==",
                "subclass",
                "glacier"
              ]
            ],
            id: "landcover_glacier",
            layout: {
              visibility: "visible"
            },
            maxzoom: 8,
            paint: {
              "fill-color": "hsl(0, 0%, 98%)",
              "fill-opacity": {
                base: 1,
                stops: [
                  [
                    0,
                    1
                  ],
                  [
                    8,
                    0.5
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "landcover",
            type: "fill"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Polygon"
              ],
              [
                "==",
                "class",
                "residential"
              ]
            ],
            id: "landuse_residential",
            layout: {
              visibility: "visible"
            },
            maxzoom: 16,
            paint: {
              "fill-color": "rgb(234, 234, 230)",
              "fill-opacity": {
                base: 0.6,
                stops: [
                  [
                    8,
                    0.8
                  ],
                  [
                    9,
                    0.6
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "landuse",
            type: "fill"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Polygon"
              ],
              [
                "==",
                "class",
                "wood"
              ]
            ],
            id: "landcover_wood",
            layout: {
              visibility: "visible"
            },
            minzoom: 10,
            paint: {
              "fill-color": "rgb(220,224,220)",
              "fill-opacity": {
                base: 1,
                stops: [
                  [
                    8,
                    0
                  ],
                  [
                    12,
                    1
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "landcover",
            type: "fill"
          },
          {
            filter: [
              "==",
              "$type",
              "LineString"
            ],
            id: "waterway",
            layout: {
              visibility: "visible"
            },
            paint: {
              "line-color": "hsl(195, 17%, 78%)"
            },
            source: "tiles",
            "source-layer": "waterway",
            type: "line"
          },
          {
            filter: [
              "==",
              "$type",
              "LineString"
            ],
            id: "water_name",
            layout: {
              "symbol-placement": "line",
              "symbol-spacing": 500,
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Italic"
              ],
              "text-rotation-alignment": "map",
              "text-size": 12
            },
            paint: {
              "text-color": "rgb(157,169,177)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "water_name",
            type: "symbol"
          },
          {
            id: "building",
            minzoom: 12,
            paint: {
              "fill-antialias": true,
              "fill-color": "rgb(234, 234, 229)",
              "fill-outline-color": "rgb(219, 219, 218)"
            },
            source: "tiles",
            "source-layer": "building",
            type: "fill"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "brunnel",
                "tunnel"
              ],
              [
                "==",
                "class",
                "motorway"
              ]
            ],
            id: "tunnel_motorway_casing",
            layout: {
              "line-cap": "butt",
              "line-join": "miter",
              visibility: "visible"
            },
            minzoom: 6,
            paint: {
              "line-color": "rgb(213, 213, 213)",
              "line-opacity": 1,
              "line-width": {
                base: 1.4,
                stops: [
                  [
                    5.8,
                    0
                  ],
                  [
                    6,
                    3
                  ],
                  [
                    20,
                    40
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "brunnel",
                "tunnel"
              ],
              [
                "==",
                "class",
                "motorway"
              ]
            ],
            id: "tunnel_motorway_inner",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 6,
            paint: {
              "line-color": "rgb(234,234,234)",
              "line-width": {
                base: 1.4,
                stops: [
                  [
                    4,
                    2
                  ],
                  [
                    6,
                    1.3
                  ],
                  [
                    20,
                    30
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "in",
              "class",
              "taxiway"
            ],
            id: "aeroway-taxiway",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 12,
            paint: {
              "line-color": "hsl(0, 0%, 88%)",
              "line-opacity": 1,
              "line-width": {
                base: 1.55,
                stops: [
                  [
                    13,
                    1.8
                  ],
                  [
                    20,
                    20
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "aeroway",
            type: "line"
          },
          {
            filter: [
              "in",
              "class",
              "runway"
            ],
            id: "aeroway-runway-casing",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 11,
            paint: {
              "line-color": "hsl(0, 0%, 88%)",
              "line-opacity": 1,
              "line-width": {
                base: 1.5,
                stops: [
                  [
                    11,
                    6
                  ],
                  [
                    17,
                    55
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "aeroway",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Polygon"
              ],
              [
                "in",
                "class",
                "runway",
                "taxiway"
              ]
            ],
            id: "aeroway-area",
            layout: {
              visibility: "visible"
            },
            minzoom: 4,
            paint: {
              "fill-color": "rgba(255, 255, 255, 1)",
              "fill-opacity": {
                base: 1,
                stops: [
                  [
                    13,
                    0
                  ],
                  [
                    14,
                    1
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "aeroway",
            type: "fill"
          },
          {
            filter: [
              "all",
              [
                "in",
                "class",
                "runway"
              ],
              [
                "==",
                "$type",
                "LineString"
              ]
            ],
            id: "aeroway-runway",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 11,
            paint: {
              "line-color": "rgba(255, 255, 255, 1)",
              "line-opacity": 1,
              "line-width": {
                base: 1.5,
                stops: [
                  [
                    11,
                    4
                  ],
                  [
                    17,
                    50
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "aeroway",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "class",
                "path"
              ]
            ],
            id: "highway_path",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            paint: {
              "line-color": "rgb(234, 234, 234)",
              "line-opacity": 0.9,
              "line-width": {
                base: 1.2,
                stops: [
                  [
                    13,
                    1
                  ],
                  [
                    20,
                    10
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "in",
                "class",
                "minor",
                "service",
                "track"
              ]
            ],
            id: "highway_minor",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 8,
            paint: {
              "line-color": "hsl(0, 0%, 88%)",
              "line-opacity": 0.9,
              "line-width": {
                base: 1.55,
                stops: [
                  [
                    13,
                    1.8
                  ],
                  [
                    20,
                    20
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "in",
                "class",
                "primary",
                "secondary",
                "tertiary",
                "trunk"
              ]
            ],
            id: "highway_major_casing",
            layout: {
              "line-cap": "butt",
              "line-join": "miter",
              visibility: "visible"
            },
            minzoom: 11,
            paint: {
              "line-color": "rgb(213, 213, 213)",
              "line-dasharray": [
                12,
                0
              ],
              "line-width": {
                base: 1.3,
                stops: [
                  [
                    10,
                    3
                  ],
                  [
                    20,
                    23
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "in",
                "class",
                "primary",
                "secondary",
                "tertiary",
                "trunk"
              ]
            ],
            id: "highway_major_inner",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 11,
            paint: {
              "line-color": "#fff",
              "line-width": {
                base: 1.3,
                stops: [
                  [
                    10,
                    2
                  ],
                  [
                    20,
                    20
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "in",
                "class",
                "primary",
                "secondary",
                "tertiary",
                "trunk"
              ]
            ],
            id: "highway_major_subtle",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            maxzoom: 11,
            paint: {
              "line-color": "hsla(0, 0%, 85%, 0.69)",
              "line-width": 2
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "!in",
                "brunnel",
                "bridge",
                "tunnel"
              ],
              [
                "==",
                "class",
                "motorway"
              ]
            ],
            id: "highway_motorway_casing",
            layout: {
              "line-cap": "butt",
              "line-join": "miter",
              visibility: "visible"
            },
            minzoom: 6,
            paint: {
              "line-color": "rgb(213, 213, 213)",
              "line-dasharray": [
                2,
                0
              ],
              "line-opacity": 1,
              "line-width": {
                base: 1.4,
                stops: [
                  [
                    5.8,
                    0
                  ],
                  [
                    6,
                    3
                  ],
                  [
                    20,
                    40
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "!in",
                "brunnel",
                "bridge",
                "tunnel"
              ],
              [
                "==",
                "class",
                "motorway"
              ]
            ],
            id: "highway_motorway_inner",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 6,
            paint: {
              "line-color": {
                base: 1,
                stops: [
                  [
                    5.8,
                    "hsla(0, 0%, 85%, 0.53)"
                  ],
                  [
                    6,
                    "#fff"
                  ]
                ]
              },
              "line-width": {
                base: 1.4,
                stops: [
                  [
                    4,
                    2
                  ],
                  [
                    6,
                    1.3
                  ],
                  [
                    20,
                    30
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "class",
                "motorway"
              ]
            ],
            id: "highway_motorway_subtle",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            maxzoom: 6,
            paint: {
              "line-color": "hsla(0, 0%, 85%, 0.53)",
              "line-width": {
                base: 1.4,
                stops: [
                  [
                    4,
                    2
                  ],
                  [
                    6,
                    1.3
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "class",
                "transit"
              ],
              [
                "!in",
                "brunnel",
                "tunnel"
              ]
            ],
            id: "railway_transit",
            layout: {
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 16,
            paint: {
              "line-color": "#dddddd",
              "line-width": 3
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "class",
                "transit"
              ],
              [
                "!in",
                "brunnel",
                "tunnel"
              ]
            ],
            id: "railway_transit_dashline",
            layout: {
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 16,
            paint: {
              "line-color": "#fafafa",
              "line-dasharray": [
                3,
                3
              ],
              "line-width": 2
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "class",
                "rail"
              ],
              [
                "has",
                "service"
              ]
            ],
            id: "railway_service",
            layout: {
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 16,
            paint: {
              "line-color": "#dddddd",
              "line-width": 3
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "class",
                "rail"
              ],
              [
                "has",
                "service"
              ]
            ],
            id: "railway_service_dashline",
            layout: {
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 16,
            paint: {
              "line-color": "#fafafa",
              "line-dasharray": [
                3,
                3
              ],
              "line-width": 2
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "!has",
                "service"
              ],
              [
                "==",
                "class",
                "rail"
              ]
            ],
            id: "railway",
            layout: {
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 13,
            paint: {
              "line-color": "#dddddd",
              "line-width": {
                base: 1.3,
                stops: [
                  [
                    16,
                    3
                  ],
                  [
                    20,
                    7
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "!has",
                "service"
              ],
              [
                "==",
                "class",
                "rail"
              ]
            ],
            id: "railway_dashline",
            layout: {
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 13,
            paint: {
              "line-color": "#fafafa",
              "line-dasharray": [
                3,
                3
              ],
              "line-width": {
                base: 1.3,
                stops: [
                  [
                    16,
                    2
                  ],
                  [
                    20,
                    6
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "brunnel",
                "bridge"
              ],
              [
                "==",
                "class",
                "motorway"
              ]
            ],
            id: "highway_motorway_bridge_casing",
            layout: {
              "line-cap": "butt",
              "line-join": "miter",
              visibility: "visible"
            },
            minzoom: 6,
            paint: {
              "line-color": "rgb(213, 213, 213)",
              "line-dasharray": [
                2,
                0
              ],
              "line-opacity": 1,
              "line-width": {
                base: 1.4,
                stops: [
                  [
                    5.8,
                    0
                  ],
                  [
                    6,
                    5
                  ],
                  [
                    20,
                    45
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "==",
                "brunnel",
                "bridge"
              ],
              [
                "==",
                "class",
                "motorway"
              ]
            ],
            id: "highway_motorway_bridge_inner",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            minzoom: 6,
            paint: {
              "line-color": {
                base: 1,
                stops: [
                  [
                    5.8,
                    "hsla(0, 0%, 85%, 0.53)"
                  ],
                  [
                    6,
                    "#fff"
                  ]
                ]
              },
              "line-width": {
                base: 1.4,
                stops: [
                  [
                    4,
                    2
                  ],
                  [
                    6,
                    1.3
                  ],
                  [
                    20,
                    30
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "transportation",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "!=",
                "class",
                "motorway"
              ],
              [
                "==",
                "$type",
                "LineString"
              ]
            ],
            id: "highway_name_other",
            layout: {
              "symbol-placement": "line",
              "symbol-spacing": 350,
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-max-angle": 30,
              "text-pitch-alignment": "viewport",
              "text-rotation-alignment": "map",
              "text-size": 10,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            paint: {
              "text-color": "#bbb",
              "text-halo-blur": 1,
              "text-halo-color": "#fff",
              "text-halo-width": 2,
              "text-translate": [
                0,
                0
              ]
            },
            source: "tiles",
            "source-layer": "transportation_name",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "<=",
                "ref_length",
                8
              ],
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "!in",
                "network",
                "us-interstate",
                "us-highway",
                "us-state"
              ]
            ],
            id: "highway-shield",
            layout: {
              "icon-image": [
                "concat",
                "road_",
                [
                  "to-string",
                  [
                    "min",
                    [
                      "get",
                      "ref_length"
                    ],
                    6
                  ]
                ]
              ],
              "icon-rotation-alignment": "viewport",
              "icon-size": 1,
              "symbol-avoid-edges": true,
              "symbol-placement": {
                base: 1,
                stops: [
                  [
                    10,
                    "point"
                  ],
                  [
                    11,
                    "line"
                  ]
                ]
              },
              "symbol-spacing": 200,
              "text-field": "{ref}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-rotation-alignment": "viewport",
              "text-size": 9
            },
            minzoom: 8,
            paint: {
              "icon-opacity": 0.6,
              "text-color": "rgb(117, 129, 145)"
            },
            source: "tiles",
            "source-layer": "transportation_name",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "<=",
                "ref_length",
                6
              ],
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "in",
                "network",
                "us-interstate"
              ]
            ],
            id: "highway-shield-us-interstate",
            layout: {
              "icon-image": "{network}_{ref_length}",
              "icon-rotation-alignment": "viewport",
              "icon-size": 1,
              "symbol-avoid-edges": true,
              "symbol-placement": {
                base: 1,
                stops: [
                  [
                    7,
                    "point"
                  ],
                  [
                    7,
                    "line"
                  ],
                  [
                    8,
                    "line"
                  ]
                ]
              },
              "symbol-spacing": 200,
              "text-field": "{ref}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-rotation-alignment": "viewport",
              "text-size": 9
            },
            minzoom: 6,
            paint: {
              "icon-opacity": 0.6,
              "text-color": "rgb(117, 129, 145)"
            },
            source: "tiles",
            "source-layer": "transportation_name",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "<=",
                "ref_length",
                6
              ],
              [
                "==",
                "$type",
                "LineString"
              ],
              [
                "in",
                "network",
                "us-highway",
                "us-state"
              ]
            ],
            id: "highway-shield-us-other",
            layout: {
              "icon-image": "{network}_{ref_length}",
              "icon-rotation-alignment": "viewport",
              "icon-size": 1,
              "symbol-avoid-edges": true,
              "symbol-placement": {
                base: 1,
                stops: [
                  [
                    10,
                    "point"
                  ],
                  [
                    11,
                    "line"
                  ]
                ]
              },
              "symbol-spacing": 200,
              "text-field": "{ref}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-rotation-alignment": "viewport",
              "text-size": 9
            },
            minzoom: 9,
            paint: {
              "icon-opacity": 0.6,
              "text-color": "rgb(117, 129, 145)"
            },
            source: "tiles",
            "source-layer": "transportation_name",
            type: "symbol"
          },
          {
            filter: [
              "==",
              "admin_level",
              4
            ],
            id: "boundary_state",
            layout: {
              "line-cap": "round",
              "line-join": "round",
              visibility: "visible"
            },
            paint: {
              "line-blur": 0.4,
              "line-color": "rgb(230, 204, 207)",
              "line-dasharray": [
                2,
                2
              ],
              "line-opacity": 1,
              "line-width": {
                base: 1.3,
                stops: [
                  [
                    3,
                    1
                  ],
                  [
                    22,
                    15
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "boundary",
            type: "line"
          },
          {
            filter: [
              "==",
              "admin_level",
              2
            ],
            id: "boundary_country",
            layout: {
              "line-cap": "round",
              "line-join": "round"
            },
            paint: {
              "line-blur": {
                base: 1,
                stops: [
                  [
                    0,
                    0.4
                  ],
                  [
                    22,
                    4
                  ]
                ]
              },
              "line-color": "rgb(230, 204, 207)",
              "line-opacity": 1,
              "line-width": {
                base: 1.1,
                stops: [
                  [
                    3,
                    1
                  ],
                  [
                    22,
                    20
                  ]
                ]
              }
            },
            source: "tiles",
            "source-layer": "boundary",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "in",
                "class",
                "continent",
                "hamlet",
                "neighbourhood",
                "isolated_dwelling"
              ],
              [
                "==",
                "$type",
                "Point"
              ]
            ],
            id: "place_other",
            layout: {
              "text-anchor": "center",
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-justify": "center",
              "text-offset": [
                0.5,
                0
              ],
              "text-size": 10,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 14,
            paint: {
              "text-color": "rgb(117, 129, 145)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "==",
                "class",
                "suburb"
              ]
            ],
            id: "place_suburb",
            layout: {
              "text-anchor": "center",
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-justify": "center",
              "text-offset": [
                0.5,
                0
              ],
              "text-size": 10,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 15,
            paint: {
              "text-color": "rgb(117, 129, 145)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "==",
                "class",
                "village"
              ]
            ],
            id: "place_village",
            layout: {
              "icon-size": 0.4,
              "text-anchor": "left",
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-justify": "left",
              "text-offset": [
                0.5,
                0.2
              ],
              "text-size": 10,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 14,
            paint: {
              "icon-opacity": 0.7,
              "text-color": "rgb(117, 129, 145)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "==",
                "class",
                "town"
              ]
            ],
            id: "place_town",
            layout: {
              "icon-image": {
                base: 1,
                stops: [
                  [
                    0,
                    "circle_11"
                  ],
                  [
                    8,
                    ""
                  ]
                ]
              },
              "icon-size": 0.4,
              "text-anchor": {
                base: 1,
                stops: [
                  [
                    0,
                    "left"
                  ],
                  [
                    8,
                    "center"
                  ]
                ]
              },
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-justify": "left",
              "text-offset": [
                0.5,
                0.2
              ],
              "text-size": 10,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 15,
            paint: {
              "icon-opacity": 0.7,
              "text-color": "rgb(117, 129, 145)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "!=",
                "capital",
                2
              ],
              [
                "==",
                "class",
                "city"
              ],
              [
                ">",
                "rank",
                3
              ]
            ],
            id: "place_city",
            layout: {
              "icon-image": {
                base: 1,
                stops: [
                  [
                    0,
                    "circle_11"
                  ],
                  [
                    8,
                    ""
                  ]
                ]
              },
              "icon-size": 0.4,
              "text-anchor": {
                base: 1,
                stops: [
                  [
                    0,
                    "left"
                  ],
                  [
                    8,
                    "center"
                  ]
                ]
              },
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-justify": "left",
              "text-offset": [
                0.5,
                0.2
              ],
              "text-size": 10,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 14,
            paint: {
              "icon-opacity": 0.7,
              "text-color": "rgb(117, 129, 145)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "==",
                "capital",
                2
              ],
              [
                "==",
                "class",
                "city"
              ]
            ],
            id: "place_capital",
            layout: {
              "icon-image": {
                base: 1,
                stops: [
                  [
                    0,
                    "star_11"
                  ],
                  [
                    8,
                    ""
                  ]
                ]
              },
              "icon-size": 0.6,
              "text-anchor": {
                base: 1,
                stops: [
                  [
                    0,
                    "left"
                  ],
                  [
                    8,
                    "center"
                  ]
                ]
              },
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-justify": "left",
              "text-offset": [
                0.5,
                0.2
              ],
              "text-size": 12,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 12,
            paint: {
              "icon-opacity": 0.7,
              "text-color": "rgb(117, 129, 145)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "!=",
                "capital",
                2
              ],
              [
                "<=",
                "rank",
                3
              ],
              [
                "==",
                "class",
                "city"
              ]
            ],
            id: "place_city_large",
            layout: {
              "icon-image": {
                base: 1,
                stops: [
                  [
                    0,
                    "circle_11"
                  ],
                  [
                    8,
                    ""
                  ]
                ]
              },
              "icon-size": 0.6,
              "text-anchor": {
                base: 1,
                stops: [
                  [
                    0,
                    "left"
                  ],
                  [
                    8,
                    "center"
                  ]
                ]
              },
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-justify": "left",
              "text-offset": [
                0.5,
                0.2
              ],
              "text-size": 12,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 12,
            paint: {
              "icon-opacity": 0.7,
              "text-color": "rgb(117, 129, 145)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "==",
                "class",
                "state"
              ]
            ],
            id: "place_state",
            layout: {
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-size": 10,
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 12,
            paint: {
              "text-color": "rgb(113, 129, 144)",
              "text-halo-blur": 1,
              "text-halo-color": "rgb(242,243,240)",
              "text-halo-width": 1
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "==",
                "class",
                "country"
              ],
              [
                "!has",
                "iso_a2"
              ]
            ],
            id: "place_country_other",
            layout: {
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Italic"
              ],
              "text-size": {
                base: 1,
                stops: [
                  [
                    0,
                    9
                  ],
                  [
                    6,
                    11
                  ]
                ]
              },
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 8,
            paint: {
              "text-color": {
                base: 1,
                stops: [
                  [
                    3,
                    "rgb(157,169,177)"
                  ],
                  [
                    4,
                    "rgb(153, 153, 153)"
                  ]
                ]
              },
              "text-halo-color": "rgba(236,236,234,0.7)",
              "text-halo-width": 1.4
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "==",
                "class",
                "country"
              ],
              [
                ">=",
                "rank",
                2
              ],
              [
                "has",
                "iso_a2"
              ]
            ],
            id: "place_country_minor",
            layout: {
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-size": {
                base: 1,
                stops: [
                  [
                    0,
                    10
                  ],
                  [
                    6,
                    12
                  ]
                ]
              },
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 8,
            paint: {
              "text-color": {
                base: 1,
                stops: [
                  [
                    3,
                    "rgb(157,169,177)"
                  ],
                  [
                    4,
                    "rgb(153, 153, 153)"
                  ]
                ]
              },
              "text-halo-color": "rgba(236,236,234,0.7)",
              "text-halo-width": 1.4
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "$type",
                "Point"
              ],
              [
                "<=",
                "rank",
                1
              ],
              [
                "==",
                "class",
                "country"
              ],
              [
                "has",
                "iso_a2"
              ]
            ],
            id: "place_country_major",
            layout: {
              "text-anchor": "center",
              "text-field": "{name}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-size": {
                base: 1.4,
                stops: [
                  [
                    0,
                    10
                  ],
                  [
                    3,
                    12
                  ],
                  [
                    4,
                    14
                  ]
                ]
              },
              "text-transform": "uppercase",
              visibility: "visible"
            },
            maxzoom: 6,
            paint: {
              "text-color": {
                base: 1,
                stops: [
                  [
                    3,
                    "rgb(157,169,177)"
                  ],
                  [
                    4,
                    "rgb(153, 153, 153)"
                  ]
                ]
              },
              "text-halo-color": "rgba(236,236,234,0.7)",
              "text-halo-width": 1.4
            },
            source: "tiles",
            "source-layer": "place",
            type: "symbol"
          },
          {
            filter: [
              "==",
              "type",
              "markers_symbol"
            ],
            id: "markers_symbol",
            layout: {
              "icon-image": [
                "get",
                "image"
              ],
              "icon-offset": [
                "get",
                "offset"
              ],
              "icon-size": [
                "get",
                "size"
              ]
            },
            metadata: {},
            paint: {},
            source: "_markers",
            type: "symbol"
          },
          {
            filter: [
              "==",
              "type",
              "china_line"
            ],
            id: "china_line",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            metadata: {},
            paint: {
              "line-color": "#a21bab",
              "line-dasharray": [
                2,
                3
              ],
              "line-width": 4
            },
            source: "_china",
            type: "line"
          },
          {
            filter: [
              "==",
              "type",
              "china_polygon"
            ],
            id: "china_polygon",
            layout: {},
            metadata: {},
            paint: {
              "fill-color": "#A21BAB",
              "fill-opacity": 0.5,
              "fill-outline-color": "#0074D9"
            },
            source: "_china",
            type: "fill"
          },
          {
            filter: [
              "==",
              "type",
              "china_circle"
            ],
            id: "china_circle",
            layout: {},
            metadata: {},
            paint: {
              "circle-opacity": 0,
              "circle-radius": 6,
              "circle-stroke-color": "#0074D9",
              "circle-stroke-width": 5
            },
            source: "_china",
            type: "circle"
          },
          {
            filter: [
              "==",
              "type",
              "polyline"
            ],
            id: "polyline_data",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            metadata: {},
            paint: {
              "line-color": "#a21bab",
              "line-opacity": 0.8,
              "line-width": 4
            },
            source: "_data",
            type: "line"
          },
          {
            filter: [
              "all",
              [
                "==",
                "type",
                "marker"
              ],
              [
                "has",
                "icon"
              ]
            ],
            id: "marker_symbol",
            layout: {
              "icon-image": "marker_icon",
              "icon-offset": [
                0,
                -30
              ],
              "icon-size": 0.5
            },
            metadata: {},
            paint: {
              "icon-opacity": [
                "get",
                "opacity"
              ]
            },
            source: "_data",
            type: "symbol"
          },
          {
            filter: [
              "all",
              [
                "==",
                "type",
                "marker"
              ],
              [
                "!has",
                "icon"
              ]
            ],
            id: "marker_circle",
            layout: {},
            metadata: {},
            paint: {
              "circle-color": [
                "coalesce",
                [
                  "get",
                  "color"
                ],
                "#000000"
              ],
              "circle-opacity": [
                "case",
                [
                  "boolean",
                  [
                    "has",
                    "color"
                  ],
                  true
                ],
                [
                  "get",
                  "opacity"
                ],
                0
              ],
              "circle-radius": 6,
              "circle-stroke-color": "#555555",
              "circle-stroke-opacity": [
                "get",
                "opacity"
              ],
              "circle-stroke-width": 2
            },
            source: "_data",
            type: "circle"
          },
          {
            filter: [
              "==",
              "type",
              "polyline"
            ],
            id: "polyline_spreader",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            metadata: {},
            paint: {
              "line-color": "#a21bab",
              "line-opacity": 0.8,
              "line-width": 4
            },
            source: "_spreader",
            type: "line"
          },
          {
            filter: [
              "==",
              "type",
              "circle_label"
            ],
            id: "circle_label",
            layout: {
              "icon-allow-overlap": true,
              "icon-image": "circle_label",
              "icon-size": 0.7,
              "text-allow-overlap": true,
              "text-field": "{label}",
              "text-font": [
                "Noto Sans Regular"
              ],
              "text-size": 10
            },
            metadata: {},
            paint: {
              "text-color": "#FFFFFF",
              "text-halo-width": 0.25,
              "text-halo-color": "rgba(255,255,255,1)"
            },
            source: "_spreader",
            type: "symbol"
          },
          {
            filter: [
              "==",
              "type",
              "polyline"
            ],
            id: "polyline_collator",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            metadata: {},
            paint: {
              "line-color": "#a21bab",
              "line-opacity": 0.8,
              "line-width": 4
            },
            source: "_collator",
            type: "line"
          },
          {
            filter: [
              "==",
              "type",
              "circle"
            ],
            id: "circle",
            layout: {},
            metadata: {},
            paint: {
              "circle-color": "orange",
              "circle-radius": 6,
              "circle-stroke-color": "#555555",
              "circle-stroke-width": 2
            },
            source: "_collator",
            type: "circle"
          },
          {
            filter: [
              "==",
              "type",
              "polyline"
            ],
            id: "polyline_collator_spreader",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            metadata: {},
            paint: {
              "line-color": "#a21bab",
              "line-opacity": 0.8,
              "line-width": 4
            },
            source: "_collator_spreader",
            type: "line"
          },
          {
            filter: [
              "==",
              "type",
              "circle_orange"
            ],
            id: "circle_orange",
            layout: {},
            metadata: {},
            paint: {
              "circle-color": "orange",
              "circle-radius": 6,
              "circle-stroke-color": "#555555",
              "circle-stroke-width": 2
            },
            source: "_collator_spreader",
            type: "circle"
          },
          {
            filter: [
              "==",
              "type",
              "circle_teal"
            ],
            id: "circle_teal",
            layout: {},
            metadata: {},
            paint: {
              "circle-color": "teal",
              "circle-radius": 6,
              "circle-stroke-color": "#555555",
              "circle-stroke-width": 2
            },
            source: "_collator_spreader",
            type: "circle"
          }
        ]
      };
    }
  });

  // index.js
  globalThis.mapboxgl = maplibregl;
  var { decode } = require_google_polyline();
  var { bounds, merge } = require_common();
  var {
    addedDirectly,
    addedWithCollator,
    addedWithCollatorAndSpreader,
    addedWithSpreader,
    sampleChina,
    sampleMarkers
  } = require_samples();
  var maps = require_index().init();
  if (maps) {
    const dataEl = document.querySelector("#data");
    const points = JSON.parse(dataEl.getAttribute("data-markers"));
    const bnds = bounds(points);
    const path = decode(dataEl.getAttribute("data-polyline"));
    const attribution = document.getElementById("attribution");
    const onReady = [
      [addedDirectly, "_data"],
      [addedWithSpreader, "_spreader"],
      [addedWithCollator, "_collator"],
      [addedWithCollatorAndSpreader, "_collator_spreader"],
      [sampleMarkers, "_markers"],
      [sampleChina, "_china"]
    ];
    Array.prototype.slice.call(document.querySelectorAll(".example .map")).forEach((mapEl, i, els) => {
      const map = maps.map(mapEl, merge({
        mapboxgl: maplibregl,
        style: createUrl(require_map_style()),
        zoomControl: true,
        zoomControlOptions: {
          position: "RB"
        },
        fullscreenControl: i > 2,
        backgroundColor: "#e5c7e6",
        onReady: () => onReady[i][0](maps, map, onReady[i][1], points, path)
      }, i ? {
        attributionControl: false,
        attribution
      } : {}));
      if (i > els.length - 3) {
        return;
      }
      map.fitBounds(bnds);
    });
  }
  function createUrl(obj) {
    return `data:text/plain;base64,${btoa(JSON.stringify(obj))}`;
  }
})();
