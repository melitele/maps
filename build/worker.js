var demo = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@mapwhit/tilerenderer/src/util/polyfill.js
  var require_polyfill = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/polyfill.js"() {
      if (typeof Promise.withResolvers !== "function") {
        Promise.withResolvers = function() {
          let resolve;
          let reject;
          const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
          });
          return { promise, resolve, reject };
        };
      }
    }
  });

  // node_modules/grid-index/grid-index.js
  var require_grid_index = __commonJS({
    "node_modules/grid-index/grid-index.js"(exports, module) {
      "use strict";
      module.exports = GridIndex;
      var NUM_PARAMS = 3;
      function GridIndex(extent, n, padding) {
        var cells = this.cells = [];
        if (extent instanceof ArrayBuffer) {
          this.arrayBuffer = extent;
          var array = new Int32Array(this.arrayBuffer);
          extent = array[0];
          n = array[1];
          padding = array[2];
          this.d = n + 2 * padding;
          for (var k = 0; k < this.d * this.d; k++) {
            var start = array[NUM_PARAMS + k];
            var end = array[NUM_PARAMS + k + 1];
            cells.push(start === end ? null : array.subarray(start, end));
          }
          var keysOffset = array[NUM_PARAMS + cells.length];
          var bboxesOffset = array[NUM_PARAMS + cells.length + 1];
          this.keys = array.subarray(keysOffset, bboxesOffset);
          this.bboxes = array.subarray(bboxesOffset);
          this.insert = this._insertReadonly;
        } else {
          this.d = n + 2 * padding;
          for (var i = 0; i < this.d * this.d; i++) {
            cells.push([]);
          }
          this.keys = [];
          this.bboxes = [];
        }
        this.n = n;
        this.extent = extent;
        this.padding = padding;
        this.scale = n / extent;
        this.uid = 0;
        var p = padding / n * extent;
        this.min = -p;
        this.max = extent + p;
      }
      GridIndex.prototype.insert = function(key, x1, y1, x2, y2) {
        this._forEachCell(x1, y1, x2, y2, this._insertCell, this.uid++);
        this.keys.push(key);
        this.bboxes.push(x1);
        this.bboxes.push(y1);
        this.bboxes.push(x2);
        this.bboxes.push(y2);
      };
      GridIndex.prototype._insertReadonly = function() {
        throw "Cannot insert into a GridIndex created from an ArrayBuffer.";
      };
      GridIndex.prototype._insertCell = function(x1, y1, x2, y2, cellIndex, uid) {
        this.cells[cellIndex].push(uid);
      };
      GridIndex.prototype.query = function(x1, y1, x2, y2, intersectionTest) {
        var min = this.min;
        var max = this.max;
        if (x1 <= min && y1 <= min && max <= x2 && max <= y2 && !intersectionTest) {
          return Array.prototype.slice.call(this.keys);
        } else {
          var result = [];
          var seenUids = {};
          this._forEachCell(x1, y1, x2, y2, this._queryCell, result, seenUids, intersectionTest);
          return result;
        }
      };
      GridIndex.prototype._queryCell = function(x1, y1, x2, y2, cellIndex, result, seenUids, intersectionTest) {
        var cell = this.cells[cellIndex];
        if (cell !== null) {
          var keys = this.keys;
          var bboxes = this.bboxes;
          for (var u = 0; u < cell.length; u++) {
            var uid = cell[u];
            if (seenUids[uid] === void 0) {
              var offset = uid * 4;
              if (intersectionTest ? intersectionTest(bboxes[offset + 0], bboxes[offset + 1], bboxes[offset + 2], bboxes[offset + 3]) : x1 <= bboxes[offset + 2] && y1 <= bboxes[offset + 3] && x2 >= bboxes[offset + 0] && y2 >= bboxes[offset + 1]) {
                seenUids[uid] = true;
                result.push(keys[uid]);
              } else {
                seenUids[uid] = false;
              }
            }
          }
        }
      };
      GridIndex.prototype._forEachCell = function(x1, y1, x2, y2, fn, arg1, arg2, intersectionTest) {
        var cx1 = this._convertToCellCoord(x1);
        var cy1 = this._convertToCellCoord(y1);
        var cx2 = this._convertToCellCoord(x2);
        var cy2 = this._convertToCellCoord(y2);
        for (var x = cx1; x <= cx2; x++) {
          for (var y = cy1; y <= cy2; y++) {
            var cellIndex = this.d * y + x;
            if (intersectionTest && !intersectionTest(
              this._convertFromCellCoord(x),
              this._convertFromCellCoord(y),
              this._convertFromCellCoord(x + 1),
              this._convertFromCellCoord(y + 1)
            )) continue;
            if (fn.call(this, x1, y1, x2, y2, cellIndex, arg1, arg2, intersectionTest)) return;
          }
        }
      };
      GridIndex.prototype._convertFromCellCoord = function(x) {
        return (x - this.padding) / this.scale;
      };
      GridIndex.prototype._convertToCellCoord = function(x) {
        return Math.max(0, Math.min(this.d - 1, Math.floor(x * this.scale) + this.padding));
      };
      GridIndex.prototype.toArrayBuffer = function() {
        if (this.arrayBuffer) return this.arrayBuffer;
        var cells = this.cells;
        var metadataLength = NUM_PARAMS + this.cells.length + 1 + 1;
        var totalCellLength = 0;
        for (var i = 0; i < this.cells.length; i++) {
          totalCellLength += this.cells[i].length;
        }
        var array = new Int32Array(metadataLength + totalCellLength + this.keys.length + this.bboxes.length);
        array[0] = this.extent;
        array[1] = this.n;
        array[2] = this.padding;
        var offset = metadataLength;
        for (var k = 0; k < cells.length; k++) {
          var cell = cells[k];
          array[NUM_PARAMS + k] = offset;
          array.set(cell, offset);
          offset += cell.length;
        }
        array[NUM_PARAMS + cells.length] = offset;
        array.set(this.keys, offset);
        offset += this.keys.length;
        array[NUM_PARAMS + cells.length + 1] = offset;
        array.set(this.bboxes, offset);
        offset += this.bboxes.length;
        return array.buffer;
      };
    }
  });

  // node_modules/@pirxpilot/nanoassert/index.js
  var require_nanoassert = __commonJS({
    "node_modules/@pirxpilot/nanoassert/index.js"(exports, module) {
      module.exports = assert;
      assert.notEqual = notEqual;
      assert.notOk = notOk;
      assert.equal = equal;
      assert.ok = assert;
      function equal(a, b, m) {
        doAssert(equal, a == b, m);
      }
      function notEqual(a, b, m) {
        doAssert(notEqual, a != b, m);
      }
      function notOk(t, m) {
        doAssert(notOk, !t, m);
      }
      function assert(t, m) {
        doAssert(assert, t, m);
      }
      var AssertionError = class extends Error {
      };
      function doAssert(fn, t, m) {
        if (!t) {
          const err = new AssertionError(m);
          Error.captureStackTrace?.(err, fn);
          throw err;
        }
      }
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/parsing_error.js
  var require_parsing_error = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/parsing_error.js"(exports, module) {
      var ParsingError = class extends Error {
        constructor(key, message) {
          super(message);
          this.message = message;
          this.key = key;
        }
      };
      module.exports = ParsingError;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/scope.js
  var require_scope = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/scope.js"(exports, module) {
      var Scope = class _Scope {
        constructor(parent, bindings = []) {
          this.parent = parent;
          this.bindings = {};
          for (const [name, expression] of bindings) {
            this.bindings[name] = expression;
          }
        }
        concat(bindings) {
          return new _Scope(this, bindings);
        }
        get(name) {
          if (this.bindings[name]) {
            return this.bindings[name];
          }
          if (this.parent) {
            return this.parent.get(name);
          }
          throw new Error(`${name} not found in scope.`);
        }
        has(name) {
          if (this.bindings[name]) return true;
          return this.parent ? this.parent.has(name) : false;
        }
      };
      module.exports = Scope;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/types.js
  var require_types = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/types.js"(exports, module) {
      var NullType = { kind: "null" };
      var NumberType = { kind: "number" };
      var StringType = { kind: "string" };
      var BooleanType = { kind: "boolean" };
      var ColorType = { kind: "color" };
      var ObjectType = { kind: "object" };
      var ValueType = { kind: "value" };
      var ErrorType = { kind: "error" };
      var CollatorType = { kind: "collator" };
      var FormattedType = { kind: "formatted" };
      function array(itemType, N) {
        return {
          kind: "array",
          itemType,
          N
        };
      }
      function toString(type) {
        if (type.kind === "array") {
          const itemType = toString(type.itemType);
          return typeof type.N === "number" ? `array<${itemType}, ${type.N}>` : type.itemType.kind === "value" ? "array" : `array<${itemType}>`;
        }
        return type.kind;
      }
      var valueMemberTypes = [
        NullType,
        NumberType,
        StringType,
        BooleanType,
        ColorType,
        FormattedType,
        ObjectType,
        array(ValueType)
      ];
      function checkSubtype(expected, t) {
        if (t.kind === "error") {
          return null;
        }
        if (expected.kind === "array") {
          if (t.kind === "array" && (t.N === 0 && t.itemType.kind === "value" || !checkSubtype(expected.itemType, t.itemType)) && (typeof expected.N !== "number" || expected.N === t.N)) {
            return null;
          }
        } else if (expected.kind === t.kind) {
          return null;
        } else if (expected.kind === "value") {
          for (const memberType of valueMemberTypes) {
            if (!checkSubtype(memberType, t)) {
              return null;
            }
          }
        }
        return `Expected ${toString(expected)} but found ${toString(t)} instead.`;
      }
      module.exports = {
        NullType,
        NumberType,
        StringType,
        BooleanType,
        ColorType,
        FormattedType,
        ObjectType,
        ValueType,
        ErrorType,
        CollatorType,
        array,
        toString,
        checkSubtype
      };
    }
  });

  // node_modules/csscolorparser/csscolorparser.js
  var require_csscolorparser = __commonJS({
    "node_modules/csscolorparser/csscolorparser.js"(exports) {
      var kCSSColorTable = {
        "transparent": [0, 0, 0, 0],
        "aliceblue": [240, 248, 255, 1],
        "antiquewhite": [250, 235, 215, 1],
        "aqua": [0, 255, 255, 1],
        "aquamarine": [127, 255, 212, 1],
        "azure": [240, 255, 255, 1],
        "beige": [245, 245, 220, 1],
        "bisque": [255, 228, 196, 1],
        "black": [0, 0, 0, 1],
        "blanchedalmond": [255, 235, 205, 1],
        "blue": [0, 0, 255, 1],
        "blueviolet": [138, 43, 226, 1],
        "brown": [165, 42, 42, 1],
        "burlywood": [222, 184, 135, 1],
        "cadetblue": [95, 158, 160, 1],
        "chartreuse": [127, 255, 0, 1],
        "chocolate": [210, 105, 30, 1],
        "coral": [255, 127, 80, 1],
        "cornflowerblue": [100, 149, 237, 1],
        "cornsilk": [255, 248, 220, 1],
        "crimson": [220, 20, 60, 1],
        "cyan": [0, 255, 255, 1],
        "darkblue": [0, 0, 139, 1],
        "darkcyan": [0, 139, 139, 1],
        "darkgoldenrod": [184, 134, 11, 1],
        "darkgray": [169, 169, 169, 1],
        "darkgreen": [0, 100, 0, 1],
        "darkgrey": [169, 169, 169, 1],
        "darkkhaki": [189, 183, 107, 1],
        "darkmagenta": [139, 0, 139, 1],
        "darkolivegreen": [85, 107, 47, 1],
        "darkorange": [255, 140, 0, 1],
        "darkorchid": [153, 50, 204, 1],
        "darkred": [139, 0, 0, 1],
        "darksalmon": [233, 150, 122, 1],
        "darkseagreen": [143, 188, 143, 1],
        "darkslateblue": [72, 61, 139, 1],
        "darkslategray": [47, 79, 79, 1],
        "darkslategrey": [47, 79, 79, 1],
        "darkturquoise": [0, 206, 209, 1],
        "darkviolet": [148, 0, 211, 1],
        "deeppink": [255, 20, 147, 1],
        "deepskyblue": [0, 191, 255, 1],
        "dimgray": [105, 105, 105, 1],
        "dimgrey": [105, 105, 105, 1],
        "dodgerblue": [30, 144, 255, 1],
        "firebrick": [178, 34, 34, 1],
        "floralwhite": [255, 250, 240, 1],
        "forestgreen": [34, 139, 34, 1],
        "fuchsia": [255, 0, 255, 1],
        "gainsboro": [220, 220, 220, 1],
        "ghostwhite": [248, 248, 255, 1],
        "gold": [255, 215, 0, 1],
        "goldenrod": [218, 165, 32, 1],
        "gray": [128, 128, 128, 1],
        "green": [0, 128, 0, 1],
        "greenyellow": [173, 255, 47, 1],
        "grey": [128, 128, 128, 1],
        "honeydew": [240, 255, 240, 1],
        "hotpink": [255, 105, 180, 1],
        "indianred": [205, 92, 92, 1],
        "indigo": [75, 0, 130, 1],
        "ivory": [255, 255, 240, 1],
        "khaki": [240, 230, 140, 1],
        "lavender": [230, 230, 250, 1],
        "lavenderblush": [255, 240, 245, 1],
        "lawngreen": [124, 252, 0, 1],
        "lemonchiffon": [255, 250, 205, 1],
        "lightblue": [173, 216, 230, 1],
        "lightcoral": [240, 128, 128, 1],
        "lightcyan": [224, 255, 255, 1],
        "lightgoldenrodyellow": [250, 250, 210, 1],
        "lightgray": [211, 211, 211, 1],
        "lightgreen": [144, 238, 144, 1],
        "lightgrey": [211, 211, 211, 1],
        "lightpink": [255, 182, 193, 1],
        "lightsalmon": [255, 160, 122, 1],
        "lightseagreen": [32, 178, 170, 1],
        "lightskyblue": [135, 206, 250, 1],
        "lightslategray": [119, 136, 153, 1],
        "lightslategrey": [119, 136, 153, 1],
        "lightsteelblue": [176, 196, 222, 1],
        "lightyellow": [255, 255, 224, 1],
        "lime": [0, 255, 0, 1],
        "limegreen": [50, 205, 50, 1],
        "linen": [250, 240, 230, 1],
        "magenta": [255, 0, 255, 1],
        "maroon": [128, 0, 0, 1],
        "mediumaquamarine": [102, 205, 170, 1],
        "mediumblue": [0, 0, 205, 1],
        "mediumorchid": [186, 85, 211, 1],
        "mediumpurple": [147, 112, 219, 1],
        "mediumseagreen": [60, 179, 113, 1],
        "mediumslateblue": [123, 104, 238, 1],
        "mediumspringgreen": [0, 250, 154, 1],
        "mediumturquoise": [72, 209, 204, 1],
        "mediumvioletred": [199, 21, 133, 1],
        "midnightblue": [25, 25, 112, 1],
        "mintcream": [245, 255, 250, 1],
        "mistyrose": [255, 228, 225, 1],
        "moccasin": [255, 228, 181, 1],
        "navajowhite": [255, 222, 173, 1],
        "navy": [0, 0, 128, 1],
        "oldlace": [253, 245, 230, 1],
        "olive": [128, 128, 0, 1],
        "olivedrab": [107, 142, 35, 1],
        "orange": [255, 165, 0, 1],
        "orangered": [255, 69, 0, 1],
        "orchid": [218, 112, 214, 1],
        "palegoldenrod": [238, 232, 170, 1],
        "palegreen": [152, 251, 152, 1],
        "paleturquoise": [175, 238, 238, 1],
        "palevioletred": [219, 112, 147, 1],
        "papayawhip": [255, 239, 213, 1],
        "peachpuff": [255, 218, 185, 1],
        "peru": [205, 133, 63, 1],
        "pink": [255, 192, 203, 1],
        "plum": [221, 160, 221, 1],
        "powderblue": [176, 224, 230, 1],
        "purple": [128, 0, 128, 1],
        "rebeccapurple": [102, 51, 153, 1],
        "red": [255, 0, 0, 1],
        "rosybrown": [188, 143, 143, 1],
        "royalblue": [65, 105, 225, 1],
        "saddlebrown": [139, 69, 19, 1],
        "salmon": [250, 128, 114, 1],
        "sandybrown": [244, 164, 96, 1],
        "seagreen": [46, 139, 87, 1],
        "seashell": [255, 245, 238, 1],
        "sienna": [160, 82, 45, 1],
        "silver": [192, 192, 192, 1],
        "skyblue": [135, 206, 235, 1],
        "slateblue": [106, 90, 205, 1],
        "slategray": [112, 128, 144, 1],
        "slategrey": [112, 128, 144, 1],
        "snow": [255, 250, 250, 1],
        "springgreen": [0, 255, 127, 1],
        "steelblue": [70, 130, 180, 1],
        "tan": [210, 180, 140, 1],
        "teal": [0, 128, 128, 1],
        "thistle": [216, 191, 216, 1],
        "tomato": [255, 99, 71, 1],
        "turquoise": [64, 224, 208, 1],
        "violet": [238, 130, 238, 1],
        "wheat": [245, 222, 179, 1],
        "white": [255, 255, 255, 1],
        "whitesmoke": [245, 245, 245, 1],
        "yellow": [255, 255, 0, 1],
        "yellowgreen": [154, 205, 50, 1]
      };
      function clamp_css_byte(i) {
        i = Math.round(i);
        return i < 0 ? 0 : i > 255 ? 255 : i;
      }
      function clamp_css_float(f) {
        return f < 0 ? 0 : f > 1 ? 1 : f;
      }
      function parse_css_int(str) {
        if (str[str.length - 1] === "%")
          return clamp_css_byte(parseFloat(str) / 100 * 255);
        return clamp_css_byte(parseInt(str));
      }
      function parse_css_float(str) {
        if (str[str.length - 1] === "%")
          return clamp_css_float(parseFloat(str) / 100);
        return clamp_css_float(parseFloat(str));
      }
      function css_hue_to_rgb(m1, m2, h) {
        if (h < 0) h += 1;
        else if (h > 1) h -= 1;
        if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
        if (h * 2 < 1) return m2;
        if (h * 3 < 2) return m1 + (m2 - m1) * (2 / 3 - h) * 6;
        return m1;
      }
      function parseCSSColor(css_str) {
        var str = css_str.replace(/ /g, "").toLowerCase();
        if (str in kCSSColorTable) return kCSSColorTable[str].slice();
        if (str[0] === "#") {
          if (str.length === 4) {
            var iv = parseInt(str.substr(1), 16);
            if (!(iv >= 0 && iv <= 4095)) return null;
            return [
              (iv & 3840) >> 4 | (iv & 3840) >> 8,
              iv & 240 | (iv & 240) >> 4,
              iv & 15 | (iv & 15) << 4,
              1
            ];
          } else if (str.length === 7) {
            var iv = parseInt(str.substr(1), 16);
            if (!(iv >= 0 && iv <= 16777215)) return null;
            return [
              (iv & 16711680) >> 16,
              (iv & 65280) >> 8,
              iv & 255,
              1
            ];
          }
          return null;
        }
        var op = str.indexOf("("), ep = str.indexOf(")");
        if (op !== -1 && ep + 1 === str.length) {
          var fname = str.substr(0, op);
          var params = str.substr(op + 1, ep - (op + 1)).split(",");
          var alpha = 1;
          switch (fname) {
            case "rgba":
              if (params.length !== 4) return null;
              alpha = parse_css_float(params.pop());
            // Fall through.
            case "rgb":
              if (params.length !== 3) return null;
              return [
                parse_css_int(params[0]),
                parse_css_int(params[1]),
                parse_css_int(params[2]),
                alpha
              ];
            case "hsla":
              if (params.length !== 4) return null;
              alpha = parse_css_float(params.pop());
            // Fall through.
            case "hsl":
              if (params.length !== 3) return null;
              var h = (parseFloat(params[0]) % 360 + 360) % 360 / 360;
              var s = parse_css_float(params[1]);
              var l = parse_css_float(params[2]);
              var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
              var m1 = l * 2 - m2;
              return [
                clamp_css_byte(css_hue_to_rgb(m1, m2, h + 1 / 3) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h - 1 / 3) * 255),
                alpha
              ];
            default:
              return null;
          }
        }
        return null;
      }
      try {
        exports.parseCSSColor = parseCSSColor;
      } catch (e) {
      }
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/util/color.js
  var require_color = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/util/color.js"(exports, module) {
      var { parseCSSColor } = require_csscolorparser();
      var Color = class _Color {
        constructor(r, g, b, a = 1) {
          this.r = r;
          this.g = g;
          this.b = b;
          this.a = a;
        }
        /**
         * Parses valid CSS color strings and returns a `Color` instance.
         * @returns A `Color` instance, or `undefined` if the input is not a valid color string.
         */
        static parse(input) {
          if (!input) {
            return void 0;
          }
          if (input instanceof _Color) {
            return input;
          }
          if (typeof input !== "string") {
            return void 0;
          }
          const rgba = parseCSSColor(input);
          if (!rgba) {
            return void 0;
          }
          return new _Color(rgba[0] / 255 * rgba[3], rgba[1] / 255 * rgba[3], rgba[2] / 255 * rgba[3], rgba[3]);
        }
        /**
         * Returns an RGBA string representing the color value.
         *
         * @returns An RGBA string.
         * @example
         * var purple = new Color.parse('purple');
         * purple.toString; // = "rgba(128,0,128,1)"
         * var translucentGreen = new Color.parse('rgba(26, 207, 26, .73)');
         * translucentGreen.toString(); // = "rgba(26,207,26,0.73)"
         */
        toString() {
          const [r, g, b, a] = this.toArray();
          return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
        }
        toArray() {
          const { r, g, b, a } = this;
          return a === 0 ? [0, 0, 0, 0] : [r * 255 / a, g * 255 / a, b * 255 / a, a];
        }
      };
      Color.black = new Color(0, 0, 0, 1);
      Color.white = new Color(1, 1, 1, 1);
      Color.transparent = new Color(0, 0, 0, 0);
      Color.red = new Color(1, 0, 0, 1);
      module.exports = Color;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/types/collator.js
  var require_collator = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/types/collator.js"(exports, module) {
      var Collator = class {
        constructor(caseSensitive, diacriticSensitive, locale) {
          if (caseSensitive) this.sensitivity = diacriticSensitive ? "variant" : "case";
          else this.sensitivity = diacriticSensitive ? "accent" : "base";
          this.locale = locale;
          this.collator = new Intl.Collator(this.locale ? this.locale : [], {
            sensitivity: this.sensitivity,
            usage: "search"
          });
        }
        compare(lhs, rhs) {
          return this.collator.compare(lhs, rhs);
        }
        resolvedLocale() {
          return new Intl.Collator(this.locale ? this.locale : []).resolvedOptions().locale;
        }
      };
      module.exports = { Collator };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/types/formatted.js
  var require_formatted = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/types/formatted.js"(exports, module) {
      var FormattedSection = class {
        constructor(text, scale, fontStack = null) {
          this.text = text;
          this.scale = scale;
          this.fontStack = fontStack;
        }
      };
      var Formatted = class _Formatted {
        constructor(sections) {
          this.sections = sections;
        }
        static fromString(unformatted) {
          return new _Formatted([new FormattedSection(unformatted, null, null)]);
        }
        toString() {
          return this.sections.map((section) => section.text).join("");
        }
        serialize() {
          const serialized = ["format"];
          for (const section of this.sections) {
            serialized.push(section.text);
            const options = {};
            if (section.fontStack) {
              options["text-font"] = ["literal", section.fontStack.split(",")];
            }
            if (section.scale) {
              options["font-scale"] = section.scale;
            }
            serialized.push(options);
          }
          return serialized;
        }
      };
      module.exports = { Formatted, FormattedSection };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/values.js
  var require_values = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/values.js"(exports, module) {
      var assert = require_nanoassert();
      var Color = require_color();
      var { Collator } = require_collator();
      var { Formatted } = require_formatted();
      var {
        NullType,
        NumberType,
        StringType,
        BooleanType,
        ColorType,
        ObjectType,
        ValueType,
        CollatorType,
        FormattedType,
        array
      } = require_types();
      function validateRGBA(r, g, b, a) {
        if (!(typeof r === "number" && r >= 0 && r <= 255 && typeof g === "number" && g >= 0 && g <= 255 && typeof b === "number" && b >= 0 && b <= 255)) {
          const value = typeof a === "number" ? [r, g, b, a] : [r, g, b];
          return `Invalid rgba value [${value.join(", ")}]: 'r', 'g', and 'b' must be between 0 and 255.`;
        }
        if (!(typeof a === "undefined" || typeof a === "number" && a >= 0 && a <= 1)) {
          return `Invalid rgba value [${[r, g, b, a].join(", ")}]: 'a' must be between 0 and 1.`;
        }
        return null;
      }
      function isValue(mixed) {
        if (mixed === null) {
          return true;
        }
        if (typeof mixed === "string") {
          return true;
        }
        if (typeof mixed === "boolean") {
          return true;
        }
        if (typeof mixed === "number") {
          return true;
        }
        if (mixed instanceof Color) {
          return true;
        }
        if (mixed instanceof Collator) {
          return true;
        }
        if (mixed instanceof Formatted) {
          return true;
        }
        if (Array.isArray(mixed)) {
          for (const item of mixed) {
            if (!isValue(item)) {
              return false;
            }
          }
          return true;
        }
        if (typeof mixed === "object") {
          for (const key in mixed) {
            if (!isValue(mixed[key])) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
      function typeOf(value) {
        if (value === null) {
          return NullType;
        }
        if (typeof value === "string") {
          return StringType;
        }
        if (typeof value === "boolean") {
          return BooleanType;
        }
        if (typeof value === "number") {
          return NumberType;
        }
        if (value instanceof Color) {
          return ColorType;
        }
        if (value instanceof Collator) {
          return CollatorType;
        }
        if (value instanceof Formatted) {
          return FormattedType;
        }
        if (Array.isArray(value)) {
          const length = value.length;
          let itemType;
          for (const item of value) {
            const t = typeOf(item);
            if (!itemType) {
              itemType = t;
            } else if (itemType === t) {
            } else {
              itemType = ValueType;
              break;
            }
          }
          return array(itemType || ValueType, length);
        }
        assert(typeof value === "object");
        return ObjectType;
      }
      function toString(value) {
        const type = typeof value;
        if (value === null) {
          return "";
        }
        if (type === "string" || type === "number" || type === "boolean") {
          return String(value);
        }
        if (value instanceof Color || value instanceof Formatted) {
          return value.toString();
        }
        return JSON.stringify(value);
      }
      module.exports = {
        toString,
        Color,
        Collator,
        validateRGBA,
        isValue,
        typeOf
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/literal.js
  var require_literal = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/literal.js"(exports, module) {
      var assert = require_nanoassert();
      var { isValue, typeOf, Color } = require_values();
      var { Formatted } = require_formatted();
      var Literal = class _Literal {
        constructor(type, value) {
          this.type = type;
          this.value = value;
        }
        static parse(args, context) {
          if (args.length !== 2)
            return context.error(`'literal' expression requires exactly one argument, but found ${args.length - 1} instead.`);
          if (!isValue(args[1])) return context.error("invalid value");
          const value = args[1];
          let type = typeOf(value);
          const expected = context.expectedType;
          if (type.kind === "array" && type.N === 0 && expected && expected.kind === "array" && (typeof expected.N !== "number" || expected.N === 0)) {
            type = expected;
          }
          return new _Literal(type, value);
        }
        evaluate() {
          return this.value;
        }
        eachChild() {
        }
        possibleOutputs() {
          return [this.value];
        }
        serialize() {
          if (this.type.kind === "array" || this.type.kind === "object") {
            return ["literal", this.value];
          }
          if (this.value instanceof Color) {
            return ["rgba"].concat(this.value.toArray());
          }
          if (this.value instanceof Formatted) {
            return this.value.serialize();
          }
          assert(
            this.value === null || typeof this.value === "string" || typeof this.value === "number" || typeof this.value === "boolean"
          );
          return this.value;
        }
      };
      module.exports = Literal;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/runtime_error.js
  var require_runtime_error = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/runtime_error.js"(exports, module) {
      var RuntimeError = class {
        constructor(message) {
          this.name = "ExpressionEvaluationError";
          this.message = message;
        }
        toJSON() {
          return this.message;
        }
      };
      module.exports = RuntimeError;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/assertion.js
  var require_assertion = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/assertion.js"(exports, module) {
      var assert = require_nanoassert();
      var {
        ObjectType,
        ValueType,
        StringType,
        NumberType,
        BooleanType,
        checkSubtype,
        toString,
        array
      } = require_types();
      var RuntimeError = require_runtime_error();
      var { typeOf } = require_values();
      var types = {
        string: StringType,
        number: NumberType,
        boolean: BooleanType,
        object: ObjectType
      };
      var Assertion = class _Assertion {
        constructor(type, args) {
          this.type = type;
          this.args = args;
        }
        static parse(args, context) {
          if (args.length < 2) return context.error("Expected at least one argument.");
          let i = 1;
          let type;
          const name = args[0];
          if (name === "array") {
            let itemType;
            if (args.length > 2) {
              const type2 = args[1];
              if (typeof type2 !== "string" || !(type2 in types) || type2 === "object")
                return context.error('The item type argument of "array" must be one of string, number, boolean', 1);
              itemType = types[type2];
              i++;
            } else {
              itemType = ValueType;
            }
            let N;
            if (args.length > 3) {
              if (args[2] !== null && (typeof args[2] !== "number" || args[2] < 0 || args[2] !== Math.floor(args[2]))) {
                return context.error('The length argument to "array" must be a positive integer literal', 2);
              }
              N = args[2];
              i++;
            }
            type = array(itemType, N);
          } else {
            assert(types[name], name);
            type = types[name];
          }
          const parsed = [];
          for (; i < args.length; i++) {
            const input = context.parse(args[i], i, ValueType);
            if (!input) return null;
            parsed.push(input);
          }
          return new _Assertion(type, parsed);
        }
        evaluate(ctx) {
          for (let i = 0; i < this.args.length; i++) {
            const value = this.args[i].evaluate(ctx);
            const error = checkSubtype(this.type, typeOf(value));
            if (!error) {
              return value;
            }
            if (i === this.args.length - 1) {
              throw new RuntimeError(
                `Expected value to be of type ${toString(this.type)}, but found ${toString(typeOf(value))} instead.`
              );
            }
          }
          assert(false);
          return null;
        }
        eachChild(fn) {
          this.args.forEach(fn);
        }
        possibleOutputs() {
          return [].concat(...this.args.map((arg) => arg.possibleOutputs()));
        }
        serialize() {
          const type = this.type;
          const serialized = [type.kind];
          if (type.kind === "array") {
            const itemType = type.itemType;
            if (itemType.kind === "string" || itemType.kind === "number" || itemType.kind === "boolean") {
              serialized.push(itemType.kind);
              const N = type.N;
              if (typeof N === "number" || this.args.length > 1) {
                serialized.push(N);
              }
            }
          }
          return serialized.concat(this.args.map((arg) => arg.serialize()));
        }
      };
      module.exports = Assertion;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/format.js
  var require_format = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/format.js"(exports, module) {
      var { NumberType, ValueType, FormattedType, array, StringType } = require_types();
      var { Formatted, FormattedSection } = require_formatted();
      var { toString } = require_values();
      var FormatExpression = class _FormatExpression {
        constructor(sections) {
          this.type = FormattedType;
          this.sections = sections;
        }
        static parse(args, context) {
          if (args.length < 3) {
            return context.error("Expected at least two arguments.");
          }
          if ((args.length - 1) % 2 !== 0) {
            return context.error("Expected an even number of arguments.");
          }
          const sections = [];
          for (let i = 1; i < args.length - 1; i += 2) {
            const text = context.parse(args[i], 1, ValueType);
            if (!text) return null;
            const kind = text.type.kind;
            if (kind !== "string" && kind !== "value" && kind !== "null")
              return context.error("Formatted text type must be 'string', 'value', or 'null'.");
            const options = args[i + 1];
            if (typeof options !== "object" || Array.isArray(options))
              return context.error("Format options argument must be an object.");
            let scale = null;
            if (options["font-scale"]) {
              scale = context.parse(options["font-scale"], 1, NumberType);
              if (!scale) return null;
            }
            let font = null;
            if (options["text-font"]) {
              font = context.parse(options["text-font"], 1, array(StringType));
              if (!font) return null;
            }
            sections.push({ text, scale, font });
          }
          return new _FormatExpression(sections);
        }
        evaluate(ctx) {
          return new Formatted(
            this.sections.map(
              (section) => new FormattedSection(
                toString(section.text.evaluate(ctx)),
                section.scale ? section.scale.evaluate(ctx) : null,
                section.font ? section.font.evaluate(ctx).join(",") : null
              )
            )
          );
        }
        eachChild(fn) {
          for (const section of this.sections) {
            fn(section.text);
            if (section.scale) {
              fn(section.scale);
            }
            if (section.font) {
              fn(section.font);
            }
          }
        }
        possibleOutputs() {
          return [void 0];
        }
        serialize() {
          const serialized = ["format"];
          for (const section of this.sections) {
            serialized.push(section.text.serialize());
            const options = {};
            if (section.scale) {
              options["font-scale"] = section.scale.serialize();
            }
            if (section.font) {
              options["text-font"] = section.font.serialize();
            }
            serialized.push(options);
          }
          return serialized;
        }
      };
      module.exports = { Formatted, FormatExpression };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/coercion.js
  var require_coercion = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/coercion.js"(exports, module) {
      var assert = require_nanoassert();
      var { BooleanType, ColorType, NumberType, StringType, ValueType } = require_types();
      var { Color, toString: valueToString, validateRGBA } = require_values();
      var RuntimeError = require_runtime_error();
      var { FormatExpression } = require_format();
      var { Formatted } = require_formatted();
      var types = {
        "to-boolean": BooleanType,
        "to-color": ColorType,
        "to-number": NumberType,
        "to-string": StringType
      };
      var Coercion = class _Coercion {
        constructor(type, args) {
          this.type = type;
          this.args = args;
        }
        static parse(args, context) {
          if (args.length < 2) return context.error("Expected at least one argument.");
          const name = args[0];
          assert(types[name], name);
          if ((name === "to-boolean" || name === "to-string") && args.length !== 2)
            return context.error("Expected one argument.");
          const type = types[name];
          const parsed = [];
          for (let i = 1; i < args.length; i++) {
            const input = context.parse(args[i], i, ValueType);
            if (!input) return null;
            parsed.push(input);
          }
          return new _Coercion(type, parsed);
        }
        evaluate(ctx) {
          if (this.type.kind === "boolean") {
            return Boolean(this.args[0].evaluate(ctx));
          }
          if (this.type.kind === "color") {
            let input;
            let error;
            for (const arg of this.args) {
              input = arg.evaluate(ctx);
              error = null;
              if (input instanceof Color) {
                return input;
              }
              if (typeof input === "string") {
                const c = ctx.parseColor(input);
                if (c) return c;
              } else if (Array.isArray(input)) {
                if (input.length < 3 || input.length > 4) {
                  error = `Invalid rbga value ${JSON.stringify(input)}: expected an array containing either three or four numeric values.`;
                } else {
                  error = validateRGBA(input[0], input[1], input[2], input[3]);
                }
                if (!error) {
                  return new Color(input[0] / 255, input[1] / 255, input[2] / 255, input[3]);
                }
              }
            }
            throw new RuntimeError(
              error || `Could not parse color from value '${typeof input === "string" ? input : JSON.stringify(input)}'`
            );
          }
          if (this.type.kind === "number") {
            let value = null;
            for (const arg of this.args) {
              value = arg.evaluate(ctx);
              if (value === null) return 0;
              const num = Number(value);
              if (isNaN(num)) continue;
              return num;
            }
            throw new RuntimeError(`Could not convert ${JSON.stringify(value)} to number.`);
          }
          if (this.type.kind === "formatted") {
            return Formatted.fromString(valueToString(this.args[0].evaluate(ctx)));
          }
          return valueToString(this.args[0].evaluate(ctx));
        }
        eachChild(fn) {
          this.args.forEach(fn);
        }
        possibleOutputs() {
          return [].concat(...this.args.map((arg) => arg.possibleOutputs()));
        }
        serialize() {
          if (this.type.kind === "formatted") {
            return new FormatExpression([{ text: this.args[0], scale: null, font: null }]).serialize();
          }
          const serialized = [`to-${this.type.kind}`];
          this.eachChild((child) => {
            serialized.push(child.serialize());
          });
          return serialized;
        }
      };
      module.exports = Coercion;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/evaluation_context.js
  var require_evaluation_context = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/evaluation_context.js"(exports, module) {
      var { Color } = require_values();
      var geometryTypes = ["Unknown", "Point", "LineString", "Polygon"];
      var EvaluationContext = class {
        constructor() {
          this.globals = null;
          this.feature = null;
          this.featureState = null;
          this._parseColorCache = {};
        }
        id() {
          return this.feature && "id" in this.feature ? this.feature.id : null;
        }
        geometryType() {
          return this.feature ? typeof this.feature.type === "number" ? geometryTypes[this.feature.type] : this.feature.type : null;
        }
        properties() {
          return this.feature?.properties || {};
        }
        parseColor(input) {
          let cached = this._parseColorCache[input];
          if (!cached) {
            cached = this._parseColorCache[input] = Color.parse(input);
          }
          return cached;
        }
      };
      module.exports = EvaluationContext;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/collator.js
  var require_collator2 = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/collator.js"(exports, module) {
      var { StringType, BooleanType, CollatorType } = require_types();
      var { Collator } = require_collator();
      var CollatorExpression = class _CollatorExpression {
        constructor(caseSensitive, diacriticSensitive, locale) {
          this.type = CollatorType;
          this.locale = locale;
          this.caseSensitive = caseSensitive;
          this.diacriticSensitive = diacriticSensitive;
        }
        static parse(args, context) {
          if (args.length !== 2) return context.error("Expected one argument.");
          const options = args[1];
          if (typeof options !== "object" || Array.isArray(options))
            return context.error("Collator options argument must be an object.");
          const caseSensitive = context.parse(
            options["case-sensitive"] === void 0 ? false : options["case-sensitive"],
            1,
            BooleanType
          );
          if (!caseSensitive) return null;
          const diacriticSensitive = context.parse(
            options["diacritic-sensitive"] === void 0 ? false : options["diacritic-sensitive"],
            1,
            BooleanType
          );
          if (!diacriticSensitive) return null;
          let locale = null;
          if (options["locale"]) {
            locale = context.parse(options["locale"], 1, StringType);
            if (!locale) return null;
          }
          return new _CollatorExpression(caseSensitive, diacriticSensitive, locale);
        }
        evaluate(ctx) {
          return new Collator(
            this.caseSensitive.evaluate(ctx),
            this.diacriticSensitive.evaluate(ctx),
            this.locale ? this.locale.evaluate(ctx) : null
          );
        }
        eachChild(fn) {
          fn(this.caseSensitive);
          fn(this.diacriticSensitive);
          if (this.locale) {
            fn(this.locale);
          }
        }
        possibleOutputs() {
          return [void 0];
        }
        serialize() {
          const options = {};
          options["case-sensitive"] = this.caseSensitive.serialize();
          options["diacritic-sensitive"] = this.diacriticSensitive.serialize();
          if (this.locale) {
            options["locale"] = this.locale.serialize();
          }
          return ["collator", options];
        }
      };
      module.exports = {
        Collator,
        CollatorExpression
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/compound_expression.js
  var require_compound_expression = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/compound_expression.js"(exports, module) {
      var { toString } = require_types();
      var assert = require_nanoassert();
      var CompoundExpression = class _CompoundExpression {
        constructor(name, type, evaluate, args) {
          this.name = name;
          this.type = type;
          this._evaluate = evaluate;
          this.args = args;
        }
        evaluate(ctx) {
          return this._evaluate(ctx, this.args);
        }
        eachChild(fn) {
          this.args.forEach(fn);
        }
        possibleOutputs() {
          return [void 0];
        }
        serialize() {
          return [this.name].concat(this.args.map((arg) => arg.serialize()));
        }
        static parse(args, context) {
          const ParsingContext = require_parsing_context();
          const op = args[0];
          const definition = _CompoundExpression.definitions[op];
          if (!definition) {
            return context.error(`Unknown expression "${op}". If you wanted a literal array, use ["literal", [...]].`, 0);
          }
          const type = Array.isArray(definition) ? definition[0] : definition.type;
          const availableOverloads = Array.isArray(definition) ? [[definition[1], definition[2]]] : definition.overloads;
          const overloads = availableOverloads.filter(
            ([signature]) => !Array.isArray(signature) || // varags
            signature.length === args.length - 1
            // correct param count
          );
          let signatureContext = null;
          for (const [params, evaluate] of overloads) {
            signatureContext = new ParsingContext(context.registry, context.path, null, context.scope);
            const parsedArgs = [];
            let argParseFailed = false;
            for (let i = 1; i < args.length; i++) {
              const arg = args[i];
              const expectedType = Array.isArray(params) ? params[i - 1] : params.type;
              const parsed = signatureContext.parse(arg, 1 + parsedArgs.length, expectedType);
              if (!parsed) {
                argParseFailed = true;
                break;
              }
              parsedArgs.push(parsed);
            }
            if (argParseFailed) {
              continue;
            }
            if (Array.isArray(params)) {
              if (params.length !== parsedArgs.length) {
                signatureContext.error(`Expected ${params.length} arguments, but found ${parsedArgs.length} instead.`);
                continue;
              }
            }
            for (let i = 0; i < parsedArgs.length; i++) {
              const expected = Array.isArray(params) ? params[i] : params.type;
              const arg = parsedArgs[i];
              signatureContext.concat(i + 1).checkSubtype(expected, arg.type);
            }
            if (signatureContext.errors.length === 0) {
              return new _CompoundExpression(op, type, evaluate, parsedArgs);
            }
          }
          assert(!signatureContext || signatureContext.errors.length > 0);
          if (overloads.length === 1) {
            context.errors.push.apply(context.errors, signatureContext.errors);
          } else {
            const expected = overloads.length ? overloads : availableOverloads;
            const signatures = expected.map(([params]) => stringifySignature(params)).join(" | ");
            const actualTypes = [];
            for (let i = 1; i < args.length; i++) {
              const parsed = context.parse(args[i], 1 + actualTypes.length);
              if (!parsed) return null;
              actualTypes.push(toString(parsed.type));
            }
            context.error(`Expected arguments of type ${signatures}, but found (${actualTypes.join(", ")}) instead.`);
          }
          return null;
        }
        static register(registry, definitions) {
          assert(!_CompoundExpression.definitions);
          _CompoundExpression.definitions = definitions;
          for (const name in definitions) {
            registry[name] = _CompoundExpression;
          }
        }
      };
      function stringifySignature(signature) {
        if (Array.isArray(signature)) {
          return `(${signature.map(toString).join(", ")})`;
        }
        return `(${toString(signature.type)}...)`;
      }
      module.exports = CompoundExpression;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/is_constant.js
  var require_is_constant = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/is_constant.js"(exports, module) {
      var CompoundExpression = require_compound_expression();
      function isFeatureConstant(e) {
        if (e instanceof CompoundExpression) {
          if (e.name === "get" && e.args.length === 1) {
            return false;
          }
          if (e.name === "feature-state") {
            return false;
          }
          if (e.name === "has" && e.args.length === 1) {
            return false;
          }
          if (e.name === "properties" || e.name === "geometry-type" || e.name === "id") {
            return false;
          }
          if (/^filter-/.test(e.name)) {
            return false;
          }
        }
        let result = true;
        e.eachChild((arg) => {
          if (result && !isFeatureConstant(arg)) {
            result = false;
          }
        });
        return result;
      }
      function isStateConstant(e) {
        if (e instanceof CompoundExpression) {
          if (e.name === "feature-state") {
            return false;
          }
        }
        let result = true;
        e.eachChild((arg) => {
          if (result && !isStateConstant(arg)) {
            result = false;
          }
        });
        return result;
      }
      function isGlobalPropertyConstant(e, properties) {
        if (e instanceof CompoundExpression && properties.indexOf(e.name) >= 0) {
          return false;
        }
        let result = true;
        e.eachChild((arg) => {
          if (result && !isGlobalPropertyConstant(arg, properties)) {
            result = false;
          }
        });
        return result;
      }
      module.exports = {
        isFeatureConstant,
        isGlobalPropertyConstant,
        isStateConstant
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/var.js
  var require_var = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/var.js"(exports, module) {
      var Var = class _Var {
        constructor(name, boundExpression) {
          this.type = boundExpression.type;
          this.name = name;
          this.boundExpression = boundExpression;
        }
        static parse(args, context) {
          if (args.length !== 2 || typeof args[1] !== "string")
            return context.error(`'var' expression requires exactly one string literal argument.`);
          const name = args[1];
          if (!context.scope.has(name)) {
            return context.error(
              `Unknown variable "${name}". Make sure "${name}" has been bound in an enclosing "let" expression before using it.`,
              1
            );
          }
          return new _Var(name, context.scope.get(name));
        }
        evaluate(ctx) {
          return this.boundExpression.evaluate(ctx);
        }
        eachChild() {
        }
        possibleOutputs() {
          return [void 0];
        }
        serialize() {
          return ["var", this.name];
        }
      };
      module.exports = Var;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/parsing_context.js
  var require_parsing_context = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/parsing_context.js"(exports, module) {
      var assert = require_nanoassert();
      var Scope = require_scope();
      var { checkSubtype } = require_types();
      var ParsingError = require_parsing_error();
      var Literal = require_literal();
      var Assertion = require_assertion();
      var Coercion = require_coercion();
      var EvaluationContext = require_evaluation_context();
      var { CollatorExpression } = require_collator2();
      var { isGlobalPropertyConstant, isFeatureConstant } = require_is_constant();
      var Var = require_var();
      var ParsingContext = class _ParsingContext {
        // The expected type of this expression. Provided only to allow Expression
        // implementations to infer argument types: Expression#parse() need not
        // check that the output type of the parsed expression matches
        // `expectedType`.
        constructor(registry, path = [], expectedType, scope = new Scope(), errors = []) {
          this.registry = registry;
          this.path = path;
          this.key = path.map((part) => `[${part}]`).join("");
          this.scope = scope;
          this.errors = errors;
          this.expectedType = expectedType;
        }
        /**
         * @param expr the JSON expression to parse
         * @param index the optional argument index if this expression is an argument of a parent expression that's being parsed
         * @param options
         * @param options.omitTypeAnnotations set true to omit inferred type annotations.  Caller beware: with this option set, the parsed expression's type will NOT satisfy `expectedType` if it would normally be wrapped in an inferred annotation.
         * @private
         */
        parse(expr, index, expectedType, bindings, options = {}) {
          if (index) {
            return this.concat(index, expectedType, bindings)._parse(expr, options);
          }
          return this._parse(expr, options);
        }
        _parse(expr, options) {
          if (expr === null || typeof expr === "string" || typeof expr === "boolean" || typeof expr === "number") {
            expr = ["literal", expr];
          }
          function annotate(parsed, type, typeAnnotation) {
            if (typeAnnotation === "assert") {
              return new Assertion(type, [parsed]);
            }
            if (typeAnnotation === "coerce") {
              return new Coercion(type, [parsed]);
            }
            return parsed;
          }
          if (Array.isArray(expr)) {
            if (expr.length === 0) {
              return this.error(
                `Expected an array with at least one element. If you wanted a literal array, use ["literal", []].`
              );
            }
            const op = expr[0];
            if (typeof op !== "string") {
              this.error(
                `Expression name must be a string, but found ${typeof op} instead. If you wanted a literal array, use ["literal", [...]].`,
                0
              );
              return null;
            }
            const Expr = this.registry[op];
            if (Expr) {
              let parsed = Expr.parse(expr, this);
              if (!parsed) return null;
              if (this.expectedType) {
                const expected = this.expectedType;
                const actual = parsed.type;
                if ((expected.kind === "string" || expected.kind === "number" || expected.kind === "boolean" || expected.kind === "object" || expected.kind === "array") && actual.kind === "value") {
                  parsed = annotate(parsed, expected, options.typeAnnotation || "assert");
                } else if ((expected.kind === "color" || expected.kind === "formatted") && (actual.kind === "value" || actual.kind === "string")) {
                  parsed = annotate(parsed, expected, options.typeAnnotation || "coerce");
                } else if (this.checkSubtype(expected, actual)) {
                  return null;
                }
              }
              if (!(parsed instanceof Literal) && isConstant(parsed)) {
                const ec = new EvaluationContext();
                try {
                  parsed = new Literal(parsed.type, parsed.evaluate(ec));
                } catch (e) {
                  this.error(e.message);
                  return null;
                }
              }
              return parsed;
            }
            return this.error(`Unknown expression "${op}". If you wanted a literal array, use ["literal", [...]].`, 0);
          }
          if (typeof expr === "undefined") {
            return this.error(`'undefined' value invalid. Use null instead.`);
          }
          if (typeof expr === "object") {
            return this.error(`Bare objects invalid. Use ["literal", {...}] instead.`);
          }
          return this.error(`Expected an array, but found ${typeof expr} instead.`);
        }
        /**
         * Returns a copy of this context suitable for parsing the subexpression at
         * index `index`, optionally appending to 'let' binding map.
         *
         * Note that `errors` property, intended for collecting errors while
         * parsing, is copied by reference rather than cloned.
         * @private
         */
        concat(index, expectedType, bindings) {
          const path = typeof index === "number" ? this.path.concat(index) : this.path;
          const scope = bindings ? this.scope.concat(bindings) : this.scope;
          return new _ParsingContext(this.registry, path, expectedType || null, scope, this.errors);
        }
        /**
         * Push a parsing (or type checking) error into the `this.errors`
         * @param error The message
         * @param keys Optionally specify the source of the error at a child
         * of the current expression at `this.key`.
         * @private
         */
        error(error, ...keys) {
          const key = `${this.key}${keys.map((k) => `[${k}]`).join("")}`;
          this.errors.push(new ParsingError(key, error));
        }
        /**
         * Returns null if `t` is a subtype of `expected`; otherwise returns an
         * error message and also pushes it to `this.errors`.
         */
        checkSubtype(expected, t) {
          const error = checkSubtype(expected, t);
          if (error) this.error(error);
          return error;
        }
      };
      module.exports = ParsingContext;
      function isConstant(expression) {
        const CompoundExpression = require_compound_expression();
        if (expression instanceof Var) {
          return isConstant(expression.boundExpression);
        }
        if (expression instanceof CompoundExpression && expression.name === "error") {
          return false;
        }
        if (expression instanceof CollatorExpression) {
          return false;
        }
        const isTypeAnnotation = expression instanceof Coercion || expression instanceof Assertion;
        let childrenConstant = true;
        expression.eachChild((child) => {
          if (isTypeAnnotation) {
            childrenConstant = childrenConstant && isConstant(child);
          } else {
            childrenConstant = childrenConstant && child instanceof Literal;
          }
        });
        if (!childrenConstant) {
          return false;
        }
        return isFeatureConstant(expression) && isGlobalPropertyConstant(expression, ["zoom", "heatmap-density", "line-progress", "is-supported-script"]);
      }
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/stops.js
  var require_stops = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/stops.js"(exports, module) {
      var RuntimeError = require_runtime_error();
      function findStopLessThanOrEqualTo(stops, input) {
        const n = stops.length;
        let lowerIndex = 0;
        let upperIndex = n - 1;
        let currentIndex = 0;
        let currentValue;
        let upperValue;
        while (lowerIndex <= upperIndex) {
          currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
          currentValue = stops[currentIndex];
          upperValue = stops[currentIndex + 1];
          if (input === currentValue || input > currentValue && input < upperValue) {
            return currentIndex;
          }
          if (currentValue < input) {
            lowerIndex = currentIndex + 1;
          } else if (currentValue > input) {
            upperIndex = currentIndex - 1;
          } else {
            throw new RuntimeError("Input is not a number.");
          }
        }
        return Math.max(currentIndex - 1, 0);
      }
      module.exports = {
        findStopLessThanOrEqualTo
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/step.js
  var require_step = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/step.js"(exports, module) {
      var { NumberType } = require_types();
      var { findStopLessThanOrEqualTo } = require_stops();
      var Step = class _Step {
        constructor(type, input, stops) {
          this.type = type;
          this.input = input;
          this.labels = [];
          this.outputs = [];
          for (const [label, expression] of stops) {
            this.labels.push(label);
            this.outputs.push(expression);
          }
        }
        static parse(args, context) {
          let [, input, ...rest] = args;
          if (args.length - 1 < 4) {
            return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
          }
          if ((args.length - 1) % 2 !== 0) {
            return context.error("Expected an even number of arguments.");
          }
          input = context.parse(input, 1, NumberType);
          if (!input) return null;
          const stops = [];
          let outputType = null;
          if (context.expectedType && context.expectedType.kind !== "value") {
            outputType = context.expectedType;
          }
          rest.unshift(Number.NEGATIVE_INFINITY);
          for (let i = 0; i < rest.length; i += 2) {
            const label = rest[i];
            const value = rest[i + 1];
            const labelKey = i + 1;
            const valueKey = i + 2;
            if (typeof label !== "number") {
              return context.error(
                'Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.',
                labelKey
              );
            }
            if (stops.length && stops[stops.length - 1][0] >= label) {
              return context.error(
                'Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.',
                labelKey
              );
            }
            const parsed = context.parse(value, valueKey, outputType);
            if (!parsed) return null;
            outputType = outputType || parsed.type;
            stops.push([label, parsed]);
          }
          return new _Step(outputType, input, stops);
        }
        evaluate(ctx) {
          const labels = this.labels;
          const outputs = this.outputs;
          if (labels.length === 1) {
            return outputs[0].evaluate(ctx);
          }
          const value = this.input.evaluate(ctx);
          if (value <= labels[0]) {
            return outputs[0].evaluate(ctx);
          }
          const stopCount = labels.length;
          if (value >= labels[stopCount - 1]) {
            return outputs[stopCount - 1].evaluate(ctx);
          }
          const index = findStopLessThanOrEqualTo(labels, value);
          return outputs[index].evaluate(ctx);
        }
        eachChild(fn) {
          fn(this.input);
          for (const expression of this.outputs) {
            fn(expression);
          }
        }
        possibleOutputs() {
          return [].concat(...this.outputs.map((output) => output.possibleOutputs()));
        }
        serialize() {
          const serialized = ["step", this.input.serialize()];
          for (let i = 0; i < this.labels.length; i++) {
            if (i > 0) {
              serialized.push(this.labels[i]);
            }
            serialized.push(this.outputs[i].serialize());
          }
          return serialized;
        }
      };
      module.exports = Step;
    }
  });

  // node_modules/@mapbox/unitbezier/index.js
  var require_unitbezier = __commonJS({
    "node_modules/@mapbox/unitbezier/index.js"(exports, module) {
      "use strict";
      module.exports = UnitBezier;
      function UnitBezier(p1x, p1y, p2x, p2y) {
        this.cx = 3 * p1x;
        this.bx = 3 * (p2x - p1x) - this.cx;
        this.ax = 1 - this.cx - this.bx;
        this.cy = 3 * p1y;
        this.by = 3 * (p2y - p1y) - this.cy;
        this.ay = 1 - this.cy - this.by;
        this.p1x = p1x;
        this.p1y = p1y;
        this.p2x = p2x;
        this.p2y = p2y;
      }
      UnitBezier.prototype = {
        sampleCurveX: function(t) {
          return ((this.ax * t + this.bx) * t + this.cx) * t;
        },
        sampleCurveY: function(t) {
          return ((this.ay * t + this.by) * t + this.cy) * t;
        },
        sampleCurveDerivativeX: function(t) {
          return (3 * this.ax * t + 2 * this.bx) * t + this.cx;
        },
        solveCurveX: function(x, epsilon) {
          if (epsilon === void 0) epsilon = 1e-6;
          if (x < 0) return 0;
          if (x > 1) return 1;
          var t = x;
          for (var i = 0; i < 8; i++) {
            var x2 = this.sampleCurveX(t) - x;
            if (Math.abs(x2) < epsilon) return t;
            var d2 = this.sampleCurveDerivativeX(t);
            if (Math.abs(d2) < 1e-6) break;
            t = t - x2 / d2;
          }
          var t0 = 0;
          var t1 = 1;
          t = x;
          for (i = 0; i < 20; i++) {
            x2 = this.sampleCurveX(t);
            if (Math.abs(x2 - x) < epsilon) break;
            if (x > x2) {
              t0 = t;
            } else {
              t1 = t;
            }
            t = (t1 - t0) * 0.5 + t0;
          }
          return t;
        },
        solve: function(x, epsilon) {
          return this.sampleCurveY(this.solveCurveX(x, epsilon));
        }
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/util/interpolate.js
  var require_interpolate = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/util/interpolate.js"(exports, module) {
      var Color = require_color();
      function number(a, b, t) {
        return a * (1 - t) + b * t;
      }
      function color(from, to, t) {
        return new Color(number(from.r, to.r, t), number(from.g, to.g, t), number(from.b, to.b, t), number(from.a, to.a, t));
      }
      function array(from, to, t) {
        return from.map((d, i) => {
          return number(d, to[i], t);
        });
      }
      module.exports = {
        number,
        color,
        array
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/util/color_spaces.js
  var require_color_spaces = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/util/color_spaces.js"(exports, module) {
      var Color = require_color();
      var { number: interpolateNumber } = require_interpolate();
      var Xn = 0.95047;
      var Yn = 1;
      var Zn = 1.08883;
      var t0 = 4 / 29;
      var t1 = 6 / 29;
      var t2 = 3 * t1 * t1;
      var t3 = t1 * t1 * t1;
      var deg2rad = Math.PI / 180;
      var rad2deg = 180 / Math.PI;
      function xyz2lab(t) {
        return t > t3 ? t ** (1 / 3) : t / t2 + t0;
      }
      function lab2xyz(t) {
        return t > t1 ? t * t * t : t2 * (t - t0);
      }
      function xyz2rgb(x) {
        return 255 * (x <= 31308e-7 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
      }
      function rgb2xyz(x) {
        x /= 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      }
      function rgbToLab(rgbColor) {
        const b = rgb2xyz(rgbColor.r);
        const a = rgb2xyz(rgbColor.g);
        const l = rgb2xyz(rgbColor.b);
        const x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn);
        const y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.072175 * l) / Yn);
        const z = xyz2lab((0.0193339 * b + 0.119192 * a + 0.9503041 * l) / Zn);
        return {
          l: 116 * y - 16,
          a: 500 * (x - y),
          b: 200 * (y - z),
          alpha: rgbColor.a
        };
      }
      function labToRgb(labColor) {
        let y = (labColor.l + 16) / 116;
        let x = isNaN(labColor.a) ? y : y + labColor.a / 500;
        let z = isNaN(labColor.b) ? y : y - labColor.b / 200;
        y = Yn * lab2xyz(y);
        x = Xn * lab2xyz(x);
        z = Zn * lab2xyz(z);
        return new Color(
          xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
          // D65 -> sRGB
          xyz2rgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z),
          xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
          labColor.alpha
        );
      }
      function interpolateLab(from, to, t) {
        return {
          l: interpolateNumber(from.l, to.l, t),
          a: interpolateNumber(from.a, to.a, t),
          b: interpolateNumber(from.b, to.b, t),
          alpha: interpolateNumber(from.alpha, to.alpha, t)
        };
      }
      function rgbToHcl(rgbColor) {
        const { l, a, b } = rgbToLab(rgbColor);
        const h = Math.atan2(b, a) * rad2deg;
        return {
          h: h < 0 ? h + 360 : h,
          c: Math.sqrt(a * a + b * b),
          l,
          alpha: rgbColor.a
        };
      }
      function hclToRgb(hclColor) {
        const h = hclColor.h * deg2rad;
        const c = hclColor.c;
        const l = hclColor.l;
        return labToRgb({
          l,
          a: Math.cos(h) * c,
          b: Math.sin(h) * c,
          alpha: hclColor.alpha
        });
      }
      function interpolateHue(a, b, t) {
        const d = b - a;
        return a + t * (d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d);
      }
      function interpolateHcl(from, to, t) {
        return {
          h: interpolateHue(from.h, to.h, t),
          c: interpolateNumber(from.c, to.c, t),
          l: interpolateNumber(from.l, to.l, t),
          alpha: interpolateNumber(from.alpha, to.alpha, t)
        };
      }
      var lab = {
        forward: rgbToLab,
        reverse: labToRgb,
        interpolate: interpolateLab
      };
      var hcl = {
        forward: rgbToHcl,
        reverse: hclToRgb,
        interpolate: interpolateHcl
      };
      module.exports = {
        lab,
        hcl
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/interpolate.js
  var require_interpolate2 = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/interpolate.js"(exports, module) {
      var UnitBezier = require_unitbezier();
      var interpolate = require_interpolate();
      var { toString, ColorType, NumberType } = require_types();
      var { findStopLessThanOrEqualTo } = require_stops();
      var { hcl, lab } = require_color_spaces();
      var Interpolate = class _Interpolate {
        constructor(type, operator, interpolation, input, stops) {
          this.type = type;
          this.operator = operator;
          this.interpolation = interpolation;
          this.input = input;
          this.labels = [];
          this.outputs = [];
          for (const [label, expression] of stops) {
            this.labels.push(label);
            this.outputs.push(expression);
          }
        }
        static interpolationFactor(interpolation, input, lower, upper) {
          let t = 0;
          if (interpolation.name === "exponential") {
            t = exponentialInterpolation(input, interpolation.base, lower, upper);
          } else if (interpolation.name === "linear") {
            t = exponentialInterpolation(input, 1, lower, upper);
          } else if (interpolation.name === "cubic-bezier") {
            const c = interpolation.controlPoints;
            const ub = new UnitBezier(c[0], c[1], c[2], c[3]);
            t = ub.solve(exponentialInterpolation(input, 1, lower, upper));
          }
          return t;
        }
        static parse(args, context) {
          let [operator, interpolation, input, ...rest] = args;
          if (!Array.isArray(interpolation) || interpolation.length === 0) {
            return context.error("Expected an interpolation type expression.", 1);
          }
          if (interpolation[0] === "linear") {
            interpolation = { name: "linear" };
          } else if (interpolation[0] === "exponential") {
            const base = interpolation[1];
            if (typeof base !== "number") return context.error("Exponential interpolation requires a numeric base.", 1, 1);
            interpolation = {
              name: "exponential",
              base
            };
          } else if (interpolation[0] === "cubic-bezier") {
            const controlPoints = interpolation.slice(1);
            if (controlPoints.length !== 4 || controlPoints.some((t) => typeof t !== "number" || t < 0 || t > 1)) {
              return context.error(
                "Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.",
                1
              );
            }
            interpolation = {
              name: "cubic-bezier",
              controlPoints
            };
          } else {
            return context.error(`Unknown interpolation type ${String(interpolation[0])}`, 1, 0);
          }
          if (args.length - 1 < 4) {
            return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
          }
          if ((args.length - 1) % 2 !== 0) {
            return context.error("Expected an even number of arguments.");
          }
          input = context.parse(input, 2, NumberType);
          if (!input) return null;
          const stops = [];
          let outputType = null;
          if (operator === "interpolate-hcl" || operator === "interpolate-lab") {
            outputType = ColorType;
          } else if (context.expectedType && context.expectedType.kind !== "value") {
            outputType = context.expectedType;
          }
          for (let i = 0; i < rest.length; i += 2) {
            const label = rest[i];
            const value = rest[i + 1];
            const labelKey = i + 3;
            const valueKey = i + 4;
            if (typeof label !== "number") {
              return context.error(
                'Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.',
                labelKey
              );
            }
            if (stops.length && stops[stops.length - 1][0] >= label) {
              return context.error(
                'Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.',
                labelKey
              );
            }
            const parsed = context.parse(value, valueKey, outputType);
            if (!parsed) return null;
            outputType = outputType || parsed.type;
            stops.push([label, parsed]);
          }
          if (outputType.kind !== "number" && outputType.kind !== "color" && !(outputType.kind === "array" && outputType.itemType.kind === "number" && typeof outputType.N === "number")) {
            return context.error(`Type ${toString(outputType)} is not interpolatable.`);
          }
          return new _Interpolate(outputType, operator, interpolation, input, stops);
        }
        evaluate(ctx) {
          const labels = this.labels;
          const outputs = this.outputs;
          if (labels.length === 1) {
            return outputs[0].evaluate(ctx);
          }
          const value = this.input.evaluate(ctx);
          if (value <= labels[0]) {
            return outputs[0].evaluate(ctx);
          }
          const stopCount = labels.length;
          if (value >= labels[stopCount - 1]) {
            return outputs[stopCount - 1].evaluate(ctx);
          }
          const index = findStopLessThanOrEqualTo(labels, value);
          const lower = labels[index];
          const upper = labels[index + 1];
          const t = _Interpolate.interpolationFactor(this.interpolation, value, lower, upper);
          const outputLower = outputs[index].evaluate(ctx);
          const outputUpper = outputs[index + 1].evaluate(ctx);
          if (this.operator === "interpolate") {
            return interpolate[this.type.kind.toLowerCase()](outputLower, outputUpper, t);
          }
          if (this.operator === "interpolate-hcl") {
            return hcl.reverse(hcl.interpolate(hcl.forward(outputLower), hcl.forward(outputUpper), t));
          }
          return lab.reverse(lab.interpolate(lab.forward(outputLower), lab.forward(outputUpper), t));
        }
        eachChild(fn) {
          fn(this.input);
          for (const expression of this.outputs) {
            fn(expression);
          }
        }
        possibleOutputs() {
          return [].concat(...this.outputs.map((output) => output.possibleOutputs()));
        }
        serialize() {
          let interpolation;
          if (this.interpolation.name === "linear") {
            interpolation = ["linear"];
          } else if (this.interpolation.name === "exponential") {
            if (this.interpolation.base === 1) {
              interpolation = ["linear"];
            } else {
              interpolation = ["exponential", this.interpolation.base];
            }
          } else {
            interpolation = ["cubic-bezier"].concat(this.interpolation.controlPoints);
          }
          const serialized = [this.operator, interpolation, this.input.serialize()];
          for (let i = 0; i < this.labels.length; i++) {
            serialized.push(this.labels[i], this.outputs[i].serialize());
          }
          return serialized;
        }
      };
      function exponentialInterpolation(input, base, lowerValue, upperValue) {
        const difference = upperValue - lowerValue;
        const progress = input - lowerValue;
        if (difference === 0) {
          return 0;
        }
        if (base === 1) {
          return progress / difference;
        }
        return (base ** progress - 1) / (base ** difference - 1);
      }
      module.exports = Interpolate;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/coalesce.js
  var require_coalesce = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/coalesce.js"(exports, module) {
      var assert = require_nanoassert();
      var { checkSubtype, ValueType } = require_types();
      var Coalesce = class _Coalesce {
        constructor(type, args) {
          this.type = type;
          this.args = args;
        }
        static parse(args, context) {
          if (args.length < 2) {
            return context.error("Expectected at least one argument.");
          }
          let outputType = null;
          const expectedType = context.expectedType;
          if (expectedType && expectedType.kind !== "value") {
            outputType = expectedType;
          }
          const parsedArgs = [];
          for (const arg of args.slice(1)) {
            const parsed = context.parse(arg, 1 + parsedArgs.length, outputType, void 0, { typeAnnotation: "omit" });
            if (!parsed) return null;
            outputType = outputType || parsed.type;
            parsedArgs.push(parsed);
          }
          assert(outputType);
          const needsAnnotation = expectedType && parsedArgs.some((arg) => checkSubtype(expectedType, arg.type));
          return needsAnnotation ? new _Coalesce(ValueType, parsedArgs) : new _Coalesce(outputType, parsedArgs);
        }
        evaluate(ctx) {
          let result = null;
          for (const arg of this.args) {
            result = arg.evaluate(ctx);
            if (result !== null) break;
          }
          return result;
        }
        eachChild(fn) {
          this.args.forEach(fn);
        }
        possibleOutputs() {
          return [].concat(...this.args.map((arg) => arg.possibleOutputs()));
        }
        serialize() {
          const serialized = ["coalesce"];
          this.eachChild((child) => {
            serialized.push(child.serialize());
          });
          return serialized;
        }
      };
      module.exports = Coalesce;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/let.js
  var require_let = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/let.js"(exports, module) {
      var Let = class _Let {
        constructor(bindings, result) {
          this.type = result.type;
          this.bindings = [].concat(bindings);
          this.result = result;
        }
        evaluate(ctx) {
          return this.result.evaluate(ctx);
        }
        eachChild(fn) {
          for (const binding of this.bindings) {
            fn(binding[1]);
          }
          fn(this.result);
        }
        static parse(args, context) {
          if (args.length < 4) return context.error(`Expected at least 3 arguments, but found ${args.length - 1} instead.`);
          const bindings = [];
          for (let i = 1; i < args.length - 1; i += 2) {
            const name = args[i];
            if (typeof name !== "string") {
              return context.error(`Expected string, but found ${typeof name} instead.`, i);
            }
            if (/[^a-zA-Z0-9_]/.test(name)) {
              return context.error(`Variable names must contain only alphanumeric characters or '_'.`, i);
            }
            const value = context.parse(args[i + 1], i + 1);
            if (!value) return null;
            bindings.push([name, value]);
          }
          const result = context.parse(args[args.length - 1], args.length - 1, context.expectedType, bindings);
          if (!result) return null;
          return new _Let(bindings, result);
        }
        possibleOutputs() {
          return this.result.possibleOutputs();
        }
        serialize() {
          const serialized = ["let"];
          for (const [name, expr] of this.bindings) {
            serialized.push(name, expr.serialize());
          }
          serialized.push(this.result.serialize());
          return serialized;
        }
      };
      module.exports = Let;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/at.js
  var require_at = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/at.js"(exports, module) {
      var { array, ValueType, NumberType } = require_types();
      var RuntimeError = require_runtime_error();
      var At = class _At {
        constructor(type, index, input) {
          this.type = type;
          this.index = index;
          this.input = input;
        }
        static parse(args, context) {
          if (args.length !== 3) return context.error(`Expected 2 arguments, but found ${args.length - 1} instead.`);
          const index = context.parse(args[1], 1, NumberType);
          const input = context.parse(args[2], 2, array(context.expectedType || ValueType));
          if (!index || !input) return null;
          const t = input.type;
          return new _At(t.itemType, index, input);
        }
        evaluate(ctx) {
          const index = this.index.evaluate(ctx);
          const array2 = this.input.evaluate(ctx);
          if (index < 0) {
            throw new RuntimeError(`Array index out of bounds: ${index} < 0.`);
          }
          if (index >= array2.length) {
            throw new RuntimeError(`Array index out of bounds: ${index} > ${array2.length - 1}.`);
          }
          if (index !== Math.floor(index)) {
            throw new RuntimeError(`Array index must be an integer, but found ${index} instead.`);
          }
          return array2[index];
        }
        eachChild(fn) {
          fn(this.index);
          fn(this.input);
        }
        possibleOutputs() {
          return [void 0];
        }
        serialize() {
          return ["at", this.index.serialize(), this.input.serialize()];
        }
      };
      module.exports = At;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/match.js
  var require_match = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/match.js"(exports, module) {
      var assert = require_nanoassert();
      var { typeOf } = require_values();
      var { ValueType } = require_types();
      var Match = class _Match {
        constructor(inputType, outputType, input, cases, outputs, otherwise) {
          this.inputType = inputType;
          this.type = outputType;
          this.input = input;
          this.cases = cases;
          this.outputs = outputs;
          this.otherwise = otherwise;
        }
        static parse(args, context) {
          if (args.length < 5) return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
          if (args.length % 2 !== 1) return context.error("Expected an even number of arguments.");
          let inputType;
          let outputType;
          if (context.expectedType && context.expectedType.kind !== "value") {
            outputType = context.expectedType;
          }
          const cases = {};
          const outputs = [];
          for (let i = 2; i < args.length - 1; i += 2) {
            let labels = args[i];
            const value = args[i + 1];
            if (!Array.isArray(labels)) {
              labels = [labels];
            }
            const labelContext = context.concat(i);
            if (labels.length === 0) {
              return labelContext.error("Expected at least one branch label.");
            }
            for (const label of labels) {
              if (typeof label !== "number" && typeof label !== "string") {
                return labelContext.error("Branch labels must be numbers or strings.");
              }
              if (typeof label === "number" && Math.abs(label) > Number.MAX_SAFE_INTEGER) {
                return labelContext.error(`Branch labels must be integers no larger than ${Number.MAX_SAFE_INTEGER}.`);
              }
              if (typeof label === "number" && Math.floor(label) !== label) {
                return labelContext.error("Numeric branch labels must be integer values.");
              }
              if (!inputType) {
                inputType = typeOf(label);
              } else if (labelContext.checkSubtype(inputType, typeOf(label))) {
                return null;
              }
              if (typeof cases[String(label)] !== "undefined") {
                return labelContext.error("Branch labels must be unique.");
              }
              cases[String(label)] = outputs.length;
            }
            const result = context.parse(value, i, outputType);
            if (!result) return null;
            outputType = outputType || result.type;
            outputs.push(result);
          }
          const input = context.parse(args[1], 1, ValueType);
          if (!input) return null;
          const otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
          if (!otherwise) return null;
          assert(inputType && outputType);
          if (input.type.kind !== "value" && context.concat(1).checkSubtype(inputType, input.type)) {
            return null;
          }
          return new _Match(inputType, outputType, input, cases, outputs, otherwise);
        }
        evaluate(ctx) {
          const input = this.input.evaluate(ctx);
          const output = typeOf(input) === this.inputType && this.outputs[this.cases[input]] || this.otherwise;
          return output.evaluate(ctx);
        }
        eachChild(fn) {
          fn(this.input);
          this.outputs.forEach(fn);
          fn(this.otherwise);
        }
        possibleOutputs() {
          return [].concat(...this.outputs.map((out) => out.possibleOutputs())).concat(this.otherwise.possibleOutputs());
        }
        serialize() {
          const serialized = ["match", this.input.serialize()];
          const sortedLabels = Object.keys(this.cases).sort();
          const groupedByOutput = [];
          const outputLookup = {};
          for (const label of sortedLabels) {
            const outputIndex = outputLookup[this.cases[label]];
            if (outputIndex === void 0) {
              outputLookup[this.cases[label]] = groupedByOutput.length;
              groupedByOutput.push([this.cases[label], [label]]);
            } else {
              groupedByOutput[outputIndex][1].push(label);
            }
          }
          const coerceLabel = (label) => this.inputType.kind === "number" ? Number(label) : label;
          for (const [outputIndex, labels] of groupedByOutput) {
            if (labels.length === 1) {
              serialized.push(coerceLabel(labels[0]));
            } else {
              serialized.push(labels.map(coerceLabel));
            }
            serialized.push(this.outputs[outputIndex].serialize());
          }
          serialized.push(this.otherwise.serialize());
          return serialized;
        }
      };
      module.exports = Match;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/case.js
  var require_case = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/case.js"(exports, module) {
      var assert = require_nanoassert();
      var { BooleanType } = require_types();
      var Case = class _Case {
        constructor(type, branches, otherwise) {
          this.type = type;
          this.branches = branches;
          this.otherwise = otherwise;
        }
        static parse(args, context) {
          if (args.length < 4) return context.error(`Expected at least 3 arguments, but found only ${args.length - 1}.`);
          if (args.length % 2 !== 0) return context.error("Expected an odd number of arguments.");
          let outputType;
          if (context.expectedType && context.expectedType.kind !== "value") {
            outputType = context.expectedType;
          }
          const branches = [];
          for (let i = 1; i < args.length - 1; i += 2) {
            const test = context.parse(args[i], i, BooleanType);
            if (!test) return null;
            const result = context.parse(args[i + 1], i + 1, outputType);
            if (!result) return null;
            branches.push([test, result]);
            outputType = outputType || result.type;
          }
          const otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
          if (!otherwise) return null;
          assert(outputType);
          return new _Case(outputType, branches, otherwise);
        }
        evaluate(ctx) {
          for (const [test, expression] of this.branches) {
            if (test.evaluate(ctx)) {
              return expression.evaluate(ctx);
            }
          }
          return this.otherwise.evaluate(ctx);
        }
        eachChild(fn) {
          for (const [test, expression] of this.branches) {
            fn(test);
            fn(expression);
          }
          fn(this.otherwise);
        }
        possibleOutputs() {
          return [].concat(...this.branches.map((branch) => branch[1].possibleOutputs())).concat(this.otherwise.possibleOutputs());
        }
        serialize() {
          const serialized = ["case"];
          this.eachChild((child) => {
            serialized.push(child.serialize());
          });
          return serialized;
        }
      };
      module.exports = Case;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/comparison.js
  var require_comparison = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/comparison.js"(exports, module) {
      var { toString, ValueType, BooleanType, CollatorType } = require_types();
      var Assertion = require_assertion();
      var { typeOf } = require_values();
      var RuntimeError = require_runtime_error();
      function isComparableType(op, type) {
        if (op === "==" || op === "!=") {
          return type.kind === "boolean" || type.kind === "string" || type.kind === "number" || type.kind === "null" || type.kind === "value";
        }
        return type.kind === "string" || type.kind === "number" || type.kind === "value";
      }
      function eq(ctx, a, b) {
        return a === b;
      }
      function neq(ctx, a, b) {
        return a !== b;
      }
      function lt(ctx, a, b) {
        return a < b;
      }
      function gt(ctx, a, b) {
        return a > b;
      }
      function lteq(ctx, a, b) {
        return a <= b;
      }
      function gteq(ctx, a, b) {
        return a >= b;
      }
      function eqCollate(ctx, a, b, c) {
        return c.compare(a, b) === 0;
      }
      function neqCollate(ctx, a, b, c) {
        return !eqCollate(ctx, a, b, c);
      }
      function ltCollate(ctx, a, b, c) {
        return c.compare(a, b) < 0;
      }
      function gtCollate(ctx, a, b, c) {
        return c.compare(a, b) > 0;
      }
      function lteqCollate(ctx, a, b, c) {
        return c.compare(a, b) <= 0;
      }
      function gteqCollate(ctx, a, b, c) {
        return c.compare(a, b) >= 0;
      }
      function makeComparison(op, compareBasic, compareWithCollator) {
        const isOrderComparison = op !== "==" && op !== "!=";
        return class Comparison {
          constructor(lhs, rhs, collator) {
            this.type = BooleanType;
            this.lhs = lhs;
            this.rhs = rhs;
            this.collator = collator;
            this.hasUntypedArgument = lhs.type.kind === "value" || rhs.type.kind === "value";
          }
          static parse(args, context) {
            if (args.length !== 3 && args.length !== 4) return context.error("Expected two or three arguments.");
            const op2 = args[0];
            let lhs = context.parse(args[1], 1, ValueType);
            if (!lhs) return null;
            if (!isComparableType(op2, lhs.type)) {
              return context.concat(1).error(`"${op2}" comparisons are not supported for type '${toString(lhs.type)}'.`);
            }
            let rhs = context.parse(args[2], 2, ValueType);
            if (!rhs) return null;
            if (!isComparableType(op2, rhs.type)) {
              return context.concat(2).error(`"${op2}" comparisons are not supported for type '${toString(rhs.type)}'.`);
            }
            if (lhs.type.kind !== rhs.type.kind && lhs.type.kind !== "value" && rhs.type.kind !== "value") {
              return context.error(`Cannot compare types '${toString(lhs.type)}' and '${toString(rhs.type)}'.`);
            }
            if (isOrderComparison) {
              if (lhs.type.kind === "value" && rhs.type.kind !== "value") {
                lhs = new Assertion(rhs.type, [lhs]);
              } else if (lhs.type.kind !== "value" && rhs.type.kind === "value") {
                rhs = new Assertion(lhs.type, [rhs]);
              }
            }
            let collator = null;
            if (args.length === 4) {
              if (lhs.type.kind !== "string" && rhs.type.kind !== "string" && lhs.type.kind !== "value" && rhs.type.kind !== "value") {
                return context.error("Cannot use collator to compare non-string types.");
              }
              collator = context.parse(args[3], 3, CollatorType);
              if (!collator) return null;
            }
            return new Comparison(lhs, rhs, collator);
          }
          evaluate(ctx) {
            const lhs = this.lhs.evaluate(ctx);
            const rhs = this.rhs.evaluate(ctx);
            if (isOrderComparison && this.hasUntypedArgument) {
              const lt2 = typeOf(lhs);
              const rt = typeOf(rhs);
              if (lt2.kind !== rt.kind || !(lt2.kind === "string" || lt2.kind === "number")) {
                throw new RuntimeError(
                  `Expected arguments for "${op}" to be (string, string) or (number, number), but found (${lt2.kind}, ${rt.kind}) instead.`
                );
              }
            }
            if (this.collator && !isOrderComparison && this.hasUntypedArgument) {
              const lt2 = typeOf(lhs);
              const rt = typeOf(rhs);
              if (lt2.kind !== "string" || rt.kind !== "string") {
                return compareBasic(ctx, lhs, rhs);
              }
            }
            return this.collator ? compareWithCollator(ctx, lhs, rhs, this.collator.evaluate(ctx)) : compareBasic(ctx, lhs, rhs);
          }
          eachChild(fn) {
            fn(this.lhs);
            fn(this.rhs);
            if (this.collator) {
              fn(this.collator);
            }
          }
          possibleOutputs() {
            return [true, false];
          }
          serialize() {
            const serialized = [op];
            this.eachChild((child) => {
              serialized.push(child.serialize());
            });
            return serialized;
          }
        };
      }
      module.exports = {
        Equals: makeComparison("==", eq, eqCollate),
        NotEquals: makeComparison("!=", neq, neqCollate),
        LessThan: makeComparison("<", lt, ltCollate),
        GreaterThan: makeComparison(">", gt, gtCollate),
        LessThanOrEqual: makeComparison("<=", lteq, lteqCollate),
        GreaterThanOrEqual: makeComparison(">=", gteq, gteqCollate)
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/length.js
  var require_length = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/length.js"(exports, module) {
      var { NumberType, toString } = require_types();
      var { typeOf } = require_values();
      var RuntimeError = require_runtime_error();
      var Length = class _Length {
        constructor(input) {
          this.type = NumberType;
          this.input = input;
        }
        static parse(args, context) {
          if (args.length !== 2) return context.error(`Expected 1 argument, but found ${args.length - 1} instead.`);
          const input = context.parse(args[1], 1);
          if (!input) return null;
          if (input.type.kind !== "array" && input.type.kind !== "string" && input.type.kind !== "value")
            return context.error(`Expected argument of type string or array, but found ${toString(input.type)} instead.`);
          return new _Length(input);
        }
        evaluate(ctx) {
          const input = this.input.evaluate(ctx);
          if (typeof input === "string") {
            return input.length;
          }
          if (Array.isArray(input)) {
            return input.length;
          }
          throw new RuntimeError(
            `Expected value to be of type string or array, but found ${toString(typeOf(input))} instead.`
          );
        }
        eachChild(fn) {
          fn(this.input);
        }
        possibleOutputs() {
          return [void 0];
        }
        serialize() {
          const serialized = ["length"];
          this.eachChild((child) => {
            serialized.push(child.serialize());
          });
          return serialized;
        }
      };
      module.exports = Length;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/definitions/index.js
  var require_definitions = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/definitions/index.js"(exports, module) {
      var {
        NumberType,
        StringType,
        BooleanType,
        ColorType,
        ObjectType,
        ValueType,
        ErrorType,
        CollatorType,
        array,
        toString: typeToString
      } = require_types();
      var { typeOf, Color, validateRGBA, toString: valueToString } = require_values();
      var CompoundExpression = require_compound_expression();
      var RuntimeError = require_runtime_error();
      var Let = require_let();
      var Var = require_var();
      var Literal = require_literal();
      var Assertion = require_assertion();
      var Coercion = require_coercion();
      var At = require_at();
      var Match = require_match();
      var Case = require_case();
      var Step = require_step();
      var Interpolate = require_interpolate2();
      var Coalesce = require_coalesce();
      var { Equals, NotEquals, LessThan, GreaterThan, LessThanOrEqual, GreaterThanOrEqual } = require_comparison();
      var { CollatorExpression } = require_collator2();
      var { FormatExpression } = require_format();
      var Length = require_length();
      var expressions = {
        // special forms
        "==": Equals,
        "!=": NotEquals,
        ">": GreaterThan,
        "<": LessThan,
        ">=": GreaterThanOrEqual,
        "<=": LessThanOrEqual,
        array: Assertion,
        at: At,
        boolean: Assertion,
        case: Case,
        coalesce: Coalesce,
        collator: CollatorExpression,
        format: FormatExpression,
        interpolate: Interpolate,
        "interpolate-hcl": Interpolate,
        "interpolate-lab": Interpolate,
        length: Length,
        let: Let,
        literal: Literal,
        match: Match,
        number: Assertion,
        object: Assertion,
        step: Step,
        string: Assertion,
        "to-boolean": Coercion,
        "to-color": Coercion,
        "to-number": Coercion,
        "to-string": Coercion,
        var: Var
      };
      function rgba(ctx, [r, g, b, a]) {
        r = r.evaluate(ctx);
        g = g.evaluate(ctx);
        b = b.evaluate(ctx);
        const alpha = a ? a.evaluate(ctx) : 1;
        const error = validateRGBA(r, g, b, alpha);
        if (error) throw new RuntimeError(error);
        return new Color(r / 255 * alpha, g / 255 * alpha, b / 255 * alpha, alpha);
      }
      function has(key, obj) {
        return key in obj;
      }
      function get(key, obj) {
        const v = obj[key];
        return typeof v === "undefined" ? null : v;
      }
      function binarySearch(v, a, i, j) {
        while (i <= j) {
          const m = i + j >> 1;
          if (a[m] === v) return true;
          if (a[m] > v) j = m - 1;
          else i = m + 1;
        }
        return false;
      }
      function varargs(type) {
        return { type };
      }
      CompoundExpression.register(expressions, {
        error: [
          ErrorType,
          [StringType],
          (ctx, [v]) => {
            throw new RuntimeError(v.evaluate(ctx));
          }
        ],
        typeof: [StringType, [ValueType], (ctx, [v]) => typeToString(typeOf(v.evaluate(ctx)))],
        "to-rgba": [
          array(NumberType, 4),
          [ColorType],
          (ctx, [v]) => {
            return v.evaluate(ctx).toArray();
          }
        ],
        rgb: [ColorType, [NumberType, NumberType, NumberType], rgba],
        rgba: [ColorType, [NumberType, NumberType, NumberType, NumberType], rgba],
        has: {
          type: BooleanType,
          overloads: [
            [[StringType], (ctx, [key]) => has(key.evaluate(ctx), ctx.properties())],
            [[StringType, ObjectType], (ctx, [key, obj]) => has(key.evaluate(ctx), obj.evaluate(ctx))]
          ]
        },
        get: {
          type: ValueType,
          overloads: [
            [[StringType], (ctx, [key]) => get(key.evaluate(ctx), ctx.properties())],
            [[StringType, ObjectType], (ctx, [key, obj]) => get(key.evaluate(ctx), obj.evaluate(ctx))]
          ]
        },
        "feature-state": [ValueType, [StringType], (ctx, [key]) => get(key.evaluate(ctx), ctx.featureState || {})],
        properties: [ObjectType, [], (ctx) => ctx.properties()],
        "geometry-type": [StringType, [], (ctx) => ctx.geometryType()],
        id: [ValueType, [], (ctx) => ctx.id()],
        zoom: [NumberType, [], (ctx) => ctx.globals.zoom],
        "heatmap-density": [NumberType, [], (ctx) => ctx.globals.heatmapDensity || 0],
        "line-progress": [NumberType, [], (ctx) => ctx.globals.lineProgress || 0],
        "+": [
          NumberType,
          varargs(NumberType),
          (ctx, args) => {
            let result = 0;
            for (const arg of args) {
              result += arg.evaluate(ctx);
            }
            return result;
          }
        ],
        "*": [
          NumberType,
          varargs(NumberType),
          (ctx, args) => {
            let result = 1;
            for (const arg of args) {
              result *= arg.evaluate(ctx);
            }
            return result;
          }
        ],
        "-": {
          type: NumberType,
          overloads: [
            [[NumberType, NumberType], (ctx, [a, b]) => a.evaluate(ctx) - b.evaluate(ctx)],
            [[NumberType], (ctx, [a]) => -a.evaluate(ctx)]
          ]
        },
        "/": [NumberType, [NumberType, NumberType], (ctx, [a, b]) => a.evaluate(ctx) / b.evaluate(ctx)],
        "%": [NumberType, [NumberType, NumberType], (ctx, [a, b]) => a.evaluate(ctx) % b.evaluate(ctx)],
        ln2: [NumberType, [], () => Math.LN2],
        pi: [NumberType, [], () => Math.PI],
        e: [NumberType, [], () => Math.E],
        "^": [NumberType, [NumberType, NumberType], (ctx, [b, e]) => b.evaluate(ctx) ** e.evaluate(ctx)],
        sqrt: [NumberType, [NumberType], (ctx, [x]) => Math.sqrt(x.evaluate(ctx))],
        log10: [NumberType, [NumberType], (ctx, [n]) => Math.log10(n.evaluate(ctx))],
        ln: [NumberType, [NumberType], (ctx, [n]) => Math.log(n.evaluate(ctx))],
        log2: [NumberType, [NumberType], (ctx, [n]) => Math.log2(n.evaluate(ctx))],
        sin: [NumberType, [NumberType], (ctx, [n]) => Math.sin(n.evaluate(ctx))],
        cos: [NumberType, [NumberType], (ctx, [n]) => Math.cos(n.evaluate(ctx))],
        tan: [NumberType, [NumberType], (ctx, [n]) => Math.tan(n.evaluate(ctx))],
        asin: [NumberType, [NumberType], (ctx, [n]) => Math.asin(n.evaluate(ctx))],
        acos: [NumberType, [NumberType], (ctx, [n]) => Math.acos(n.evaluate(ctx))],
        atan: [NumberType, [NumberType], (ctx, [n]) => Math.atan(n.evaluate(ctx))],
        min: [NumberType, varargs(NumberType), (ctx, args) => Math.min(...args.map((arg) => arg.evaluate(ctx)))],
        max: [NumberType, varargs(NumberType), (ctx, args) => Math.max(...args.map((arg) => arg.evaluate(ctx)))],
        abs: [NumberType, [NumberType], (ctx, [n]) => Math.abs(n.evaluate(ctx))],
        round: [
          NumberType,
          [NumberType],
          (ctx, [n]) => {
            const v = n.evaluate(ctx);
            return v < 0 ? -Math.round(-v) : Math.round(v);
          }
        ],
        floor: [NumberType, [NumberType], (ctx, [n]) => Math.floor(n.evaluate(ctx))],
        ceil: [NumberType, [NumberType], (ctx, [n]) => Math.ceil(n.evaluate(ctx))],
        "filter-==": [BooleanType, [StringType, ValueType], (ctx, [k, v]) => ctx.properties()[k.value] === v.value],
        "filter-id-==": [BooleanType, [ValueType], (ctx, [v]) => ctx.id() === v.value],
        "filter-type-==": [BooleanType, [StringType], (ctx, [v]) => ctx.geometryType() === v.value],
        "filter-<": [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a < b;
          }
        ],
        "filter-id-<": [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a < b;
          }
        ],
        "filter->": [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a > b;
          }
        ],
        "filter-id->": [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a > b;
          }
        ],
        "filter-<=": [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a <= b;
          }
        ],
        "filter-id-<=": [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a <= b;
          }
        ],
        "filter->=": [
          BooleanType,
          [StringType, ValueType],
          (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a >= b;
          }
        ],
        "filter-id->=": [
          BooleanType,
          [ValueType],
          (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a >= b;
          }
        ],
        "filter-has": [BooleanType, [ValueType], (ctx, [k]) => k.value in ctx.properties()],
        "filter-has-id": [BooleanType, [], (ctx) => ctx.id() !== null],
        "filter-type-in": [BooleanType, [array(StringType)], (ctx, [v]) => v.value.indexOf(ctx.geometryType()) >= 0],
        "filter-id-in": [BooleanType, [array(ValueType)], (ctx, [v]) => v.value.indexOf(ctx.id()) >= 0],
        "filter-in-small": [
          BooleanType,
          [StringType, array(ValueType)],
          // assumes v is an array literal
          (ctx, [k, v]) => v.value.indexOf(ctx.properties()[k.value]) >= 0
        ],
        "filter-in-large": [
          BooleanType,
          [StringType, array(ValueType)],
          // assumes v is a array literal with values sorted in ascending order and of a single type
          (ctx, [k, v]) => binarySearch(ctx.properties()[k.value], v.value, 0, v.value.length - 1)
        ],
        all: {
          type: BooleanType,
          overloads: [
            [[BooleanType, BooleanType], (ctx, [a, b]) => a.evaluate(ctx) && b.evaluate(ctx)],
            [
              varargs(BooleanType),
              (ctx, args) => {
                for (const arg of args) {
                  if (!arg.evaluate(ctx)) return false;
                }
                return true;
              }
            ]
          ]
        },
        any: {
          type: BooleanType,
          overloads: [
            [[BooleanType, BooleanType], (ctx, [a, b]) => a.evaluate(ctx) || b.evaluate(ctx)],
            [
              varargs(BooleanType),
              (ctx, args) => {
                for (const arg of args) {
                  if (arg.evaluate(ctx)) return true;
                }
                return false;
              }
            ]
          ]
        },
        "!": [BooleanType, [BooleanType], (ctx, [b]) => !b.evaluate(ctx)],
        "is-supported-script": [
          BooleanType,
          [StringType],
          // At parse time this will always return true, so we need to exclude this expression with isGlobalPropertyConstant
          (ctx, [s]) => {
            const isSupportedScript = ctx.globals?.isSupportedScript;
            if (isSupportedScript) {
              return isSupportedScript(s.evaluate(ctx));
            }
            return true;
          }
        ],
        upcase: [StringType, [StringType], (ctx, [s]) => s.evaluate(ctx).toUpperCase()],
        downcase: [StringType, [StringType], (ctx, [s]) => s.evaluate(ctx).toLowerCase()],
        concat: [StringType, varargs(ValueType), (ctx, args) => args.map((arg) => valueToString(arg.evaluate(ctx))).join("")],
        "resolved-locale": [StringType, [CollatorType], (ctx, [collator]) => collator.evaluate(ctx).resolvedLocale()]
      });
      module.exports = expressions;
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/util/result.js
  var require_result = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/util/result.js"(exports, module) {
      function success(value) {
        return { result: "success", value };
      }
      function error(value) {
        return { result: "error", value };
      }
      module.exports = {
        success,
        error
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/util/properties.js
  var require_properties = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/util/properties.js"(exports, module) {
      function supportsPropertyExpression({ ["property-type"]: propertyType }) {
        return propertyType === "data-driven" || propertyType === "cross-faded-data-driven";
      }
      function supportsZoomExpression(spec) {
        return !!spec.expression?.parameters.includes("zoom");
      }
      function supportsInterpolation(spec) {
        return !!spec.expression?.interpolated;
      }
      module.exports = {
        supportsPropertyExpression,
        supportsZoomExpression,
        supportsInterpolation
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/util/get_type.js
  var require_get_type = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/util/get_type.js"(exports, module) {
      module.exports = function getType(val) {
        if (val instanceof Number) {
          return "number";
        }
        if (val instanceof String) {
          return "string";
        }
        if (val instanceof Boolean) {
          return "boolean";
        }
        if (Array.isArray(val)) {
          return "array";
        }
        if (val === null) {
          return "null";
        }
        return typeof val;
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/function/index.js
  var require_function = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/function/index.js"(exports, module) {
      var colorSpaces = require_color_spaces();
      var Color = require_color();
      var getType = require_get_type();
      var interpolate = require_interpolate();
      var Interpolate = require_interpolate2();
      var { Formatted } = require_formatted();
      var { supportsInterpolation } = require_properties();
      module.exports = {
        isFunction,
        createFunction
      };
      function isFunction(value) {
        return typeof value === "object" && value !== null && !Array.isArray(value);
      }
      function identityFunction(x) {
        return x;
      }
      function createFunction(parameters, propertySpec) {
        const isColor = propertySpec.type === "color";
        const zoomAndFeatureDependent = parameters.stops && typeof parameters.stops[0][0] === "object";
        const featureDependent = zoomAndFeatureDependent || parameters.property !== void 0;
        const zoomDependent = zoomAndFeatureDependent || !featureDependent;
        const type = parameters.type || (supportsInterpolation(propertySpec) ? "exponential" : "interval");
        if (isColor) {
          parameters = { ...parameters };
          if (parameters.stops) {
            parameters.stops = parameters.stops.map((stop) => {
              return [stop[0], Color.parse(stop[1])];
            });
          }
          if (parameters.default) {
            parameters.default = Color.parse(parameters.default);
          } else {
            parameters.default = Color.parse(propertySpec.default);
          }
        }
        if (parameters.colorSpace && parameters.colorSpace !== "rgb" && !colorSpaces[parameters.colorSpace]) {
          throw new Error(`Unknown color space: ${parameters.colorSpace}`);
        }
        let innerFun;
        let hashedStops;
        let categoricalKeyType;
        if (type === "exponential") {
          innerFun = evaluateExponentialFunction;
        } else if (type === "interval") {
          innerFun = evaluateIntervalFunction;
        } else if (type === "categorical") {
          innerFun = evaluateCategoricalFunction;
          hashedStops = /* @__PURE__ */ Object.create(null);
          for (const stop of parameters.stops) {
            hashedStops[stop[0]] = stop[1];
          }
          categoricalKeyType = typeof parameters.stops[0][0];
        } else if (type === "identity") {
          innerFun = evaluateIdentityFunction;
        } else {
          throw new Error(`Unknown function type "${type}"`);
        }
        if (zoomAndFeatureDependent) {
          const featureFunctions = {};
          const zoomStops = [];
          for (let s = 0; s < parameters.stops.length; s++) {
            const stop = parameters.stops[s];
            const zoom = stop[0].zoom;
            if (featureFunctions[zoom] === void 0) {
              featureFunctions[zoom] = {
                zoom,
                type: parameters.type,
                property: parameters.property,
                default: parameters.default,
                stops: []
              };
              zoomStops.push(zoom);
            }
            featureFunctions[zoom].stops.push([stop[0].value, stop[1]]);
          }
          const featureFunctionStops = [];
          for (const z of zoomStops) {
            featureFunctionStops.push([featureFunctions[z].zoom, createFunction(featureFunctions[z], propertySpec)]);
          }
          return {
            kind: "composite",
            interpolationFactor: Interpolate.interpolationFactor.bind(void 0, { name: "linear" }),
            zoomStops: featureFunctionStops.map((s) => s[0]),
            evaluate({ zoom }, properties) {
              return evaluateExponentialFunction(
                {
                  stops: featureFunctionStops,
                  base: parameters.base
                },
                propertySpec,
                zoom
              ).evaluate(zoom, properties);
            }
          };
        }
        if (zoomDependent) {
          return {
            kind: "camera",
            interpolationFactor: type === "exponential" ? Interpolate.interpolationFactor.bind(void 0, {
              name: "exponential",
              base: parameters.base !== void 0 ? parameters.base : 1
            }) : () => 0,
            zoomStops: parameters.stops.map((s) => s[0]),
            evaluate: ({ zoom }) => innerFun(parameters, propertySpec, zoom, hashedStops, categoricalKeyType)
          };
        }
        return {
          kind: "source",
          evaluate(_, feature) {
            const value = feature?.properties ? feature.properties[parameters.property] : void 0;
            if (value === void 0) {
              return coalesce(parameters.default, propertySpec.default);
            }
            return innerFun(parameters, propertySpec, value, hashedStops, categoricalKeyType);
          }
        };
      }
      function coalesce(a, b, c) {
        if (a !== void 0) return a;
        if (b !== void 0) return b;
        if (c !== void 0) return c;
      }
      function evaluateCategoricalFunction(parameters, propertySpec, input, hashedStops, keyType) {
        const evaluated = typeof input === keyType ? hashedStops[input] : void 0;
        return coalesce(evaluated, parameters.default, propertySpec.default);
      }
      function evaluateIntervalFunction(parameters, propertySpec, input) {
        if (getType(input) !== "number") return coalesce(parameters.default, propertySpec.default);
        const n = parameters.stops.length;
        if (n === 1) return parameters.stops[0][1];
        if (input <= parameters.stops[0][0]) return parameters.stops[0][1];
        if (input >= parameters.stops[n - 1][0]) return parameters.stops[n - 1][1];
        const index = findStopLessThanOrEqualTo(parameters.stops, input);
        return parameters.stops[index][1];
      }
      function evaluateExponentialFunction(parameters, propertySpec, input) {
        const base = parameters.base !== void 0 ? parameters.base : 1;
        if (getType(input) !== "number") return coalesce(parameters.default, propertySpec.default);
        const n = parameters.stops.length;
        if (n === 1) return parameters.stops[0][1];
        if (input <= parameters.stops[0][0]) return parameters.stops[0][1];
        if (input >= parameters.stops[n - 1][0]) return parameters.stops[n - 1][1];
        const index = findStopLessThanOrEqualTo(parameters.stops, input);
        const t = interpolationFactor(input, base, parameters.stops[index][0], parameters.stops[index + 1][0]);
        const outputLower = parameters.stops[index][1];
        const outputUpper = parameters.stops[index + 1][1];
        let interp = interpolate[propertySpec.type] || identityFunction;
        if (parameters.colorSpace && parameters.colorSpace !== "rgb") {
          const colorspace = colorSpaces[parameters.colorSpace];
          interp = (a, b) => colorspace.reverse(colorspace.interpolate(colorspace.forward(a), colorspace.forward(b), t));
        }
        if (typeof outputLower.evaluate === "function") {
          return {
            evaluate(...args) {
              const evaluatedLower = outputLower.evaluate.apply(void 0, args);
              const evaluatedUpper = outputUpper.evaluate.apply(void 0, args);
              if (evaluatedLower === void 0 || evaluatedUpper === void 0) {
                return void 0;
              }
              return interp(evaluatedLower, evaluatedUpper, t);
            }
          };
        }
        return interp(outputLower, outputUpper, t);
      }
      function evaluateIdentityFunction(parameters, propertySpec, input) {
        switch (propertySpec.type) {
          case "color":
            input = Color.parse(input);
            break;
          case "formatted":
            input = Formatted.fromString(input.toString());
            break;
          case "enum":
            if (!propertySpec.values.includes(input)) {
              input = void 0;
            }
            break;
          default:
            if (getType(input) !== propertySpec.type) {
              input = void 0;
            }
        }
        return coalesce(input, parameters.default, propertySpec.default);
      }
      function findStopLessThanOrEqualTo(stops, input) {
        const n = stops.length;
        let lowerIndex = 0;
        let upperIndex = n - 1;
        let currentIndex = 0;
        let currentValue;
        let upperValue;
        while (lowerIndex <= upperIndex) {
          currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
          currentValue = stops[currentIndex][0];
          upperValue = stops[currentIndex + 1][0];
          if (input === currentValue || input > currentValue && input < upperValue) {
            return currentIndex;
          }
          if (currentValue < input) {
            lowerIndex = currentIndex + 1;
          } else if (currentValue > input) {
            upperIndex = currentIndex - 1;
          }
        }
        return Math.max(currentIndex - 1, 0);
      }
      function interpolationFactor(input, base, lowerValue, upperValue) {
        const difference = upperValue - lowerValue;
        const progress = input - lowerValue;
        if (difference === 0) {
          return 0;
        }
        if (base === 1) {
          return progress / difference;
        }
        return (base ** progress - 1) / (base ** difference - 1);
      }
    }
  });

  // node_modules/@mapwhit/style-expressions/lib/expression/index.js
  var require_expression = __commonJS({
    "node_modules/@mapwhit/style-expressions/lib/expression/index.js"(exports, module) {
      var assert = require_nanoassert();
      var ParsingError = require_parsing_error();
      var ParsingContext = require_parsing_context();
      var EvaluationContext = require_evaluation_context();
      var CompoundExpression = require_compound_expression();
      var Step = require_step();
      var Interpolate = require_interpolate2();
      var Coalesce = require_coalesce();
      var Let = require_let();
      var definitions = require_definitions();
      var formatted = require_formatted();
      var isConstant = require_is_constant();
      var RuntimeError = require_runtime_error();
      var { success, error } = require_result();
      var properties = require_properties();
      var { supportsPropertyExpression, supportsZoomExpression, supportsInterpolation } = properties;
      var colorSpaces = require_color_spaces();
      var interpolate = require_interpolate();
      var StyleExpression = class {
        constructor(expression, propertySpec) {
          this.expression = expression;
          this._warningHistory = {};
          this._evaluator = new EvaluationContext();
          this._defaultValue = getDefaultValue(propertySpec);
          this._enumValues = propertySpec.type === "enum" ? propertySpec.values : null;
        }
        evaluateWithoutErrorHandling(globals, feature, featureState) {
          this._evaluator.globals = globals;
          this._evaluator.feature = feature;
          this._evaluator.featureState = featureState;
          return this.expression.evaluate(this._evaluator);
        }
        evaluate(globals, feature, featureState) {
          this._evaluator.globals = globals;
          this._evaluator.feature = feature || null;
          this._evaluator.featureState = featureState || null;
          try {
            const val = this.expression.evaluate(this._evaluator);
            if (val === null || val === void 0) {
              return this._defaultValue;
            }
            if (this._enumValues && !this._enumValues.includes(val)) {
              throw new RuntimeError(
                `Expected value to be one of ${this._enumValues.map((v) => JSON.stringify(v)).join(", ")}, but found ${JSON.stringify(val)} instead.`
              );
            }
            return val;
          } catch (e) {
            if (!this._warningHistory[e.message]) {
              this._warningHistory[e.message] = true;
              if (typeof console !== "undefined") {
                console.warn(e.message);
              }
            }
            return this._defaultValue;
          }
        }
      };
      function isExpression(expression) {
        return Array.isArray(expression) && expression.length > 0 && typeof expression[0] === "string" && expression[0] in definitions;
      }
      function createExpression(expression, propertySpec) {
        const parser = new ParsingContext(definitions, [], getExpectedType(propertySpec));
        const parsed = parser.parse(
          expression,
          void 0,
          void 0,
          void 0,
          propertySpec.type === "string" ? { typeAnnotation: "coerce" } : void 0
        );
        if (!parsed) {
          assert(parser.errors.length > 0);
          return error(parser.errors);
        }
        return success(new StyleExpression(parsed, propertySpec));
      }
      var ZoomConstantExpression = class {
        constructor(kind, expression) {
          this.kind = kind;
          this._styleExpression = expression;
          this.isStateDependent = kind !== "constant" && !isConstant.isStateConstant(expression.expression);
        }
        evaluateWithoutErrorHandling(globals, feature, featureState) {
          return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
        }
        evaluate(globals, feature, featureState) {
          return this._styleExpression.evaluate(globals, feature, featureState);
        }
      };
      var ZoomDependentExpression = class {
        constructor(kind, expression, zoomCurve) {
          this.kind = kind;
          this.zoomStops = zoomCurve.labels;
          this._styleExpression = expression;
          this.isStateDependent = kind !== "camera" && !isConstant.isStateConstant(expression.expression);
          if (zoomCurve instanceof Interpolate) {
            this._interpolationType = zoomCurve.interpolation;
          }
        }
        evaluateWithoutErrorHandling(globals, feature, featureState) {
          return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
        }
        evaluate(globals, feature, featureState) {
          return this._styleExpression.evaluate(globals, feature, featureState);
        }
        interpolationFactor(input, lower, upper) {
          if (this._interpolationType) {
            return Interpolate.interpolationFactor(this._interpolationType, input, lower, upper);
          }
          return 0;
        }
      };
      function createPropertyExpression(expression, propertySpec) {
        expression = createExpression(expression, propertySpec);
        if (expression.result === "error") {
          return expression;
        }
        const parsed = expression.value.expression;
        const isFeatureConstant = isConstant.isFeatureConstant(parsed);
        if (!isFeatureConstant && !supportsPropertyExpression(propertySpec)) {
          return error([new ParsingError("", "data expressions not supported")]);
        }
        const isZoomConstant = isConstant.isGlobalPropertyConstant(parsed, ["zoom"]);
        if (!isZoomConstant && !supportsZoomExpression(propertySpec)) {
          return error([new ParsingError("", "zoom expressions not supported")]);
        }
        const zoomCurve = findZoomCurve(parsed);
        if (!zoomCurve && !isZoomConstant) {
          return error([
            new ParsingError(
              "",
              '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.'
            )
          ]);
        }
        if (zoomCurve instanceof ParsingError) {
          return error([zoomCurve]);
        }
        if (zoomCurve instanceof Interpolate && !supportsInterpolation(propertySpec)) {
          return error([new ParsingError("", '"interpolate" expressions cannot be used with this property')]);
        }
        if (!zoomCurve) {
          return success(
            isFeatureConstant ? new ZoomConstantExpression("constant", expression.value) : new ZoomConstantExpression("source", expression.value)
          );
        }
        return success(
          isFeatureConstant ? new ZoomDependentExpression("camera", expression.value, zoomCurve) : new ZoomDependentExpression("composite", expression.value, zoomCurve)
        );
      }
      var { isFunction, createFunction } = require_function();
      var { Color } = require_values();
      var StylePropertyFunction = class _StylePropertyFunction {
        constructor(parameters, specification) {
          this._parameters = parameters;
          this._specification = specification;
          Object.assign(this, createFunction(this._parameters, this._specification));
        }
        static deserialize(serialized) {
          return new _StylePropertyFunction(serialized._parameters, serialized._specification);
        }
        static serialize(input) {
          return {
            _parameters: input._parameters,
            _specification: input._specification
          };
        }
      };
      function normalizePropertyExpression(value, specification) {
        if (isFunction(value)) {
          return new StylePropertyFunction(value, specification);
        }
        if (isExpression(value)) {
          const expression = createPropertyExpression(value, specification);
          if (expression.result === "error") {
            throw new Error(expression.value.map((err) => `${err.key}: ${err.message}`).join(", "));
          }
          return expression.value;
        }
        let constant = value;
        if (typeof value === "string" && specification.type === "color") {
          constant = Color.parse(value);
        }
        return {
          kind: "constant",
          evaluate: () => constant
        };
      }
      function findZoomCurve(expression) {
        let result = null;
        if (expression instanceof Let) {
          result = findZoomCurve(expression.result);
        } else if (expression instanceof Coalesce) {
          for (const arg of expression.args) {
            result = findZoomCurve(arg);
            if (result) {
              break;
            }
          }
        } else if ((expression instanceof Step || expression instanceof Interpolate) && expression.input instanceof CompoundExpression && expression.input.name === "zoom") {
          result = expression;
        }
        if (result instanceof ParsingError) {
          return result;
        }
        expression.eachChild((child) => {
          const childResult = findZoomCurve(child);
          if (childResult instanceof ParsingError) {
            result = childResult;
          } else if (!result && childResult) {
            result = new ParsingError(
              "",
              '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.'
            );
          } else if (result && childResult && result !== childResult) {
            result = new ParsingError(
              "",
              'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.'
            );
          }
        });
        return result;
      }
      var { ColorType, StringType, NumberType, BooleanType, ValueType, FormattedType, array } = require_types();
      function getExpectedType(spec) {
        const types = {
          color: ColorType,
          string: StringType,
          number: NumberType,
          enum: StringType,
          boolean: BooleanType,
          formatted: FormattedType
        };
        if (spec.type === "array") {
          return array(types[spec.value] || ValueType, spec.length);
        }
        return types[spec.type];
      }
      function getDefaultValue(spec) {
        if (spec.type === "color" && isFunction(spec.default)) {
          return new Color(0, 0, 0, 0);
        }
        if (spec.type === "color") {
          return Color.parse(spec.default) || null;
        }
        if (spec.default === void 0) {
          return null;
        }
        return spec.default;
      }
      module.exports = {
        StyleExpression,
        isExpression,
        createExpression,
        ZoomConstantExpression,
        ZoomDependentExpression,
        createPropertyExpression,
        StylePropertyFunction,
        normalizePropertyExpression,
        Color,
        colorSpaces,
        CompoundExpression,
        definitions,
        interpolate,
        ...formatted,
        ...properties
      };
    }
  });

  // node_modules/@mapwhit/style-expressions/index.js
  var require_style_expressions = __commonJS({
    "node_modules/@mapwhit/style-expressions/index.js"(exports, module) {
      module.exports = require_expression();
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/transfer_registry.js
  var require_transfer_registry = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/transfer_registry.js"(exports, module) {
      var assert = require_nanoassert();
      module.exports = {
        register,
        serialize,
        deserialize
      };
      var registry = /* @__PURE__ */ new Map();
      function register(name, klass, { omit, shallow } = {}) {
        assert(!registry.has(name), `${name} is already registered.`);
        Object.defineProperty(klass, "_classRegistryKey", {
          value: name,
          writeable: false
        });
        registry.set(name, { klass, omit, shallow });
      }
      register("Object", Object);
      function serialize(input, transferables) {
        if (isSerializablePrimitive(input)) {
          return input;
        }
        if (input instanceof ArrayBuffer) {
          transferables?.push(input);
          return input;
        }
        if (ArrayBuffer.isView(input)) {
          transferables?.push(input.buffer);
          return input;
        }
        if (input instanceof ImageData) {
          transferables?.push(input.data.buffer);
          return input;
        }
        if (Array.isArray(input)) {
          return input.map((item) => serialize(item, transferables));
        }
        if (typeof input === "object") {
          const klass = input.constructor;
          const name = klass._classRegistryKey;
          if (!name) {
            throw new Error(`can't serialize object of unregistered class`);
          }
          assert(registry.has(name));
          const properties = klass.serialize ? klass.serialize(input, transferables) : {};
          if (!klass.serialize) {
            const { omit, shallow } = registry.get(name);
            for (const key in input) {
              if (!Object.hasOwn(input, key)) continue;
              if (omit?.includes(key)) continue;
              const value = input[key];
              properties[key] = shallow?.includes(key) ? value : serialize(value, transferables);
            }
            if (input instanceof Error) {
              properties.message = input.message;
            }
          } else {
            assert(!transferables || properties !== transferables[transferables.length - 1]);
          }
          if (properties.$name) {
            throw new Error("$name property is reserved for worker serialization logic.");
          }
          if (name !== "Object") {
            properties.$name = name;
          }
          return properties;
        }
        throw new Error(`can't serialize object of type ${typeof input}`);
      }
      function deserialize(input) {
        if (isSerializablePrimitive(input) || input instanceof ArrayBuffer || ArrayBuffer.isView(input) || input instanceof ImageData) {
          return input;
        }
        if (Array.isArray(input)) {
          return input.map(deserialize);
        }
        if (typeof input === "object") {
          const name = input.$name ?? "Object";
          const { klass, shallow } = registry.get(name);
          if (!klass) {
            throw new Error(`can't deserialize unregistered class ${name}`);
          }
          if (klass.deserialize) {
            return klass.deserialize(input);
          }
          const result = Object.create(klass.prototype);
          for (const key of Object.keys(input)) {
            if (key === "$name") continue;
            const value = input[key];
            result[key] = shallow?.includes(key) ? value : deserialize(value);
          }
          return result;
        }
        throw new Error(`can't deserialize object of type ${typeof input}`);
      }
      function isSerializablePrimitive(input) {
        return input == null || typeof input === "boolean" || typeof input === "number" || typeof input === "string" || input instanceof Date || input instanceof RegExp || input instanceof Boolean || input instanceof Number || input instanceof String;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/web_worker_transfer.js
  var require_web_worker_transfer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/web_worker_transfer.js"(exports, module) {
      var Grid = require_grid_index();
      var { Color } = require_style_expressions();
      var {
        CompoundExpression,
        definitions: expressions,
        StylePropertyFunction,
        StyleExpression,
        ZoomDependentExpression,
        ZoomConstantExpression
      } = require_style_expressions();
      var { register, serialize, deserialize } = require_transfer_registry();
      module.exports = {
        serialize,
        deserialize
      };
      Grid.serialize = function serializeGrid(grid, transferables) {
        const buffer = grid.toArrayBuffer();
        if (transferables) {
          transferables.push(buffer);
        }
        return { buffer };
      };
      Grid.deserialize = function deserializeGrid(serialized) {
        return new Grid(serialized.buffer);
      };
      register("Grid", Grid);
      register("Color", Color);
      register("Error", Error);
      register("StylePropertyFunction", StylePropertyFunction);
      register("StyleExpression", StyleExpression, { omit: ["_evaluator"] });
      register("ZoomDependentExpression", ZoomDependentExpression);
      register("ZoomConstantExpression", ZoomConstantExpression);
      register("CompoundExpression", CompoundExpression, { omit: ["_evaluate"] });
      for (const name in expressions) {
        if (expressions[name]._classRegistryKey) continue;
        register(`Expression_${name}`, expressions[name]);
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/actor.js
  var require_actor = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/actor.js"(exports, module) {
      var { serialize, deserialize } = require_web_worker_transfer();
      module.exports = actor;
      function actor(target, parent, mapId, name) {
        const promises = /* @__PURE__ */ new Map();
        let callbackID = Number.MIN_SAFE_INTEGER;
        target.addEventListener("message", receive, false);
        return {
          send,
          receive,
          remove,
          name
        };
        function send(type, data, targetMapId) {
          const id = `${mapId}:${callbackID++}`;
          const p = Promise.withResolvers();
          promises.set(id, p);
          postMessage(targetMapId, id, type, data);
          return p.promise;
        }
        async function receive(message) {
          const { data } = message;
          const { id, type, targetMapId } = data;
          if (targetMapId && mapId !== targetMapId) return;
          if (type === "<response>") {
            const p = promises.get(id);
            if (p) {
              promises.delete(id);
              if (data.error) {
                p.reject(deserialize(data.error));
              } else {
                p.resolve(deserialize(data.data));
              }
            }
            return;
          }
          if (typeof id !== "undefined") {
            let perform;
            if (parent[type]) {
              perform = () => parent[type](data.sourceMapId, deserialize(data.data));
            } else if (parent.getWorkerSource) {
              const [sourcetype, method] = type.split(".");
              const params = deserialize(data.data);
              const workerSource = parent.getWorkerSource(data.sourceMapId, sourcetype, params.source);
              perform = () => workerSource[method](params);
            } else {
              return;
            }
            try {
              const result = await perform();
              postMessage(data.sourceMapId, id, "<response>", result);
            } catch (err) {
              postMessage(data.sourceMapId, id, "<response>", void 0, err);
            }
            return;
          }
          parent[type](deserialize(data.data));
        }
        function remove() {
          target.removeEventListener("message", receive, false);
        }
        function postMessage(targetMapId, id, type, data, err) {
          const buffers = [];
          const payload = {
            targetMapId,
            sourceMapId: mapId,
            type,
            id,
            data: serialize(data, buffers)
          };
          if (err) {
            payload.error = serialize(err);
          }
          target.postMessage(payload, buffers);
        }
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/object.js
  var require_object = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/object.js"(exports, module) {
      function values(obj) {
        const result = [];
        for (const k in obj) {
          result.push(obj[k]);
        }
        return result;
      }
      function keysDifference(obj, other) {
        const difference = [];
        for (const i in obj) {
          if (!(i in other)) {
            difference.push(i);
          }
        }
        return difference;
      }
      function pick(src, properties) {
        const result = {};
        for (let i = 0; i < properties.length; i++) {
          const k = properties[i];
          if (k in src) {
            result[k] = src[k];
          }
        }
        return result;
      }
      function bindAll(fns, context) {
        fns.forEach((fn) => {
          if (!context[fn]) {
            return;
          }
          context[fn] = context[fn].bind(context);
        });
      }
      function mapObject(input, iterator, context) {
        const output = {};
        for (const key in input) {
          output[key] = iterator.call(context || this, input[key], key, input);
        }
        return output;
      }
      function filterObject(input, iterator, context) {
        const output = {};
        for (const key in input) {
          if (iterator.call(context || this, input[key], key, input)) {
            output[key] = input[key];
          }
        }
        return output;
      }
      function deepEqual(a, b) {
        if (Array.isArray(a)) {
          if (!Array.isArray(b) || a.length !== b.length) return false;
          for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
          }
          return true;
        }
        if (typeof a === "object" && a !== null && b !== null) {
          if (!(typeof b === "object")) return false;
          const keys = Object.keys(a);
          if (keys.length !== Object.keys(b).length) return false;
          for (const key in a) {
            if (!deepEqual(a[key], b[key])) return false;
          }
          return true;
        }
        return a === b;
      }
      function clone(input) {
        if (Array.isArray(input)) {
          return input.map(clone);
        }
        if (typeof input === "object" && input) {
          return mapObject(input, clone);
        }
        return input;
      }
      function arraysIntersect(a, b) {
        for (let l = 0; l < a.length; l++) {
          if (b.indexOf(a[l]) >= 0) return true;
        }
        return false;
      }
      module.exports = {
        values,
        keysDifference,
        pick,
        bindAll,
        mapObject,
        filterObject,
        deepEqual,
        clone,
        arraysIntersect
      };
    }
  });

  // node_modules/@mapwhit/events/lib/events.js
  var events_exports = {};
  __export(events_exports, {
    ErrorEvent: () => ErrorEvent,
    Event: () => Event,
    Evented: () => Evented
  });
  function listeners({ once } = {}) {
    const bag = /* @__PURE__ */ new Map();
    return {
      add,
      remove,
      fire,
      listens
    };
    function add(type, listener) {
      const list = bag.get(type);
      if (!list) {
        bag.set(type, [listener]);
      } else if (!list.includes(listener)) {
        list.push(listener);
      }
    }
    function remove(type, listener) {
      const list = bag.get(type);
      if (!list) {
        return;
      }
      const index = list.indexOf(listener);
      if (index !== -1) {
        list.splice(index, 1);
      }
      if (list.length === 0) {
        bag.delete(type);
      }
    }
    function fire(type, thisArg, data) {
      let list = bag.get(type);
      if (!list || list.length === 0) {
        return;
      }
      if (once) {
        bag.delete(type);
      } else {
        list = list.slice();
      }
      for (const listener of list) {
        listener.call(thisArg, data);
      }
    }
    function listens(type) {
      return bag.get(type)?.length > 0;
    }
  }
  var Event, ErrorEvent, Evented;
  var init_events = __esm({
    "node_modules/@mapwhit/events/lib/events.js"() {
      Event = class {
        constructor(type, data) {
          Object.assign(this, data);
          this.type = type;
        }
      };
      ErrorEvent = class extends Event {
        constructor(error, data) {
          super("error", Object.assign({ error }, data));
        }
      };
      Evented = class {
        #listeners;
        #oneTimeListeners;
        #parent;
        #parentData;
        /**
         * Adds a listener to a specified event type.
         *
         * @param {string} type The event type to add a listen for.
         * @param {Function} listener The function to be called when the event is fired.
         *   The listener function is called with the data object passed to `fire`,
         *   extended with `target` and `type` properties.
         * @returns {Object} `this`
         */
        on(type, listener) {
          this.#listeners ??= listeners();
          this.#listeners.add(type, listener);
          return this;
        }
        /**
         * Removes a previously registered event listener.
         *
         * @param {string} type The event type to remove listeners for.
         * @param {Function} listener The listener function to remove.
         * @returns {Object} `this`
         */
        off(type, listener) {
          this.#listeners?.remove(type, listener);
          this.#oneTimeListeners?.remove(type, listener);
          return this;
        }
        /**
         * Adds a listener that will be called only once to a specified event type.
         *
         * The listener will be called first time the event fires after the listener is registered.
         *
         * @param {string} type The event type to listen for.
         * @param {Function} listener The function to be called when the event is fired the first time.
         * @returns {Object} `this`
         */
        once(type, listener) {
          this.#oneTimeListeners ??= listeners({ once: true });
          this.#oneTimeListeners.add(type, listener);
          return this;
        }
        fire(event, ...args) {
          if (typeof event === "string") {
            event = new Event(event, ...args);
          }
          const { type } = event;
          if (this.listens(type)) {
            event.target = this;
            this.#listeners?.fire(type, this, event);
            this.#oneTimeListeners?.fire(type, this, event);
            const parent = this.#parent;
            if (parent) {
              const data = typeof this.#parentData === "function" ? this.#parentData() : this.#parentData;
              Object.assign(event, data);
              parent.fire(event);
            }
          } else if (event instanceof ErrorEvent) {
            console.error(event.error);
          }
          return this;
        }
        /**
         * Returns a true if this instance of Evented or any forwardeed instances of Evented have a listener for the specified type.
         *
         * @param {string} type The event type
         * @returns {boolean} `true` if there is at least one registered listener for specified event type, `false` otherwise
         */
        listens(type) {
          return this.#listeners?.listens(type) || this.#oneTimeListeners?.listens(type) || this.#parent?.listens(type);
        }
        /**
         * Bubble all events fired by this instance of Evented to this parent instance of Evented.
         *
         * @returns {Object} `this`
         */
        setEventedParent(parent, data) {
          this.#parent = parent;
          this.#parentData = data;
          return this;
        }
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/geo/coordinate.js
  var require_coordinate = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/geo/coordinate.js"(exports, module) {
      var Coordinate = class _Coordinate {
        constructor(column, row, zoom) {
          this.column = column;
          this.row = row;
          this.zoom = zoom;
        }
        /**
         * Create a clone of this coordinate that can be mutated without
         * changing the original coordinate
         *
         * @returns {Coordinate} clone
         * @private
         * var coord = new Coordinate(0, 0, 0);
         * var c2 = coord.clone();
         * // since coord is cloned, modifying a property of c2 does
         * // not modify it.
         * c2.zoom = 2;
         */
        clone() {
          return new _Coordinate(this.column, this.row, this.zoom);
        }
        /**
         * Zoom this coordinate to a given zoom level. This returns a new
         * coordinate object, not mutating the old one.
         *
         * @param {number} zoom
         * @returns {Coordinate} zoomed coordinate
         * @private
         * @example
         * var coord = new Coordinate(0, 0, 0);
         * var c2 = coord.zoomTo(1);
         * c2 // equals new Coordinate(0, 0, 1);
         */
        zoomTo(zoom) {
          return this.clone()._zoomTo(zoom);
        }
        /**
         * Subtract the column and row values of this coordinate from those
         * of another coordinate. The other coordinat will be zoomed to the
         * same level as `this` before the subtraction occurs
         *
         * @param {Coordinate} c other coordinate
         * @returns {Coordinate} result
         * @private
         */
        sub(c) {
          return this.clone()._sub(c);
        }
        _zoomTo(zoom) {
          const scale = 2 ** (zoom - this.zoom);
          this.column *= scale;
          this.row *= scale;
          this.zoom = zoom;
          return this;
        }
        _sub(c) {
          c = c.zoomTo(this.zoom);
          this.column -= c.column;
          this.row -= c.row;
          return this;
        }
      };
      module.exports = Coordinate;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/util.js
  var require_util = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/util.js"(exports, module) {
      var UnitBezier = require_unitbezier();
      var Coordinate = require_coordinate();
      function easeCubicInOut(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        const t2 = t * t;
        const t3 = t2 * t;
        return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
      }
      function bezier(p1x, p1y, p2x, p2y) {
        const bezier2 = new UnitBezier(p1x, p1y, p2x, p2y);
        return function(t) {
          return bezier2.solve(t);
        };
      }
      var ease = bezier(0.25, 0.1, 0.25, 1);
      function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
      }
      function wrap2(n, min, max) {
        const d = max - min;
        const w = ((n - min) % d + d) % d + min;
        return w === min ? max : w;
      }
      function getCoordinatesCenter(coords) {
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < coords.length; i++) {
          minX = Math.min(minX, coords[i].column);
          minY = Math.min(minY, coords[i].row);
          maxX = Math.max(maxX, coords[i].column);
          maxY = Math.max(maxY, coords[i].row);
        }
        const dx = maxX - minX;
        const dy = maxY - minY;
        const dMax = Math.max(dx, dy);
        const zoom = Math.max(0, Math.floor(-Math.log(dMax) / Math.LN2));
        return new Coordinate((minX + maxX) / 2, (minY + maxY) / 2, 0).zoomTo(zoom);
      }
      function isCounterClockwise(a, b, c) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
      }
      function calculateSignedArea(ring) {
        let sum = 0;
        const len = ring.length;
        let p2 = ring[len - 1];
        for (const p1 of ring) {
          sum += (p2.x - p1.x) * (p1.y + p2.y);
          p2 = p1;
        }
        return sum;
      }
      function isClosedPolygon(points) {
        if (points.length < 4) return false;
        const p1 = points[0];
        const p2 = points[points.length - 1];
        if (Math.abs(p1.x - p2.x) > 0 || Math.abs(p1.y - p2.y) > 0) {
          return false;
        }
        return Math.abs(calculateSignedArea(points)) > 0.01;
      }
      function sphericalToCartesian([r, azimuthal, polar]) {
        azimuthal += 90;
        azimuthal *= Math.PI / 180;
        polar *= Math.PI / 180;
        return {
          x: r * Math.cos(azimuthal) * Math.sin(polar),
          y: r * Math.sin(azimuthal) * Math.sin(polar),
          z: r * Math.cos(polar)
        };
      }
      module.exports = {
        easeCubicInOut,
        bezier,
        ease,
        clamp,
        wrap: wrap2,
        getCoordinatesCenter,
        isCounterClockwise,
        calculateSignedArea,
        isClosedPolygon,
        sphericalToCartesian
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/zoom_history.js
  var require_zoom_history = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/zoom_history.js"(exports, module) {
      var ZoomHistory = class {
        constructor() {
          this.first = true;
        }
        update(z, now) {
          const floorZ = Math.floor(z);
          if (this.first) {
            this.first = false;
            this.lastIntegerZoom = floorZ;
            this.lastIntegerZoomTime = 0;
            this.lastZoom = z;
            this.lastFloorZoom = floorZ;
            return true;
          }
          if (this.lastFloorZoom > floorZ) {
            this.lastIntegerZoom = floorZ + 1;
            this.lastIntegerZoomTime = now;
          } else if (this.lastFloorZoom < floorZ) {
            this.lastIntegerZoom = floorZ;
            this.lastIntegerZoomTime = now;
          }
          if (z !== this.lastZoom) {
            this.lastZoom = z;
            this.lastFloorZoom = floorZ;
            return true;
          }
          return false;
        }
      };
      module.exports = ZoomHistory;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/is_char_in_unicode_block.js
  var require_is_char_in_unicode_block = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/is_char_in_unicode_block.js"(exports, module) {
      var unicodeBlockLookup = {
        // 'Basic Latin': (char) => char >= 0x0000 && char <= 0x007F,
        "Latin-1 Supplement": (char) => char >= 128 && char <= 255,
        // 'Latin Extended-A': (char) => char >= 0x0100 && char <= 0x017F,
        // 'Latin Extended-B': (char) => char >= 0x0180 && char <= 0x024F,
        // 'IPA Extensions': (char) => char >= 0x0250 && char <= 0x02AF,
        // 'Spacing Modifier Letters': (char) => char >= 0x02B0 && char <= 0x02FF,
        // 'Combining Diacritical Marks': (char) => char >= 0x0300 && char <= 0x036F,
        // 'Greek and Coptic': (char) => char >= 0x0370 && char <= 0x03FF,
        // 'Cyrillic': (char) => char >= 0x0400 && char <= 0x04FF,
        // 'Cyrillic Supplement': (char) => char >= 0x0500 && char <= 0x052F,
        // 'Armenian': (char) => char >= 0x0530 && char <= 0x058F,
        //'Hebrew': (char) => char >= 0x0590 && char <= 0x05FF,
        Arabic: (char) => char >= 1536 && char <= 1791,
        //'Syriac': (char) => char >= 0x0700 && char <= 0x074F,
        "Arabic Supplement": (char) => char >= 1872 && char <= 1919,
        // 'Thaana': (char) => char >= 0x0780 && char <= 0x07BF,
        // 'NKo': (char) => char >= 0x07C0 && char <= 0x07FF,
        // 'Samaritan': (char) => char >= 0x0800 && char <= 0x083F,
        // 'Mandaic': (char) => char >= 0x0840 && char <= 0x085F,
        // 'Syriac Supplement': (char) => char >= 0x0860 && char <= 0x086F,
        "Arabic Extended-A": (char) => char >= 2208 && char <= 2303,
        // 'Devanagari': (char) => char >= 0x0900 && char <= 0x097F,
        // 'Bengali': (char) => char >= 0x0980 && char <= 0x09FF,
        // 'Gurmukhi': (char) => char >= 0x0A00 && char <= 0x0A7F,
        // 'Gujarati': (char) => char >= 0x0A80 && char <= 0x0AFF,
        // 'Oriya': (char) => char >= 0x0B00 && char <= 0x0B7F,
        // 'Tamil': (char) => char >= 0x0B80 && char <= 0x0BFF,
        // 'Telugu': (char) => char >= 0x0C00 && char <= 0x0C7F,
        // 'Kannada': (char) => char >= 0x0C80 && char <= 0x0CFF,
        // 'Malayalam': (char) => char >= 0x0D00 && char <= 0x0D7F,
        // 'Sinhala': (char) => char >= 0x0D80 && char <= 0x0DFF,
        // 'Thai': (char) => char >= 0x0E00 && char <= 0x0E7F,
        // 'Lao': (char) => char >= 0x0E80 && char <= 0x0EFF,
        // 'Tibetan': (char) => char >= 0x0F00 && char <= 0x0FFF,
        // 'Myanmar': (char) => char >= 0x1000 && char <= 0x109F,
        // 'Georgian': (char) => char >= 0x10A0 && char <= 0x10FF,
        "Hangul Jamo": (char) => char >= 4352 && char <= 4607,
        // 'Ethiopic': (char) => char >= 0x1200 && char <= 0x137F,
        // 'Ethiopic Supplement': (char) => char >= 0x1380 && char <= 0x139F,
        // 'Cherokee': (char) => char >= 0x13A0 && char <= 0x13FF,
        "Unified Canadian Aboriginal Syllabics": (char) => char >= 5120 && char <= 5759,
        // 'Ogham': (char) => char >= 0x1680 && char <= 0x169F,
        // 'Runic': (char) => char >= 0x16A0 && char <= 0x16FF,
        // 'Tagalog': (char) => char >= 0x1700 && char <= 0x171F,
        // 'Hanunoo': (char) => char >= 0x1720 && char <= 0x173F,
        // 'Buhid': (char) => char >= 0x1740 && char <= 0x175F,
        // 'Tagbanwa': (char) => char >= 0x1760 && char <= 0x177F,
        Khmer: (char) => char >= 6016 && char <= 6143,
        // 'Mongolian': (char) => char >= 0x1800 && char <= 0x18AF,
        "Unified Canadian Aboriginal Syllabics Extended": (char) => char >= 6320 && char <= 6399,
        // 'Limbu': (char) => char >= 0x1900 && char <= 0x194F,
        // 'Tai Le': (char) => char >= 0x1950 && char <= 0x197F,
        // 'New Tai Lue': (char) => char >= 0x1980 && char <= 0x19DF,
        // 'Khmer Symbols': (char) => char >= 0x19E0 && char <= 0x19FF,
        // 'Buginese': (char) => char >= 0x1A00 && char <= 0x1A1F,
        // 'Tai Tham': (char) => char >= 0x1A20 && char <= 0x1AAF,
        // 'Combining Diacritical Marks Extended': (char) => char >= 0x1AB0 && char <= 0x1AFF,
        // 'Balinese': (char) => char >= 0x1B00 && char <= 0x1B7F,
        // 'Sundanese': (char) => char >= 0x1B80 && char <= 0x1BBF,
        // 'Batak': (char) => char >= 0x1BC0 && char <= 0x1BFF,
        // 'Lepcha': (char) => char >= 0x1C00 && char <= 0x1C4F,
        // 'Ol Chiki': (char) => char >= 0x1C50 && char <= 0x1C7F,
        // 'Cyrillic Extended-C': (char) => char >= 0x1C80 && char <= 0x1C8F,
        // 'Sundanese Supplement': (char) => char >= 0x1CC0 && char <= 0x1CCF,
        // 'Vedic Extensions': (char) => char >= 0x1CD0 && char <= 0x1CFF,
        // 'Phonetic Extensions': (char) => char >= 0x1D00 && char <= 0x1D7F,
        // 'Phonetic Extensions Supplement': (char) => char >= 0x1D80 && char <= 0x1DBF,
        // 'Combining Diacritical Marks Supplement': (char) => char >= 0x1DC0 && char <= 0x1DFF,
        // 'Latin Extended Additional': (char) => char >= 0x1E00 && char <= 0x1EFF,
        // 'Greek Extended': (char) => char >= 0x1F00 && char <= 0x1FFF,
        "General Punctuation": (char) => char >= 8192 && char <= 8303,
        // 'Superscripts and Subscripts': (char) => char >= 0x2070 && char <= 0x209F,
        // 'Currency Symbols': (char) => char >= 0x20A0 && char <= 0x20CF,
        // 'Combining Diacritical Marks for Symbols': (char) => char >= 0x20D0 && char <= 0x20FF,
        "Letterlike Symbols": (char) => char >= 8448 && char <= 8527,
        "Number Forms": (char) => char >= 8528 && char <= 8591,
        // 'Arrows': (char) => char >= 0x2190 && char <= 0x21FF,
        // 'Mathematical Operators': (char) => char >= 0x2200 && char <= 0x22FF,
        "Miscellaneous Technical": (char) => char >= 8960 && char <= 9215,
        "Control Pictures": (char) => char >= 9216 && char <= 9279,
        "Optical Character Recognition": (char) => char >= 9280 && char <= 9311,
        "Enclosed Alphanumerics": (char) => char >= 9312 && char <= 9471,
        // 'Box Drawing': (char) => char >= 0x2500 && char <= 0x257F,
        // 'Block Elements': (char) => char >= 0x2580 && char <= 0x259F,
        "Geometric Shapes": (char) => char >= 9632 && char <= 9727,
        "Miscellaneous Symbols": (char) => char >= 9728 && char <= 9983,
        // 'Dingbats': (char) => char >= 0x2700 && char <= 0x27BF,
        // 'Miscellaneous Mathematical Symbols-A': (char) => char >= 0x27C0 && char <= 0x27EF,
        // 'Supplemental Arrows-A': (char) => char >= 0x27F0 && char <= 0x27FF,
        // 'Braille Patterns': (char) => char >= 0x2800 && char <= 0x28FF,
        // 'Supplemental Arrows-B': (char) => char >= 0x2900 && char <= 0x297F,
        // 'Miscellaneous Mathematical Symbols-B': (char) => char >= 0x2980 && char <= 0x29FF,
        // 'Supplemental Mathematical Operators': (char) => char >= 0x2A00 && char <= 0x2AFF,
        "Miscellaneous Symbols and Arrows": (char) => char >= 11008 && char <= 11263,
        // 'Glagolitic': (char) => char >= 0x2C00 && char <= 0x2C5F,
        // 'Latin Extended-C': (char) => char >= 0x2C60 && char <= 0x2C7F,
        // 'Coptic': (char) => char >= 0x2C80 && char <= 0x2CFF,
        // 'Georgian Supplement': (char) => char >= 0x2D00 && char <= 0x2D2F,
        // 'Tifinagh': (char) => char >= 0x2D30 && char <= 0x2D7F,
        // 'Ethiopic Extended': (char) => char >= 0x2D80 && char <= 0x2DDF,
        // 'Cyrillic Extended-A': (char) => char >= 0x2DE0 && char <= 0x2DFF,
        // 'Supplemental Punctuation': (char) => char >= 0x2E00 && char <= 0x2E7F,
        "CJK Radicals Supplement": (char) => char >= 11904 && char <= 12031,
        "Kangxi Radicals": (char) => char >= 12032 && char <= 12255,
        "Ideographic Description Characters": (char) => char >= 12272 && char <= 12287,
        "CJK Symbols and Punctuation": (char) => char >= 12288 && char <= 12351,
        Hiragana: (char) => char >= 12352 && char <= 12447,
        Katakana: (char) => char >= 12448 && char <= 12543,
        Bopomofo: (char) => char >= 12544 && char <= 12591,
        "Hangul Compatibility Jamo": (char) => char >= 12592 && char <= 12687,
        Kanbun: (char) => char >= 12688 && char <= 12703,
        "Bopomofo Extended": (char) => char >= 12704 && char <= 12735,
        "CJK Strokes": (char) => char >= 12736 && char <= 12783,
        "Katakana Phonetic Extensions": (char) => char >= 12784 && char <= 12799,
        "Enclosed CJK Letters and Months": (char) => char >= 12800 && char <= 13055,
        "CJK Compatibility": (char) => char >= 13056 && char <= 13311,
        "CJK Unified Ideographs Extension A": (char) => char >= 13312 && char <= 19903,
        "Yijing Hexagram Symbols": (char) => char >= 19904 && char <= 19967,
        "CJK Unified Ideographs": (char) => char >= 19968 && char <= 40959,
        "Yi Syllables": (char) => char >= 40960 && char <= 42127,
        "Yi Radicals": (char) => char >= 42128 && char <= 42191,
        // 'Lisu': (char) => char >= 0xA4D0 && char <= 0xA4FF,
        // 'Vai': (char) => char >= 0xA500 && char <= 0xA63F,
        // 'Cyrillic Extended-B': (char) => char >= 0xA640 && char <= 0xA69F,
        // 'Bamum': (char) => char >= 0xA6A0 && char <= 0xA6FF,
        // 'Modifier Tone Letters': (char) => char >= 0xA700 && char <= 0xA71F,
        // 'Latin Extended-D': (char) => char >= 0xA720 && char <= 0xA7FF,
        // 'Syloti Nagri': (char) => char >= 0xA800 && char <= 0xA82F,
        // 'Common Indic Number Forms': (char) => char >= 0xA830 && char <= 0xA83F,
        // 'Phags-pa': (char) => char >= 0xA840 && char <= 0xA87F,
        // 'Saurashtra': (char) => char >= 0xA880 && char <= 0xA8DF,
        // 'Devanagari Extended': (char) => char >= 0xA8E0 && char <= 0xA8FF,
        // 'Kayah Li': (char) => char >= 0xA900 && char <= 0xA92F,
        // 'Rejang': (char) => char >= 0xA930 && char <= 0xA95F,
        "Hangul Jamo Extended-A": (char) => char >= 43360 && char <= 43391,
        // 'Javanese': (char) => char >= 0xA980 && char <= 0xA9DF,
        // 'Myanmar Extended-B': (char) => char >= 0xA9E0 && char <= 0xA9FF,
        // 'Cham': (char) => char >= 0xAA00 && char <= 0xAA5F,
        // 'Myanmar Extended-A': (char) => char >= 0xAA60 && char <= 0xAA7F,
        // 'Tai Viet': (char) => char >= 0xAA80 && char <= 0xAADF,
        // 'Meetei Mayek Extensions': (char) => char >= 0xAAE0 && char <= 0xAAFF,
        // 'Ethiopic Extended-A': (char) => char >= 0xAB00 && char <= 0xAB2F,
        // 'Latin Extended-E': (char) => char >= 0xAB30 && char <= 0xAB6F,
        // 'Cherokee Supplement': (char) => char >= 0xAB70 && char <= 0xABBF,
        // 'Meetei Mayek': (char) => char >= 0xABC0 && char <= 0xABFF,
        "Hangul Syllables": (char) => char >= 44032 && char <= 55215,
        "Hangul Jamo Extended-B": (char) => char >= 55216 && char <= 55295,
        // 'High Surrogates': (char) => char >= 0xD800 && char <= 0xDB7F,
        // 'High Private Use Surrogates': (char) => char >= 0xDB80 && char <= 0xDBFF,
        // 'Low Surrogates': (char) => char >= 0xDC00 && char <= 0xDFFF,
        "Private Use Area": (char) => char >= 57344 && char <= 63743,
        "CJK Compatibility Ideographs": (char) => char >= 63744 && char <= 64255,
        // 'Alphabetic Presentation Forms': (char) => char >= 0xFB00 && char <= 0xFB4F,
        "Arabic Presentation Forms-A": (char) => char >= 64336 && char <= 65023,
        // 'Variation Selectors': (char) => char >= 0xFE00 && char <= 0xFE0F,
        "Vertical Forms": (char) => char >= 65040 && char <= 65055,
        // 'Combining Half Marks': (char) => char >= 0xFE20 && char <= 0xFE2F,
        "CJK Compatibility Forms": (char) => char >= 65072 && char <= 65103,
        "Small Form Variants": (char) => char >= 65104 && char <= 65135,
        "Arabic Presentation Forms-B": (char) => char >= 65136 && char <= 65279,
        "Halfwidth and Fullwidth Forms": (char) => char >= 65280 && char <= 65519
        // 'Specials': (char) => char >= 0xFFF0 && char <= 0xFFFF,
        // 'Linear B Syllabary': (char) => char >= 0x10000 && char <= 0x1007F,
        // 'Linear B Ideograms': (char) => char >= 0x10080 && char <= 0x100FF,
        // 'Aegean Numbers': (char) => char >= 0x10100 && char <= 0x1013F,
        // 'Ancient Greek Numbers': (char) => char >= 0x10140 && char <= 0x1018F,
        // 'Ancient Symbols': (char) => char >= 0x10190 && char <= 0x101CF,
        // 'Phaistos Disc': (char) => char >= 0x101D0 && char <= 0x101FF,
        // 'Lycian': (char) => char >= 0x10280 && char <= 0x1029F,
        // 'Carian': (char) => char >= 0x102A0 && char <= 0x102DF,
        // 'Coptic Epact Numbers': (char) => char >= 0x102E0 && char <= 0x102FF,
        // 'Old Italic': (char) => char >= 0x10300 && char <= 0x1032F,
        // 'Gothic': (char) => char >= 0x10330 && char <= 0x1034F,
        // 'Old Permic': (char) => char >= 0x10350 && char <= 0x1037F,
        // 'Ugaritic': (char) => char >= 0x10380 && char <= 0x1039F,
        // 'Old Persian': (char) => char >= 0x103A0 && char <= 0x103DF,
        // 'Deseret': (char) => char >= 0x10400 && char <= 0x1044F,
        // 'Shavian': (char) => char >= 0x10450 && char <= 0x1047F,
        // 'Osmanya': (char) => char >= 0x10480 && char <= 0x104AF,
        // 'Osage': (char) => char >= 0x104B0 && char <= 0x104FF,
        // 'Elbasan': (char) => char >= 0x10500 && char <= 0x1052F,
        // 'Caucasian Albanian': (char) => char >= 0x10530 && char <= 0x1056F,
        // 'Linear A': (char) => char >= 0x10600 && char <= 0x1077F,
        // 'Cypriot Syllabary': (char) => char >= 0x10800 && char <= 0x1083F,
        // 'Imperial Aramaic': (char) => char >= 0x10840 && char <= 0x1085F,
        // 'Palmyrene': (char) => char >= 0x10860 && char <= 0x1087F,
        // 'Nabataean': (char) => char >= 0x10880 && char <= 0x108AF,
        // 'Hatran': (char) => char >= 0x108E0 && char <= 0x108FF,
        // 'Phoenician': (char) => char >= 0x10900 && char <= 0x1091F,
        // 'Lydian': (char) => char >= 0x10920 && char <= 0x1093F,
        // 'Meroitic Hieroglyphs': (char) => char >= 0x10980 && char <= 0x1099F,
        // 'Meroitic Cursive': (char) => char >= 0x109A0 && char <= 0x109FF,
        // 'Kharoshthi': (char) => char >= 0x10A00 && char <= 0x10A5F,
        // 'Old South Arabian': (char) => char >= 0x10A60 && char <= 0x10A7F,
        // 'Old North Arabian': (char) => char >= 0x10A80 && char <= 0x10A9F,
        // 'Manichaean': (char) => char >= 0x10AC0 && char <= 0x10AFF,
        // 'Avestan': (char) => char >= 0x10B00 && char <= 0x10B3F,
        // 'Inscriptional Parthian': (char) => char >= 0x10B40 && char <= 0x10B5F,
        // 'Inscriptional Pahlavi': (char) => char >= 0x10B60 && char <= 0x10B7F,
        // 'Psalter Pahlavi': (char) => char >= 0x10B80 && char <= 0x10BAF,
        // 'Old Turkic': (char) => char >= 0x10C00 && char <= 0x10C4F,
        // 'Old Hungarian': (char) => char >= 0x10C80 && char <= 0x10CFF,
        // 'Rumi Numeral Symbols': (char) => char >= 0x10E60 && char <= 0x10E7F,
        // 'Brahmi': (char) => char >= 0x11000 && char <= 0x1107F,
        // 'Kaithi': (char) => char >= 0x11080 && char <= 0x110CF,
        // 'Sora Sompeng': (char) => char >= 0x110D0 && char <= 0x110FF,
        // 'Chakma': (char) => char >= 0x11100 && char <= 0x1114F,
        // 'Mahajani': (char) => char >= 0x11150 && char <= 0x1117F,
        // 'Sharada': (char) => char >= 0x11180 && char <= 0x111DF,
        // 'Sinhala Archaic Numbers': (char) => char >= 0x111E0 && char <= 0x111FF,
        // 'Khojki': (char) => char >= 0x11200 && char <= 0x1124F,
        // 'Multani': (char) => char >= 0x11280 && char <= 0x112AF,
        // 'Khudawadi': (char) => char >= 0x112B0 && char <= 0x112FF,
        // 'Grantha': (char) => char >= 0x11300 && char <= 0x1137F,
        // 'Newa': (char) => char >= 0x11400 && char <= 0x1147F,
        // 'Tirhuta': (char) => char >= 0x11480 && char <= 0x114DF,
        // 'Siddham': (char) => char >= 0x11580 && char <= 0x115FF,
        // 'Modi': (char) => char >= 0x11600 && char <= 0x1165F,
        // 'Mongolian Supplement': (char) => char >= 0x11660 && char <= 0x1167F,
        // 'Takri': (char) => char >= 0x11680 && char <= 0x116CF,
        // 'Ahom': (char) => char >= 0x11700 && char <= 0x1173F,
        // 'Warang Citi': (char) => char >= 0x118A0 && char <= 0x118FF,
        // 'Zanabazar Square': (char) => char >= 0x11A00 && char <= 0x11A4F,
        // 'Soyombo': (char) => char >= 0x11A50 && char <= 0x11AAF,
        // 'Pau Cin Hau': (char) => char >= 0x11AC0 && char <= 0x11AFF,
        // 'Bhaiksuki': (char) => char >= 0x11C00 && char <= 0x11C6F,
        // 'Marchen': (char) => char >= 0x11C70 && char <= 0x11CBF,
        // 'Masaram Gondi': (char) => char >= 0x11D00 && char <= 0x11D5F,
        // 'Cuneiform': (char) => char >= 0x12000 && char <= 0x123FF,
        // 'Cuneiform Numbers and Punctuation': (char) => char >= 0x12400 && char <= 0x1247F,
        // 'Early Dynastic Cuneiform': (char) => char >= 0x12480 && char <= 0x1254F,
        // 'Egyptian Hieroglyphs': (char) => char >= 0x13000 && char <= 0x1342F,
        // 'Anatolian Hieroglyphs': (char) => char >= 0x14400 && char <= 0x1467F,
        // 'Bamum Supplement': (char) => char >= 0x16800 && char <= 0x16A3F,
        // 'Mro': (char) => char >= 0x16A40 && char <= 0x16A6F,
        // 'Bassa Vah': (char) => char >= 0x16AD0 && char <= 0x16AFF,
        // 'Pahawh Hmong': (char) => char >= 0x16B00 && char <= 0x16B8F,
        // 'Miao': (char) => char >= 0x16F00 && char <= 0x16F9F,
        // 'Ideographic Symbols and Punctuation': (char) => char >= 0x16FE0 && char <= 0x16FFF,
        // 'Tangut': (char) => char >= 0x17000 && char <= 0x187FF,
        // 'Tangut Components': (char) => char >= 0x18800 && char <= 0x18AFF,
        // 'Kana Supplement': (char) => char >= 0x1B000 && char <= 0x1B0FF,
        // 'Kana Extended-A': (char) => char >= 0x1B100 && char <= 0x1B12F,
        // 'Nushu': (char) => char >= 0x1B170 && char <= 0x1B2FF,
        // 'Duployan': (char) => char >= 0x1BC00 && char <= 0x1BC9F,
        // 'Shorthand Format Controls': (char) => char >= 0x1BCA0 && char <= 0x1BCAF,
        // 'Byzantine Musical Symbols': (char) => char >= 0x1D000 && char <= 0x1D0FF,
        // 'Musical Symbols': (char) => char >= 0x1D100 && char <= 0x1D1FF,
        // 'Ancient Greek Musical Notation': (char) => char >= 0x1D200 && char <= 0x1D24F,
        // 'Tai Xuan Jing Symbols': (char) => char >= 0x1D300 && char <= 0x1D35F,
        // 'Counting Rod Numerals': (char) => char >= 0x1D360 && char <= 0x1D37F,
        // 'Mathematical Alphanumeric Symbols': (char) => char >= 0x1D400 && char <= 0x1D7FF,
        // 'Sutton SignWriting': (char) => char >= 0x1D800 && char <= 0x1DAAF,
        // 'Glagolitic Supplement': (char) => char >= 0x1E000 && char <= 0x1E02F,
        // 'Mende Kikakui': (char) => char >= 0x1E800 && char <= 0x1E8DF,
        // 'Adlam': (char) => char >= 0x1E900 && char <= 0x1E95F,
        // 'Arabic Mathematical Alphabetic Symbols': (char) => char >= 0x1EE00 && char <= 0x1EEFF,
        // 'Mahjong Tiles': (char) => char >= 0x1F000 && char <= 0x1F02F,
        // 'Domino Tiles': (char) => char >= 0x1F030 && char <= 0x1F09F,
        // 'Playing Cards': (char) => char >= 0x1F0A0 && char <= 0x1F0FF,
        // 'Enclosed Alphanumeric Supplement': (char) => char >= 0x1F100 && char <= 0x1F1FF,
        // 'Enclosed Ideographic Supplement': (char) => char >= 0x1F200 && char <= 0x1F2FF,
        // 'Miscellaneous Symbols and Pictographs': (char) => char >= 0x1F300 && char <= 0x1F5FF,
        // 'Emoticons': (char) => char >= 0x1F600 && char <= 0x1F64F,
        // 'Ornamental Dingbats': (char) => char >= 0x1F650 && char <= 0x1F67F,
        // 'Transport and Map Symbols': (char) => char >= 0x1F680 && char <= 0x1F6FF,
        // 'Alchemical Symbols': (char) => char >= 0x1F700 && char <= 0x1F77F,
        // 'Geometric Shapes Extended': (char) => char >= 0x1F780 && char <= 0x1F7FF,
        // 'Supplemental Arrows-C': (char) => char >= 0x1F800 && char <= 0x1F8FF,
        // 'Supplemental Symbols and Pictographs': (char) => char >= 0x1F900 && char <= 0x1F9FF,
        // 'CJK Unified Ideographs Extension B': (char) => char >= 0x20000 && char <= 0x2A6DF,
        // 'CJK Unified Ideographs Extension C': (char) => char >= 0x2A700 && char <= 0x2B73F,
        // 'CJK Unified Ideographs Extension D': (char) => char >= 0x2B740 && char <= 0x2B81F,
        // 'CJK Unified Ideographs Extension E': (char) => char >= 0x2B820 && char <= 0x2CEAF,
        // 'CJK Unified Ideographs Extension F': (char) => char >= 0x2CEB0 && char <= 0x2EBEF,
        // 'CJK Compatibility Ideographs Supplement': (char) => char >= 0x2F800 && char <= 0x2FA1F,
        // 'Tags': (char) => char >= 0xE0000 && char <= 0xE007F,
        // 'Variation Selectors Supplement': (char) => char >= 0xE0100 && char <= 0xE01EF,
        // 'Supplementary Private Use Area-A': (char) => char >= 0xF0000 && char <= 0xFFFFF,
        // 'Supplementary Private Use Area-B': (char) => char >= 0x100000 && char <= 0x10FFFF,
      };
      module.exports = unicodeBlockLookup;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/script_detection.js
  var require_script_detection = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/script_detection.js"(exports, module) {
      var isChar = require_is_char_in_unicode_block();
      module.exports = {
        allowsIdeographicBreaking,
        allowsVerticalWritingMode,
        allowsLetterSpacing,
        charAllowsLetterSpacing,
        charAllowsIdeographicBreaking,
        charHasUprightVerticalOrientation,
        charHasNeutralVerticalOrientation,
        charHasRotatedVerticalOrientation,
        charInSupportedScript,
        isStringInSupportedScript
      };
      function allowsIdeographicBreaking(chars) {
        for (const char of chars) {
          if (!charAllowsIdeographicBreaking(char.charCodeAt(0))) return false;
        }
        return true;
      }
      function allowsVerticalWritingMode(chars) {
        for (const char of chars) {
          if (charHasUprightVerticalOrientation(char.charCodeAt(0))) return true;
        }
        return false;
      }
      function allowsLetterSpacing(chars) {
        for (const char of chars) {
          if (!charAllowsLetterSpacing(char.charCodeAt(0))) return false;
        }
        return true;
      }
      function charAllowsLetterSpacing(char) {
        if (isChar["Arabic"](char)) return false;
        if (isChar["Arabic Supplement"](char)) return false;
        if (isChar["Arabic Extended-A"](char)) return false;
        if (isChar["Arabic Presentation Forms-A"](char)) return false;
        if (isChar["Arabic Presentation Forms-B"](char)) return false;
        return true;
      }
      function charAllowsIdeographicBreaking(char) {
        if (char < 11904) return false;
        if (isChar["Bopomofo Extended"](char)) return true;
        if (isChar["Bopomofo"](char)) return true;
        if (isChar["CJK Compatibility Forms"](char)) return true;
        if (isChar["CJK Compatibility Ideographs"](char)) return true;
        if (isChar["CJK Compatibility"](char)) return true;
        if (isChar["CJK Radicals Supplement"](char)) return true;
        if (isChar["CJK Strokes"](char)) return true;
        if (isChar["CJK Symbols and Punctuation"](char)) return true;
        if (isChar["CJK Unified Ideographs Extension A"](char)) return true;
        if (isChar["CJK Unified Ideographs"](char)) return true;
        if (isChar["Enclosed CJK Letters and Months"](char)) return true;
        if (isChar["Halfwidth and Fullwidth Forms"](char)) return true;
        if (isChar["Hiragana"](char)) return true;
        if (isChar["Ideographic Description Characters"](char)) return true;
        if (isChar["Kangxi Radicals"](char)) return true;
        if (isChar["Katakana Phonetic Extensions"](char)) return true;
        if (isChar["Katakana"](char)) return true;
        if (isChar["Vertical Forms"](char)) return true;
        if (isChar["Yi Radicals"](char)) return true;
        if (isChar["Yi Syllables"](char)) return true;
        return false;
      }
      function charHasUprightVerticalOrientation(char) {
        if (char === 746 || char === 747) {
          return true;
        }
        if (char < 4352) return false;
        if (isChar["Bopomofo Extended"](char)) return true;
        if (isChar["Bopomofo"](char)) return true;
        if (isChar["CJK Compatibility Forms"](char)) {
          if (!(char >= 65097 && char <= 65103)) {
            return true;
          }
        }
        if (isChar["CJK Compatibility Ideographs"](char)) return true;
        if (isChar["CJK Compatibility"](char)) return true;
        if (isChar["CJK Radicals Supplement"](char)) return true;
        if (isChar["CJK Strokes"](char)) return true;
        if (isChar["CJK Symbols and Punctuation"](char)) {
          if (!(char >= 12296 && char <= 12305) && !(char >= 12308 && char <= 12319) && char !== 12336) {
            return true;
          }
        }
        if (isChar["CJK Unified Ideographs Extension A"](char)) return true;
        if (isChar["CJK Unified Ideographs"](char)) return true;
        if (isChar["Enclosed CJK Letters and Months"](char)) return true;
        if (isChar["Hangul Compatibility Jamo"](char)) return true;
        if (isChar["Hangul Jamo Extended-A"](char)) return true;
        if (isChar["Hangul Jamo Extended-B"](char)) return true;
        if (isChar["Hangul Jamo"](char)) return true;
        if (isChar["Hangul Syllables"](char)) return true;
        if (isChar["Hiragana"](char)) return true;
        if (isChar["Ideographic Description Characters"](char)) return true;
        if (isChar["Kanbun"](char)) return true;
        if (isChar["Kangxi Radicals"](char)) return true;
        if (isChar["Katakana Phonetic Extensions"](char)) return true;
        if (isChar["Katakana"](char)) {
          if (char !== 12540) {
            return true;
          }
        }
        if (isChar["Halfwidth and Fullwidth Forms"](char)) {
          if (char !== 65288 && char !== 65289 && char !== 65293 && !(char >= 65306 && char <= 65310) && char !== 65339 && char !== 65341 && char !== 65343 && !(char >= 65371 && char <= 65503) && char !== 65507 && !(char >= 65512 && char <= 65519)) {
            return true;
          }
        }
        if (isChar["Small Form Variants"](char)) {
          if (!(char >= 65112 && char <= 65118) && !(char >= 65123 && char <= 65126)) {
            return true;
          }
        }
        if (isChar["Unified Canadian Aboriginal Syllabics"](char)) return true;
        if (isChar["Unified Canadian Aboriginal Syllabics Extended"](char)) return true;
        if (isChar["Vertical Forms"](char)) return true;
        if (isChar["Yijing Hexagram Symbols"](char)) return true;
        if (isChar["Yi Syllables"](char)) return true;
        if (isChar["Yi Radicals"](char)) return true;
        return false;
      }
      function charHasNeutralVerticalOrientation(char) {
        if (isChar["Latin-1 Supplement"](char)) {
          if (char === 167 || char === 169 || char === 174 || char === 177 || char === 188 || char === 189 || char === 190 || char === 215 || char === 247) {
            return true;
          }
        }
        if (isChar["General Punctuation"](char)) {
          if (char === 8214 || char === 8224 || char === 8225 || char === 8240 || char === 8241 || char === 8251 || char === 8252 || char === 8258 || char === 8263 || char === 8264 || char === 8265 || char === 8273) {
            return true;
          }
        }
        if (isChar["Letterlike Symbols"](char)) return true;
        if (isChar["Number Forms"](char)) return true;
        if (isChar["Miscellaneous Technical"](char)) {
          if (char >= 8960 && char <= 8967 || char >= 8972 && char <= 8991 || char >= 8996 && char <= 9e3 || char === 9003 || char >= 9085 && char <= 9114 || char >= 9150 && char <= 9165 || char === 9167 || char >= 9169 && char <= 9179 || char >= 9186 && char <= 9215) {
            return true;
          }
        }
        if (isChar["Control Pictures"](char) && char !== 9251) return true;
        if (isChar["Optical Character Recognition"](char)) return true;
        if (isChar["Enclosed Alphanumerics"](char)) return true;
        if (isChar["Geometric Shapes"](char)) return true;
        if (isChar["Miscellaneous Symbols"](char)) {
          if (!(char >= 9754 && char <= 9759)) {
            return true;
          }
        }
        if (isChar["Miscellaneous Symbols and Arrows"](char)) {
          if (char >= 11026 && char <= 11055 || char >= 11088 && char <= 11097 || char >= 11192 && char <= 11243) {
            return true;
          }
        }
        if (isChar["CJK Symbols and Punctuation"](char)) return true;
        if (isChar["Katakana"](char)) return true;
        if (isChar["Private Use Area"](char)) return true;
        if (isChar["CJK Compatibility Forms"](char)) return true;
        if (isChar["Small Form Variants"](char)) return true;
        if (isChar["Halfwidth and Fullwidth Forms"](char)) return true;
        if (char === 8734 || char === 8756 || char === 8757 || char >= 9984 && char <= 10087 || char >= 10102 && char <= 10131 || char === 65532 || char === 65533) {
          return true;
        }
        return false;
      }
      function charHasRotatedVerticalOrientation(char) {
        return !(charHasUprightVerticalOrientation(char) || charHasNeutralVerticalOrientation(char));
      }
      function charInSupportedScript(char, canRenderRTL) {
        if (!canRenderRTL && (char >= 1424 && char <= 2303 || isChar["Arabic Presentation Forms-A"](char) || isChar["Arabic Presentation Forms-B"](char))) {
          return false;
        }
        if (char >= 2304 && char <= 3583 || // Main blocks for Indic scripts and Sinhala
        char >= 3840 && char <= 4255 || // Main blocks for Tibetan and Myanmar
        isChar["Khmer"](char)) {
          return false;
        }
        return true;
      }
      function isStringInSupportedScript(chars, canRenderRTL) {
        for (const char of chars) {
          if (!charInSupportedScript(char.charCodeAt(0), canRenderRTL)) {
            return false;
          }
        }
        return true;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/browser.js
  var require_browser = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/browser.js"(exports, module) {
      var now = () => performance.now();
      var raf = typeof window === "object" ? window.requestAnimationFrame : (fn) => setTimeout(fn, 0);
      var cancel = typeof window === "object" ? window.cancelAnimationFrame : (id) => clearTimeout(id);
      var exported = {
        /**
         * Provides a function that outputs milliseconds: either performance.now()
         * or a fallback to Date.now()
         */
        now,
        frame(fn) {
          return raf(fn);
        },
        cancelFrame(id) {
          return cancel(id);
        },
        getImageData(img) {
          const canvas = window.document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("failed to create canvas 2d context");
          }
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0, img.width, img.height);
          return context.getImageData(0, 0, img.width, img.height);
        },
        resolveURL(path) {
          const a = window.document.createElement("a");
          a.href = path;
          return a.href;
        },
        hardwareConcurrency: typeof window === "object" ? window.navigator.hardwareConcurrency : 4,
        get devicePixelRatio() {
          return typeof window === "object" ? window.devicePixelRatio : 1;
        }
      };
      module.exports = exported;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/rtl_text_plugin.js
  var require_rtl_text_plugin = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/rtl_text_plugin.js"(exports, module) {
      var { Event: Event2, Evented: Evented2 } = (init_events(), __toCommonJS(events_exports));
      var browser = require_browser();
      var pluginRequested = false;
      var pluginURL = null;
      var foregroundLoadComplete = false;
      var evented = new Evented2();
      var _completionCallback;
      function registerForPluginAvailability(callback) {
        if (pluginURL) {
          callback({ pluginURL, completionCallback: _completionCallback });
        } else {
          evented.once("pluginAvailable", callback);
        }
        return callback;
      }
      function clearRTLTextPlugin() {
        pluginRequested = false;
        pluginURL = null;
      }
      function setRTLTextPlugin(url, callback) {
        if (pluginRequested) {
          throw new Error("setRTLTextPlugin cannot be called multiple times.");
        }
        pluginRequested = true;
        pluginURL = browser.resolveURL(url);
        _completionCallback = (error) => {
          if (error) {
            clearRTLTextPlugin();
            if (callback) {
              callback(error);
            }
          } else {
            foregroundLoadComplete = true;
          }
        };
        evented.fire(new Event2("pluginAvailable", { pluginURL, completionCallback: _completionCallback }));
      }
      var plugin = {
        applyArabicShaping: null,
        processBidirectionalText: null,
        processStyledBidirectionalText: null,
        isLoaded: function() {
          return foregroundLoadComplete || // Foreground: loaded if the completion callback returned successfully
          plugin.applyArabicShaping != null;
        }
      };
      module.exports = {
        registerForPluginAvailability,
        clearRTLTextPlugin,
        setRTLTextPlugin,
        plugin,
        evented
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/evaluation_parameters.js
  var require_evaluation_parameters = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/evaluation_parameters.js"(exports, module) {
      var ZoomHistory = require_zoom_history();
      var { isStringInSupportedScript } = require_script_detection();
      var { plugin: rtlTextPlugin } = require_rtl_text_plugin();
      var EvaluationParameters = class {
        // "options" may also be another EvaluationParameters to copy, see CrossFadedProperty.possiblyEvaluate
        constructor(zoom, options) {
          this.zoom = zoom;
          if (options) {
            this.now = options.now;
            this.fadeDuration = options.fadeDuration;
            this.zoomHistory = options.zoomHistory;
            this.transition = options.transition;
          } else {
            this.now = 0;
            this.fadeDuration = 0;
            this.zoomHistory = new ZoomHistory();
            this.transition = {};
          }
        }
        isSupportedScript(str) {
          return isStringInSupportedScript(str, rtlTextPlugin.isLoaded());
        }
        crossFadingFactor() {
          if (this.fadeDuration === 0) {
            return 1;
          }
          return Math.min((this.now - this.zoomHistory.lastIntegerZoomTime) / this.fadeDuration, 1);
        }
        getCrossfadeParameters() {
          const z = this.zoom;
          const fraction = z - Math.floor(z);
          const t = this.crossFadingFactor();
          return z > this.zoomHistory.lastIntegerZoom ? { fromScale: 2, toScale: 1, t: fraction + (1 - fraction) * t } : { fromScale: 0.5, toScale: 1, t: 1 - (1 - t) * fraction };
        }
      };
      module.exports = EvaluationParameters;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/properties.js
  var require_properties2 = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/properties.js"(exports, module) {
      var assert = require_nanoassert();
      var { clone } = require_object();
      var { easeCubicInOut } = require_util();
      var { interpolate, normalizePropertyExpression } = require_style_expressions();
      var { register } = require_transfer_registry();
      var EvaluationParameters = require_evaluation_parameters();
      var PropertyValue = class {
        constructor(property, value) {
          this.property = property;
          this.value = value;
          this.expression = normalizePropertyExpression(
            value === void 0 ? property.specification.default : value,
            property.specification
          );
        }
        isDataDriven() {
          return this.expression.kind === "source" || this.expression.kind === "composite";
        }
        possiblyEvaluate(parameters) {
          return this.property.possiblyEvaluate(this, parameters);
        }
      };
      var TransitionablePropertyValue = class {
        constructor(property) {
          this.property = property;
          this.value = new PropertyValue(property, void 0);
        }
        transitioned(parameters, prior) {
          return new TransitioningPropertyValue(
            this.property,
            this.value,
            prior,
            Object.assign({}, parameters.transition, this.transition),
            parameters.now
          );
        }
        untransitioned() {
          return new TransitioningPropertyValue(this.property, this.value, null, {}, 0);
        }
      };
      var Transitionable = class {
        constructor(properties) {
          this._properties = properties;
          this._values = Object.create(properties.defaultTransitionablePropertyValues);
        }
        getValue(name) {
          return clone(this._values[name].value.value);
        }
        setValue(name, value) {
          if (!this._values.hasOwnProperty(name)) {
            this._values[name] = new TransitionablePropertyValue(this._values[name].property);
          }
          this._values[name].value = new PropertyValue(
            this._values[name].property,
            value === null ? void 0 : clone(value)
          );
        }
        getTransition(name) {
          return clone(this._values[name].transition);
        }
        setTransition(name, value) {
          if (!this._values.hasOwnProperty(name)) {
            this._values[name] = new TransitionablePropertyValue(this._values[name].property);
          }
          this._values[name].transition = clone(value) || void 0;
        }
        serialize() {
          const result = {};
          for (const property of Object.keys(this._values)) {
            const value = this.getValue(property);
            if (value !== void 0) {
              result[property] = value;
            }
            const transition = this.getTransition(property);
            if (transition !== void 0) {
              result[`${property}-transition`] = transition;
            }
          }
          return result;
        }
        transitioned(parameters, prior) {
          const result = new Transitioning(this._properties);
          for (const property of Object.keys(this._values)) {
            result._values[property] = this._values[property].transitioned(parameters, prior._values[property]);
          }
          return result;
        }
        untransitioned() {
          const result = new Transitioning(this._properties);
          for (const property of Object.keys(this._values)) {
            result._values[property] = this._values[property].untransitioned();
          }
          return result;
        }
      };
      var TransitioningPropertyValue = class {
        constructor(property, value, prior, transition, now) {
          this.property = property;
          this.value = value;
          this.begin = now + transition.delay || 0;
          this.end = this.begin + transition.duration || 0;
          if (property.specification.transition && (transition.delay || transition.duration)) {
            this.prior = prior;
          }
        }
        possiblyEvaluate(parameters) {
          const now = parameters.now || 0;
          const finalValue = this.value.possiblyEvaluate(parameters);
          const prior = this.prior;
          if (!prior) {
            return finalValue;
          }
          if (now > this.end) {
            this.prior = null;
            return finalValue;
          }
          if (this.value.isDataDriven()) {
            this.prior = null;
            return finalValue;
          }
          if (now < this.begin) {
            return prior.possiblyEvaluate(parameters);
          }
          const t = (now - this.begin) / (this.end - this.begin);
          return this.property.interpolate(prior.possiblyEvaluate(parameters), finalValue, easeCubicInOut(t));
        }
      };
      var Transitioning = class {
        constructor(properties) {
          this._properties = properties;
          this._values = Object.create(properties.defaultTransitioningPropertyValues);
        }
        possiblyEvaluate(parameters) {
          const result = new PossiblyEvaluated(this._properties);
          for (const property of Object.keys(this._values)) {
            result._values[property] = this._values[property].possiblyEvaluate(parameters);
          }
          return result;
        }
        hasTransition() {
          for (const property of Object.keys(this._values)) {
            if (this._values[property].prior) {
              return true;
            }
          }
          return false;
        }
      };
      var Layout = class {
        constructor(properties) {
          this._properties = properties;
          this._values = Object.create(properties.defaultPropertyValues);
        }
        getValue(name) {
          return clone(this._values[name].value);
        }
        setValue(name, value) {
          this._values[name] = new PropertyValue(this._values[name].property, value === null ? void 0 : clone(value));
        }
        serialize() {
          const result = {};
          for (const property of Object.keys(this._values)) {
            const value = this.getValue(property);
            if (value !== void 0) {
              result[property] = value;
            }
          }
          return result;
        }
        possiblyEvaluate(parameters) {
          const result = new PossiblyEvaluated(this._properties);
          for (const property of Object.keys(this._values)) {
            result._values[property] = this._values[property].possiblyEvaluate(parameters);
          }
          return result;
        }
      };
      var PossiblyEvaluatedPropertyValue = class {
        constructor(property, value, parameters) {
          this.property = property;
          this.value = value;
          this.parameters = parameters;
        }
        isConstant() {
          return this.value.kind === "constant";
        }
        constantOr(value) {
          if (this.value.kind === "constant") {
            return this.value.value;
          }
          return value;
        }
        evaluate(feature, featureState) {
          return this.property.evaluate(this.value, this.parameters, feature, featureState);
        }
      };
      var PossiblyEvaluated = class {
        constructor(properties) {
          this._properties = properties;
          this._values = Object.create(properties.defaultPossiblyEvaluatedValues);
        }
        get(name) {
          return this._values[name];
        }
      };
      var DataConstantProperty = class {
        constructor(specification) {
          this.specification = specification;
          this.specification["property-type"] ??= "data-constant";
        }
        possiblyEvaluate(value, parameters) {
          assert(!value.isDataDriven());
          return value.expression.evaluate(parameters);
        }
        interpolate(a, b, t) {
          const interp = interpolate[this.specification.type];
          if (interp) {
            return interp(a, b, t);
          }
          return a;
        }
      };
      var DataDrivenProperty = class {
        constructor(specification) {
          this.specification = specification;
          this.specification["property-type"] ??= "data-driven";
        }
        possiblyEvaluate(value, parameters) {
          if (value.expression.kind === "constant" || value.expression.kind === "camera") {
            return new PossiblyEvaluatedPropertyValue(
              this,
              { kind: "constant", value: value.expression.evaluate(parameters) },
              parameters
            );
          }
          return new PossiblyEvaluatedPropertyValue(this, value.expression, parameters);
        }
        interpolate(a, b, t) {
          if (a.value.kind !== "constant" || b.value.kind !== "constant") {
            return a;
          }
          if (a.value.value === void 0 || b.value.value === void 0) {
            return new PossiblyEvaluatedPropertyValue(this, { kind: "constant", value: void 0 }, a.parameters);
          }
          const interp = interpolate[this.specification.type];
          if (interp) {
            return new PossiblyEvaluatedPropertyValue(
              this,
              { kind: "constant", value: interp(a.value.value, b.value.value, t) },
              a.parameters
            );
          }
          return a;
        }
        evaluate(value, parameters, feature, featureState) {
          if (value.kind === "constant") {
            return value.value;
          }
          return value.evaluate(parameters, feature, featureState);
        }
      };
      var CrossFadedDataDrivenProperty = class extends DataDrivenProperty {
        constructor(specification) {
          specification["property-type"] ??= "cross-faded-data-driven";
          super(specification);
        }
        possiblyEvaluate(value, parameters) {
          if (value.value === void 0) {
            return new PossiblyEvaluatedPropertyValue(this, { kind: "constant", value: void 0 }, parameters);
          }
          if (value.expression.kind === "constant") {
            const constantValue = value.expression.evaluate(parameters);
            const constant = this._calculate(constantValue, constantValue, constantValue, parameters);
            return new PossiblyEvaluatedPropertyValue(this, { kind: "constant", value: constant }, parameters);
          }
          if (value.expression.kind === "camera") {
            const cameraVal = this._calculate(
              value.expression.evaluate({ zoom: parameters.zoom - 1 }),
              value.expression.evaluate({ zoom: parameters.zoom }),
              value.expression.evaluate({ zoom: parameters.zoom + 1 }),
              parameters
            );
            return new PossiblyEvaluatedPropertyValue(this, { kind: "constant", value: cameraVal }, parameters);
          }
          return new PossiblyEvaluatedPropertyValue(this, value.expression, parameters);
        }
        evaluate(value, globals, feature, featureState) {
          if (value.kind === "source") {
            const constant = value.evaluate(globals, feature, featureState);
            return this._calculate(constant, constant, constant, globals);
          }
          if (value.kind === "composite") {
            return this._calculate(
              value.evaluate({ zoom: Math.floor(globals.zoom) - 1 }, feature, featureState),
              value.evaluate({ zoom: Math.floor(globals.zoom) }, feature, featureState),
              value.evaluate({ zoom: Math.floor(globals.zoom) + 1 }, feature, featureState),
              globals
            );
          }
          return value.value;
        }
        _calculate(min, mid, max, parameters) {
          const z = parameters.zoom;
          return z > parameters.zoomHistory.lastIntegerZoom ? { from: min, to: mid } : { from: max, to: mid };
        }
        interpolate(a) {
          return a;
        }
      };
      var CrossFadedProperty = class {
        constructor(specification) {
          this.specification = specification;
          this.specification["property-type"] ??= "cross-faded";
        }
        possiblyEvaluate(value, parameters) {
          if (value.value === void 0) {
            return void 0;
          }
          if (value.expression.kind === "constant") {
            const constant = value.expression.evaluate(parameters);
            return this._calculate(constant, constant, constant, parameters);
          }
          assert(!value.isDataDriven());
          return this._calculate(
            value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom - 1), parameters)),
            value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom), parameters)),
            value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom + 1), parameters)),
            parameters
          );
        }
        _calculate(min, mid, max, parameters) {
          const z = parameters.zoom;
          return z > parameters.zoomHistory.lastIntegerZoom ? { from: min, to: mid } : { from: max, to: mid };
        }
        interpolate(a) {
          return a;
        }
      };
      var ColorRampProperty = class {
        constructor(specification) {
          this.specification = specification;
          this.specification["property-type"] ??= "color-ramp";
        }
        possiblyEvaluate(value, parameters) {
          return !!value.expression.evaluate(parameters);
        }
        interpolate() {
          return false;
        }
      };
      var Properties = class {
        constructor(properties) {
          this.properties = properties;
          this.defaultPropertyValues = {};
          this.defaultTransitionablePropertyValues = {};
          this.defaultTransitioningPropertyValues = {};
          this.defaultPossiblyEvaluatedValues = {};
          for (const property in properties) {
            const prop = properties[property];
            const defaultPropertyValue = this.defaultPropertyValues[property] = new PropertyValue(prop, void 0);
            const defaultTransitionablePropertyValue = this.defaultTransitionablePropertyValues[property] = new TransitionablePropertyValue(prop);
            this.defaultTransitioningPropertyValues[property] = defaultTransitionablePropertyValue.untransitioned();
            this.defaultPossiblyEvaluatedValues[property] = defaultPropertyValue.possiblyEvaluate({});
          }
        }
      };
      register("DataDrivenProperty", DataDrivenProperty);
      register("DataConstantProperty", DataConstantProperty);
      register("CrossFadedDataDrivenProperty", CrossFadedDataDrivenProperty);
      register("CrossFadedProperty", CrossFadedProperty);
      register("ColorRampProperty", ColorRampProperty);
      module.exports = {
        PropertyValue,
        Transitionable,
        Transitioning,
        Layout,
        PossiblyEvaluatedPropertyValue,
        PossiblyEvaluated,
        DataConstantProperty,
        DataDrivenProperty,
        CrossFadedDataDrivenProperty,
        CrossFadedProperty,
        ColorRampProperty,
        Properties
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer.js
  var require_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer.js"(exports, module) {
      var { filterObject } = require_object();
      var { Evented: Evented2 } = (init_events(), __toCommonJS(events_exports));
      var { Layout, Transitionable, PossiblyEvaluatedPropertyValue } = require_properties2();
      var { supportsPropertyExpression } = require_style_expressions();
      var TRANSITION_SUFFIX = "-transition";
      var StyleLayer = class extends Evented2 {
        constructor(layer, properties) {
          super();
          this.id = layer.id;
          this.metadata = layer.metadata;
          this.type = layer.type;
          this.minzoom = layer.minzoom;
          this.maxzoom = layer.maxzoom;
          this.visibility = "visible";
          this.paint = {};
          this.layout = {};
          if (layer.type !== "background") {
            this.source = layer.source;
            this.sourceLayer = layer["source-layer"];
            this.filter = layer.filter;
          }
          this._featureFilter = () => true;
          if (properties.layout) {
            this._unevaluatedLayout = new Layout(properties.layout);
          }
          this._transitionablePaint = new Transitionable(properties.paint);
          for (const property in layer.paint) {
            this.setPaintProperty(property, layer.paint[property]);
          }
          for (const property in layer.layout) {
            this.setLayoutProperty(property, layer.layout[property]);
          }
          this._transitioningPaint = this._transitionablePaint.untransitioned();
        }
        getCrossfadeParameters() {
          return this._crossfadeParameters;
        }
        getLayoutProperty(name) {
          if (name === "visibility") {
            return this.visibility;
          }
          return this._unevaluatedLayout.getValue(name);
        }
        setLayoutProperty(name, value) {
          if (name === "visibility") {
            this.visibility = value === "none" ? value : "visible";
            return;
          }
          this._unevaluatedLayout.setValue(name, value);
        }
        getPaintProperty(name) {
          if (name.endsWith(TRANSITION_SUFFIX)) {
            return this._transitionablePaint.getTransition(name.slice(0, -TRANSITION_SUFFIX.length));
          }
          return this._transitionablePaint.getValue(name);
        }
        setPaintProperty(name, value) {
          if (name.endsWith(TRANSITION_SUFFIX)) {
            this._transitionablePaint.setTransition(name.slice(0, -TRANSITION_SUFFIX.length), value || void 0);
            return false;
          }
          const prop = this._transitionablePaint._values[name];
          const newCrossFadedValue = prop.property.specification["property-type"] === "cross-faded-data-driven" && !prop.value.value && value;
          const wasDataDriven = this._transitionablePaint._values[name].value.isDataDriven();
          this._transitionablePaint.setValue(name, value);
          const isDataDriven = this._transitionablePaint._values[name].value.isDataDriven();
          this._handleSpecialPaintPropertyUpdate(name);
          return isDataDriven || wasDataDriven || newCrossFadedValue;
        }
        _handleSpecialPaintPropertyUpdate() {
        }
        isHidden(zoom) {
          if (this.minzoom && zoom < this.minzoom) return true;
          if (this.maxzoom && zoom >= this.maxzoom) return true;
          return this.visibility === "none";
        }
        updateTransitions(parameters) {
          this._transitioningPaint = this._transitionablePaint.transitioned(parameters, this._transitioningPaint);
        }
        hasTransition() {
          return this._transitioningPaint.hasTransition();
        }
        recalculate(parameters) {
          if (parameters.getCrossfadeParameters) {
            this._crossfadeParameters = parameters.getCrossfadeParameters();
          }
          if (this._unevaluatedLayout) {
            this.layout = this._unevaluatedLayout.possiblyEvaluate(parameters);
          }
          this.paint = this._transitioningPaint.possiblyEvaluate(parameters);
        }
        serialize() {
          const output = {
            id: this.id,
            type: this.type,
            source: this.source,
            "source-layer": this.sourceLayer,
            metadata: this.metadata,
            minzoom: this.minzoom,
            maxzoom: this.maxzoom,
            filter: this.filter,
            layout: this._unevaluatedLayout?.serialize(),
            paint: this._transitionablePaint?.serialize()
          };
          if (this.visibility === "none") {
            output.layout = output.layout || {};
            output.layout.visibility = "none";
          }
          return filterObject(output, (value, key) => {
            return value !== void 0 && !(key === "layout" && !Object.keys(value).length) && !(key === "paint" && !Object.keys(value).length);
          });
        }
        is3D() {
          return false;
        }
        isTileClipped() {
          return false;
        }
        hasOffscreenPass() {
          return false;
        }
        resize() {
        }
        isStateDependent() {
          for (const property in this.paint._values) {
            const value = this.paint.get(property);
            if (!(value instanceof PossiblyEvaluatedPropertyValue) || !supportsPropertyExpression(value.property.specification)) {
              continue;
            }
            if ((value.value.kind === "source" || value.value.kind === "composite") && value.value.isStateDependent) {
              return true;
            }
          }
          return false;
        }
      };
      module.exports = StyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/struct_array.js
  var require_struct_array = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/struct_array.js"(exports, module) {
      var assert = require_nanoassert();
      var viewTypes = {
        Int8: Int8Array,
        Uint8: Uint8Array,
        Int16: Int16Array,
        Uint16: Uint16Array,
        Int32: Int32Array,
        Uint32: Uint32Array,
        Float32: Float32Array
      };
      var Struct = class {
        // The following properties are defined on the prototype of sub classes.
        /**
         * @param {StructArray} structArray The StructArray the struct is stored in
         * @param {number} index The index of the struct in the StructArray.
         * @private
         */
        constructor(structArray, index) {
          this._structArray = structArray;
          this._pos1 = index * this.size;
          this._pos2 = this._pos1 / 2;
          this._pos4 = this._pos1 / 4;
          this._pos8 = this._pos1 / 8;
        }
      };
      var DEFAULT_CAPACITY = 128;
      var RESIZE_MULTIPLIER = 5;
      var StructArray = class {
        // The following properties are defined on the prototype.
        constructor() {
          this.isTransferred = false;
          this.capacity = -1;
          this.resize(0);
        }
        /**
         * Serialize a StructArray instance.  Serializes both the raw data and the
         * metadata needed to reconstruct the StructArray base class during
         * deserialization.
         */
        static serialize(array, transferables) {
          assert(!array.isTransferred);
          array._trim();
          if (transferables) {
            array.isTransferred = true;
            transferables.push(array.arrayBuffer);
          }
          return {
            length: array.length,
            arrayBuffer: array.arrayBuffer
          };
        }
        static deserialize(input) {
          const structArray = Object.create(this.prototype);
          structArray.arrayBuffer = input.arrayBuffer;
          structArray.length = input.length;
          structArray.capacity = input.arrayBuffer.byteLength / structArray.bytesPerElement;
          structArray._refreshViews();
          return structArray;
        }
        /**
         * Resize the array to discard unused capacity.
         */
        _trim() {
          if (this.length !== this.capacity) {
            this.capacity = this.length;
            this.arrayBuffer = this.arrayBuffer.slice(0, this.length * this.bytesPerElement);
            this._refreshViews();
          }
        }
        /**
         * Resets the the length of the array to 0 without de-allocating capcacity.
         */
        clear() {
          this.length = 0;
        }
        /**
         * Resize the array.
         * If `n` is greater than the current length then additional elements with undefined values are added.
         * If `n` is less than the current length then the array will be reduced to the first `n` elements.
         * @param {number} n The new size of the array.
         */
        resize(n) {
          assert(!this.isTransferred);
          this.reserve(n);
          this.length = n;
        }
        /**
         * Indicate a planned increase in size, so that any necessary allocation may
         * be done once, ahead of time.
         * @param {number} n The expected size of the array.
         */
        reserve(n) {
          if (n > this.capacity) {
            this.capacity = Math.max(n, Math.floor(this.capacity * RESIZE_MULTIPLIER), DEFAULT_CAPACITY);
            this.arrayBuffer = new ArrayBuffer(this.capacity * this.bytesPerElement);
            const oldUint8Array = this.uint8;
            this._refreshViews();
            if (oldUint8Array) this.uint8.set(oldUint8Array);
          }
        }
        /**
         * Create TypedArray views for the current ArrayBuffer.
         */
        _refreshViews() {
          throw new Error("_refreshViews() must be implemented by each concrete StructArray layout");
        }
      };
      function createLayout(members, alignment = 1) {
        let offset = 0;
        let maxSize = 0;
        const layoutMembers = members.map((member) => {
          assert(member.name.length);
          const typeSize = sizeOf(member.type);
          const memberOffset = offset = align(offset, Math.max(alignment, typeSize));
          const components = member.components || 1;
          maxSize = Math.max(maxSize, typeSize);
          offset += typeSize * components;
          return {
            name: member.name,
            type: member.type,
            components,
            offset: memberOffset
          };
        });
        const size = align(offset, Math.max(maxSize, alignment));
        return {
          members: layoutMembers,
          size,
          alignment
        };
      }
      function sizeOf(type) {
        return viewTypes[type].BYTES_PER_ELEMENT;
      }
      function align(offset, size) {
        return Math.ceil(offset / size) * size;
      }
      module.exports = { StructArray, Struct, viewTypes, createLayout };
    }
  });

  // node_modules/@mapbox/point-geometry/index.js
  var point_geometry_exports = {};
  __export(point_geometry_exports, {
    default: () => Point
  });
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }
  var init_point_geometry = __esm({
    "node_modules/@mapbox/point-geometry/index.js"() {
      Point.prototype = {
        /**
         * Clone this point, returning a new point that can be modified
         * without affecting the old one.
         * @return {Point} the clone
         */
        clone() {
          return new Point(this.x, this.y);
        },
        /**
         * Add this point's x & y coordinates to another point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        add(p) {
          return this.clone()._add(p);
        },
        /**
         * Subtract this point's x & y coordinates to from point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        sub(p) {
          return this.clone()._sub(p);
        },
        /**
         * Multiply this point's x & y coordinates by point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        multByPoint(p) {
          return this.clone()._multByPoint(p);
        },
        /**
         * Divide this point's x & y coordinates by point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        divByPoint(p) {
          return this.clone()._divByPoint(p);
        },
        /**
         * Multiply this point's x & y coordinates by a factor,
         * yielding a new point.
         * @param {number} k factor
         * @return {Point} output point
         */
        mult(k) {
          return this.clone()._mult(k);
        },
        /**
         * Divide this point's x & y coordinates by a factor,
         * yielding a new point.
         * @param {number} k factor
         * @return {Point} output point
         */
        div(k) {
          return this.clone()._div(k);
        },
        /**
         * Rotate this point around the 0, 0 origin by an angle a,
         * given in radians
         * @param {number} a angle to rotate around, in radians
         * @return {Point} output point
         */
        rotate(a) {
          return this.clone()._rotate(a);
        },
        /**
         * Rotate this point around p point by an angle a,
         * given in radians
         * @param {number} a angle to rotate around, in radians
         * @param {Point} p Point to rotate around
         * @return {Point} output point
         */
        rotateAround(a, p) {
          return this.clone()._rotateAround(a, p);
        },
        /**
         * Multiply this point by a 4x1 transformation matrix
         * @param {[number, number, number, number]} m transformation matrix
         * @return {Point} output point
         */
        matMult(m) {
          return this.clone()._matMult(m);
        },
        /**
         * Calculate this point but as a unit vector from 0, 0, meaning
         * that the distance from the resulting point to the 0, 0
         * coordinate will be equal to 1 and the angle from the resulting
         * point to the 0, 0 coordinate will be the same as before.
         * @return {Point} unit vector point
         */
        unit() {
          return this.clone()._unit();
        },
        /**
         * Compute a perpendicular point, where the new y coordinate
         * is the old x coordinate and the new x coordinate is the old y
         * coordinate multiplied by -1
         * @return {Point} perpendicular point
         */
        perp() {
          return this.clone()._perp();
        },
        /**
         * Return a version of this point with the x & y coordinates
         * rounded to integers.
         * @return {Point} rounded point
         */
        round() {
          return this.clone()._round();
        },
        /**
         * Return the magnitude of this point: this is the Euclidean
         * distance from the 0, 0 coordinate to this point's x and y
         * coordinates.
         * @return {number} magnitude
         */
        mag() {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        /**
         * Judge whether this point is equal to another point, returning
         * true or false.
         * @param {Point} other the other point
         * @return {boolean} whether the points are equal
         */
        equals(other) {
          return this.x === other.x && this.y === other.y;
        },
        /**
         * Calculate the distance from this point to another point
         * @param {Point} p the other point
         * @return {number} distance
         */
        dist(p) {
          return Math.sqrt(this.distSqr(p));
        },
        /**
         * Calculate the distance from this point to another point,
         * without the square root step. Useful if you're comparing
         * relative distances.
         * @param {Point} p the other point
         * @return {number} distance
         */
        distSqr(p) {
          const dx = p.x - this.x, dy = p.y - this.y;
          return dx * dx + dy * dy;
        },
        /**
         * Get the angle from the 0, 0 coordinate to this point, in radians
         * coordinates.
         * @return {number} angle
         */
        angle() {
          return Math.atan2(this.y, this.x);
        },
        /**
         * Get the angle from this point to another point, in radians
         * @param {Point} b the other point
         * @return {number} angle
         */
        angleTo(b) {
          return Math.atan2(this.y - b.y, this.x - b.x);
        },
        /**
         * Get the angle between this point and another point, in radians
         * @param {Point} b the other point
         * @return {number} angle
         */
        angleWith(b) {
          return this.angleWithSep(b.x, b.y);
        },
        /**
         * Find the angle of the two vectors, solving the formula for
         * the cross product a x b = |a||b|sin(θ) for θ.
         * @param {number} x the x-coordinate
         * @param {number} y the y-coordinate
         * @return {number} the angle in radians
         */
        angleWithSep(x, y) {
          return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y
          );
        },
        /** @param {[number, number, number, number]} m */
        _matMult(m) {
          const x = m[0] * this.x + m[1] * this.y, y = m[2] * this.x + m[3] * this.y;
          this.x = x;
          this.y = y;
          return this;
        },
        /** @param {Point} p */
        _add(p) {
          this.x += p.x;
          this.y += p.y;
          return this;
        },
        /** @param {Point} p */
        _sub(p) {
          this.x -= p.x;
          this.y -= p.y;
          return this;
        },
        /** @param {number} k */
        _mult(k) {
          this.x *= k;
          this.y *= k;
          return this;
        },
        /** @param {number} k */
        _div(k) {
          this.x /= k;
          this.y /= k;
          return this;
        },
        /** @param {Point} p */
        _multByPoint(p) {
          this.x *= p.x;
          this.y *= p.y;
          return this;
        },
        /** @param {Point} p */
        _divByPoint(p) {
          this.x /= p.x;
          this.y /= p.y;
          return this;
        },
        _unit() {
          this._div(this.mag());
          return this;
        },
        _perp() {
          const y = this.y;
          this.y = this.x;
          this.x = -y;
          return this;
        },
        /** @param {number} angle */
        _rotate(angle) {
          const cos = Math.cos(angle), sin = Math.sin(angle), x = cos * this.x - sin * this.y, y = sin * this.x + cos * this.y;
          this.x = x;
          this.y = y;
          return this;
        },
        /**
         * @param {number} angle
         * @param {Point} p
         */
        _rotateAround(angle, p) {
          const cos = Math.cos(angle), sin = Math.sin(angle), x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y), y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
          this.x = x;
          this.y = y;
          return this;
        },
        _round() {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          return this;
        },
        constructor: Point
      };
      Point.convert = function(p) {
        if (p instanceof Point) {
          return (
            /** @type {Point} */
            p
          );
        }
        if (Array.isArray(p)) {
          return new Point(+p[0], +p[1]);
        }
        if (p.x !== void 0 && p.y !== void 0) {
          return new Point(+p.x, +p.y);
        }
        throw new Error("Expected [x, y] or {x, y} point format");
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/array_types.js
  var require_array_types = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/array_types.js"(exports, module) {
      var assert = require_nanoassert();
      var { Struct, StructArray } = require_struct_array();
      var { register } = require_transfer_registry();
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var StructArrayLayout2i4 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 2;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          return i;
        }
        emplace(i, v0, v1) {
          const o2 = i * 2;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          return i;
        }
      };
      StructArrayLayout2i4.prototype.bytesPerElement = 4;
      register("StructArrayLayout2i4", StructArrayLayout2i4);
      var StructArrayLayout4i8 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 4;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          return i;
        }
        emplace(i, v0, v1, v2, v3) {
          const o2 = i * 4;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          return i;
        }
      };
      StructArrayLayout4i8.prototype.bytesPerElement = 8;
      register("StructArrayLayout4i8", StructArrayLayout4i8);
      var StructArrayLayout2i4i12 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 6;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.int16[o2 + 4] = v4;
          this.int16[o2 + 5] = v5;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5) {
          const o2 = i * 6;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.int16[o2 + 4] = v4;
          this.int16[o2 + 5] = v5;
          return i;
        }
      };
      StructArrayLayout2i4i12.prototype.bytesPerElement = 12;
      register("StructArrayLayout2i4i12", StructArrayLayout2i4i12);
      var StructArrayLayout4i4ub12 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 6;
          const o1 = i * 12;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.uint8[o1 + 8] = v4;
          this.uint8[o1 + 9] = v5;
          this.uint8[o1 + 10] = v6;
          this.uint8[o1 + 11] = v7;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5, v6, v7) {
          const o2 = i * 6;
          const o1 = i * 12;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.uint8[o1 + 8] = v4;
          this.uint8[o1 + 9] = v5;
          this.uint8[o1 + 10] = v6;
          this.uint8[o1 + 11] = v7;
          return i;
        }
      };
      StructArrayLayout4i4ub12.prototype.bytesPerElement = 12;
      register("StructArrayLayout4i4ub12", StructArrayLayout4i4ub12);
      var StructArrayLayout8ui16 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 8;
          this.uint16[o2 + 0] = v0;
          this.uint16[o2 + 1] = v1;
          this.uint16[o2 + 2] = v2;
          this.uint16[o2 + 3] = v3;
          this.uint16[o2 + 4] = v4;
          this.uint16[o2 + 5] = v5;
          this.uint16[o2 + 6] = v6;
          this.uint16[o2 + 7] = v7;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5, v6, v7) {
          const o2 = i * 8;
          this.uint16[o2 + 0] = v0;
          this.uint16[o2 + 1] = v1;
          this.uint16[o2 + 2] = v2;
          this.uint16[o2 + 3] = v3;
          this.uint16[o2 + 4] = v4;
          this.uint16[o2 + 5] = v5;
          this.uint16[o2 + 6] = v6;
          this.uint16[o2 + 7] = v7;
          return i;
        }
      };
      StructArrayLayout8ui16.prototype.bytesPerElement = 16;
      register("StructArrayLayout8ui16", StructArrayLayout8ui16);
      var StructArrayLayout4i4ui16 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 8;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.uint16[o2 + 4] = v4;
          this.uint16[o2 + 5] = v5;
          this.uint16[o2 + 6] = v6;
          this.uint16[o2 + 7] = v7;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5, v6, v7) {
          const o2 = i * 8;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.uint16[o2 + 4] = v4;
          this.uint16[o2 + 5] = v5;
          this.uint16[o2 + 6] = v6;
          this.uint16[o2 + 7] = v7;
          return i;
        }
      };
      StructArrayLayout4i4ui16.prototype.bytesPerElement = 16;
      register("StructArrayLayout4i4ui16", StructArrayLayout4i4ui16);
      var StructArrayLayout3f12 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.float32 = new Float32Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2) {
          const i = this.length;
          this.resize(i + 1);
          const o4 = i * 3;
          this.float32[o4 + 0] = v0;
          this.float32[o4 + 1] = v1;
          this.float32[o4 + 2] = v2;
          return i;
        }
        emplace(i, v0, v1, v2) {
          const o4 = i * 3;
          this.float32[o4 + 0] = v0;
          this.float32[o4 + 1] = v1;
          this.float32[o4 + 2] = v2;
          return i;
        }
      };
      StructArrayLayout3f12.prototype.bytesPerElement = 12;
      register("StructArrayLayout3f12", StructArrayLayout3f12);
      var StructArrayLayout1ul4 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.uint32 = new Uint32Array(this.arrayBuffer);
        }
        emplaceBack(v0) {
          const i = this.length;
          this.resize(i + 1);
          const o4 = i * 1;
          this.uint32[o4 + 0] = v0;
          return i;
        }
        emplace(i, v0) {
          const o4 = i * 1;
          this.uint32[o4 + 0] = v0;
          return i;
        }
      };
      StructArrayLayout1ul4.prototype.bytesPerElement = 4;
      register("StructArrayLayout1ul4", StructArrayLayout1ul4);
      var StructArrayLayout6i1ul2ui2i24 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
          this.uint32 = new Uint32Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 12;
          const o4 = i * 6;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.int16[o2 + 4] = v4;
          this.int16[o2 + 5] = v5;
          this.uint32[o4 + 3] = v6;
          this.uint16[o2 + 8] = v7;
          this.uint16[o2 + 9] = v8;
          this.int16[o2 + 10] = v9;
          this.int16[o2 + 11] = v10;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10) {
          const o2 = i * 12;
          const o4 = i * 6;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.int16[o2 + 4] = v4;
          this.int16[o2 + 5] = v5;
          this.uint32[o4 + 3] = v6;
          this.uint16[o2 + 8] = v7;
          this.uint16[o2 + 9] = v8;
          this.int16[o2 + 10] = v9;
          this.int16[o2 + 11] = v10;
          return i;
        }
      };
      StructArrayLayout6i1ul2ui2i24.prototype.bytesPerElement = 24;
      register("StructArrayLayout6i1ul2ui2i24", StructArrayLayout6i1ul2ui2i24);
      var StructArrayLayout2i2i2i12 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 6;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.int16[o2 + 4] = v4;
          this.int16[o2 + 5] = v5;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5) {
          const o2 = i * 6;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.int16[o2 + 4] = v4;
          this.int16[o2 + 5] = v5;
          return i;
        }
      };
      StructArrayLayout2i2i2i12.prototype.bytesPerElement = 12;
      register("StructArrayLayout2i2i2i12", StructArrayLayout2i2i2i12);
      var StructArrayLayout2ub4 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1) {
          const i = this.length;
          this.resize(i + 1);
          const o1 = i * 4;
          this.uint8[o1 + 0] = v0;
          this.uint8[o1 + 1] = v1;
          return i;
        }
        emplace(i, v0, v1) {
          const o1 = i * 4;
          this.uint8[o1 + 0] = v0;
          this.uint8[o1 + 1] = v1;
          return i;
        }
      };
      StructArrayLayout2ub4.prototype.bytesPerElement = 4;
      register("StructArrayLayout2ub4", StructArrayLayout2ub4);
      var StructArrayLayout2i2ui3ul3ui2f2ub40 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
          this.uint32 = new Uint32Array(this.arrayBuffer);
          this.float32 = new Float32Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 20;
          const o4 = i * 10;
          const o1 = i * 40;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.uint16[o2 + 2] = v2;
          this.uint16[o2 + 3] = v3;
          this.uint32[o4 + 2] = v4;
          this.uint32[o4 + 3] = v5;
          this.uint32[o4 + 4] = v6;
          this.uint16[o2 + 10] = v7;
          this.uint16[o2 + 11] = v8;
          this.uint16[o2 + 12] = v9;
          this.float32[o4 + 7] = v10;
          this.float32[o4 + 8] = v11;
          this.uint8[o1 + 36] = v12;
          this.uint8[o1 + 37] = v13;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13) {
          const o2 = i * 20;
          const o4 = i * 10;
          const o1 = i * 40;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.uint16[o2 + 2] = v2;
          this.uint16[o2 + 3] = v3;
          this.uint32[o4 + 2] = v4;
          this.uint32[o4 + 3] = v5;
          this.uint32[o4 + 4] = v6;
          this.uint16[o2 + 10] = v7;
          this.uint16[o2 + 11] = v8;
          this.uint16[o2 + 12] = v9;
          this.float32[o4 + 7] = v10;
          this.float32[o4 + 8] = v11;
          this.uint8[o1 + 36] = v12;
          this.uint8[o1 + 37] = v13;
          return i;
        }
      };
      StructArrayLayout2i2ui3ul3ui2f2ub40.prototype.bytesPerElement = 40;
      register("StructArrayLayout2i2ui3ul3ui2f2ub40", StructArrayLayout2i2ui3ul3ui2f2ub40);
      var StructArrayLayout4i9ui1ul32 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
          this.uint32 = new Uint32Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 16;
          const o4 = i * 8;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.uint16[o2 + 4] = v4;
          this.uint16[o2 + 5] = v5;
          this.uint16[o2 + 6] = v6;
          this.uint16[o2 + 7] = v7;
          this.uint16[o2 + 8] = v8;
          this.uint16[o2 + 9] = v9;
          this.uint16[o2 + 10] = v10;
          this.uint16[o2 + 11] = v11;
          this.uint16[o2 + 12] = v12;
          this.uint32[o4 + 7] = v13;
          return i;
        }
        emplace(i, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13) {
          const o2 = i * 16;
          const o4 = i * 8;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          this.int16[o2 + 3] = v3;
          this.uint16[o2 + 4] = v4;
          this.uint16[o2 + 5] = v5;
          this.uint16[o2 + 6] = v6;
          this.uint16[o2 + 7] = v7;
          this.uint16[o2 + 8] = v8;
          this.uint16[o2 + 9] = v9;
          this.uint16[o2 + 10] = v10;
          this.uint16[o2 + 11] = v11;
          this.uint16[o2 + 12] = v12;
          this.uint32[o4 + 7] = v13;
          return i;
        }
      };
      StructArrayLayout4i9ui1ul32.prototype.bytesPerElement = 32;
      register("StructArrayLayout4i9ui1ul32", StructArrayLayout4i9ui1ul32);
      var StructArrayLayout1f4 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.float32 = new Float32Array(this.arrayBuffer);
        }
        emplaceBack(v0) {
          const i = this.length;
          this.resize(i + 1);
          const o4 = i * 1;
          this.float32[o4 + 0] = v0;
          return i;
        }
        emplace(i, v0) {
          const o4 = i * 1;
          this.float32[o4 + 0] = v0;
          return i;
        }
      };
      StructArrayLayout1f4.prototype.bytesPerElement = 4;
      register("StructArrayLayout1f4", StructArrayLayout1f4);
      var StructArrayLayout3i6 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.int16 = new Int16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 3;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          return i;
        }
        emplace(i, v0, v1, v2) {
          const o2 = i * 3;
          this.int16[o2 + 0] = v0;
          this.int16[o2 + 1] = v1;
          this.int16[o2 + 2] = v2;
          return i;
        }
      };
      StructArrayLayout3i6.prototype.bytesPerElement = 6;
      register("StructArrayLayout3i6", StructArrayLayout3i6);
      var StructArrayLayout1ul2ui8 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.uint32 = new Uint32Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2) {
          const i = this.length;
          this.resize(i + 1);
          const o4 = i * 2;
          const o2 = i * 4;
          this.uint32[o4 + 0] = v0;
          this.uint16[o2 + 2] = v1;
          this.uint16[o2 + 3] = v2;
          return i;
        }
        emplace(i, v0, v1, v2) {
          const o4 = i * 2;
          const o2 = i * 4;
          this.uint32[o4 + 0] = v0;
          this.uint16[o2 + 2] = v1;
          this.uint16[o2 + 3] = v2;
          return i;
        }
      };
      StructArrayLayout1ul2ui8.prototype.bytesPerElement = 8;
      register("StructArrayLayout1ul2ui8", StructArrayLayout1ul2ui8);
      var StructArrayLayout3ui6 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 3;
          this.uint16[o2 + 0] = v0;
          this.uint16[o2 + 1] = v1;
          this.uint16[o2 + 2] = v2;
          return i;
        }
        emplace(i, v0, v1, v2) {
          const o2 = i * 3;
          this.uint16[o2 + 0] = v0;
          this.uint16[o2 + 1] = v1;
          this.uint16[o2 + 2] = v2;
          return i;
        }
      };
      StructArrayLayout3ui6.prototype.bytesPerElement = 6;
      register("StructArrayLayout3ui6", StructArrayLayout3ui6);
      var StructArrayLayout2ui4 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 2;
          this.uint16[o2 + 0] = v0;
          this.uint16[o2 + 1] = v1;
          return i;
        }
        emplace(i, v0, v1) {
          const o2 = i * 2;
          this.uint16[o2 + 0] = v0;
          this.uint16[o2 + 1] = v1;
          return i;
        }
      };
      StructArrayLayout2ui4.prototype.bytesPerElement = 4;
      register("StructArrayLayout2ui4", StructArrayLayout2ui4);
      var StructArrayLayout1ui2 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.uint16 = new Uint16Array(this.arrayBuffer);
        }
        emplaceBack(v0) {
          const i = this.length;
          this.resize(i + 1);
          const o2 = i * 1;
          this.uint16[o2 + 0] = v0;
          return i;
        }
        emplace(i, v0) {
          const o2 = i * 1;
          this.uint16[o2 + 0] = v0;
          return i;
        }
      };
      StructArrayLayout1ui2.prototype.bytesPerElement = 2;
      register("StructArrayLayout1ui2", StructArrayLayout1ui2);
      var StructArrayLayout2f8 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.float32 = new Float32Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1) {
          const i = this.length;
          this.resize(i + 1);
          const o4 = i * 2;
          this.float32[o4 + 0] = v0;
          this.float32[o4 + 1] = v1;
          return i;
        }
        emplace(i, v0, v1) {
          const o4 = i * 2;
          this.float32[o4 + 0] = v0;
          this.float32[o4 + 1] = v1;
          return i;
        }
      };
      StructArrayLayout2f8.prototype.bytesPerElement = 8;
      register("StructArrayLayout2f8", StructArrayLayout2f8);
      var StructArrayLayout4f16 = class extends StructArray {
        _refreshViews() {
          this.uint8 = new Uint8Array(this.arrayBuffer);
          this.float32 = new Float32Array(this.arrayBuffer);
        }
        emplaceBack(v0, v1, v2, v3) {
          const i = this.length;
          this.resize(i + 1);
          const o4 = i * 4;
          this.float32[o4 + 0] = v0;
          this.float32[o4 + 1] = v1;
          this.float32[o4 + 2] = v2;
          this.float32[o4 + 3] = v3;
          return i;
        }
        emplace(i, v0, v1, v2, v3) {
          const o4 = i * 4;
          this.float32[o4 + 0] = v0;
          this.float32[o4 + 1] = v1;
          this.float32[o4 + 2] = v2;
          this.float32[o4 + 3] = v3;
          return i;
        }
      };
      StructArrayLayout4f16.prototype.bytesPerElement = 16;
      register("StructArrayLayout4f16", StructArrayLayout4f16);
      var CollisionBoxStruct = class extends Struct {
        get anchorPointX() {
          return this._structArray.int16[this._pos2 + 0];
        }
        set anchorPointX(x) {
          this._structArray.int16[this._pos2 + 0] = x;
        }
        get anchorPointY() {
          return this._structArray.int16[this._pos2 + 1];
        }
        set anchorPointY(x) {
          this._structArray.int16[this._pos2 + 1] = x;
        }
        get x1() {
          return this._structArray.int16[this._pos2 + 2];
        }
        set x1(x) {
          this._structArray.int16[this._pos2 + 2] = x;
        }
        get y1() {
          return this._structArray.int16[this._pos2 + 3];
        }
        set y1(x) {
          this._structArray.int16[this._pos2 + 3] = x;
        }
        get x2() {
          return this._structArray.int16[this._pos2 + 4];
        }
        set x2(x) {
          this._structArray.int16[this._pos2 + 4] = x;
        }
        get y2() {
          return this._structArray.int16[this._pos2 + 5];
        }
        set y2(x) {
          this._structArray.int16[this._pos2 + 5] = x;
        }
        get featureIndex() {
          return this._structArray.uint32[this._pos4 + 3];
        }
        set featureIndex(x) {
          this._structArray.uint32[this._pos4 + 3] = x;
        }
        get sourceLayerIndex() {
          return this._structArray.uint16[this._pos2 + 8];
        }
        set sourceLayerIndex(x) {
          this._structArray.uint16[this._pos2 + 8] = x;
        }
        get bucketIndex() {
          return this._structArray.uint16[this._pos2 + 9];
        }
        set bucketIndex(x) {
          this._structArray.uint16[this._pos2 + 9] = x;
        }
        get radius() {
          return this._structArray.int16[this._pos2 + 10];
        }
        set radius(x) {
          this._structArray.int16[this._pos2 + 10] = x;
        }
        get signedDistanceFromAnchor() {
          return this._structArray.int16[this._pos2 + 11];
        }
        set signedDistanceFromAnchor(x) {
          this._structArray.int16[this._pos2 + 11] = x;
        }
        get anchorPoint() {
          return new Point2(this.anchorPointX, this.anchorPointY);
        }
      };
      CollisionBoxStruct.prototype.size = 24;
      var CollisionBoxArray = class extends StructArrayLayout6i1ul2ui2i24 {
        /**
         * Return the CollisionBoxStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        get(index) {
          assert(!this.isTransferred);
          return new CollisionBoxStruct(this, index);
        }
      };
      register("CollisionBoxArray", CollisionBoxArray);
      var PlacedSymbolStruct = class extends Struct {
        get anchorX() {
          return this._structArray.int16[this._pos2 + 0];
        }
        set anchorX(x) {
          this._structArray.int16[this._pos2 + 0] = x;
        }
        get anchorY() {
          return this._structArray.int16[this._pos2 + 1];
        }
        set anchorY(x) {
          this._structArray.int16[this._pos2 + 1] = x;
        }
        get glyphStartIndex() {
          return this._structArray.uint16[this._pos2 + 2];
        }
        set glyphStartIndex(x) {
          this._structArray.uint16[this._pos2 + 2] = x;
        }
        get numGlyphs() {
          return this._structArray.uint16[this._pos2 + 3];
        }
        set numGlyphs(x) {
          this._structArray.uint16[this._pos2 + 3] = x;
        }
        get vertexStartIndex() {
          return this._structArray.uint32[this._pos4 + 2];
        }
        set vertexStartIndex(x) {
          this._structArray.uint32[this._pos4 + 2] = x;
        }
        get lineStartIndex() {
          return this._structArray.uint32[this._pos4 + 3];
        }
        set lineStartIndex(x) {
          this._structArray.uint32[this._pos4 + 3] = x;
        }
        get lineLength() {
          return this._structArray.uint32[this._pos4 + 4];
        }
        set lineLength(x) {
          this._structArray.uint32[this._pos4 + 4] = x;
        }
        get segment() {
          return this._structArray.uint16[this._pos2 + 10];
        }
        set segment(x) {
          this._structArray.uint16[this._pos2 + 10] = x;
        }
        get lowerSize() {
          return this._structArray.uint16[this._pos2 + 11];
        }
        set lowerSize(x) {
          this._structArray.uint16[this._pos2 + 11] = x;
        }
        get upperSize() {
          return this._structArray.uint16[this._pos2 + 12];
        }
        set upperSize(x) {
          this._structArray.uint16[this._pos2 + 12] = x;
        }
        get lineOffsetX() {
          return this._structArray.float32[this._pos4 + 7];
        }
        set lineOffsetX(x) {
          this._structArray.float32[this._pos4 + 7] = x;
        }
        get lineOffsetY() {
          return this._structArray.float32[this._pos4 + 8];
        }
        set lineOffsetY(x) {
          this._structArray.float32[this._pos4 + 8] = x;
        }
        get writingMode() {
          return this._structArray.uint8[this._pos1 + 36];
        }
        set writingMode(x) {
          this._structArray.uint8[this._pos1 + 36] = x;
        }
        get hidden() {
          return this._structArray.uint8[this._pos1 + 37];
        }
        set hidden(x) {
          this._structArray.uint8[this._pos1 + 37] = x;
        }
      };
      PlacedSymbolStruct.prototype.size = 40;
      var PlacedSymbolArray = class extends StructArrayLayout2i2ui3ul3ui2f2ub40 {
        /**
         * Return the PlacedSymbolStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        get(index) {
          assert(!this.isTransferred);
          return new PlacedSymbolStruct(this, index);
        }
      };
      register("PlacedSymbolArray", PlacedSymbolArray);
      var SymbolInstanceStruct = class extends Struct {
        get anchorX() {
          return this._structArray.int16[this._pos2 + 0];
        }
        set anchorX(x) {
          this._structArray.int16[this._pos2 + 0] = x;
        }
        get anchorY() {
          return this._structArray.int16[this._pos2 + 1];
        }
        set anchorY(x) {
          this._structArray.int16[this._pos2 + 1] = x;
        }
        get horizontalPlacedTextSymbolIndex() {
          return this._structArray.int16[this._pos2 + 2];
        }
        set horizontalPlacedTextSymbolIndex(x) {
          this._structArray.int16[this._pos2 + 2] = x;
        }
        get verticalPlacedTextSymbolIndex() {
          return this._structArray.int16[this._pos2 + 3];
        }
        set verticalPlacedTextSymbolIndex(x) {
          this._structArray.int16[this._pos2 + 3] = x;
        }
        get key() {
          return this._structArray.uint16[this._pos2 + 4];
        }
        set key(x) {
          this._structArray.uint16[this._pos2 + 4] = x;
        }
        get textBoxStartIndex() {
          return this._structArray.uint16[this._pos2 + 5];
        }
        set textBoxStartIndex(x) {
          this._structArray.uint16[this._pos2 + 5] = x;
        }
        get textBoxEndIndex() {
          return this._structArray.uint16[this._pos2 + 6];
        }
        set textBoxEndIndex(x) {
          this._structArray.uint16[this._pos2 + 6] = x;
        }
        get iconBoxStartIndex() {
          return this._structArray.uint16[this._pos2 + 7];
        }
        set iconBoxStartIndex(x) {
          this._structArray.uint16[this._pos2 + 7] = x;
        }
        get iconBoxEndIndex() {
          return this._structArray.uint16[this._pos2 + 8];
        }
        set iconBoxEndIndex(x) {
          this._structArray.uint16[this._pos2 + 8] = x;
        }
        get featureIndex() {
          return this._structArray.uint16[this._pos2 + 9];
        }
        set featureIndex(x) {
          this._structArray.uint16[this._pos2 + 9] = x;
        }
        get numGlyphVertices() {
          return this._structArray.uint16[this._pos2 + 10];
        }
        set numGlyphVertices(x) {
          this._structArray.uint16[this._pos2 + 10] = x;
        }
        get numVerticalGlyphVertices() {
          return this._structArray.uint16[this._pos2 + 11];
        }
        set numVerticalGlyphVertices(x) {
          this._structArray.uint16[this._pos2 + 11] = x;
        }
        get numIconVertices() {
          return this._structArray.uint16[this._pos2 + 12];
        }
        set numIconVertices(x) {
          this._structArray.uint16[this._pos2 + 12] = x;
        }
        get crossTileID() {
          return this._structArray.uint32[this._pos4 + 7];
        }
        set crossTileID(x) {
          this._structArray.uint32[this._pos4 + 7] = x;
        }
      };
      SymbolInstanceStruct.prototype.size = 32;
      var SymbolInstanceArray = class extends StructArrayLayout4i9ui1ul32 {
        /**
         * Return the SymbolInstanceStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        get(index) {
          assert(!this.isTransferred);
          return new SymbolInstanceStruct(this, index);
        }
      };
      register("SymbolInstanceArray", SymbolInstanceArray);
      var GlyphOffsetStruct = class extends Struct {
        get offsetX() {
          return this._structArray.float32[this._pos4 + 0];
        }
        set offsetX(x) {
          this._structArray.float32[this._pos4 + 0] = x;
        }
      };
      GlyphOffsetStruct.prototype.size = 4;
      var GlyphOffsetArray = class extends StructArrayLayout1f4 {
        getoffsetX(index) {
          return this.float32[index * 1 + 0];
        }
        /**
         * Return the GlyphOffsetStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        get(index) {
          assert(!this.isTransferred);
          return new GlyphOffsetStruct(this, index);
        }
      };
      register("GlyphOffsetArray", GlyphOffsetArray);
      var SymbolLineVertexStruct = class extends Struct {
        get x() {
          return this._structArray.int16[this._pos2 + 0];
        }
        set x(x) {
          this._structArray.int16[this._pos2 + 0] = x;
        }
        get y() {
          return this._structArray.int16[this._pos2 + 1];
        }
        set y(x) {
          this._structArray.int16[this._pos2 + 1] = x;
        }
        get tileUnitDistanceFromAnchor() {
          return this._structArray.int16[this._pos2 + 2];
        }
        set tileUnitDistanceFromAnchor(x) {
          this._structArray.int16[this._pos2 + 2] = x;
        }
      };
      SymbolLineVertexStruct.prototype.size = 6;
      var SymbolLineVertexArray = class extends StructArrayLayout3i6 {
        getx(index) {
          return this.int16[index * 3 + 0];
        }
        gety(index) {
          return this.int16[index * 3 + 1];
        }
        gettileUnitDistanceFromAnchor(index) {
          return this.int16[index * 3 + 2];
        }
        /**
         * Return the SymbolLineVertexStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        get(index) {
          assert(!this.isTransferred);
          return new SymbolLineVertexStruct(this, index);
        }
      };
      register("SymbolLineVertexArray", SymbolLineVertexArray);
      var FeatureIndexStruct = class extends Struct {
        get featureIndex() {
          return this._structArray.uint32[this._pos4 + 0];
        }
        set featureIndex(x) {
          this._structArray.uint32[this._pos4 + 0] = x;
        }
        get sourceLayerIndex() {
          return this._structArray.uint16[this._pos2 + 2];
        }
        set sourceLayerIndex(x) {
          this._structArray.uint16[this._pos2 + 2] = x;
        }
        get bucketIndex() {
          return this._structArray.uint16[this._pos2 + 3];
        }
        set bucketIndex(x) {
          this._structArray.uint16[this._pos2 + 3] = x;
        }
      };
      FeatureIndexStruct.prototype.size = 8;
      var FeatureIndexArray = class extends StructArrayLayout1ul2ui8 {
        /**
         * Return the FeatureIndexStruct at the given location in the array.
         * @param {number} index The index of the element.
         */
        get(index) {
          assert(!this.isTransferred);
          return new FeatureIndexStruct(this, index);
        }
      };
      register("FeatureIndexArray", FeatureIndexArray);
      module.exports = {
        StructArrayLayout2i4,
        StructArrayLayout4i8,
        StructArrayLayout2i4i12,
        StructArrayLayout4i4ub12,
        StructArrayLayout8ui16,
        StructArrayLayout4i4ui16,
        StructArrayLayout3f12,
        StructArrayLayout1ul4,
        StructArrayLayout6i1ul2ui2i24,
        StructArrayLayout2i2i2i12,
        StructArrayLayout2ub4,
        StructArrayLayout2i2ui3ul3ui2f2ub40,
        StructArrayLayout4i9ui1ul32,
        StructArrayLayout1f4,
        StructArrayLayout3i6,
        StructArrayLayout1ul2ui8,
        StructArrayLayout3ui6,
        StructArrayLayout2ui4,
        StructArrayLayout1ui2,
        StructArrayLayout2f8,
        StructArrayLayout4f16,
        PosArray: StructArrayLayout2i4,
        RasterBoundsArray: StructArrayLayout4i8,
        CircleLayoutArray: StructArrayLayout2i4,
        FillLayoutArray: StructArrayLayout2i4,
        FillExtrusionLayoutArray: StructArrayLayout2i4i12,
        HeatmapLayoutArray: StructArrayLayout2i4,
        LineLayoutArray: StructArrayLayout4i4ub12,
        PatternLayoutArray: StructArrayLayout8ui16,
        SymbolLayoutArray: StructArrayLayout4i4ui16,
        SymbolDynamicLayoutArray: StructArrayLayout3f12,
        SymbolOpacityArray: StructArrayLayout1ul4,
        CollisionBoxLayoutArray: StructArrayLayout2i2i2i12,
        CollisionCircleLayoutArray: StructArrayLayout2i2i2i12,
        CollisionVertexArray: StructArrayLayout2ub4,
        TriangleIndexArray: StructArrayLayout3ui6,
        LineIndexArray: StructArrayLayout2ui4,
        LineStripIndexArray: StructArrayLayout1ui2,
        CollisionBoxArray,
        FeatureIndexArray,
        GlyphOffsetArray,
        PlacedSymbolArray,
        SymbolInstanceArray,
        SymbolLineVertexArray
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/circle_attributes.js
  var require_circle_attributes = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/circle_attributes.js"(exports, module) {
      var { createLayout } = require_struct_array();
      var layout = createLayout([{ name: "a_pos", components: 2, type: "Int16" }], 4);
      module.exports = layout;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/warn.js
  var require_warn = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/warn.js"(exports, module) {
      var warnOnceHistory = {};
      function once(message) {
        if (!warnOnceHistory[message]) {
          console.warn(message);
          warnOnceHistory[message] = true;
        }
      }
      function noop() {
      }
      module.exports = {
        once: typeof console !== "undefined" ? once : noop
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/segment.js
  var require_segment = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/segment.js"(exports, module) {
      var warn = require_warn();
      var { register } = require_transfer_registry();
      var SegmentVector = class _SegmentVector {
        constructor(segments = []) {
          this.segments = segments;
        }
        prepareSegment(numVertices, layoutVertexArray, indexArray) {
          if (numVertices > _SegmentVector.MAX_VERTEX_ARRAY_LENGTH)
            warn.once(
              `Max vertices per segment is ${_SegmentVector.MAX_VERTEX_ARRAY_LENGTH}: bucket requested ${numVertices}`
            );
          let segment = this.segments.at(-1);
          if (!segment || segment.vertexLength + numVertices > _SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
            segment = {
              vertexOffset: layoutVertexArray.length,
              primitiveOffset: indexArray.length,
              vertexLength: 0,
              primitiveLength: 0
            };
            this.segments.push(segment);
          }
          return segment;
        }
        get() {
          return this.segments;
        }
        destroy() {
          for (const segment of this.segments) {
            for (const k in segment.vaos) {
              segment.vaos[k].destroy();
            }
          }
        }
        static simpleSegment(vertexOffset, primitiveOffset, vertexLength, primitiveLength) {
          return new _SegmentVector([
            {
              vertexOffset,
              primitiveOffset,
              vertexLength,
              primitiveLength,
              vaos: {}
            }
          ]);
        }
      };
      SegmentVector.MAX_VERTEX_ARRAY_LENGTH = 2 ** 16 - 1;
      register("SegmentVector", SegmentVector);
      module.exports = SegmentVector;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/shaders/encode_attribute.js
  var require_encode_attribute = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/shaders/encode_attribute.js"(exports, module) {
      var { clamp } = require_util();
      function pack(a, b) {
        a = clamp(Math.floor(a), 0, 255);
        b = clamp(Math.floor(b), 0, 255);
        return 256 * a + b;
      }
      module.exports = {
        packUint8ToFloat: pack
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/render/uniform_binding.js
  var require_uniform_binding = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/render/uniform_binding.js"(exports, module) {
      var { Color } = require_style_expressions();
      var Uniform = class {
        constructor(context, location) {
          this.gl = context.gl;
          this.location = location;
        }
      };
      var Uniform1i = class extends Uniform {
        constructor(context, location) {
          super(context, location);
          this.current = 0;
        }
        set(v) {
          if (this.current !== v) {
            this.current = v;
            this.gl.uniform1i(this.location, v);
          }
        }
      };
      var Uniform1f = class extends Uniform {
        constructor(context, location) {
          super(context, location);
          this.current = 0;
        }
        set(v) {
          if (this.current !== v) {
            this.current = v;
            this.gl.uniform1f(this.location, v);
          }
        }
      };
      var Uniform2f = class extends Uniform {
        constructor(context, location) {
          super(context, location);
          this.current = [0, 0];
        }
        set(v) {
          if (v[0] !== this.current[0] || v[1] !== this.current[1]) {
            this.current = v;
            this.gl.uniform2f(this.location, v[0], v[1]);
          }
        }
      };
      var Uniform3f = class extends Uniform {
        constructor(context, location) {
          super(context, location);
          this.current = [0, 0, 0];
        }
        set(v) {
          if (v[0] !== this.current[0] || v[1] !== this.current[1] || v[2] !== this.current[2]) {
            this.current = v;
            this.gl.uniform3f(this.location, v[0], v[1], v[2]);
          }
        }
      };
      var Uniform4f = class extends Uniform {
        constructor(context, location) {
          super(context, location);
          this.current = [0, 0, 0, 0];
        }
        set(v) {
          if (v[0] !== this.current[0] || v[1] !== this.current[1] || v[2] !== this.current[2] || v[3] !== this.current[3]) {
            this.current = v;
            this.gl.uniform4f(this.location, v[0], v[1], v[2], v[3]);
          }
        }
      };
      var UniformColor = class extends Uniform {
        constructor(context, location) {
          super(context, location);
          this.current = Color.transparent;
        }
        set(v) {
          if (v.r !== this.current.r || v.g !== this.current.g || v.b !== this.current.b || v.a !== this.current.a) {
            this.current = v;
            this.gl.uniform4f(this.location, v.r, v.g, v.b, v.a);
          }
        }
      };
      var emptyMat4 = new Float32Array(16);
      var UniformMatrix4f = class extends Uniform {
        constructor(context, location) {
          super(context, location);
          this.current = emptyMat4;
        }
        set(v) {
          if (v[12] !== this.current[12] || v[0] !== this.current[0]) {
            this.current = v;
            this.gl.uniformMatrix4fv(this.location, false, v);
            return;
          }
          for (let i = 1; i < 16; i++) {
            if (v[i] !== this.current[i]) {
              this.current = v;
              this.gl.uniformMatrix4fv(this.location, false, v);
              break;
            }
          }
        }
      };
      module.exports = {
        Uniform,
        Uniform1i,
        Uniform1f,
        Uniform2f,
        Uniform3f,
        Uniform4f,
        UniformColor,
        UniformMatrix4f
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/program_configuration.js
  var require_program_configuration = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/program_configuration.js"(exports, module) {
      var { packUint8ToFloat } = require_encode_attribute();
      var { supportsPropertyExpression } = require_style_expressions();
      var { register } = require_transfer_registry();
      var { PossiblyEvaluatedPropertyValue } = require_properties2();
      var {
        StructArrayLayout1f4,
        StructArrayLayout2f8,
        StructArrayLayout4f16,
        PatternLayoutArray
      } = require_array_types();
      var EvaluationParameters = require_evaluation_parameters();
      var { Uniform1f, UniformColor, Uniform4f } = require_uniform_binding();
      function packColor(color) {
        return [packUint8ToFloat(255 * color.r, 255 * color.g), packUint8ToFloat(255 * color.b, 255 * color.a)];
      }
      var ConstantBinder = class {
        constructor(value, names, type) {
          this.value = value;
          this.names = names;
          this.uniformNames = this.names.map((name) => `u_${name}`);
          this.type = type;
          this.maxValue = Number.NEGATIVE_INFINITY;
        }
        defines() {
          return this.names.map((name) => `#define HAS_UNIFORM_u_${name}`);
        }
        setConstantPatternPositions() {
        }
        populatePaintArray() {
        }
        updatePaintArray() {
        }
        upload() {
        }
        destroy() {
        }
        setUniforms(context, uniform, globals, currentValue) {
          uniform.set(currentValue.constantOr(this.value));
        }
        getBinding(context, location) {
          return this.type === "color" ? new UniformColor(context, location) : new Uniform1f(context, location);
        }
      };
      var CrossFadedConstantBinder = class {
        constructor(value, names, type) {
          this.value = value;
          this.names = names;
          this.uniformNames = this.names.map((name) => `u_${name}`);
          this.type = type;
          this.maxValue = Number.NEGATIVE_INFINITY;
          this.patternPositions = { patternTo: null, patternFrom: null };
        }
        defines() {
          return this.names.map((name) => `#define HAS_UNIFORM_u_${name}`);
        }
        populatePaintArray() {
        }
        updatePaintArray() {
        }
        upload() {
        }
        destroy() {
        }
        setConstantPatternPositions(posTo, posFrom) {
          this.patternPositions.patternTo = posTo.tlbr;
          this.patternPositions.patternFrom = posFrom.tlbr;
        }
        setUniforms(context, uniform, globals, currentValue, uniformName) {
          const pos = this.patternPositions;
          if (uniformName === "u_pattern_to" && pos.patternTo) uniform.set(pos.patternTo);
          if (uniformName === "u_pattern_from" && pos.patternFrom) uniform.set(pos.patternFrom);
        }
        getBinding(context, location) {
          return new Uniform4f(context, location);
        }
      };
      var SourceExpressionBinder = class {
        constructor(expression, names, type, PaintVertexArray) {
          this.expression = expression;
          this.names = names;
          this.type = type;
          this.uniformNames = this.names.map((name) => `a_${name}`);
          this.maxValue = Number.NEGATIVE_INFINITY;
          this.paintVertexAttributes = names.map((name) => ({
            name: `a_${name}`,
            type: "Float32",
            components: type === "color" ? 2 : 1,
            offset: 0
          }));
          this.paintVertexArray = new PaintVertexArray();
        }
        defines() {
          return [];
        }
        setConstantPatternPositions() {
        }
        populatePaintArray(newLength, feature, imagePositions) {
          const paintArray = this.paintVertexArray;
          const start = paintArray.length;
          paintArray.reserve(newLength);
          const value = this.expression.evaluate(new EvaluationParameters(0), feature, {});
          if (this.type === "color") {
            const color = packColor(value);
            for (let i = start; i < newLength; i++) {
              paintArray.emplaceBack(color[0], color[1]);
            }
          } else {
            for (let i = start; i < newLength; i++) {
              paintArray.emplaceBack(value);
            }
            this.maxValue = Math.max(this.maxValue, value);
          }
        }
        updatePaintArray(start, end, feature, featureState, imagePositions) {
          const paintArray = this.paintVertexArray;
          const value = this.expression.evaluate({ zoom: 0 }, feature, featureState);
          if (this.type === "color") {
            const color = packColor(value);
            for (let i = start; i < end; i++) {
              paintArray.emplace(i, color[0], color[1]);
            }
          } else {
            for (let i = start; i < end; i++) {
              paintArray.emplace(i, value);
            }
            this.maxValue = Math.max(this.maxValue, value);
          }
        }
        upload(context) {
          if (this.paintVertexArray?.arrayBuffer) {
            if (this.paintVertexBuffer?.buffer) {
              this.paintVertexBuffer.updateData(this.paintVertexArray);
            } else {
              this.paintVertexBuffer = context.createVertexBuffer(
                this.paintVertexArray,
                this.paintVertexAttributes,
                this.expression.isStateDependent
              );
            }
          }
        }
        destroy() {
          if (this.paintVertexBuffer) {
            this.paintVertexBuffer.destroy();
          }
        }
        setUniforms(context, uniform) {
          uniform.set(0);
        }
        getBinding(context, location) {
          return new Uniform1f(context, location);
        }
      };
      var CompositeExpressionBinder = class {
        constructor(expression, names, type, useIntegerZoom, zoom, layout) {
          this.expression = expression;
          this.names = names;
          this.uniformNames = this.names.map((name) => `a_${name}_t`);
          this.type = type;
          this.useIntegerZoom = useIntegerZoom;
          this.zoom = zoom;
          this.maxValue = Number.NEGATIVE_INFINITY;
          const PaintVertexArray = layout;
          this.paintVertexAttributes = names.map((name) => {
            return {
              name: `a_${name}`,
              type: "Float32",
              components: type === "color" ? 4 : 2,
              offset: 0
            };
          });
          this.paintVertexArray = new PaintVertexArray();
        }
        defines() {
          return [];
        }
        setConstantPatternPositions() {
        }
        populatePaintArray(newLength, feature) {
          const paintArray = this.paintVertexArray;
          const start = paintArray.length;
          paintArray.reserve(newLength);
          const min = this.expression.evaluate(new EvaluationParameters(this.zoom), feature, {});
          const max = this.expression.evaluate(new EvaluationParameters(this.zoom + 1), feature, {});
          if (this.type === "color") {
            const minColor = packColor(min);
            const maxColor = packColor(max);
            for (let i = start; i < newLength; i++) {
              paintArray.emplaceBack(minColor[0], minColor[1], maxColor[0], maxColor[1]);
            }
          } else {
            for (let i = start; i < newLength; i++) {
              paintArray.emplaceBack(min, max);
            }
            this.maxValue = Math.max(this.maxValue, min, max);
          }
        }
        updatePaintArray(start, end, feature, featureState) {
          const paintArray = this.paintVertexArray;
          const min = this.expression.evaluate({ zoom: this.zoom }, feature, featureState);
          const max = this.expression.evaluate({ zoom: this.zoom + 1 }, feature, featureState);
          if (this.type === "color") {
            const minColor = packColor(min);
            const maxColor = packColor(max);
            for (let i = start; i < end; i++) {
              paintArray.emplace(i, minColor[0], minColor[1], maxColor[0], maxColor[1]);
            }
          } else {
            for (let i = start; i < end; i++) {
              paintArray.emplace(i, min, max);
            }
            this.maxValue = Math.max(this.maxValue, min, max);
          }
        }
        upload(context) {
          if (this.paintVertexArray?.arrayBuffer) {
            if (this.paintVertexBuffer?.buffer) {
              this.paintVertexBuffer.updateData(this.paintVertexArray);
            } else {
              this.paintVertexBuffer = context.createVertexBuffer(
                this.paintVertexArray,
                this.paintVertexAttributes,
                this.expression.isStateDependent
              );
            }
          }
        }
        destroy() {
          if (this.paintVertexBuffer) {
            this.paintVertexBuffer.destroy();
          }
        }
        interpolationFactor(currentZoom) {
          if (this.useIntegerZoom) {
            return this.expression.interpolationFactor(Math.floor(currentZoom), this.zoom, this.zoom + 1);
          }
          return this.expression.interpolationFactor(currentZoom, this.zoom, this.zoom + 1);
        }
        setUniforms(context, uniform, globals) {
          uniform.set(this.interpolationFactor(globals.zoom));
        }
        getBinding(context, location) {
          return new Uniform1f(context, location);
        }
      };
      var CrossFadedCompositeBinder = class {
        constructor(expression, names, type, useIntegerZoom, zoom, PaintVertexArray, layerId) {
          this.expression = expression;
          this.names = names;
          this.type = type;
          this.uniformNames = this.names.map((name) => `a_${name}_t`);
          this.useIntegerZoom = useIntegerZoom;
          this.zoom = zoom;
          this.maxValue = Number.NEGATIVE_INFINITY;
          this.layerId = layerId;
          this.paintVertexAttributes = names.map((name) => ({
            name: `a_${name}`,
            type: "Uint16",
            components: 4,
            offset: 0
          }));
          this.zoomInPaintVertexArray = new PaintVertexArray();
          this.zoomOutPaintVertexArray = new PaintVertexArray();
        }
        defines() {
          return [];
        }
        setConstantPatternPositions() {
        }
        populatePaintArray(length, feature, imagePositions) {
          const zoomInArray = this.zoomInPaintVertexArray;
          const zoomOutArray = this.zoomOutPaintVertexArray;
          const { layerId } = this;
          const start = zoomInArray.length;
          zoomInArray.reserve(length);
          zoomOutArray.reserve(length);
          if (imagePositions && feature.patterns && feature.patterns[layerId]) {
            const { min, mid, max } = feature.patterns[layerId];
            const imageMin = imagePositions[min];
            const imageMid = imagePositions[mid];
            const imageMax = imagePositions[max];
            if (!imageMin || !imageMid || !imageMax) return;
            for (let i = start; i < length; i++) {
              zoomInArray.emplaceBack(
                imageMid.tl[0],
                imageMid.tl[1],
                imageMid.br[0],
                imageMid.br[1],
                imageMin.tl[0],
                imageMin.tl[1],
                imageMin.br[0],
                imageMin.br[1]
              );
              zoomOutArray.emplaceBack(
                imageMid.tl[0],
                imageMid.tl[1],
                imageMid.br[0],
                imageMid.br[1],
                imageMax.tl[0],
                imageMax.tl[1],
                imageMax.br[0],
                imageMax.br[1]
              );
            }
          }
        }
        updatePaintArray(start, end, feature, featureState, imagePositions) {
          const zoomInArray = this.zoomInPaintVertexArray;
          const zoomOutArray = this.zoomOutPaintVertexArray;
          const { layerId } = this;
          if (imagePositions && feature.patterns && feature.patterns[layerId]) {
            const { min, mid, max } = feature.patterns[layerId];
            const imageMin = imagePositions[min];
            const imageMid = imagePositions[mid];
            const imageMax = imagePositions[max];
            if (!imageMin || !imageMid || !imageMax) return;
            for (let i = start; i < end; i++) {
              zoomInArray.emplace(
                i,
                imageMid.tl[0],
                imageMid.tl[1],
                imageMid.br[0],
                imageMid.br[1],
                imageMin.tl[0],
                imageMin.tl[1],
                imageMin.br[0],
                imageMin.br[1]
              );
              zoomOutArray.emplace(
                i,
                imageMid.tl[0],
                imageMid.tl[1],
                imageMid.br[0],
                imageMid.br[1],
                imageMax.tl[0],
                imageMax.tl[1],
                imageMax.br[0],
                imageMax.br[1]
              );
            }
          }
        }
        upload(context) {
          if (this.zoomInPaintVertexArray?.arrayBuffer && this.zoomOutPaintVertexArray?.arrayBuffer) {
            this.zoomInPaintVertexBuffer = context.createVertexBuffer(
              this.zoomInPaintVertexArray,
              this.paintVertexAttributes,
              this.expression.isStateDependent
            );
            this.zoomOutPaintVertexBuffer = context.createVertexBuffer(
              this.zoomOutPaintVertexArray,
              this.paintVertexAttributes,
              this.expression.isStateDependent
            );
          }
        }
        destroy() {
          if (this.zoomOutPaintVertexBuffer) this.zoomOutPaintVertexBuffer.destroy();
          if (this.zoomInPaintVertexBuffer) this.zoomInPaintVertexBuffer.destroy();
        }
        setUniforms(context, uniform) {
          uniform.set(0);
        }
        getBinding(context, location) {
          return new Uniform1f(context, location);
        }
      };
      var ProgramConfiguration = class _ProgramConfiguration {
        constructor() {
          this.binders = {};
          this.cacheKey = "";
          this._buffers = [];
          this._idMap = {};
          this._bufferOffset = 0;
        }
        static createDynamic(layer, zoom, filterProperties) {
          const self2 = new _ProgramConfiguration();
          const keys = [];
          for (const property in layer.paint._values) {
            if (!filterProperties(property)) continue;
            const value = layer.paint.get(property);
            if (!(value instanceof PossiblyEvaluatedPropertyValue) || !supportsPropertyExpression(value.property.specification)) {
              continue;
            }
            const names = paintAttributeNames(property, layer.type);
            const type = value.property.specification.type;
            const useIntegerZoom = value.property.useIntegerZoom;
            const isCrossFaded = value.property.specification["property-type"] === "cross-faded" || value.property.specification["property-type"] === "cross-faded-data-driven";
            if (isCrossFaded) {
              if (value.value.kind === "constant") {
                self2.binders[property] = new CrossFadedConstantBinder(value.value.value, names, type);
                keys.push(`/u_${property}`);
              } else {
                const StructArrayLayout = layoutType(property, type, "source");
                self2.binders[property] = new CrossFadedCompositeBinder(
                  value.value,
                  names,
                  type,
                  useIntegerZoom,
                  zoom,
                  StructArrayLayout,
                  layer.id
                );
                keys.push(`/a_${property}`);
              }
            } else if (value.value.kind === "constant") {
              self2.binders[property] = new ConstantBinder(value.value.value, names, type);
              keys.push(`/u_${property}`);
            } else if (value.value.kind === "source") {
              const StructArrayLayout = layoutType(property, type, "source");
              self2.binders[property] = new SourceExpressionBinder(value.value, names, type, StructArrayLayout);
              keys.push(`/a_${property}`);
            } else {
              const StructArrayLayout = layoutType(property, type, "composite");
              self2.binders[property] = new CompositeExpressionBinder(
                value.value,
                names,
                type,
                useIntegerZoom,
                zoom,
                StructArrayLayout
              );
              keys.push(`/z_${property}`);
            }
          }
          self2.cacheKey = keys.sort().join("");
          return self2;
        }
        populatePaintArrays(newLength, feature, index, imagePositions) {
          for (const property in this.binders) {
            const binder = this.binders[property];
            binder.populatePaintArray(newLength, feature, imagePositions);
          }
          if (feature.id) {
            const featureId = String(feature.id);
            this._idMap[featureId] = this._idMap[featureId] || [];
            this._idMap[featureId].push({
              index,
              start: this._bufferOffset,
              end: newLength
            });
          }
          this._bufferOffset = newLength;
        }
        setConstantPatternPositions(posTo, posFrom) {
          for (const property in this.binders) {
            const binder = this.binders[property];
            binder.setConstantPatternPositions(posTo, posFrom);
          }
        }
        updatePaintArrays(featureStates, vtLayer, layer, imagePositions) {
          let dirty = false;
          for (const id in featureStates) {
            const posArray = this._idMap[id];
            if (!posArray) continue;
            const featureState = featureStates[id];
            for (const pos of posArray) {
              const feature = vtLayer.feature(pos.index);
              for (const property in this.binders) {
                const binder = this.binders[property];
                if (binder instanceof ConstantBinder || binder instanceof CrossFadedConstantBinder) continue;
                if (binder.expression.isStateDependent === true) {
                  const value = layer.paint.get(property);
                  binder.expression = value.value;
                  binder.updatePaintArray(pos.start, pos.end, feature, featureState, imagePositions);
                  dirty = true;
                }
              }
            }
          }
          return dirty;
        }
        defines() {
          const result = [];
          for (const property in this.binders) {
            result.push.apply(result, this.binders[property].defines());
          }
          return result;
        }
        getPaintVertexBuffers() {
          return this._buffers;
        }
        getUniforms(context, locations) {
          const result = {};
          for (const property in this.binders) {
            const binder = this.binders[property];
            for (const name of binder.uniformNames) {
              result[name] = binder.getBinding(context, locations[name]);
            }
          }
          return result;
        }
        setUniforms(context, uniformBindings, properties, globals) {
          for (const property in this.binders) {
            const binder = this.binders[property];
            for (const uniformName of binder.uniformNames) {
              binder.setUniforms(context, uniformBindings[uniformName], globals, properties.get(property), uniformName);
            }
          }
        }
        updatePatternPaintBuffers(crossfade) {
          const buffers = [];
          for (const property in this.binders) {
            const binder = this.binders[property];
            if (binder instanceof CrossFadedCompositeBinder) {
              const patternVertexBuffer = crossfade.fromScale === 2 ? binder.zoomInPaintVertexBuffer : binder.zoomOutPaintVertexBuffer;
              if (patternVertexBuffer) buffers.push(patternVertexBuffer);
            } else if ((binder instanceof SourceExpressionBinder || binder instanceof CompositeExpressionBinder) && binder.paintVertexBuffer) {
              buffers.push(binder.paintVertexBuffer);
            }
          }
          this._buffers = buffers;
        }
        upload(context) {
          for (const property in this.binders) {
            this.binders[property].upload(context);
          }
          const buffers = [];
          for (const property in this.binders) {
            const binder = this.binders[property];
            if ((binder instanceof SourceExpressionBinder || binder instanceof CompositeExpressionBinder) && binder.paintVertexBuffer) {
              buffers.push(binder.paintVertexBuffer);
            }
          }
          this._buffers = buffers;
        }
        destroy() {
          for (const property in this.binders) {
            this.binders[property].destroy();
          }
        }
      };
      var ProgramConfigurationSet = class {
        constructor(layoutAttributes, layers, zoom, filterProperties = () => true) {
          this.programConfigurations = {};
          for (const layer of layers) {
            this.programConfigurations[layer.id] = ProgramConfiguration.createDynamic(layer, zoom, filterProperties);
            this.programConfigurations[layer.id].layoutAttributes = layoutAttributes;
          }
          this.needsUpload = false;
        }
        populatePaintArrays(length, feature, index, imagePositions) {
          for (const key in this.programConfigurations) {
            this.programConfigurations[key].populatePaintArrays(length, feature, index, imagePositions);
          }
          this.needsUpload = true;
        }
        updatePaintArrays(featureStates, vtLayer, layers, imagePositions) {
          for (const layer of layers) {
            this.needsUpload = this.programConfigurations[layer.id].updatePaintArrays(featureStates, vtLayer, layer, imagePositions) || this.needsUpload;
          }
        }
        get(layerId) {
          return this.programConfigurations[layerId];
        }
        upload(context) {
          if (!this.needsUpload) return;
          for (const layerId in this.programConfigurations) {
            this.programConfigurations[layerId].upload(context);
          }
          this.needsUpload = false;
        }
        destroy() {
          for (const layerId in this.programConfigurations) {
            this.programConfigurations[layerId].destroy();
          }
        }
      };
      function paintAttributeNames(property, type) {
        const attributeNameExceptions = {
          "text-opacity": ["opacity"],
          "icon-opacity": ["opacity"],
          "text-color": ["fill_color"],
          "icon-color": ["fill_color"],
          "text-halo-color": ["halo_color"],
          "icon-halo-color": ["halo_color"],
          "text-halo-blur": ["halo_blur"],
          "icon-halo-blur": ["halo_blur"],
          "text-halo-width": ["halo_width"],
          "icon-halo-width": ["halo_width"],
          "line-gap-width": ["gapwidth"],
          "line-pattern": ["pattern_to", "pattern_from"],
          "fill-pattern": ["pattern_to", "pattern_from"],
          "fill-extrusion-pattern": ["pattern_to", "pattern_from"]
        };
        return attributeNameExceptions[property] || [property.replace(`${type}-`, "").replace(/-/g, "_")];
      }
      function getLayoutException(property) {
        const propertyExceptions = {
          "line-pattern": {
            source: PatternLayoutArray,
            composite: PatternLayoutArray
          },
          "fill-pattern": {
            source: PatternLayoutArray,
            composite: PatternLayoutArray
          },
          "fill-extrusion-pattern": {
            source: PatternLayoutArray,
            composite: PatternLayoutArray
          }
        };
        return propertyExceptions[property];
      }
      function layoutType(property, type, binderType) {
        const defaultLayouts = {
          color: {
            source: StructArrayLayout2f8,
            composite: StructArrayLayout4f16
          },
          number: {
            source: StructArrayLayout1f4,
            composite: StructArrayLayout2f8
          }
        };
        const layoutException = getLayoutException(property);
        return layoutException?.[binderType] || defaultLayouts[type][binderType];
      }
      register("ConstantBinder", ConstantBinder);
      register("CrossFadedConstantBinder", CrossFadedConstantBinder);
      register("SourceExpressionBinder", SourceExpressionBinder);
      register("CrossFadedCompositeBinder", CrossFadedCompositeBinder);
      register("CompositeExpressionBinder", CompositeExpressionBinder);
      register("ProgramConfiguration", ProgramConfiguration, { omit: ["_buffers"] });
      register("ProgramConfigurationSet", ProgramConfigurationSet);
      ProgramConfiguration.ProgramConfigurationSet = ProgramConfigurationSet;
      module.exports = ProgramConfiguration;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/index_array_type.js
  var require_index_array_type = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/index_array_type.js"(exports, module) {
      var { LineIndexArray, TriangleIndexArray, LineStripIndexArray } = require_array_types();
      module.exports = {
        LineIndexArray,
        TriangleIndexArray,
        LineStripIndexArray
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/extent.js
  var require_extent = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/extent.js"(exports, module) {
      module.exports = 8192;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/load_geometry.js
  var require_load_geometry = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/load_geometry.js"(exports, module) {
      var warn = require_warn();
      var EXTENT = require_extent();
      function createBounds(bits) {
        return {
          min: -1 * 2 ** (bits - 1),
          max: 2 ** (bits - 1) - 1
        };
      }
      var bounds = createBounds(16);
      module.exports = function loadGeometry(feature) {
        const scale = EXTENT / feature.extent;
        const geometry = feature.loadGeometry();
        for (let r = 0; r < geometry.length; r++) {
          const ring = geometry[r];
          for (let p = 0; p < ring.length; p++) {
            const point = ring[p];
            point.x = Math.round(point.x * scale);
            point.y = Math.round(point.y * scale);
            if (point.x < bounds.min || point.x > bounds.max || point.y < bounds.min || point.y > bounds.max) {
              warn.once("Geometry exceeds allowed extent, reduce your vector tile buffer size");
            }
          }
        }
        return geometry;
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/circle_bucket.js
  var require_circle_bucket = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/circle_bucket.js"(exports, module) {
      var { CircleLayoutArray } = require_array_types();
      var { members: layoutAttributes } = require_circle_attributes();
      var SegmentVector = require_segment();
      var { ProgramConfigurationSet } = require_program_configuration();
      var { TriangleIndexArray } = require_index_array_type();
      var loadGeometry = require_load_geometry();
      var EXTENT = require_extent();
      var { register } = require_transfer_registry();
      var EvaluationParameters = require_evaluation_parameters();
      function addCircleVertex(layoutVertexArray, x, y, extrudeX, extrudeY) {
        layoutVertexArray.emplaceBack(x * 2 + (extrudeX + 1) / 2, y * 2 + (extrudeY + 1) / 2);
      }
      var CircleBucket = class {
        constructor(options) {
          this.zoom = options.zoom;
          this.overscaling = options.overscaling;
          this.layers = options.layers;
          this.layerIds = this.layers.map((layer) => layer.id);
          this.index = options.index;
          this.hasPattern = false;
          this.layoutVertexArray = new CircleLayoutArray();
          this.indexArray = new TriangleIndexArray();
          this.segments = new SegmentVector();
          this.programConfigurations = new ProgramConfigurationSet(layoutAttributes, options.layers, options.zoom);
        }
        populate(features, options) {
          for (const { feature, index, sourceLayerIndex } of features) {
            if (this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) {
              const geometry = loadGeometry(feature);
              this.addFeature(feature, geometry, index);
              options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index);
            }
          }
        }
        update(states, vtLayer, imagePositions) {
          if (!this.stateDependentLayers.length) return;
          this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
        }
        isEmpty() {
          return this.layoutVertexArray.length === 0;
        }
        uploadPending() {
          return !this.uploaded || this.programConfigurations.needsUpload;
        }
        upload(context) {
          if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, layoutAttributes);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
          }
          this.programConfigurations.upload(context);
          this.uploaded = true;
        }
        destroy() {
          if (!this.layoutVertexBuffer) return;
          this.layoutVertexBuffer.destroy();
          this.indexBuffer.destroy();
          this.programConfigurations.destroy();
          this.segments.destroy();
        }
        addFeature(feature, geometry, index) {
          for (const ring of geometry) {
            for (const point of ring) {
              const x = point.x;
              const y = point.y;
              if (x < 0 || x >= EXTENT || y < 0 || y >= EXTENT) continue;
              const segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
              const index2 = segment.vertexLength;
              addCircleVertex(this.layoutVertexArray, x, y, -1, -1);
              addCircleVertex(this.layoutVertexArray, x, y, 1, -1);
              addCircleVertex(this.layoutVertexArray, x, y, 1, 1);
              addCircleVertex(this.layoutVertexArray, x, y, -1, 1);
              this.indexArray.emplaceBack(index2, index2 + 1, index2 + 2);
              this.indexArray.emplaceBack(index2, index2 + 3, index2 + 2);
              segment.vertexLength += 4;
              segment.primitiveLength += 2;
            }
          }
          this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, {});
        }
      };
      register("CircleBucket", CircleBucket, { omit: ["layers"] });
      module.exports = CircleBucket;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/intersection_tests.js
  var require_intersection_tests = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/intersection_tests.js"(exports, module) {
      var { isCounterClockwise } = require_util();
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      module.exports = {
        polygonIntersectsBufferedPoint,
        polygonIntersectsMultiPolygon,
        polygonIntersectsBufferedMultiLine,
        polygonIntersectsPolygon,
        distToSegmentSquared,
        polygonIntersectsBox
      };
      function polygonIntersectsPolygon(polygonA, polygonB) {
        for (let i = 0; i < polygonA.length; i++) {
          if (polygonContainsPoint(polygonB, polygonA[i])) return true;
        }
        for (let i = 0; i < polygonB.length; i++) {
          if (polygonContainsPoint(polygonA, polygonB[i])) return true;
        }
        if (lineIntersectsLine(polygonA, polygonB)) return true;
        return false;
      }
      function polygonIntersectsBufferedPoint(polygon, point, radius) {
        if (polygonContainsPoint(polygon, point)) return true;
        if (pointIntersectsBufferedLine(point, polygon, radius)) return true;
        return false;
      }
      function polygonIntersectsMultiPolygon(polygon, multiPolygon) {
        if (polygon.length === 1) {
          return multiPolygonContainsPoint(multiPolygon, polygon[0]);
        }
        for (let m = 0; m < multiPolygon.length; m++) {
          const ring = multiPolygon[m];
          for (let n = 0; n < ring.length; n++) {
            if (polygonContainsPoint(polygon, ring[n])) return true;
          }
        }
        for (let i = 0; i < polygon.length; i++) {
          if (multiPolygonContainsPoint(multiPolygon, polygon[i])) return true;
        }
        for (let k = 0; k < multiPolygon.length; k++) {
          if (lineIntersectsLine(polygon, multiPolygon[k])) return true;
        }
        return false;
      }
      function polygonIntersectsBufferedMultiLine(polygon, multiLine, radius) {
        for (let i = 0; i < multiLine.length; i++) {
          const line = multiLine[i];
          if (polygon.length >= 3) {
            for (let k = 0; k < line.length; k++) {
              if (polygonContainsPoint(polygon, line[k])) return true;
            }
          }
          if (lineIntersectsBufferedLine(polygon, line, radius)) return true;
        }
        return false;
      }
      function lineIntersectsBufferedLine(lineA, lineB, radius) {
        if (lineA.length > 1) {
          if (lineIntersectsLine(lineA, lineB)) return true;
          for (let j = 0; j < lineB.length; j++) {
            if (pointIntersectsBufferedLine(lineB[j], lineA, radius)) return true;
          }
        }
        for (let k = 0; k < lineA.length; k++) {
          if (pointIntersectsBufferedLine(lineA[k], lineB, radius)) return true;
        }
        return false;
      }
      function lineIntersectsLine(lineA, lineB) {
        if (lineA.length === 0 || lineB.length === 0) return false;
        for (let i = 0; i < lineA.length - 1; i++) {
          const a0 = lineA[i];
          const a1 = lineA[i + 1];
          for (let j = 0; j < lineB.length - 1; j++) {
            const b0 = lineB[j];
            const b1 = lineB[j + 1];
            if (lineSegmentIntersectsLineSegment(a0, a1, b0, b1)) return true;
          }
        }
        return false;
      }
      function lineSegmentIntersectsLineSegment(a0, a1, b0, b1) {
        return isCounterClockwise(a0, b0, b1) !== isCounterClockwise(a1, b0, b1) && isCounterClockwise(a0, a1, b0) !== isCounterClockwise(a0, a1, b1);
      }
      function pointIntersectsBufferedLine(p, line, radius) {
        const radiusSquared = radius * radius;
        if (line.length === 1) return p.distSqr(line[0]) < radiusSquared;
        for (let i = 1; i < line.length; i++) {
          const v = line[i - 1];
          const w = line[i];
          if (distToSegmentSquared(p, v, w) < radiusSquared) return true;
        }
        return false;
      }
      function distToSegmentSquared(p, v, w) {
        const l2 = v.distSqr(w);
        if (l2 === 0) return p.distSqr(v);
        const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) return p.distSqr(v);
        if (t > 1) return p.distSqr(w);
        return p.distSqr(w.sub(v)._mult(t)._add(v));
      }
      function multiPolygonContainsPoint(rings, p) {
        let c = false;
        let ring;
        let p1;
        let p2;
        for (let k = 0; k < rings.length; k++) {
          ring = rings[k];
          for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            p1 = ring[i];
            p2 = ring[j];
            if (p1.y > p.y !== p2.y > p.y && p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x) {
              c = !c;
            }
          }
        }
        return c;
      }
      function polygonContainsPoint(ring, p) {
        let c = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const p1 = ring[i];
          const p2 = ring[j];
          if (p1.y > p.y !== p2.y > p.y && p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x) {
            c = !c;
          }
        }
        return c;
      }
      function polygonIntersectsBox(ring, boxX1, boxY1, boxX2, boxY2) {
        for (const p of ring) {
          if (boxX1 <= p.x && boxY1 <= p.y && boxX2 >= p.x && boxY2 >= p.y) return true;
        }
        const corners = [new Point2(boxX1, boxY1), new Point2(boxX1, boxY2), new Point2(boxX2, boxY2), new Point2(boxX2, boxY1)];
        if (ring.length > 2) {
          for (const corner of corners) {
            if (polygonContainsPoint(ring, corner)) return true;
          }
        }
        for (let i = 0; i < ring.length - 1; i++) {
          const p1 = ring[i];
          const p2 = ring[i + 1];
          if (edgeIntersectsBox(p1, p2, corners)) return true;
        }
        return false;
      }
      function edgeIntersectsBox(e1, e2, corners) {
        const tl = corners[0];
        const br = corners[2];
        if (e1.x < tl.x && e2.x < tl.x || e1.x > br.x && e2.x > br.x || e1.y < tl.y && e2.y < tl.y || e1.y > br.y && e2.y > br.y)
          return false;
        const dir = isCounterClockwise(e1, e2, corners[0]);
        return dir !== isCounterClockwise(e1, e2, corners[1]) || dir !== isCounterClockwise(e1, e2, corners[2]) || dir !== isCounterClockwise(e1, e2, corners[3]);
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/query_utils.js
  var require_query_utils = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/query_utils.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      module.exports = {
        getMaximumPaintValue,
        translateDistance,
        translate
      };
      function getMaximumPaintValue(property, layer, bucket) {
        const value = layer.paint.get(property).value;
        if (value.kind === "constant") {
          return value.value;
        }
        const binders = bucket.programConfigurations.get(layer.id).binders;
        return binders[property].maxValue;
      }
      function translateDistance(translate2) {
        return Math.sqrt(translate2[0] * translate2[0] + translate2[1] * translate2[1]);
      }
      function translate(queryGeometry, translate2, translateAnchor, bearing, pixelsToTileUnits) {
        if (!translate2[0] && !translate2[1]) {
          return queryGeometry;
        }
        const pt = Point2.convert(translate2);
        if (translateAnchor === "viewport") {
          pt._rotate(-bearing);
        }
        const translated = [];
        for (let i = 0; i < queryGeometry.length; i++) {
          const point = queryGeometry[i];
          translated.push(point.sub(pt._mult(pixelsToTileUnits)));
        }
        return translated;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/circle_style_layer_properties.js
  var require_circle_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/circle_style_layer_properties.js"(exports, module) {
      var { Properties, DataConstantProperty, DataDrivenProperty } = require_properties2();
      var paint = new Properties({
        "circle-radius": new DataDrivenProperty({
          type: "number",
          default: 5,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "circle-color": new DataDrivenProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "circle-blur": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "circle-opacity": new DataDrivenProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "circle-translate": new DataConstantProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "circle-translate-anchor": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "map",
          expression: { parameters: ["zoom"] }
        }),
        "circle-pitch-scale": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "map",
          expression: { parameters: ["zoom"] }
        }),
        "circle-pitch-alignment": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "viewport",
          expression: { parameters: ["zoom"] }
        }),
        "circle-stroke-width": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "circle-stroke-color": new DataDrivenProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "circle-stroke-opacity": new DataDrivenProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        })
      });
      module.exports = { paint };
    }
  });

  // node_modules/@mapbox/gl-matrix/dist/gl-matrix.js
  var require_gl_matrix = __commonJS({
    "node_modules/@mapbox/gl-matrix/dist/gl-matrix.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.glMatrix = factory();
      })(exports, function() {
        "use strict";
        function create() {
          var out = new Float32Array(3);
          out[0] = 0;
          out[1] = 0;
          out[2] = 0;
          return out;
        }
        function transformMat3(out, a, m) {
          var x = a[0], y = a[1], z = a[2];
          out[0] = x * m[0] + y * m[3] + z * m[6];
          out[1] = x * m[1] + y * m[4] + z * m[7];
          out[2] = x * m[2] + y * m[5] + z * m[8];
          return out;
        }
        var vec = create();
        function create$1() {
          var out = new Float32Array(4);
          out[0] = 0;
          out[1] = 0;
          out[2] = 0;
          out[3] = 0;
          return out;
        }
        function scale$1(out, a, b) {
          out[0] = a[0] * b;
          out[1] = a[1] * b;
          out[2] = a[2] * b;
          out[3] = a[3] * b;
          return out;
        }
        function normalize$1(out, a) {
          var x = a[0], y = a[1], z = a[2], w = a[3];
          var len = x * x + y * y + z * z + w * w;
          if (len > 0) {
            len = 1 / Math.sqrt(len);
            out[0] = x * len;
            out[1] = y * len;
            out[2] = z * len;
            out[3] = w * len;
          }
          return out;
        }
        function transformMat4$1(out, a, m) {
          var x = a[0], y = a[1], z = a[2], w = a[3];
          out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
          out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
          out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
          out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
          return out;
        }
        var vec$1 = create$1();
        function create$2() {
          var out = new Float32Array(4);
          out[0] = 1;
          out[1] = 0;
          out[2] = 0;
          out[3] = 1;
          return out;
        }
        function rotate(out, a, rad) {
          var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], s = Math.sin(rad), c = Math.cos(rad);
          out[0] = a0 * c + a2 * s;
          out[1] = a1 * c + a3 * s;
          out[2] = a0 * -s + a2 * c;
          out[3] = a1 * -s + a3 * c;
          return out;
        }
        function scale$2(out, a, v) {
          var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], v0 = v[0], v1 = v[1];
          out[0] = a0 * v0;
          out[1] = a1 * v0;
          out[2] = a2 * v1;
          out[3] = a3 * v1;
          return out;
        }
        function create$3() {
          var out = new Float32Array(9);
          out[0] = 1;
          out[1] = 0;
          out[2] = 0;
          out[3] = 0;
          out[4] = 1;
          out[5] = 0;
          out[6] = 0;
          out[7] = 0;
          out[8] = 1;
          return out;
        }
        function fromRotation$1(out, rad) {
          var s = Math.sin(rad), c = Math.cos(rad);
          out[0] = c;
          out[1] = s;
          out[2] = 0;
          out[3] = -s;
          out[4] = c;
          out[5] = 0;
          out[6] = 0;
          out[7] = 0;
          out[8] = 1;
          return out;
        }
        function create$4() {
          var out = new Float32Array(16);
          out[0] = 1;
          out[1] = 0;
          out[2] = 0;
          out[3] = 0;
          out[4] = 0;
          out[5] = 1;
          out[6] = 0;
          out[7] = 0;
          out[8] = 0;
          out[9] = 0;
          out[10] = 1;
          out[11] = 0;
          out[12] = 0;
          out[13] = 0;
          out[14] = 0;
          out[15] = 1;
          return out;
        }
        function identity$2(out) {
          out[0] = 1;
          out[1] = 0;
          out[2] = 0;
          out[3] = 0;
          out[4] = 0;
          out[5] = 1;
          out[6] = 0;
          out[7] = 0;
          out[8] = 0;
          out[9] = 0;
          out[10] = 1;
          out[11] = 0;
          out[12] = 0;
          out[13] = 0;
          out[14] = 0;
          out[15] = 1;
          return out;
        }
        function invert$2(out, a) {
          var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
          if (!det) {
            return null;
          }
          det = 1 / det;
          out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
          out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
          out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
          out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
          out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
          out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
          out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
          out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
          out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
          out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
          out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
          out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
          out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
          out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
          out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
          out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
          return out;
        }
        function multiply$4(out, a, b) {
          var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
          var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
          out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
          out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
          out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
          out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
          b0 = b[4];
          b1 = b[5];
          b2 = b[6];
          b3 = b[7];
          out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
          out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
          out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
          out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
          b0 = b[8];
          b1 = b[9];
          b2 = b[10];
          b3 = b[11];
          out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
          out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
          out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
          out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
          b0 = b[12];
          b1 = b[13];
          b2 = b[14];
          b3 = b[15];
          out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
          out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
          out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
          out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
          return out;
        }
        function translate$1(out, a, v) {
          var x = v[0], y = v[1], z = v[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
          if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
          } else {
            a00 = a[0];
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a10 = a[4];
            a11 = a[5];
            a12 = a[6];
            a13 = a[7];
            a20 = a[8];
            a21 = a[9];
            a22 = a[10];
            a23 = a[11];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a03;
            out[4] = a10;
            out[5] = a11;
            out[6] = a12;
            out[7] = a13;
            out[8] = a20;
            out[9] = a21;
            out[10] = a22;
            out[11] = a23;
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
          }
          return out;
        }
        function scale$4(out, a, v) {
          var x = v[0], y = v[1], z = v[2];
          out[0] = a[0] * x;
          out[1] = a[1] * x;
          out[2] = a[2] * x;
          out[3] = a[3] * x;
          out[4] = a[4] * y;
          out[5] = a[5] * y;
          out[6] = a[6] * y;
          out[7] = a[7] * y;
          out[8] = a[8] * z;
          out[9] = a[9] * z;
          out[10] = a[10] * z;
          out[11] = a[11] * z;
          out[12] = a[12];
          out[13] = a[13];
          out[14] = a[14];
          out[15] = a[15];
          return out;
        }
        function rotateX$1(out, a, rad) {
          var s = Math.sin(rad), c = Math.cos(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
          if (a !== out) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
          }
          out[4] = a10 * c + a20 * s;
          out[5] = a11 * c + a21 * s;
          out[6] = a12 * c + a22 * s;
          out[7] = a13 * c + a23 * s;
          out[8] = a20 * c - a10 * s;
          out[9] = a21 * c - a11 * s;
          out[10] = a22 * c - a12 * s;
          out[11] = a23 * c - a13 * s;
          return out;
        }
        function rotateZ$1(out, a, rad) {
          var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
          if (a !== out) {
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
          }
          out[0] = a00 * c + a10 * s;
          out[1] = a01 * c + a11 * s;
          out[2] = a02 * c + a12 * s;
          out[3] = a03 * c + a13 * s;
          out[4] = a10 * c - a00 * s;
          out[5] = a11 * c - a01 * s;
          out[6] = a12 * c - a02 * s;
          out[7] = a13 * c - a03 * s;
          return out;
        }
        function perspective(out, fovy, aspect, near, far) {
          var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
          out[0] = f / aspect;
          out[1] = 0;
          out[2] = 0;
          out[3] = 0;
          out[4] = 0;
          out[5] = f;
          out[6] = 0;
          out[7] = 0;
          out[8] = 0;
          out[9] = 0;
          out[10] = (far + near) * nf;
          out[11] = -1;
          out[12] = 0;
          out[13] = 0;
          out[14] = 2 * far * near * nf;
          out[15] = 0;
          return out;
        }
        function ortho(out, left, right, bottom, top, near, far) {
          var lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
          out[0] = -2 * lr;
          out[1] = 0;
          out[2] = 0;
          out[3] = 0;
          out[4] = 0;
          out[5] = -2 * bt;
          out[6] = 0;
          out[7] = 0;
          out[8] = 0;
          out[9] = 0;
          out[10] = 2 * nf;
          out[11] = 0;
          out[12] = (left + right) * lr;
          out[13] = (top + bottom) * bt;
          out[14] = (far + near) * nf;
          out[15] = 1;
          return out;
        }
        var mapboxBuild = {
          vec3: {
            transformMat3
          },
          vec4: {
            transformMat4: transformMat4$1
          },
          mat2: {
            create: create$2,
            rotate,
            scale: scale$2
          },
          mat3: {
            create: create$3,
            fromRotation: fromRotation$1
          },
          mat4: {
            create: create$4,
            identity: identity$2,
            translate: translate$1,
            scale: scale$4,
            multiply: multiply$4,
            perspective,
            rotateX: rotateX$1,
            rotateZ: rotateZ$1,
            invert: invert$2,
            ortho
          }
        };
        return mapboxBuild;
      });
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/circle_style_layer.js
  var require_circle_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/circle_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var CircleBucket = require_circle_bucket();
      var { polygonIntersectsBufferedPoint } = require_intersection_tests();
      var { getMaximumPaintValue, translateDistance, translate } = require_query_utils();
      var properties = require_circle_style_layer_properties();
      var { vec4 } = require_gl_matrix();
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var CircleStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
        createBucket(parameters) {
          return new CircleBucket(parameters);
        }
        queryRadius(bucket) {
          const circleBucket = bucket;
          return getMaximumPaintValue("circle-radius", this, circleBucket) + getMaximumPaintValue("circle-stroke-width", this, circleBucket) + translateDistance(this.paint.get("circle-translate"));
        }
        queryIntersectsFeature(queryGeometry, feature, featureState, geometry, zoom, transform, pixelsToTileUnits, pixelPosMatrix) {
          const translatedPolygon = translate(
            queryGeometry,
            this.paint.get("circle-translate"),
            this.paint.get("circle-translate-anchor"),
            transform.angle,
            pixelsToTileUnits
          );
          const radius = this.paint.get("circle-radius").evaluate(feature, featureState);
          const stroke = this.paint.get("circle-stroke-width").evaluate(feature, featureState);
          const size = radius + stroke;
          const alignWithMap = this.paint.get("circle-pitch-alignment") === "map";
          const transformedPolygon = alignWithMap ? translatedPolygon : projectQueryGeometry(translatedPolygon, pixelPosMatrix);
          const transformedSize = alignWithMap ? size * pixelsToTileUnits : size;
          for (const ring of geometry) {
            for (const point of ring) {
              const transformedPoint = alignWithMap ? point : projectPoint(point, pixelPosMatrix);
              let adjustedSize = transformedSize;
              const projectedCenter = vec4.transformMat4([], [point.x, point.y, 0, 1], pixelPosMatrix);
              if (this.paint.get("circle-pitch-scale") === "viewport" && this.paint.get("circle-pitch-alignment") === "map") {
                adjustedSize *= projectedCenter[3] / transform.cameraToCenterDistance;
              } else if (this.paint.get("circle-pitch-scale") === "map" && this.paint.get("circle-pitch-alignment") === "viewport") {
                adjustedSize *= transform.cameraToCenterDistance / projectedCenter[3];
              }
              if (polygonIntersectsBufferedPoint(transformedPolygon, transformedPoint, adjustedSize)) return true;
            }
          }
          return false;
        }
      };
      function projectPoint(p, pixelPosMatrix) {
        const point = vec4.transformMat4([], [p.x, p.y, 0, 1], pixelPosMatrix);
        return new Point2(point[0] / point[3], point[1] / point[3]);
      }
      function projectQueryGeometry(queryGeometry, pixelPosMatrix) {
        return queryGeometry.map((p) => {
          return projectPoint(p, pixelPosMatrix);
        });
      }
      module.exports = CircleStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/heatmap_bucket.js
  var require_heatmap_bucket = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/heatmap_bucket.js"(exports, module) {
      var CircleBucket = require_circle_bucket();
      var { register } = require_transfer_registry();
      var HeatmapBucket = class extends CircleBucket {
        // Needed for flow to accept omit: ['layers'] below, due to
        // https://github.com/facebook/flow/issues/4262
      };
      register("HeatmapBucket", HeatmapBucket, { omit: ["layers"] });
      module.exports = HeatmapBucket;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/heatmap_style_layer_properties.js
  var require_heatmap_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/heatmap_style_layer_properties.js"(exports, module) {
      var { Properties, ColorRampProperty, DataConstantProperty, DataDrivenProperty } = require_properties2();
      var paint = new Properties({
        "heatmap-radius": new DataDrivenProperty({
          type: "number",
          default: 30,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "heatmap-weight": new DataDrivenProperty({
          type: "number",
          default: 1,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "heatmap-intensity": new DataConstantProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "heatmap-color": new ColorRampProperty({
          type: "color",
          default: [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 255, 0)",
            0.1,
            "royalblue",
            0.3,
            "cyan",
            0.5,
            "lime",
            0.7,
            "yellow",
            1,
            "red"
          ],
          expression: { interpolated: true, parameters: ["heatmap-density"] }
        }),
        "heatmap-opacity": new DataConstantProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        })
      });
      module.exports = { paint };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/image.js
  var require_image = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/image.js"(exports, module) {
      var assert = require_nanoassert();
      var { register } = require_transfer_registry();
      function createImage(image, { width, height }, channels, data) {
        if (!data) {
          data = new Uint8Array(width * height * channels);
        } else if (data.length !== width * height * channels) {
          throw new RangeError("mismatched image size");
        }
        image.width = width;
        image.height = height;
        image.data = data;
        return image;
      }
      function resizeImage(image, { width, height }, channels) {
        if (width === image.width && height === image.height) {
          return;
        }
        const newImage = createImage({}, { width, height }, channels);
        copyImage(
          image,
          newImage,
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          {
            width: Math.min(image.width, width),
            height: Math.min(image.height, height)
          },
          channels
        );
        image.width = width;
        image.height = height;
        image.data = newImage.data;
      }
      function copyImage(srcImg, dstImg, srcPt, dstPt, size, channels) {
        if (size.width === 0 || size.height === 0) {
          return dstImg;
        }
        if (size.width > srcImg.width || size.height > srcImg.height || srcPt.x > srcImg.width - size.width || srcPt.y > srcImg.height - size.height) {
          throw new RangeError("out of range source coordinates for image copy");
        }
        if (size.width > dstImg.width || size.height > dstImg.height || dstPt.x > dstImg.width - size.width || dstPt.y > dstImg.height - size.height) {
          throw new RangeError("out of range destination coordinates for image copy");
        }
        const srcData = srcImg.data;
        const dstData = dstImg.data;
        assert(srcData !== dstData);
        for (let y = 0; y < size.height; y++) {
          const srcOffset = ((srcPt.y + y) * srcImg.width + srcPt.x) * channels;
          const dstOffset = ((dstPt.y + y) * dstImg.width + dstPt.x) * channels;
          for (let i = 0; i < size.width * channels; i++) {
            dstData[dstOffset + i] = srcData[srcOffset + i];
          }
        }
        return dstImg;
      }
      var AlphaImage = class _AlphaImage {
        constructor(size, data) {
          createImage(this, size, 1, data);
        }
        resize(size) {
          resizeImage(this, size, 1);
        }
        clone() {
          return new _AlphaImage({ width: this.width, height: this.height }, new Uint8Array(this.data));
        }
        static copy(srcImg, dstImg, srcPt, dstPt, size) {
          copyImage(srcImg, dstImg, srcPt, dstPt, size, 1);
        }
      };
      var RGBAImage = class _RGBAImage {
        constructor(size, data) {
          createImage(this, size, 4, data);
        }
        resize(size) {
          resizeImage(this, size, 4);
        }
        clone() {
          return new _RGBAImage({ width: this.width, height: this.height }, new Uint8Array(this.data));
        }
        static copy(srcImg, dstImg, srcPt, dstPt, size) {
          copyImage(srcImg, dstImg, srcPt, dstPt, size, 4);
        }
      };
      register("AlphaImage", AlphaImage);
      register("RGBAImage", RGBAImage);
      module.exports = {
        AlphaImage,
        RGBAImage
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/color_ramp.js
  var require_color_ramp = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/color_ramp.js"(exports, module) {
      var { RGBAImage } = require_image();
      module.exports = function renderColorRamp(expression, colorRampEvaluationParameter) {
        const colorRampData = new Uint8Array(256 * 4);
        const evaluationGlobals = {};
        for (let i = 0, j = 0; i < 256; i++, j += 4) {
          evaluationGlobals[colorRampEvaluationParameter] = i / 255;
          const pxColor = expression.evaluate(evaluationGlobals);
          colorRampData[j + 0] = Math.floor(pxColor.r * 255 / pxColor.a);
          colorRampData[j + 1] = Math.floor(pxColor.g * 255 / pxColor.a);
          colorRampData[j + 2] = Math.floor(pxColor.b * 255 / pxColor.a);
          colorRampData[j + 3] = Math.floor(pxColor.a * 255);
        }
        return new RGBAImage({ width: 256, height: 1 }, colorRampData);
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/heatmap_style_layer.js
  var require_heatmap_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/heatmap_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var HeatmapBucket = require_heatmap_bucket();
      var properties = require_heatmap_style_layer_properties();
      var renderColorRamp = require_color_ramp();
      var HeatmapStyleLayer = class extends StyleLayer {
        createBucket(options) {
          return new HeatmapBucket(options);
        }
        constructor(layer) {
          super(layer, properties);
          this._updateColorRamp();
        }
        _handleSpecialPaintPropertyUpdate(name) {
          if (name === "heatmap-color") {
            this._updateColorRamp();
          }
        }
        _updateColorRamp() {
          const expression = this._transitionablePaint._values["heatmap-color"].value.expression;
          this.colorRamp = renderColorRamp(expression, "heatmapDensity");
          this.colorRampTexture = null;
        }
        resize() {
          if (this.heatmapFbo) {
            this.heatmapFbo.destroy();
            this.heatmapFbo = null;
          }
        }
        queryRadius() {
          return 0;
        }
        queryIntersectsFeature() {
          return false;
        }
        hasOffscreenPass() {
          return this.paint.get("heatmap-opacity") !== 0 && this.visibility !== "none";
        }
      };
      module.exports = HeatmapStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/hillshade_style_layer_properties.js
  var require_hillshade_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/hillshade_style_layer_properties.js"(exports, module) {
      var { Properties, DataConstantProperty } = require_properties2();
      var paint = new Properties({
        "hillshade-illumination-direction": new DataConstantProperty({
          type: "number",
          default: 335,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "hillshade-illumination-anchor": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "viewport",
          expression: { parameters: ["zoom"] }
        }),
        "hillshade-exaggeration": new DataConstantProperty({
          type: "number",
          default: 0.5,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "hillshade-shadow-color": new DataConstantProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "hillshade-highlight-color": new DataConstantProperty({
          type: "color",
          default: "#FFFFFF",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "hillshade-accent-color": new DataConstantProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        })
      });
      module.exports = { paint };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/hillshade_style_layer.js
  var require_hillshade_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/hillshade_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var properties = require_hillshade_style_layer_properties();
      var HillshadeStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
        hasOffscreenPass() {
          return this.paint.get("hillshade-exaggeration") !== 0 && this.visibility !== "none";
        }
      };
      module.exports = HillshadeStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_attributes.js
  var require_fill_attributes = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_attributes.js"(exports, module) {
      var { createLayout } = require_struct_array();
      var layout = createLayout([{ name: "a_pos", components: 2, type: "Int16" }], 4);
      module.exports = layout;
    }
  });

  // node_modules/earcut/src/earcut.js
  var earcut_exports = {};
  __export(earcut_exports, {
    default: () => earcut,
    deviation: () => deviation,
    flatten: () => flatten
  });
  function earcut(data, holeIndices, dim = 2) {
    const hasHoles = holeIndices && holeIndices.length;
    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
    let outerNode = linkedList(data, 0, outerLen, dim, true);
    const triangles = [];
    if (!outerNode || outerNode.next === outerNode.prev) return triangles;
    let minX, minY, invSize;
    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
    if (data.length > 80 * dim) {
      minX = data[0];
      minY = data[1];
      let maxX = minX;
      let maxY = minY;
      for (let i = dim; i < outerLen; i += dim) {
        const x = data[i];
        const y = data[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      invSize = Math.max(maxX - minX, maxY - minY);
      invSize = invSize !== 0 ? 32767 / invSize : 0;
    }
    earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
    return triangles;
  }
  function linkedList(data, start, end, dim, clockwise) {
    let last;
    if (clockwise === signedArea(data, start, end, dim) > 0) {
      for (let i = start; i < end; i += dim) last = insertNode(i / dim | 0, data[i], data[i + 1], last);
    } else {
      for (let i = end - dim; i >= start; i -= dim) last = insertNode(i / dim | 0, data[i], data[i + 1], last);
    }
    if (last && equals(last, last.next)) {
      removeNode(last);
      last = last.next;
    }
    return last;
  }
  function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;
    let p = start, again;
    do {
      again = false;
      if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
        removeNode(p);
        p = end = p.prev;
        if (p === p.next) break;
        again = true;
      } else {
        p = p.next;
      }
    } while (again || p !== end);
    return end;
  }
  function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);
    let stop = ear;
    while (ear.prev !== ear.next) {
      const prev = ear.prev;
      const next = ear.next;
      if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
        triangles.push(prev.i, ear.i, next.i);
        removeNode(ear);
        ear = next.next;
        stop = next.next;
        continue;
      }
      ear = next;
      if (ear === stop) {
        if (!pass) {
          earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
        } else if (pass === 1) {
          ear = cureLocalIntersections(filterPoints(ear), triangles);
          earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
        } else if (pass === 2) {
          splitEarcut(ear, triangles, dim, minX, minY, invSize);
        }
        break;
      }
    }
  }
  function isEar(ear) {
    const a = ear.prev, b = ear, c = ear.next;
    if (area(a, b, c) >= 0) return false;
    const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
    const x0 = Math.min(ax, bx, cx), y0 = Math.min(ay, by, cy), x1 = Math.max(ax, bx, cx), y1 = Math.max(ay, by, cy);
    let p = c.next;
    while (p !== a) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
      p = p.next;
    }
    return true;
  }
  function isEarHashed(ear, minX, minY, invSize) {
    const a = ear.prev, b = ear, c = ear.next;
    if (area(a, b, c) >= 0) return false;
    const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
    const x0 = Math.min(ax, bx, cx), y0 = Math.min(ay, by, cy), x1 = Math.max(ax, bx, cx), y1 = Math.max(ay, by, cy);
    const minZ = zOrder(x0, y0, minX, minY, invSize), maxZ = zOrder(x1, y1, minX, minY, invSize);
    let p = ear.prevZ, n = ear.nextZ;
    while (p && p.z >= minZ && n && n.z <= maxZ) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
      p = p.prevZ;
      if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
      n = n.nextZ;
    }
    while (p && p.z >= minZ) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
      p = p.prevZ;
    }
    while (n && n.z <= maxZ) {
      if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
      n = n.nextZ;
    }
    return true;
  }
  function cureLocalIntersections(start, triangles) {
    let p = start;
    do {
      const a = p.prev, b = p.next.next;
      if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
        triangles.push(a.i, p.i, b.i);
        removeNode(p);
        removeNode(p.next);
        p = start = b;
      }
      p = p.next;
    } while (p !== start);
    return filterPoints(p);
  }
  function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    let a = start;
    do {
      let b = a.next.next;
      while (b !== a.prev) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          let c = splitPolygon(a, b);
          a = filterPoints(a, a.next);
          c = filterPoints(c, c.next);
          earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
          earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
          return;
        }
        b = b.next;
      }
      a = a.next;
    } while (a !== start);
  }
  function eliminateHoles(data, holeIndices, outerNode, dim) {
    const queue = [];
    for (let i = 0, len = holeIndices.length; i < len; i++) {
      const start = holeIndices[i] * dim;
      const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
      const list = linkedList(data, start, end, dim, false);
      if (list === list.next) list.steiner = true;
      queue.push(getLeftmost(list));
    }
    queue.sort(compareXYSlope);
    for (let i = 0; i < queue.length; i++) {
      outerNode = eliminateHole(queue[i], outerNode);
    }
    return outerNode;
  }
  function compareXYSlope(a, b) {
    let result = a.x - b.x;
    if (result === 0) {
      result = a.y - b.y;
      if (result === 0) {
        const aSlope = (a.next.y - a.y) / (a.next.x - a.x);
        const bSlope = (b.next.y - b.y) / (b.next.x - b.x);
        result = aSlope - bSlope;
      }
    }
    return result;
  }
  function eliminateHole(hole, outerNode) {
    const bridge = findHoleBridge(hole, outerNode);
    if (!bridge) {
      return outerNode;
    }
    const bridgeReverse = splitPolygon(bridge, hole);
    filterPoints(bridgeReverse, bridgeReverse.next);
    return filterPoints(bridge, bridge.next);
  }
  function findHoleBridge(hole, outerNode) {
    let p = outerNode;
    const hx = hole.x;
    const hy = hole.y;
    let qx = -Infinity;
    let m;
    if (equals(hole, p)) return p;
    do {
      if (equals(hole, p.next)) return p.next;
      else if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
        const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
        if (x <= hx && x > qx) {
          qx = x;
          m = p.x < p.next.x ? p : p.next;
          if (x === hx) return m;
        }
      }
      p = p.next;
    } while (p !== outerNode);
    if (!m) return null;
    const stop = m;
    const mx = m.x;
    const my = m.y;
    let tanMin = Infinity;
    p = m;
    do {
      if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
        const tan = Math.abs(hy - p.y) / (hx - p.x);
        if (locallyInside(p, hole) && (tan < tanMin || tan === tanMin && (p.x > m.x || p.x === m.x && sectorContainsSector(m, p)))) {
          m = p;
          tanMin = tan;
        }
      }
      p = p.next;
    } while (p !== stop);
    return m;
  }
  function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
  }
  function indexCurve(start, minX, minY, invSize) {
    let p = start;
    do {
      if (p.z === 0) p.z = zOrder(p.x, p.y, minX, minY, invSize);
      p.prevZ = p.prev;
      p.nextZ = p.next;
      p = p.next;
    } while (p !== start);
    p.prevZ.nextZ = null;
    p.prevZ = null;
    sortLinked(p);
  }
  function sortLinked(list) {
    let numMerges;
    let inSize = 1;
    do {
      let p = list;
      let e;
      list = null;
      let tail = null;
      numMerges = 0;
      while (p) {
        numMerges++;
        let q = p;
        let pSize = 0;
        for (let i = 0; i < inSize; i++) {
          pSize++;
          q = q.nextZ;
          if (!q) break;
        }
        let qSize = inSize;
        while (pSize > 0 || qSize > 0 && q) {
          if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
            e = p;
            p = p.nextZ;
            pSize--;
          } else {
            e = q;
            q = q.nextZ;
            qSize--;
          }
          if (tail) tail.nextZ = e;
          else list = e;
          e.prevZ = tail;
          tail = e;
        }
        p = q;
      }
      tail.nextZ = null;
      inSize *= 2;
    } while (numMerges > 1);
    return list;
  }
  function zOrder(x, y, minX, minY, invSize) {
    x = (x - minX) * invSize | 0;
    y = (y - minY) * invSize | 0;
    x = (x | x << 8) & 16711935;
    x = (x | x << 4) & 252645135;
    x = (x | x << 2) & 858993459;
    x = (x | x << 1) & 1431655765;
    y = (y | y << 8) & 16711935;
    y = (y | y << 4) & 252645135;
    y = (y | y << 2) & 858993459;
    y = (y | y << 1) & 1431655765;
    return x | y << 1;
  }
  function getLeftmost(start) {
    let p = start, leftmost = start;
    do {
      if (p.x < leftmost.x || p.x === leftmost.x && p.y < leftmost.y) leftmost = p;
      p = p.next;
    } while (p !== start);
    return leftmost;
  }
  function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) >= (ax - px) * (cy - py) && (ax - px) * (by - py) >= (bx - px) * (ay - py) && (bx - px) * (cy - py) >= (cx - px) * (by - py);
  }
  function pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, px, py) {
    return !(ax === px && ay === py) && pointInTriangle(ax, ay, bx, by, cx, cy, px, py);
  }
  function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // doesn't intersect other edges
    (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
    (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
    equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
  }
  function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  }
  function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
  function intersects(p1, q1, p2, q2) {
    const o1 = sign(area(p1, q1, p2));
    const o2 = sign(area(p1, q1, q2));
    const o3 = sign(area(p2, q2, p1));
    const o4 = sign(area(p2, q2, q1));
    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;
    return false;
  }
  function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
  }
  function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
  }
  function intersectsPolygon(a, b) {
    let p = a;
    do {
      if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) return true;
      p = p.next;
    } while (p !== a);
    return false;
  }
  function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
  }
  function middleInside(a, b) {
    let p = a;
    let inside = false;
    const px = (a.x + b.x) / 2;
    const py = (a.y + b.y) / 2;
    do {
      if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)
        inside = !inside;
      p = p.next;
    } while (p !== a);
    return inside;
  }
  function splitPolygon(a, b) {
    const a2 = createNode(a.i, a.x, a.y), b2 = createNode(b.i, b.x, b.y), an = a.next, bp = b.prev;
    a.next = b;
    b.prev = a;
    a2.next = an;
    an.prev = a2;
    b2.next = a2;
    a2.prev = b2;
    bp.next = b2;
    b2.prev = bp;
    return b2;
  }
  function insertNode(i, x, y, last) {
    const p = createNode(i, x, y);
    if (!last) {
      p.prev = p;
      p.next = p;
    } else {
      p.next = last.next;
      p.prev = last;
      last.next.prev = p;
      last.next = p;
    }
    return p;
  }
  function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;
    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
  }
  function createNode(i, x, y) {
    return {
      i,
      // vertex index in coordinates array
      x,
      y,
      // vertex coordinates
      prev: null,
      // previous and next vertex nodes in a polygon ring
      next: null,
      z: 0,
      // z-order curve value
      prevZ: null,
      // previous and next nodes in z-order
      nextZ: null,
      steiner: false
      // indicates whether this is a steiner point
    };
  }
  function deviation(data, holeIndices, dim, triangles) {
    const hasHoles = holeIndices && holeIndices.length;
    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
    let polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
      for (let i = 0, len = holeIndices.length; i < len; i++) {
        const start = holeIndices[i] * dim;
        const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        polygonArea -= Math.abs(signedArea(data, start, end, dim));
      }
    }
    let trianglesArea = 0;
    for (let i = 0; i < triangles.length; i += 3) {
      const a = triangles[i] * dim;
      const b = triangles[i + 1] * dim;
      const c = triangles[i + 2] * dim;
      trianglesArea += Math.abs(
        (data[a] - data[c]) * (data[b + 1] - data[a + 1]) - (data[a] - data[b]) * (data[c + 1] - data[a + 1])
      );
    }
    return polygonArea === 0 && trianglesArea === 0 ? 0 : Math.abs((trianglesArea - polygonArea) / polygonArea);
  }
  function signedArea(data, start, end, dim) {
    let sum = 0;
    for (let i = start, j = end - dim; i < end; i += dim) {
      sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
      j = i;
    }
    return sum;
  }
  function flatten(data) {
    const vertices = [];
    const holes = [];
    const dimensions = data[0][0].length;
    let holeIndex = 0;
    let prevLen = 0;
    for (const ring of data) {
      for (const p of ring) {
        for (let d = 0; d < dimensions; d++) vertices.push(p[d]);
      }
      if (prevLen) {
        holeIndex += prevLen;
        holes.push(holeIndex);
      }
      prevLen = ring.length;
    }
    return { vertices, holes, dimensions };
  }
  var init_earcut = __esm({
    "node_modules/earcut/src/earcut.js"() {
    }
  });

  // node_modules/quickselect/index.js
  var quickselect_exports = {};
  __export(quickselect_exports, {
    default: () => quickselect
  });
  function quickselect(arr, k, left = 0, right = arr.length - 1, compare = defaultCompare) {
    while (right > left) {
      if (right - left > 600) {
        const n = right - left + 1;
        const m = k - left + 1;
        const z = Math.log(n);
        const s = 0.5 * Math.exp(2 * z / 3);
        const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
        const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
        const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
        quickselect(arr, k, newLeft, newRight, compare);
      }
      const t = arr[k];
      let i = left;
      let j = right;
      swap(arr, left, k);
      if (compare(arr[right], t) > 0) swap(arr, left, right);
      while (i < j) {
        swap(arr, i, j);
        i++;
        j--;
        while (compare(arr[i], t) < 0) i++;
        while (compare(arr[j], t) > 0) j--;
      }
      if (compare(arr[left], t) === 0) swap(arr, left, j);
      else {
        j++;
        swap(arr, j, right);
      }
      if (j <= k) left = j + 1;
      if (k <= j) right = j - 1;
    }
  }
  function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  var init_quickselect = __esm({
    "node_modules/quickselect/index.js"() {
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/classify_rings.js
  var require_classify_rings = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/classify_rings.js"(exports, module) {
      var { default: quickselect2 } = (init_quickselect(), __toCommonJS(quickselect_exports));
      var { calculateSignedArea } = require_util();
      module.exports = function classifyRings(rings, maxRings) {
        if (rings.length <= 1) return [rings];
        const polygons = [];
        let polygon;
        let ccw;
        for (const ring of rings) {
          const area2 = calculateSignedArea(ring);
          if (area2 === 0) continue;
          ring.area = Math.abs(area2);
          if (ccw === void 0) ccw = area2 < 0;
          if (ccw === area2 < 0) {
            append(polygon);
            polygon = [ring];
          } else {
            polygon.push(ring);
          }
        }
        append(polygon);
        return polygons;
        function append(polygon2) {
          if (!polygon2) {
            return;
          }
          if (maxRings > 1 && maxRings < polygon2.length) {
            quickselect2(polygon2, maxRings, 1, polygon2.length - 1, (a, b) => b.area - a.area);
            polygon2.length = maxRings;
          }
          polygons.push(polygon2);
        }
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/pattern_bucket_features.js
  var require_pattern_bucket_features = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/pattern_bucket_features.js"(exports, module) {
      function hasPattern(type, layers, options) {
        const patterns = options.patternDependencies;
        let hasPattern2 = false;
        for (const layer of layers) {
          const patternProperty = layer.paint.get(`${type}-pattern`);
          if (!patternProperty.isConstant()) {
            hasPattern2 = true;
          }
          const constantPattern = patternProperty.constantOr(null);
          if (constantPattern) {
            hasPattern2 = true;
            patterns[constantPattern.to] = true;
            patterns[constantPattern.from] = true;
          }
        }
        return hasPattern2;
      }
      function addPatternDependencies(type, layers, patternFeature, zoom, options) {
        const patterns = options.patternDependencies;
        for (const layer of layers) {
          const patternProperty = layer.paint.get(`${type}-pattern`);
          const patternPropertyValue = patternProperty.value;
          if (patternPropertyValue.kind !== "constant") {
            const min = patternPropertyValue.evaluate({ zoom: zoom - 1 }, patternFeature, {});
            const mid = patternPropertyValue.evaluate({ zoom }, patternFeature, {});
            const max = patternPropertyValue.evaluate({ zoom: zoom + 1 }, patternFeature, {});
            patterns[min] = true;
            patterns[mid] = true;
            patterns[max] = true;
            patternFeature.patterns[layer.id] = { min, mid, max };
          }
        }
        return patternFeature;
      }
      module.exports = { hasPattern, addPatternDependencies };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_bucket.js
  var require_fill_bucket = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_bucket.js"(exports, module) {
      var { FillLayoutArray } = require_array_types();
      var { members: layoutAttributes } = require_fill_attributes();
      var SegmentVector = require_segment();
      var { ProgramConfigurationSet } = require_program_configuration();
      var { LineIndexArray, TriangleIndexArray } = require_index_array_type();
      var { default: earcut2 } = (init_earcut(), __toCommonJS(earcut_exports));
      var classifyRings = require_classify_rings();
      var assert = require_nanoassert();
      var EARCUT_MAX_RINGS = 500;
      var { register } = require_transfer_registry();
      var { hasPattern, addPatternDependencies } = require_pattern_bucket_features();
      var loadGeometry = require_load_geometry();
      var EvaluationParameters = require_evaluation_parameters();
      var FillBucket = class {
        constructor(options) {
          this.zoom = options.zoom;
          this.overscaling = options.overscaling;
          this.layers = options.layers;
          this.layerIds = this.layers.map((layer) => layer.id);
          this.index = options.index;
          this.hasPattern = false;
          this.layoutVertexArray = new FillLayoutArray();
          this.indexArray = new TriangleIndexArray();
          this.indexArray2 = new LineIndexArray();
          this.programConfigurations = new ProgramConfigurationSet(layoutAttributes, options.layers, options.zoom);
          this.segments = new SegmentVector();
          this.segments2 = new SegmentVector();
        }
        populate(features, options) {
          this.features = [];
          this.hasPattern = hasPattern("fill", this.layers, options);
          for (const { feature, index, sourceLayerIndex } of features) {
            if (!this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) continue;
            const geometry = loadGeometry(feature);
            const patternFeature = {
              sourceLayerIndex,
              index,
              geometry,
              properties: feature.properties,
              type: feature.type,
              patterns: {}
            };
            if (typeof feature.id !== "undefined") {
              patternFeature.id = feature.id;
            }
            if (this.hasPattern) {
              this.features.push(addPatternDependencies("fill", this.layers, patternFeature, this.zoom, options));
            } else {
              this.addFeature(patternFeature, geometry, index, {});
            }
            options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index);
          }
        }
        update(states, vtLayer, imagePositions) {
          if (!this.stateDependentLayers.length) return;
          this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
        }
        addFeatures(options, imagePositions) {
          for (const feature of this.features) {
            const { geometry } = feature;
            this.addFeature(feature, geometry, feature.index, imagePositions);
          }
        }
        isEmpty() {
          return this.layoutVertexArray.length === 0;
        }
        uploadPending() {
          return !this.uploaded || this.programConfigurations.needsUpload;
        }
        upload(context) {
          if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, layoutAttributes);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
            this.indexBuffer2 = context.createIndexBuffer(this.indexArray2);
          }
          this.programConfigurations.upload(context);
          this.uploaded = true;
        }
        destroy() {
          if (!this.layoutVertexBuffer) return;
          this.layoutVertexBuffer.destroy();
          this.indexBuffer.destroy();
          this.indexBuffer2.destroy();
          this.programConfigurations.destroy();
          this.segments.destroy();
          this.segments2.destroy();
        }
        addFeature(feature, geometry, index, imagePositions) {
          for (const polygon of classifyRings(geometry, EARCUT_MAX_RINGS)) {
            let numVertices = 0;
            for (const ring of polygon) {
              numVertices += ring.length;
            }
            const triangleSegment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
            const triangleIndex = triangleSegment.vertexLength;
            const flattened = [];
            const holeIndices = [];
            for (const ring of polygon) {
              if (ring.length === 0) {
                continue;
              }
              if (ring !== polygon[0]) {
                holeIndices.push(flattened.length / 2);
              }
              const lineSegment = this.segments2.prepareSegment(ring.length, this.layoutVertexArray, this.indexArray2);
              const lineIndex = lineSegment.vertexLength;
              this.layoutVertexArray.emplaceBack(ring[0].x, ring[0].y);
              this.indexArray2.emplaceBack(lineIndex + ring.length - 1, lineIndex);
              flattened.push(ring[0].x);
              flattened.push(ring[0].y);
              for (let i = 1; i < ring.length; i++) {
                this.layoutVertexArray.emplaceBack(ring[i].x, ring[i].y);
                this.indexArray2.emplaceBack(lineIndex + i - 1, lineIndex + i);
                flattened.push(ring[i].x);
                flattened.push(ring[i].y);
              }
              lineSegment.vertexLength += ring.length;
              lineSegment.primitiveLength += ring.length;
            }
            const indices = earcut2(flattened, holeIndices);
            assert(indices.length % 3 === 0);
            for (let i = 0; i < indices.length; i += 3) {
              this.indexArray.emplaceBack(
                triangleIndex + indices[i],
                triangleIndex + indices[i + 1],
                triangleIndex + indices[i + 2]
              );
            }
            triangleSegment.vertexLength += numVertices;
            triangleSegment.primitiveLength += indices.length / 3;
          }
          this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
        }
      };
      register("FillBucket", FillBucket, { omit: ["layers", "features"] });
      module.exports = FillBucket;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_style_layer_properties.js
  var require_fill_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_style_layer_properties.js"(exports, module) {
      var { Properties, CrossFadedDataDrivenProperty, DataConstantProperty, DataDrivenProperty } = require_properties2();
      var paint = new Properties({
        "fill-antialias": new DataConstantProperty({ type: "boolean", default: true, expression: { parameters: ["zoom"] } }),
        "fill-opacity": new DataDrivenProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "fill-color": new DataDrivenProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "fill-outline-color": new DataDrivenProperty({
          type: "color",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "fill-translate": new DataConstantProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "fill-translate-anchor": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "map",
          expression: { parameters: ["zoom"] }
        }),
        "fill-pattern": new CrossFadedDataDrivenProperty({
          type: "string",
          transition: true,
          expression: { parameters: ["zoom", "feature"] }
        })
      });
      module.exports = { paint };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_style_layer.js
  var require_fill_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var FillBucket = require_fill_bucket();
      var { polygonIntersectsMultiPolygon } = require_intersection_tests();
      var { translateDistance, translate } = require_query_utils();
      var properties = require_fill_style_layer_properties();
      var FillStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
        recalculate(parameters) {
          super.recalculate(parameters);
          const outlineColor = this.paint._values["fill-outline-color"];
          if (outlineColor.value.kind === "constant" && outlineColor.value.value === void 0) {
            this.paint._values["fill-outline-color"] = this.paint._values["fill-color"];
          }
        }
        createBucket(parameters) {
          return new FillBucket(parameters);
        }
        queryRadius() {
          return translateDistance(this.paint.get("fill-translate"));
        }
        queryIntersectsFeature(queryGeometry, feature, featureState, geometry, zoom, transform, pixelsToTileUnits) {
          const translatedPolygon = translate(
            queryGeometry,
            this.paint.get("fill-translate"),
            this.paint.get("fill-translate-anchor"),
            transform.angle,
            pixelsToTileUnits
          );
          return polygonIntersectsMultiPolygon(translatedPolygon, geometry);
        }
        isTileClipped() {
          return true;
        }
      };
      module.exports = FillStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_extrusion_attributes.js
  var require_fill_extrusion_attributes = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_extrusion_attributes.js"(exports, module) {
      var { createLayout } = require_struct_array();
      var layout = createLayout(
        [
          { name: "a_pos", components: 2, type: "Int16" },
          { name: "a_normal_ed", components: 4, type: "Int16" }
        ],
        4
      );
      module.exports = layout;
    }
  });

  // node_modules/@mapwhit/vector-tile/lib/vectortilefeature.js
  var require_vectortilefeature = __commonJS({
    "node_modules/@mapwhit/vector-tile/lib/vectortilefeature.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var VectorTileFeature = class _VectorTileFeature {
        static types = ["Unknown", "Point", "LineString", "Polygon"];
        constructor(pbf, end, extent, keys, values) {
          this.properties = {};
          this.extent = extent;
          this.type = 0;
          this._pbf = pbf;
          this._geometry = -1;
          this._keys = keys;
          this._values = values;
          pbf.readFields(readFeature, this, end);
        }
        loadGeometry() {
          const pbf = this._pbf;
          pbf.pos = this._geometry;
          const end = pbf.readVarint() + pbf.pos;
          let cmd = 1;
          let length = 0;
          let x = 0;
          let y = 0;
          const lines = [];
          let line;
          while (pbf.pos < end) {
            if (length <= 0) {
              const cmdLen = pbf.readVarint();
              cmd = cmdLen & 7;
              length = cmdLen >> 3;
            }
            length--;
            if (cmd === 1 || cmd === 2) {
              x += pbf.readSVarint();
              y += pbf.readSVarint();
              if (cmd === 1) {
                if (line) lines.push(line);
                line = [];
              }
              line.push(new Point2(x, y));
            } else if (cmd === 7) {
              if (line) {
                line.push(line[0].clone());
              }
            } else {
              throw new Error(`unknown command ${cmd}`);
            }
          }
          if (line) lines.push(line);
          return lines;
        }
        bbox() {
          const pbf = this._pbf;
          pbf.pos = this._geometry;
          const end = pbf.readVarint() + pbf.pos;
          let cmd = 1;
          let length = 0;
          let x = 0;
          let y = 0;
          let x1 = Number.POSITIVE_INFINITY;
          let x2 = Number.NEGATIVE_INFINITY;
          let y1 = Number.POSITIVE_INFINITY;
          let y2 = Number.NEGATIVE_INFINITY;
          while (pbf.pos < end) {
            if (length <= 0) {
              const cmdLen = pbf.readVarint();
              cmd = cmdLen & 7;
              length = cmdLen >> 3;
            }
            length--;
            if (cmd === 1 || cmd === 2) {
              x += pbf.readSVarint();
              y += pbf.readSVarint();
              if (x < x1) x1 = x;
              if (x > x2) x2 = x;
              if (y < y1) y1 = y;
              if (y > y2) y2 = y;
            } else if (cmd !== 7) {
              throw new Error(`unknown command ${cmd}`);
            }
          }
          return [x1, y1, x2, y2];
        }
        toGeoJSON(x, y, z) {
          const size = this.extent * 2 ** z;
          const x0 = this.extent * x;
          const y0 = this.extent * y;
          let coords = this.loadGeometry();
          let type = _VectorTileFeature.types[this.type];
          function project(line) {
            for (let j = 0; j < line.length; j++) {
              const p = line[j];
              const y2 = 180 - (p.y + y0) * 360 / size;
              line[j] = [(p.x + x0) * 360 / size - 180, 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90];
            }
          }
          switch (this.type) {
            case 1: {
              const points = [];
              for (let i = 0; i < coords.length; i++) {
                points[i] = coords[i][0];
              }
              coords = points;
              project(coords);
              break;
            }
            case 2:
              for (let i = 0; i < coords.length; i++) {
                project(coords[i]);
              }
              break;
            case 3:
              coords = classifyRings(coords);
              for (let i = 0; i < coords.length; i++) {
                for (let j = 0; j < coords[i].length; j++) {
                  project(coords[i][j]);
                }
              }
              break;
          }
          if (coords.length === 1) {
            coords = coords[0];
          } else {
            type = `Multi${type}`;
          }
          const result = {
            type: "Feature",
            geometry: {
              type,
              coordinates: coords
            },
            properties: this.properties
          };
          if ("id" in this) {
            result.id = this.id;
          }
          return result;
        }
      };
      module.exports = VectorTileFeature;
      function readFeature(tag, feature, pbf) {
        switch (tag) {
          case 1:
            feature.id = pbf.readVarint();
            break;
          case 2:
            {
              const end = pbf.readVarint() + pbf.pos;
              while (pbf.pos < end) {
                const key = feature._keys[pbf.readVarint()];
                const value = feature._values[pbf.readVarint()];
                feature.properties[key] = value;
              }
            }
            break;
          case 3:
            feature.type = pbf.readVarint();
            break;
          case 4:
            feature._geometry = pbf.pos;
            break;
        }
      }
      function classifyRings(rings) {
        const len = rings.length;
        if (len <= 1) return [rings];
        const polygons = [];
        let polygon;
        let ccw;
        for (let i = 0; i < len; i++) {
          const area2 = signedArea2(rings[i]);
          if (area2 === 0) continue;
          ccw ??= area2 < 0;
          if (ccw === area2 < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];
          } else {
            polygon.push(rings[i]);
          }
        }
        if (polygon) polygons.push(polygon);
        return polygons;
      }
      function signedArea2(ring) {
        let sum = 0;
        let to = ring.at(-1);
        for (const from of ring) {
          sum += (to.x - from.x) * (from.y + to.y);
          to = from;
        }
        return sum;
      }
    }
  });

  // node_modules/@mapwhit/vector-tile/lib/vectortilelayer.js
  var require_vectortilelayer = __commonJS({
    "node_modules/@mapwhit/vector-tile/lib/vectortilelayer.js"(exports, module) {
      var VectorTileFeature = require_vectortilefeature();
      var VectorTileLayer = class {
        constructor(pbf, end) {
          this.version = 1;
          this.name = null;
          this.extent = 4096;
          this.length = 0;
          this._pbf = pbf;
          this._keys = [];
          this._values = [];
          this._features = [];
          pbf.readFields(readLayer, this, end);
          this.length = this._features.length;
        }
        // return feature `i` from this layer as a `VectorTileFeature`
        feature(i) {
          if (i < 0 || i >= this._features.length) throw new Error("feature index out of bounds");
          this._pbf.pos = this._features[i];
          const end = this._pbf.readVarint() + this._pbf.pos;
          return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
        }
      };
      module.exports = VectorTileLayer;
      function readLayer(tag, layer, pbf) {
        switch (tag) {
          case 1:
            layer.name = pbf.readString();
            break;
          case 5:
            layer.extent = pbf.readVarint();
            break;
          case 2:
            layer._features.push(pbf.pos);
            break;
          case 3:
            layer._keys.push(pbf.readString());
            break;
          case 4:
            layer._values.push(readValueMessage(pbf));
            break;
          case 15:
            layer.version = pbf.readVarint();
            break;
        }
      }
      function readValueMessage(pbf) {
        let value = null;
        const end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) {
          switch (pbf.readVarint() >> 3) {
            case 1:
              value = pbf.readString();
              break;
            case 2:
              value = pbf.readFloat();
              break;
            case 3:
              value = pbf.readDouble();
              break;
            case 4:
              value = pbf.readVarint64();
              break;
            case 5:
              value = pbf.readVarint();
              break;
            case 6:
              value = pbf.readSVarint();
              break;
            case 7:
              value = pbf.readBoolean();
              break;
            default:
              value = null;
          }
        }
        return value;
      }
    }
  });

  // node_modules/@mapwhit/vector-tile/lib/vectortile.js
  var require_vectortile = __commonJS({
    "node_modules/@mapwhit/vector-tile/lib/vectortile.js"(exports, module) {
      var VectorTileLayer = require_vectortilelayer();
      module.exports = VectorTile;
      function VectorTile(pbf, end) {
        this.layers = pbf.readFields(readTile, {}, end);
      }
      function readTile(tag, layers, pbf) {
        if (tag === 3) {
          const layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
          if (layer.length) layers[layer.name] = layer;
        }
      }
    }
  });

  // node_modules/@mapwhit/vector-tile/index.js
  var require_vector_tile = __commonJS({
    "node_modules/@mapwhit/vector-tile/index.js"(exports, module) {
      module.exports.VectorTile = require_vectortile();
      module.exports.VectorTileFeature = require_vectortilefeature();
      module.exports.VectorTileLayer = require_vectortilelayer();
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_extrusion_bucket.js
  var require_fill_extrusion_bucket = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/fill_extrusion_bucket.js"(exports, module) {
      var { FillExtrusionLayoutArray } = require_array_types();
      var { members: layoutAttributes } = require_fill_extrusion_attributes();
      var SegmentVector = require_segment();
      var { ProgramConfigurationSet } = require_program_configuration();
      var { TriangleIndexArray } = require_index_array_type();
      var EXTENT = require_extent();
      var { default: earcut2 } = (init_earcut(), __toCommonJS(earcut_exports));
      var {
        VectorTileFeature: { types: vectorTileFeatureTypes }
      } = require_vector_tile();
      var classifyRings = require_classify_rings();
      var assert = require_nanoassert();
      var EARCUT_MAX_RINGS = 500;
      var { register } = require_transfer_registry();
      var { hasPattern, addPatternDependencies } = require_pattern_bucket_features();
      var loadGeometry = require_load_geometry();
      var EvaluationParameters = require_evaluation_parameters();
      var FACTOR = 2 ** 13;
      function addVertex(vertexArray, x, y, nx, ny, nz, t, e) {
        vertexArray.emplaceBack(
          // a_pos
          x,
          y,
          // a_normal_ed: 3-component normal and 1-component edgedistance
          Math.floor(nx * FACTOR) * 2 + t,
          ny * FACTOR * 2,
          nz * FACTOR * 2,
          // edgedistance (used for wrapping patterns around extrusion sides)
          Math.round(e)
        );
      }
      var FillExtrusionBucket = class {
        constructor(options) {
          this.zoom = options.zoom;
          this.overscaling = options.overscaling;
          this.layers = options.layers;
          this.layerIds = this.layers.map((layer) => layer.id);
          this.index = options.index;
          this.hasPattern = false;
          this.layoutVertexArray = new FillExtrusionLayoutArray();
          this.indexArray = new TriangleIndexArray();
          this.programConfigurations = new ProgramConfigurationSet(layoutAttributes, options.layers, options.zoom);
          this.segments = new SegmentVector();
        }
        populate(features, options) {
          this.features = [];
          this.hasPattern = hasPattern("fill-extrusion", this.layers, options);
          for (const { feature, index, sourceLayerIndex } of features) {
            if (!this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) continue;
            const geometry = loadGeometry(feature);
            const patternFeature = {
              sourceLayerIndex,
              index,
              geometry,
              properties: feature.properties,
              type: feature.type,
              patterns: {}
            };
            if (typeof feature.id !== "undefined") {
              patternFeature.id = feature.id;
            }
            if (this.hasPattern) {
              this.features.push(addPatternDependencies("fill-extrusion", this.layers, patternFeature, this.zoom, options));
            } else {
              this.addFeature(patternFeature, geometry, index, {});
            }
            options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index, true);
          }
        }
        addFeatures(options, imagePositions) {
          for (const feature of this.features) {
            const { geometry } = feature;
            this.addFeature(feature, geometry, feature.index, imagePositions);
          }
        }
        update(states, vtLayer, imagePositions) {
          if (!this.stateDependentLayers.length) return;
          this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
        }
        isEmpty() {
          return this.layoutVertexArray.length === 0;
        }
        uploadPending() {
          return !this.uploaded || this.programConfigurations.needsUpload;
        }
        upload(context) {
          if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, layoutAttributes);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
          }
          this.programConfigurations.upload(context);
          this.uploaded = true;
        }
        destroy() {
          if (!this.layoutVertexBuffer) return;
          this.layoutVertexBuffer.destroy();
          this.indexBuffer.destroy();
          this.programConfigurations.destroy();
          this.segments.destroy();
        }
        addFeature(feature, geometry, index, imagePositions) {
          for (const polygon of classifyRings(geometry, EARCUT_MAX_RINGS)) {
            let numVertices = 0;
            for (const ring of polygon) {
              numVertices += ring.length;
            }
            let segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
            for (const ring of polygon) {
              if (ring.length === 0) {
                continue;
              }
              if (isEntirelyOutside(ring)) {
                continue;
              }
              let edgeDistance = 0;
              for (let p = 0; p < ring.length; p++) {
                const p1 = ring[p];
                if (p >= 1) {
                  const p2 = ring[p - 1];
                  if (!isBoundaryEdge(p1, p2)) {
                    if (segment.vertexLength + 4 > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
                      segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
                    }
                    const perp = p1.sub(p2)._perp()._unit();
                    const dist = p2.dist(p1);
                    if (edgeDistance + dist > 32768) edgeDistance = 0;
                    addVertex(this.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 0, edgeDistance);
                    addVertex(this.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 1, edgeDistance);
                    edgeDistance += dist;
                    addVertex(this.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 0, edgeDistance);
                    addVertex(this.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 1, edgeDistance);
                    const bottomRight = segment.vertexLength;
                    this.indexArray.emplaceBack(bottomRight, bottomRight + 2, bottomRight + 1);
                    this.indexArray.emplaceBack(bottomRight + 1, bottomRight + 2, bottomRight + 3);
                    segment.vertexLength += 4;
                    segment.primitiveLength += 2;
                  }
                }
              }
            }
            if (segment.vertexLength + numVertices > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
              segment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
            }
            if (vectorTileFeatureTypes[feature.type] !== "Polygon") {
              continue;
            }
            const flattened = [];
            const holeIndices = [];
            const triangleIndex = segment.vertexLength;
            for (const ring of polygon) {
              if (ring.length === 0) {
                continue;
              }
              if (ring !== polygon[0]) {
                holeIndices.push(flattened.length / 2);
              }
              for (let i = 0; i < ring.length; i++) {
                const p = ring[i];
                addVertex(this.layoutVertexArray, p.x, p.y, 0, 0, 1, 1, 0);
                flattened.push(p.x);
                flattened.push(p.y);
              }
            }
            const indices = earcut2(flattened, holeIndices);
            assert(indices.length % 3 === 0);
            for (let j = 0; j < indices.length; j += 3) {
              this.indexArray.emplaceBack(
                triangleIndex + indices[j],
                triangleIndex + indices[j + 2],
                triangleIndex + indices[j + 1]
              );
            }
            segment.primitiveLength += indices.length / 3;
            segment.vertexLength += numVertices;
          }
          this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
        }
      };
      register("FillExtrusionBucket", FillExtrusionBucket, { omit: ["layers", "features"] });
      module.exports = FillExtrusionBucket;
      function isBoundaryEdge(p1, p2) {
        return p1.x === p2.x && (p1.x < 0 || p1.x > EXTENT) || p1.y === p2.y && (p1.y < 0 || p1.y > EXTENT);
      }
      function isEntirelyOutside(ring) {
        return ring.every((p) => p.x < 0) || ring.every((p) => p.x > EXTENT) || ring.every((p) => p.y < 0) || ring.every((p) => p.y > EXTENT);
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_extrusion_style_layer_properties.js
  var require_fill_extrusion_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_extrusion_style_layer_properties.js"(exports, module) {
      var { Properties, CrossFadedDataDrivenProperty, DataConstantProperty, DataDrivenProperty } = require_properties2();
      var paint = new Properties({
        "fill-extrusion-opacity": new DataConstantProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "fill-extrusion-color": new DataDrivenProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "fill-extrusion-translate": new DataConstantProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "fill-extrusion-translate-anchor": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "map",
          expression: { parameters: ["zoom"] }
        }),
        "fill-extrusion-pattern": new CrossFadedDataDrivenProperty({
          type: "string",
          transition: true,
          expression: { parameters: ["zoom", "feature"] }
        }),
        "fill-extrusion-height": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "fill-extrusion-base": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "fill-extrusion-vertical-gradient": new DataConstantProperty({
          type: "boolean",
          default: true,
          expression: { parameters: ["zoom"] }
        })
      });
      module.exports = { paint };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_extrusion_style_layer.js
  var require_fill_extrusion_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/fill_extrusion_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var FillExtrusionBucket = require_fill_extrusion_bucket();
      var { polygonIntersectsPolygon, polygonIntersectsMultiPolygon } = require_intersection_tests();
      var { translateDistance, translate } = require_query_utils();
      var properties = require_fill_extrusion_style_layer_properties();
      var { vec4 } = require_gl_matrix();
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var FillExtrusionStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
        createBucket(parameters) {
          return new FillExtrusionBucket(parameters);
        }
        queryRadius() {
          return translateDistance(this.paint.get("fill-extrusion-translate"));
        }
        is3D() {
          return true;
        }
        queryIntersectsFeature(queryGeometry, feature, featureState, geometry, zoom, transform, pixelsToTileUnits, pixelPosMatrix) {
          const translatedPolygon = translate(
            queryGeometry,
            this.paint.get("fill-extrusion-translate"),
            this.paint.get("fill-extrusion-translate-anchor"),
            transform.angle,
            pixelsToTileUnits
          );
          const height = this.paint.get("fill-extrusion-height").evaluate(feature, featureState);
          const base = this.paint.get("fill-extrusion-base").evaluate(feature, featureState);
          const projectedQueryGeometry = projectQueryGeometry(translatedPolygon, pixelPosMatrix, transform, 0);
          const projected = projectExtrusion(geometry, base, height, pixelPosMatrix);
          const projectedBase = projected[0];
          const projectedTop = projected[1];
          return checkIntersection(projectedBase, projectedTop, projectedQueryGeometry);
        }
      };
      function dot(a, b) {
        return a.x * b.x + a.y * b.y;
      }
      function getIntersectionDistance(projectedQueryGeometry, projectedFace) {
        if (projectedQueryGeometry.length === 1) {
          const a = projectedFace[0];
          const b = projectedFace[1];
          const c = projectedFace[3];
          const p = projectedQueryGeometry[0];
          const ab = b.sub(a);
          const ac = c.sub(a);
          const ap = p.sub(a);
          const dotABAB = dot(ab, ab);
          const dotABAC = dot(ab, ac);
          const dotACAC = dot(ac, ac);
          const dotAPAB = dot(ap, ab);
          const dotAPAC = dot(ap, ac);
          const denom = dotABAB * dotACAC - dotABAC * dotABAC;
          const v = (dotACAC * dotAPAB - dotABAC * dotAPAC) / denom;
          const w = (dotABAB * dotAPAC - dotABAC * dotAPAB) / denom;
          const u = 1 - v - w;
          return a.z * u + b.z * v + c.z * w;
        }
        let closestDistance = Number.POSITIVE_INFINITY;
        for (const p of projectedFace) {
          closestDistance = Math.min(closestDistance, p.z);
        }
        return closestDistance;
      }
      function checkIntersection(projectedBase, projectedTop, projectedQueryGeometry) {
        let closestDistance = Number.POSITIVE_INFINITY;
        if (polygonIntersectsMultiPolygon(projectedQueryGeometry, projectedTop)) {
          closestDistance = getIntersectionDistance(projectedQueryGeometry, projectedTop[0]);
        }
        for (let r = 0; r < projectedTop.length; r++) {
          const ringTop = projectedTop[r];
          const ringBase = projectedBase[r];
          for (let p = 0; p < ringTop.length - 1; p++) {
            const topA = ringTop[p];
            const topB = ringTop[p + 1];
            const baseA = ringBase[p];
            const baseB = ringBase[p + 1];
            const face = [topA, topB, baseB, baseA, topA];
            if (polygonIntersectsPolygon(projectedQueryGeometry, face)) {
              closestDistance = Math.min(closestDistance, getIntersectionDistance(projectedQueryGeometry, face));
            }
          }
        }
        return closestDistance === Number.POSITIVE_INFINITY ? false : closestDistance;
      }
      function projectExtrusion(geometry, zBase, zTop, m) {
        const projectedBase = [];
        const projectedTop = [];
        const baseXZ = m[8] * zBase;
        const baseYZ = m[9] * zBase;
        const baseZZ = m[10] * zBase;
        const baseWZ = m[11] * zBase;
        const topXZ = m[8] * zTop;
        const topYZ = m[9] * zTop;
        const topZZ = m[10] * zTop;
        const topWZ = m[11] * zTop;
        for (const r of geometry) {
          const ringBase = [];
          const ringTop = [];
          for (const p of r) {
            const x = p.x;
            const y = p.y;
            const sX = m[0] * x + m[4] * y + m[12];
            const sY = m[1] * x + m[5] * y + m[13];
            const sZ = m[2] * x + m[6] * y + m[14];
            const sW = m[3] * x + m[7] * y + m[15];
            const baseX = sX + baseXZ;
            const baseY = sY + baseYZ;
            const baseZ = sZ + baseZZ;
            const baseW = sW + baseWZ;
            const topX = sX + topXZ;
            const topY = sY + topYZ;
            const topZ = sZ + topZZ;
            const topW = sW + topWZ;
            const b = new Point2(baseX / baseW, baseY / baseW);
            b.z = baseZ / baseW;
            ringBase.push(b);
            const t = new Point2(topX / topW, topY / topW);
            t.z = topZ / topW;
            ringTop.push(t);
          }
          projectedBase.push(ringBase);
          projectedTop.push(ringTop);
        }
        return [projectedBase, projectedTop];
      }
      function projectQueryGeometry(queryGeometry, pixelPosMatrix, transform, z) {
        const projectedQueryGeometry = [];
        for (const p of queryGeometry) {
          const v = [p.x, p.y, z, 1];
          vec4.transformMat4(v, v, pixelPosMatrix);
          projectedQueryGeometry.push(new Point2(v[0] / v[3], v[1] / v[3]));
        }
        return projectedQueryGeometry;
      }
      module.exports = FillExtrusionStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/line_attributes.js
  var require_line_attributes = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/line_attributes.js"(exports, module) {
      var { createLayout } = require_struct_array();
      var layout = createLayout(
        [
          { name: "a_pos_normal", components: 4, type: "Int16" },
          { name: "a_data", components: 4, type: "Uint8" }
        ],
        4
      );
      module.exports = layout;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/line_bucket.js
  var require_line_bucket = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/line_bucket.js"(exports, module) {
      var { LineLayoutArray } = require_array_types();
      var { members: layoutAttributes } = require_line_attributes();
      var SegmentVector = require_segment();
      var { ProgramConfigurationSet } = require_program_configuration();
      var { TriangleIndexArray } = require_index_array_type();
      var EXTENT = require_extent();
      var mvt = require_vector_tile();
      var vectorTileFeatureTypes = mvt.VectorTileFeature.types;
      var { register } = require_transfer_registry();
      var { hasPattern, addPatternDependencies } = require_pattern_bucket_features();
      var loadGeometry = require_load_geometry();
      var EvaluationParameters = require_evaluation_parameters();
      var EXTRUDE_SCALE = 63;
      var COS_HALF_SHARP_CORNER = Math.cos(75 / 2 * (Math.PI / 180));
      var SHARP_CORNER_OFFSET = 15;
      var LINE_DISTANCE_BUFFER_BITS = 15;
      var LINE_DISTANCE_SCALE = 1 / 2;
      var MAX_LINE_DISTANCE = 2 ** (LINE_DISTANCE_BUFFER_BITS - 1) / LINE_DISTANCE_SCALE;
      function addLineVertex(layoutVertexBuffer, point, extrude, round, up, dir, linesofar) {
        layoutVertexBuffer.emplaceBack(
          // a_pos_normal
          point.x,
          point.y,
          round ? 1 : 0,
          up ? 1 : -1,
          // a_data
          // add 128 to store a byte in an unsigned byte
          Math.round(EXTRUDE_SCALE * extrude.x) + 128,
          Math.round(EXTRUDE_SCALE * extrude.y) + 128,
          // Encode the -1/0/1 direction value into the first two bits of .z of a_data.
          // Combine it with the lower 6 bits of `linesofar` (shifted by 2 bites to make
          // room for the direction value). The upper 8 bits of `linesofar` are placed in
          // the `w` component. `linesofar` is scaled down by `LINE_DISTANCE_SCALE` so that
          // we can store longer distances while sacrificing precision.
          (dir === 0 ? 0 : dir < 0 ? -1 : 1) + 1 | (linesofar * LINE_DISTANCE_SCALE & 63) << 2,
          linesofar * LINE_DISTANCE_SCALE >> 6
        );
      }
      var LineBucket = class {
        constructor(options) {
          this.zoom = options.zoom;
          this.overscaling = options.overscaling;
          this.layers = options.layers;
          this.layerIds = this.layers.map((layer) => layer.id);
          this.index = options.index;
          this.features = [];
          this.hasPattern = false;
          this.layoutVertexArray = new LineLayoutArray();
          this.indexArray = new TriangleIndexArray();
          this.programConfigurations = new ProgramConfigurationSet(layoutAttributes, options.layers, options.zoom);
          this.segments = new SegmentVector();
        }
        populate(features, options) {
          this.features = [];
          this.hasPattern = hasPattern("line", this.layers, options);
          for (const { feature, index, sourceLayerIndex } of features) {
            if (!this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) continue;
            const geometry = loadGeometry(feature);
            const patternFeature = {
              sourceLayerIndex,
              index,
              geometry,
              properties: feature.properties,
              type: feature.type,
              patterns: {}
            };
            if (typeof feature.id !== "undefined") {
              patternFeature.id = feature.id;
            }
            if (this.hasPattern) {
              this.features.push(addPatternDependencies("line", this.layers, patternFeature, this.zoom, options));
            } else {
              this.addFeature(patternFeature, geometry, index, {});
            }
            options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index);
          }
        }
        update(states, vtLayer, imagePositions) {
          if (!this.stateDependentLayers.length) return;
          this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
        }
        addFeatures(options, imagePositions) {
          for (const feature of this.features) {
            const { geometry } = feature;
            this.addFeature(feature, geometry, feature.index, imagePositions);
          }
        }
        isEmpty() {
          return this.layoutVertexArray.length === 0;
        }
        uploadPending() {
          return !this.uploaded || this.programConfigurations.needsUpload;
        }
        upload(context) {
          if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, layoutAttributes);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
          }
          this.programConfigurations.upload(context);
          this.uploaded = true;
        }
        destroy() {
          if (!this.layoutVertexBuffer) return;
          this.layoutVertexBuffer.destroy();
          this.indexBuffer.destroy();
          this.programConfigurations.destroy();
          this.segments.destroy();
        }
        addFeature(feature, geometry, index, imagePositions) {
          const layout = this.layers[0].layout;
          const join = layout.get("line-join").evaluate(feature, {});
          const cap = layout.get("line-cap");
          const miterLimit = layout.get("line-miter-limit");
          const roundLimit = layout.get("line-round-limit");
          for (const line of geometry) {
            this.addLine(line, feature, join, cap, miterLimit, roundLimit, index, imagePositions);
          }
        }
        addLine(vertices, feature, join, cap, miterLimit, roundLimit, index, imagePositions) {
          let lineDistances = null;
          if (!!feature.properties && feature.properties.hasOwnProperty("mapbox_clip_start") && feature.properties.hasOwnProperty("mapbox_clip_end")) {
            lineDistances = {
              start: feature.properties.mapbox_clip_start,
              end: feature.properties.mapbox_clip_end,
              tileTotal: void 0
            };
          }
          const isPolygon = vectorTileFeatureTypes[feature.type] === "Polygon";
          let len = vertices.length;
          while (len >= 2 && vertices[len - 1].equals(vertices[len - 2])) {
            len--;
          }
          let first = 0;
          while (first < len - 1 && vertices[first].equals(vertices[first + 1])) {
            first++;
          }
          if (len < (isPolygon ? 3 : 2)) return;
          if (lineDistances) {
            lineDistances.tileTotal = calculateFullDistance(vertices, first, len);
          }
          if (join === "bevel") miterLimit = 1.05;
          const sharpCornerOffset = SHARP_CORNER_OFFSET * (EXTENT / (512 * this.overscaling));
          const firstVertex = vertices[first];
          const segment = this.segments.prepareSegment(len * 10, this.layoutVertexArray, this.indexArray);
          this.distance = 0;
          const beginCap = cap;
          const endCap = isPolygon ? "butt" : cap;
          let startOfLine = true;
          let currentVertex;
          let prevVertex;
          let nextVertex;
          let prevNormal;
          let nextNormal;
          let offsetA;
          let offsetB;
          this.e1 = this.e2 = this.e3 = -1;
          if (isPolygon) {
            currentVertex = vertices[len - 2];
            nextNormal = firstVertex.sub(currentVertex)._unit()._perp();
          }
          for (let i = first; i < len; i++) {
            nextVertex = isPolygon && i === len - 1 ? vertices[first + 1] : (
              // if the line is closed, we treat the last vertex like the first
              vertices[i + 1]
            );
            if (nextVertex && vertices[i].equals(nextVertex)) continue;
            if (nextNormal) prevNormal = nextNormal;
            if (currentVertex) prevVertex = currentVertex;
            currentVertex = vertices[i];
            nextNormal = nextVertex ? nextVertex.sub(currentVertex)._unit()._perp() : prevNormal;
            prevNormal = prevNormal || nextNormal;
            let joinNormal = prevNormal.add(nextNormal);
            if (joinNormal.x !== 0 || joinNormal.y !== 0) {
              joinNormal._unit();
            }
            const cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
            const miterLength = cosHalfAngle !== 0 ? 1 / cosHalfAngle : Number.POSITIVE_INFINITY;
            const isSharpCorner = cosHalfAngle < COS_HALF_SHARP_CORNER && prevVertex && nextVertex;
            if (isSharpCorner && i > first) {
              const prevSegmentLength = currentVertex.dist(prevVertex);
              if (prevSegmentLength > 2 * sharpCornerOffset) {
                const newPrevVertex = currentVertex.sub(
                  currentVertex.sub(prevVertex)._mult(sharpCornerOffset / prevSegmentLength)._round()
                );
                this.distance += newPrevVertex.dist(prevVertex);
                this.addCurrentVertex(newPrevVertex, this.distance, prevNormal.mult(1), 0, 0, false, segment, lineDistances);
                prevVertex = newPrevVertex;
              }
            }
            const middleVertex = prevVertex && nextVertex;
            let currentJoin = middleVertex ? join : nextVertex ? beginCap : endCap;
            if (middleVertex && currentJoin === "round") {
              if (miterLength < roundLimit) {
                currentJoin = "miter";
              } else if (miterLength <= 2) {
                currentJoin = "fakeround";
              }
            }
            if (currentJoin === "miter" && miterLength > miterLimit) {
              currentJoin = "bevel";
            }
            if (currentJoin === "bevel") {
              if (miterLength > 2) currentJoin = "flipbevel";
              if (miterLength < miterLimit) currentJoin = "miter";
            }
            if (prevVertex) this.distance += currentVertex.dist(prevVertex);
            if (currentJoin === "miter") {
              joinNormal._mult(miterLength);
              this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);
            } else if (currentJoin === "flipbevel") {
              if (miterLength > 100) {
                joinNormal = nextNormal.clone().mult(-1);
              } else {
                const direction = prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0 ? -1 : 1;
                const bevelLength = miterLength * prevNormal.add(nextNormal).mag() / prevNormal.sub(nextNormal).mag();
                joinNormal._perp()._mult(bevelLength * direction);
              }
              this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);
              this.addCurrentVertex(currentVertex, this.distance, joinNormal.mult(-1), 0, 0, false, segment, lineDistances);
            } else if (currentJoin === "bevel" || currentJoin === "fakeround") {
              const lineTurnsLeft = prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0;
              const offset = -Math.sqrt(miterLength * miterLength - 1);
              if (lineTurnsLeft) {
                offsetB = 0;
                offsetA = offset;
              } else {
                offsetA = 0;
                offsetB = offset;
              }
              if (!startOfLine) {
                this.addCurrentVertex(
                  currentVertex,
                  this.distance,
                  prevNormal,
                  offsetA,
                  offsetB,
                  false,
                  segment,
                  lineDistances
                );
              }
              if (currentJoin === "fakeround") {
                const n = Math.floor((0.5 - (cosHalfAngle - 0.5)) * 8);
                let approxFractionalJoinNormal;
                for (let m = 0; m < n; m++) {
                  approxFractionalJoinNormal = nextNormal.mult((m + 1) / (n + 1))._add(prevNormal)._unit();
                  this.addPieSliceVertex(
                    currentVertex,
                    this.distance,
                    approxFractionalJoinNormal,
                    lineTurnsLeft,
                    segment,
                    lineDistances
                  );
                }
                this.addPieSliceVertex(currentVertex, this.distance, joinNormal, lineTurnsLeft, segment, lineDistances);
                for (let k = n - 1; k >= 0; k--) {
                  approxFractionalJoinNormal = prevNormal.mult((k + 1) / (n + 1))._add(nextNormal)._unit();
                  this.addPieSliceVertex(
                    currentVertex,
                    this.distance,
                    approxFractionalJoinNormal,
                    lineTurnsLeft,
                    segment,
                    lineDistances
                  );
                }
              }
              if (nextVertex) {
                this.addCurrentVertex(
                  currentVertex,
                  this.distance,
                  nextNormal,
                  -offsetA,
                  -offsetB,
                  false,
                  segment,
                  lineDistances
                );
              }
            } else if (currentJoin === "butt") {
              if (!startOfLine) {
                this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
              }
              if (nextVertex) {
                this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
              }
            } else if (currentJoin === "square") {
              if (!startOfLine) {
                this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, false, segment, lineDistances);
                this.e1 = this.e2 = -1;
              }
              if (nextVertex) {
                this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, false, segment, lineDistances);
              }
            } else if (currentJoin === "round") {
              if (!startOfLine) {
                this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
                this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, true, segment, lineDistances);
                this.e1 = this.e2 = -1;
              }
              if (nextVertex) {
                this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, true, segment, lineDistances);
                this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
              }
            }
            if (isSharpCorner && i < len - 1) {
              const nextSegmentLength = currentVertex.dist(nextVertex);
              if (nextSegmentLength > 2 * sharpCornerOffset) {
                const newCurrentVertex = currentVertex.add(
                  nextVertex.sub(currentVertex)._mult(sharpCornerOffset / nextSegmentLength)._round()
                );
                this.distance += newCurrentVertex.dist(currentVertex);
                this.addCurrentVertex(
                  newCurrentVertex,
                  this.distance,
                  nextNormal.mult(1),
                  0,
                  0,
                  false,
                  segment,
                  lineDistances
                );
                currentVertex = newCurrentVertex;
              }
            }
            startOfLine = false;
          }
          this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
        }
        /**
         * Add two vertices to the buffers.
         *
         * @param {Object} currentVertex the line vertex to add buffer vertices for
         * @param {number} distance the distance from the beginning of the line to the vertex
         * @param {number} endLeft extrude to shift the left vertex along the line
         * @param {number} endRight extrude to shift the left vertex along the line
         * @param {boolean} round whether this is a round cap
         * @private
         */
        addCurrentVertex(currentVertex, distance, normal, endLeft, endRight, round, segment, distancesForScaling) {
          let extrude;
          const layoutVertexArray = this.layoutVertexArray;
          const indexArray = this.indexArray;
          if (distancesForScaling) {
            distance = scaleDistance(distance, distancesForScaling);
          }
          extrude = normal.clone();
          if (endLeft) extrude._sub(normal.perp()._mult(endLeft));
          addLineVertex(layoutVertexArray, currentVertex, extrude, round, false, endLeft, distance);
          this.e3 = segment.vertexLength++;
          if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
          }
          this.e1 = this.e2;
          this.e2 = this.e3;
          extrude = normal.mult(-1);
          if (endRight) extrude._sub(normal.perp()._mult(endRight));
          addLineVertex(layoutVertexArray, currentVertex, extrude, round, true, -endRight, distance);
          this.e3 = segment.vertexLength++;
          if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
          }
          this.e1 = this.e2;
          this.e2 = this.e3;
          if (distance > MAX_LINE_DISTANCE / 2 && !distancesForScaling) {
            this.distance = 0;
            this.addCurrentVertex(currentVertex, this.distance, normal, endLeft, endRight, round, segment);
          }
        }
        /**
         * Add a single new vertex and a triangle using two previous vertices.
         * This adds a pie slice triangle near a join to simulate round joins
         *
         * @param currentVertex the line vertex to add buffer vertices for
         * @param distance the distance from the beginning of the line to the vertex
         * @param extrude the offset of the new vertex from the currentVertex
         * @param lineTurnsLeft whether the line is turning left or right at this angle
         * @private
         */
        addPieSliceVertex(currentVertex, distance, extrude, lineTurnsLeft, segment, distancesForScaling) {
          extrude = extrude.mult(lineTurnsLeft ? -1 : 1);
          const layoutVertexArray = this.layoutVertexArray;
          const indexArray = this.indexArray;
          if (distancesForScaling) distance = scaleDistance(distance, distancesForScaling);
          addLineVertex(layoutVertexArray, currentVertex, extrude, false, lineTurnsLeft, 0, distance);
          this.e3 = segment.vertexLength++;
          if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
          }
          if (lineTurnsLeft) {
            this.e2 = this.e3;
          } else {
            this.e1 = this.e3;
          }
        }
      };
      function scaleDistance(tileDistance, stats) {
        return (tileDistance / stats.tileTotal * (stats.end - stats.start) + stats.start) * (MAX_LINE_DISTANCE - 1);
      }
      function calculateFullDistance(vertices, first, len) {
        let currentVertex;
        let nextVertex;
        let total = 0;
        for (let i = first; i < len - 1; i++) {
          currentVertex = vertices[i];
          nextVertex = vertices[i + 1];
          total += currentVertex.dist(nextVertex);
        }
        return total;
      }
      register("LineBucket", LineBucket, { omit: ["layers", "features"] });
      module.exports = LineBucket;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/line_style_layer_properties.js
  var require_line_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/line_style_layer_properties.js"(exports, module) {
      var {
        Properties,
        ColorRampProperty,
        CrossFadedDataDrivenProperty,
        CrossFadedProperty,
        DataConstantProperty,
        DataDrivenProperty
      } = require_properties2();
      var layout = new Properties({
        "line-cap": new DataConstantProperty({
          type: "enum",
          values: ["butt", "round", "square"],
          default: "butt",
          expression: { parameters: ["zoom"] }
        }),
        "line-join": new DataDrivenProperty({
          type: "enum",
          values: ["bevel", "round", "miter"],
          default: "miter",
          expression: { parameters: ["zoom", "feature"] }
        }),
        "line-miter-limit": new DataConstantProperty({
          type: "number",
          default: 2,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "line-round-limit": new DataConstantProperty({
          type: "number",
          default: 1.05,
          expression: { interpolated: true, parameters: ["zoom"] }
        })
      });
      var paint = new Properties({
        "line-opacity": new DataDrivenProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "line-color": new DataDrivenProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "line-translate": new DataConstantProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "line-translate-anchor": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "map",
          expression: { parameters: ["zoom"] }
        }),
        "line-width": new DataDrivenProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "line-gap-width": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "line-offset": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "line-blur": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "line-dasharray": new CrossFadedProperty({
          type: "array",
          value: "number",
          transition: true,
          expression: { parameters: ["zoom"] }
        }),
        "line-pattern": new CrossFadedDataDrivenProperty({
          type: "string",
          transition: true,
          expression: { parameters: ["zoom", "feature"] }
        }),
        "line-gradient": new ColorRampProperty({
          type: "color",
          expression: { interpolated: true, parameters: ["line-progress"] }
        })
      });
      module.exports = { paint, layout };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/line_style_layer.js
  var require_line_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/line_style_layer.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var StyleLayer = require_style_layer();
      var LineBucket = require_line_bucket();
      var { polygonIntersectsBufferedMultiLine } = require_intersection_tests();
      var { getMaximumPaintValue, translateDistance, translate } = require_query_utils();
      var properties = require_line_style_layer_properties();
      var EvaluationParameters = require_evaluation_parameters();
      var renderColorRamp = require_color_ramp();
      var { DataDrivenProperty } = require_properties2();
      var LineFloorwidthProperty = class extends DataDrivenProperty {
        possiblyEvaluate(value, parameters) {
          parameters = new EvaluationParameters(Math.floor(parameters.zoom), {
            now: parameters.now,
            fadeDuration: parameters.fadeDuration,
            zoomHistory: parameters.zoomHistory,
            transition: parameters.transition
          });
          return super.possiblyEvaluate(value, parameters);
        }
        evaluate(value, globals, feature, featureState) {
          globals = Object.assign({}, globals, { zoom: Math.floor(globals.zoom) });
          return super.evaluate(value, globals, feature, featureState);
        }
      };
      var lineFloorwidthProperty = new LineFloorwidthProperty(properties.paint.properties["line-width"].specification);
      lineFloorwidthProperty.useIntegerZoom = true;
      var LineStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
        _handleSpecialPaintPropertyUpdate(name) {
          if (name === "line-gradient") {
            this._updateGradient();
          }
        }
        _updateGradient() {
          const expression = this._transitionablePaint._values["line-gradient"].value.expression;
          this.gradient = renderColorRamp(expression, "lineProgress");
          this.gradientTexture = null;
        }
        recalculate(parameters) {
          super.recalculate(parameters);
          this.paint._values["line-floorwidth"] = lineFloorwidthProperty.possiblyEvaluate(
            this._transitioningPaint._values["line-width"].value,
            parameters
          );
        }
        createBucket(parameters) {
          return new LineBucket(parameters);
        }
        queryRadius(bucket) {
          const lineBucket = bucket;
          const width = getLineWidth(
            getMaximumPaintValue("line-width", this, lineBucket),
            getMaximumPaintValue("line-gap-width", this, lineBucket)
          );
          const offset = getMaximumPaintValue("line-offset", this, lineBucket);
          return width / 2 + Math.abs(offset) + translateDistance(this.paint.get("line-translate"));
        }
        queryIntersectsFeature(queryGeometry, feature, featureState, geometry, zoom, transform, pixelsToTileUnits) {
          const translatedPolygon = translate(
            queryGeometry,
            this.paint.get("line-translate"),
            this.paint.get("line-translate-anchor"),
            transform.angle,
            pixelsToTileUnits
          );
          const halfWidth = pixelsToTileUnits / 2 * getLineWidth(
            this.paint.get("line-width").evaluate(feature, featureState),
            this.paint.get("line-gap-width").evaluate(feature, featureState)
          );
          const lineOffset = this.paint.get("line-offset").evaluate(feature, featureState);
          if (lineOffset) {
            geometry = offsetLine(geometry, lineOffset * pixelsToTileUnits);
          }
          return polygonIntersectsBufferedMultiLine(translatedPolygon, geometry, halfWidth);
        }
        isTileClipped() {
          return true;
        }
      };
      module.exports = LineStyleLayer;
      function getLineWidth(lineWidth, lineGapWidth) {
        if (lineGapWidth > 0) {
          return lineGapWidth + 2 * lineWidth;
        }
        return lineWidth;
      }
      function offsetLine(rings, offset) {
        const newRings = [];
        const zero = new Point2(0, 0);
        for (let k = 0; k < rings.length; k++) {
          const ring = rings[k];
          const newRing = [];
          for (let i = 0; i < ring.length; i++) {
            const a = ring[i - 1];
            const b = ring[i];
            const c = ring[i + 1];
            const aToB = i === 0 ? zero : b.sub(a)._unit()._perp();
            const bToC = i === ring.length - 1 ? zero : c.sub(b)._unit()._perp();
            const extrude = aToB._add(bToC)._unit();
            const cosHalfAngle = extrude.x * bToC.x + extrude.y * bToC.y;
            extrude._mult(1 / cosHalfAngle);
            newRing.push(extrude._mult(offset)._add(b));
          }
          newRings.push(newRing);
        }
        return newRings;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/symbol_attributes.js
  var require_symbol_attributes = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/symbol_attributes.js"(exports, module) {
      var { createLayout } = require_struct_array();
      var symbolLayoutAttributes = createLayout([
        { name: "a_pos_offset", components: 4, type: "Int16" },
        { name: "a_data", components: 4, type: "Uint16" }
      ]);
      var dynamicLayoutAttributes = createLayout([{ name: "a_projected_pos", components: 3, type: "Float32" }], 4);
      var placementOpacityAttributes = createLayout([{ name: "a_fade_opacity", components: 1, type: "Uint32" }], 4);
      var collisionVertexAttributes = createLayout([{ name: "a_placed", components: 2, type: "Uint8" }], 4);
      var collisionBox = createLayout([
        // the box is centered around the anchor point
        { type: "Int16", name: "anchorPointX" },
        { type: "Int16", name: "anchorPointY" },
        // distances to the edges from the anchor
        { type: "Int16", name: "x1" },
        { type: "Int16", name: "y1" },
        { type: "Int16", name: "x2" },
        { type: "Int16", name: "y2" },
        // the index of the feature in the original vectortile
        { type: "Uint32", name: "featureIndex" },
        // the source layer the feature appears in
        { type: "Uint16", name: "sourceLayerIndex" },
        // the bucket the feature appears in
        { type: "Uint16", name: "bucketIndex" },
        // collision circles for lines store their distance to the anchor in tile units
        // so that they can be ignored if the projected label doesn't extend into
        // the box area
        { type: "Int16", name: "radius" },
        { type: "Int16", name: "signedDistanceFromAnchor" }
      ]);
      var collisionBoxLayout = createLayout(
        [
          // used to render collision boxes for debugging purposes
          { name: "a_pos", components: 2, type: "Int16" },
          { name: "a_anchor_pos", components: 2, type: "Int16" },
          { name: "a_extrude", components: 2, type: "Int16" }
        ],
        4
      );
      var collisionCircleLayout = createLayout(
        [
          // used to render collision circles for debugging purposes
          { name: "a_pos", components: 2, type: "Int16" },
          { name: "a_anchor_pos", components: 2, type: "Int16" },
          { name: "a_extrude", components: 2, type: "Int16" }
        ],
        4
      );
      var placement = createLayout([
        { type: "Int16", name: "anchorX" },
        { type: "Int16", name: "anchorY" },
        { type: "Uint16", name: "glyphStartIndex" },
        { type: "Uint16", name: "numGlyphs" },
        { type: "Uint32", name: "vertexStartIndex" },
        { type: "Uint32", name: "lineStartIndex" },
        { type: "Uint32", name: "lineLength" },
        { type: "Uint16", name: "segment" },
        { type: "Uint16", name: "lowerSize" },
        { type: "Uint16", name: "upperSize" },
        { type: "Float32", name: "lineOffsetX" },
        { type: "Float32", name: "lineOffsetY" },
        { type: "Uint8", name: "writingMode" },
        { type: "Uint8", name: "hidden" }
      ]);
      var symbolInstance = createLayout([
        { type: "Int16", name: "anchorX" },
        { type: "Int16", name: "anchorY" },
        { type: "Int16", name: "horizontalPlacedTextSymbolIndex" },
        { type: "Int16", name: "verticalPlacedTextSymbolIndex" },
        { type: "Uint16", name: "key" },
        { type: "Uint16", name: "textBoxStartIndex" },
        { type: "Uint16", name: "textBoxEndIndex" },
        { type: "Uint16", name: "iconBoxStartIndex" },
        { type: "Uint16", name: "iconBoxEndIndex" },
        { type: "Uint16", name: "featureIndex" },
        { type: "Uint16", name: "numGlyphVertices" },
        { type: "Uint16", name: "numVerticalGlyphVertices" },
        { type: "Uint16", name: "numIconVertices" },
        { type: "Uint32", name: "crossTileID" }
      ]);
      var glyphOffset = createLayout([{ type: "Float32", name: "offsetX" }]);
      var lineVertex = createLayout([
        { type: "Int16", name: "x" },
        { type: "Int16", name: "y" },
        { type: "Int16", name: "tileUnitDistanceFromAnchor" }
      ]);
      module.exports = {
        symbolLayoutAttributes,
        dynamicLayoutAttributes,
        placementOpacityAttributes,
        collisionVertexAttributes,
        collisionBox,
        collisionBoxLayout,
        collisionCircleLayout,
        placement,
        symbolInstance,
        glyphOffset,
        lineVertex
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/transform_text.js
  var require_transform_text = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/transform_text.js"(exports, module) {
      var { plugin: rtlTextPlugin } = require_rtl_text_plugin();
      function transformText(text, layer, feature) {
        const transform = layer.layout.get("text-transform").evaluate(feature, {});
        if (transform === "uppercase") {
          text = text.toLocaleUpperCase();
        } else if (transform === "lowercase") {
          text = text.toLocaleLowerCase();
        }
        if (rtlTextPlugin.applyArabicShaping) {
          text = rtlTextPlugin.applyArabicShaping(text);
        }
        return text;
      }
      module.exports = function(text, layer, feature) {
        text.sections.forEach((section) => {
          section.text = transformText(section.text, layer, feature);
        });
        return text;
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/mergelines.js
  var require_mergelines = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/mergelines.js"(exports, module) {
      module.exports = function(features) {
        const leftIndex = /* @__PURE__ */ new Map();
        const rightIndex = /* @__PURE__ */ new Map();
        const mergedFeatures = [];
        let mergedIndex = 0;
        for (let k = 0; k < features.length; k++) {
          const { geometry, text: featureText } = features[k];
          const text = featureText ? featureText.toString() : null;
          if (!text) {
            add(k);
            continue;
          }
          const leftKey = getKey(text, geometry);
          const rightKey = getKey(text, geometry, true);
          if (rightIndex.has(leftKey) && leftIndex.has(rightKey) && rightIndex.get(leftKey) !== leftIndex.get(rightKey)) {
            const j = mergeFromLeft(leftKey, rightKey, geometry);
            const i = mergeFromRight(leftKey, rightKey, mergedFeatures[j].geometry);
            leftIndex.delete(leftKey);
            rightIndex.delete(rightKey);
            rightIndex.set(getKey(text, mergedFeatures[i].geometry, true), i);
            mergedFeatures[j].geometry = null;
          } else if (rightIndex.has(leftKey)) {
            mergeFromRight(leftKey, rightKey, geometry);
          } else if (leftIndex.has(rightKey)) {
            mergeFromLeft(leftKey, rightKey, geometry);
          } else {
            add(k);
            leftIndex.set(leftKey, mergedIndex - 1);
            rightIndex.set(rightKey, mergedIndex - 1);
          }
        }
        return mergedFeatures.filter((f) => f.geometry);
        function add(k) {
          mergedFeatures.push(features[k]);
          mergedIndex++;
        }
        function mergeFromRight(leftKey, rightKey, [geom]) {
          const i = rightIndex.get(leftKey);
          rightIndex.delete(leftKey);
          rightIndex.set(rightKey, i);
          const feature = mergedFeatures[i];
          feature.geometry[0].pop();
          feature.geometry[0].push(...geom);
          return i;
        }
        function mergeFromLeft(leftKey, rightKey, [geom]) {
          const i = leftIndex.get(rightKey);
          leftIndex.delete(rightKey);
          leftIndex.set(leftKey, i);
          const feature = mergedFeatures[i];
          feature.geometry[0].shift();
          feature.geometry[0].unshift(...geom);
          return i;
        }
        function getKey(text, [geom], onRight) {
          const { x, y } = geom.at(onRight ? -1 : 0);
          return `${text}:${x}:${y}`;
        }
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/verticalize_punctuation.js
  var require_verticalize_punctuation = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/verticalize_punctuation.js"(exports, module) {
      var { charHasRotatedVerticalOrientation } = require_script_detection();
      var verticalizedCharacterMap = {
        "!": "\uFE15",
        "#": "\uFF03",
        $: "\uFF04",
        "%": "\uFF05",
        "&": "\uFF06",
        "(": "\uFE35",
        ")": "\uFE36",
        "*": "\uFF0A",
        "+": "\uFF0B",
        ",": "\uFE10",
        "-": "\uFE32",
        ".": "\u30FB",
        "/": "\uFF0F",
        ":": "\uFE13",
        ";": "\uFE14",
        "<": "\uFE3F",
        "=": "\uFF1D",
        ">": "\uFE40",
        "?": "\uFE16",
        "@": "\uFF20",
        "[": "\uFE47",
        "\\": "\uFF3C",
        "]": "\uFE48",
        "^": "\uFF3E",
        _: "\uFE33",
        "`": "\uFF40",
        "{": "\uFE37",
        "|": "\u2015",
        "}": "\uFE38",
        "~": "\uFF5E",
        "\xA2": "\uFFE0",
        "\xA3": "\uFFE1",
        "\xA5": "\uFFE5",
        "\xA6": "\uFFE4",
        "\xAC": "\uFFE2",
        "\xAF": "\uFFE3",
        "\u2013": "\uFE32",
        "\u2014": "\uFE31",
        "\u2018": "\uFE43",
        "\u2019": "\uFE44",
        "\u201C": "\uFE41",
        "\u201D": "\uFE42",
        "\u2026": "\uFE19",
        "\u2027": "\u30FB",
        "\u20A9": "\uFFE6",
        "\u3001": "\uFE11",
        "\u3002": "\uFE12",
        "\u3008": "\uFE3F",
        "\u3009": "\uFE40",
        "\u300A": "\uFE3D",
        "\u300B": "\uFE3E",
        "\u300C": "\uFE41",
        "\u300D": "\uFE42",
        "\u300E": "\uFE43",
        "\u300F": "\uFE44",
        "\u3010": "\uFE3B",
        "\u3011": "\uFE3C",
        "\u3014": "\uFE39",
        "\u3015": "\uFE3A",
        "\u3016": "\uFE17",
        "\u3017": "\uFE18",
        "\uFF01": "\uFE15",
        "\uFF08": "\uFE35",
        "\uFF09": "\uFE36",
        "\uFF0C": "\uFE10",
        "\uFF0D": "\uFE32",
        "\uFF0E": "\u30FB",
        "\uFF1A": "\uFE13",
        "\uFF1B": "\uFE14",
        "\uFF1C": "\uFE3F",
        "\uFF1E": "\uFE40",
        "\uFF1F": "\uFE16",
        "\uFF3B": "\uFE47",
        "\uFF3D": "\uFE48",
        "\uFF3F": "\uFE33",
        "\uFF5B": "\uFE37",
        "\uFF5C": "\u2015",
        "\uFF5D": "\uFE38",
        "\uFF5F": "\uFE35",
        "\uFF60": "\uFE36",
        "\uFF61": "\uFE12",
        "\uFF62": "\uFE41",
        "\uFF63": "\uFE42"
      };
      function verticalizePunctuation(input) {
        let output = "";
        for (let i = 0; i < input.length; i++) {
          const nextCharCode = input.charCodeAt(i + 1) || null;
          const prevCharCode = input.charCodeAt(i - 1) || null;
          const canReplacePunctuation = (!nextCharCode || !charHasRotatedVerticalOrientation(nextCharCode) || verticalizedCharacterMap[input[i + 1]]) && (!prevCharCode || !charHasRotatedVerticalOrientation(prevCharCode) || verticalizedCharacterMap[input[i - 1]]);
          if (canReplacePunctuation && verticalizedCharacterMap[input[i]]) {
            output += verticalizedCharacterMap[input[i]];
          } else {
            output += input[i];
          }
        }
        return output;
      }
      verticalizePunctuation.verticalizedCharacterMap = verticalizedCharacterMap;
      module.exports = verticalizePunctuation;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/interpolate.js
  var require_interpolate3 = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/interpolate.js"(exports, module) {
      module.exports = interpolate;
      function interpolate(a, b, t) {
        return a * (1 - t) + b * t;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/symbol_size.js
  var require_symbol_size = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/symbol_size.js"(exports, module) {
      var { normalizePropertyExpression } = require_style_expressions();
      var interpolate = require_interpolate3();
      var { clamp } = require_util();
      var EvaluationParameters = require_evaluation_parameters();
      module.exports = { getSizeData, evaluateSizeForFeature, evaluateSizeForZoom };
      function getSizeData(tileZoom, value) {
        const { expression } = value;
        if (expression.kind === "constant") {
          return {
            functionType: "constant",
            layoutSize: expression.evaluate(new EvaluationParameters(tileZoom + 1))
          };
        }
        if (expression.kind === "source") {
          return {
            functionType: "source"
          };
        }
        const levels = expression.zoomStops;
        let lower = 0;
        while (lower < levels.length && levels[lower] <= tileZoom) lower++;
        lower = Math.max(0, lower - 1);
        let upper = lower;
        while (upper < levels.length && levels[upper] < tileZoom + 1) upper++;
        upper = Math.min(levels.length - 1, upper);
        const zoomRange = {
          min: levels[lower],
          max: levels[upper]
        };
        if (expression.kind === "composite") {
          return {
            functionType: "composite",
            zoomRange,
            propertyValue: value.value
          };
        }
        return {
          functionType: "camera",
          layoutSize: expression.evaluate(new EvaluationParameters(tileZoom + 1)),
          zoomRange,
          sizeRange: {
            min: expression.evaluate(new EvaluationParameters(zoomRange.min)),
            max: expression.evaluate(new EvaluationParameters(zoomRange.max))
          },
          propertyValue: value.value
        };
      }
      function evaluateSizeForFeature(sizeData, partiallyEvaluatedSize, symbol) {
        const part = partiallyEvaluatedSize;
        if (sizeData.functionType === "source") {
          return symbol.lowerSize / 10;
        }
        if (sizeData.functionType === "composite") {
          return interpolate(symbol.lowerSize / 10, symbol.upperSize / 10, part.uSizeT);
        }
        return part.uSize;
      }
      function evaluateSizeForZoom(sizeData, currentZoom, property) {
        if (sizeData.functionType === "constant") {
          return {
            uSizeT: 0,
            uSize: sizeData.layoutSize
          };
        }
        if (sizeData.functionType === "source") {
          return {
            uSizeT: 0,
            uSize: 0
          };
        }
        if (sizeData.functionType === "camera") {
          const { propertyValue: propertyValue2, zoomRange: zoomRange2, sizeRange } = sizeData;
          const expression2 = normalizePropertyExpression(propertyValue2, property.specification);
          const t = clamp(expression2.interpolationFactor(currentZoom, zoomRange2.min, zoomRange2.max), 0, 1);
          return {
            uSizeT: 0,
            uSize: sizeRange.min + t * (sizeRange.max - sizeRange.min)
          };
        }
        const { propertyValue, zoomRange } = sizeData;
        const expression = normalizePropertyExpression(propertyValue, property.specification);
        return {
          uSizeT: clamp(expression.interpolationFactor(currentZoom, zoomRange.min, zoomRange.max), 0, 1),
          uSize: 0
        };
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/bucket/symbol_bucket.js
  var require_symbol_bucket = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/bucket/symbol_bucket.js"(exports, module) {
      var {
        symbolLayoutAttributes,
        collisionVertexAttributes,
        collisionBoxLayout,
        collisionCircleLayout,
        dynamicLayoutAttributes
      } = require_symbol_attributes();
      var {
        SymbolLayoutArray,
        SymbolDynamicLayoutArray,
        SymbolOpacityArray,
        CollisionBoxLayoutArray,
        CollisionCircleLayoutArray,
        CollisionVertexArray,
        PlacedSymbolArray,
        SymbolInstanceArray,
        GlyphOffsetArray,
        SymbolLineVertexArray
      } = require_array_types();
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var SegmentVector = require_segment();
      var { ProgramConfigurationSet } = require_program_configuration();
      var { TriangleIndexArray, LineIndexArray } = require_index_array_type();
      var transformText = require_transform_text();
      var mergeLines = require_mergelines();
      var { allowsVerticalWritingMode } = require_script_detection();
      var loadGeometry = require_load_geometry();
      var mvt = require_vector_tile();
      var vectorTileFeatureTypes = mvt.VectorTileFeature.types;
      var { verticalizedCharacterMap } = require_verticalize_punctuation();
      var { getSizeData } = require_symbol_size();
      var { register } = require_transfer_registry();
      var EvaluationParameters = require_evaluation_parameters();
      var { Formatted } = require_style_expressions();
      var shaderOpacityAttributes = [{ name: "a_fade_opacity", components: 1, type: "Uint8", offset: 0 }];
      function addVertex(array, anchorX, anchorY, ox, oy, tx, ty, sizeVertex) {
        array.emplaceBack(
          // a_pos_offset
          anchorX,
          anchorY,
          Math.round(ox * 32),
          Math.round(oy * 32),
          // a_data
          tx,
          // x coordinate of symbol on glyph atlas texture
          ty,
          // y coordinate of symbol on glyph atlas texture
          sizeVertex ? sizeVertex[0] : 0,
          sizeVertex ? sizeVertex[1] : 0
        );
      }
      function addDynamicAttributes(dynamicLayoutVertexArray, p, angle) {
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
      }
      var SymbolBuffers = class {
        constructor(programConfigurations) {
          this.layoutVertexArray = new SymbolLayoutArray();
          this.indexArray = new TriangleIndexArray();
          this.programConfigurations = programConfigurations;
          this.segments = new SegmentVector();
          this.dynamicLayoutVertexArray = new SymbolDynamicLayoutArray();
          this.opacityVertexArray = new SymbolOpacityArray();
          this.placedSymbolArray = new PlacedSymbolArray();
        }
        upload(context, dynamicIndexBuffer, upload, update) {
          if (upload) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, symbolLayoutAttributes.members);
            this.indexBuffer = context.createIndexBuffer(this.indexArray, dynamicIndexBuffer);
            this.dynamicLayoutVertexBuffer = context.createVertexBuffer(
              this.dynamicLayoutVertexArray,
              dynamicLayoutAttributes.members,
              true
            );
            this.opacityVertexBuffer = context.createVertexBuffer(this.opacityVertexArray, shaderOpacityAttributes, true);
            this.opacityVertexBuffer.itemSize = 1;
          }
          if (upload || update) {
            this.programConfigurations.upload(context);
          }
        }
        destroy() {
          if (!this.layoutVertexBuffer) return;
          this.layoutVertexBuffer.destroy();
          this.indexBuffer.destroy();
          this.programConfigurations.destroy();
          this.segments.destroy();
          this.dynamicLayoutVertexBuffer.destroy();
          this.opacityVertexBuffer.destroy();
        }
      };
      register("SymbolBuffers", SymbolBuffers);
      var CollisionBuffers = class {
        constructor(LayoutArray, layoutAttributes, IndexArray) {
          this.layoutVertexArray = new LayoutArray();
          this.layoutAttributes = layoutAttributes;
          this.indexArray = new IndexArray();
          this.segments = new SegmentVector();
          this.collisionVertexArray = new CollisionVertexArray();
        }
        upload(context) {
          this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, this.layoutAttributes);
          this.indexBuffer = context.createIndexBuffer(this.indexArray);
          this.collisionVertexBuffer = context.createVertexBuffer(
            this.collisionVertexArray,
            collisionVertexAttributes.members,
            true
          );
        }
        destroy() {
          if (!this.layoutVertexBuffer) return;
          this.layoutVertexBuffer.destroy();
          this.indexBuffer.destroy();
          this.segments.destroy();
          this.collisionVertexBuffer.destroy();
        }
      };
      register("CollisionBuffers", CollisionBuffers);
      var SymbolBucket = class {
        constructor(options) {
          this.collisionBoxArray = options.collisionBoxArray;
          this.zoom = options.zoom;
          this.overscaling = options.overscaling;
          this.layers = options.layers;
          this.layerIds = this.layers.map((layer2) => layer2.id);
          this.index = options.index;
          this.pixelRatio = options.pixelRatio;
          this.sourceLayerIndex = options.sourceLayerIndex;
          this.hasPattern = false;
          const layer = this.layers[0];
          const unevaluatedLayoutValues = layer._unevaluatedLayout._values;
          this.textSizeData = getSizeData(this.zoom, unevaluatedLayoutValues["text-size"]);
          this.iconSizeData = getSizeData(this.zoom, unevaluatedLayoutValues["icon-size"]);
          const layout = this.layers[0].layout;
          const zOrderByViewportY = layout.get("symbol-z-order") === "viewport-y";
          this.sortFeaturesByY = zOrderByViewportY && (layout.get("text-allow-overlap") || layout.get("icon-allow-overlap") || layout.get("text-ignore-placement") || layout.get("icon-ignore-placement"));
          this.sourceID = options.sourceID;
        }
        createArrays() {
          this.text = new SymbolBuffers(
            new ProgramConfigurationSet(
              symbolLayoutAttributes.members,
              this.layers,
              this.zoom,
              (property) => /^text/.test(property)
            )
          );
          this.icon = new SymbolBuffers(
            new ProgramConfigurationSet(
              symbolLayoutAttributes.members,
              this.layers,
              this.zoom,
              (property) => /^icon/.test(property)
            )
          );
          this.collisionBox = new CollisionBuffers(CollisionBoxLayoutArray, collisionBoxLayout.members, LineIndexArray);
          this.collisionCircle = new CollisionBuffers(
            CollisionCircleLayoutArray,
            collisionCircleLayout.members,
            TriangleIndexArray
          );
          this.glyphOffsetArray = new GlyphOffsetArray();
          this.lineVertexArray = new SymbolLineVertexArray();
          this.symbolInstances = new SymbolInstanceArray();
        }
        calculateGlyphDependencies(text, stack, textAlongLine, doesAllowVerticalWritingMode) {
          for (let i = 0; i < text.length; i++) {
            stack[text.charCodeAt(i)] = true;
            if (textAlongLine && doesAllowVerticalWritingMode) {
              const verticalChar = verticalizedCharacterMap[text.charAt(i)];
              if (verticalChar) {
                stack[verticalChar.charCodeAt(0)] = true;
              }
            }
          }
        }
        populate(features, options) {
          const layer = this.layers[0];
          const layout = layer.layout;
          const textFont = layout.get("text-font");
          const textField = layout.get("text-field");
          const iconImage = layout.get("icon-image");
          const hasText = (textField.value.kind !== "constant" || textField.value.value.toString().length > 0) && (textFont.value.kind !== "constant" || textFont.value.value.length > 0);
          const hasIcon = iconImage.value.kind !== "constant" || iconImage.value.value && iconImage.value.value.length > 0;
          this.features = [];
          if (!hasText && !hasIcon) {
            return;
          }
          const icons = options.iconDependencies;
          const stacks = options.glyphDependencies;
          const globalProperties = new EvaluationParameters(this.zoom);
          for (const { feature, index, sourceLayerIndex } of features) {
            if (!layer._featureFilter(globalProperties, feature)) {
              continue;
            }
            let text;
            if (hasText) {
              const resolvedTokens = layer.getValueAndResolveTokens("text-field", feature);
              text = transformText(
                resolvedTokens instanceof Formatted ? resolvedTokens : Formatted.fromString(resolvedTokens),
                layer,
                feature
              );
            }
            let icon;
            if (hasIcon) {
              icon = layer.getValueAndResolveTokens("icon-image", feature);
            }
            if (!text && !icon) {
              continue;
            }
            const symbolFeature = {
              text,
              icon,
              index,
              sourceLayerIndex,
              geometry: loadGeometry(feature),
              properties: feature.properties,
              type: vectorTileFeatureTypes[feature.type]
            };
            if (typeof feature.id !== "undefined") {
              symbolFeature.id = feature.id;
            }
            this.features.push(symbolFeature);
            if (icon) {
              icons[icon] = true;
            }
            if (text) {
              const fontStack = textFont.evaluate(feature, {}).join(",");
              const textAlongLine = layout.get("text-rotation-alignment") === "map" && layout.get("symbol-placement") !== "point";
              for (const section of text.sections) {
                const doesAllowVerticalWritingMode = allowsVerticalWritingMode(text.toString());
                const sectionFont = section.fontStack || fontStack;
                const sectionStack = stacks[sectionFont] = stacks[sectionFont] || {};
                this.calculateGlyphDependencies(section.text, sectionStack, textAlongLine, doesAllowVerticalWritingMode);
              }
            }
          }
          if (layout.get("symbol-placement") === "line") {
            this.features = mergeLines(this.features);
          }
        }
        update(states, vtLayer, imagePositions) {
          if (!this.stateDependentLayers.length) return;
          this.text.programConfigurations.updatePaintArrays(states, vtLayer, this.layers, imagePositions);
          this.icon.programConfigurations.updatePaintArrays(states, vtLayer, this.layers, imagePositions);
        }
        isEmpty() {
          return this.symbolInstances.length === 0;
        }
        uploadPending() {
          return !this.uploaded || this.text.programConfigurations.needsUpload || this.icon.programConfigurations.needsUpload;
        }
        upload(context) {
          if (!this.uploaded) {
            this.collisionBox.upload(context);
            this.collisionCircle.upload(context);
          }
          this.text.upload(context, this.sortFeaturesByY, !this.uploaded, this.text.programConfigurations.needsUpload);
          this.icon.upload(context, this.sortFeaturesByY, !this.uploaded, this.icon.programConfigurations.needsUpload);
          this.uploaded = true;
        }
        destroy() {
          this.text.destroy();
          this.icon.destroy();
          this.collisionBox.destroy();
          this.collisionCircle.destroy();
        }
        addToLineVertexArray(anchor, line) {
          const lineStartIndex = this.lineVertexArray.length;
          if (anchor.segment !== void 0) {
            let sumForwardLength = anchor.dist(line[anchor.segment + 1]);
            let sumBackwardLength = anchor.dist(line[anchor.segment]);
            const vertices = {};
            for (let i = anchor.segment + 1; i < line.length; i++) {
              vertices[i] = { x: line[i].x, y: line[i].y, tileUnitDistanceFromAnchor: sumForwardLength };
              if (i < line.length - 1) {
                sumForwardLength += line[i + 1].dist(line[i]);
              }
            }
            for (let i = anchor.segment || 0; i >= 0; i--) {
              vertices[i] = { x: line[i].x, y: line[i].y, tileUnitDistanceFromAnchor: sumBackwardLength };
              if (i > 0) {
                sumBackwardLength += line[i - 1].dist(line[i]);
              }
            }
            for (let i = 0; i < line.length; i++) {
              const vertex = vertices[i];
              this.lineVertexArray.emplaceBack(vertex.x, vertex.y, vertex.tileUnitDistanceFromAnchor);
            }
          }
          return {
            lineStartIndex,
            lineLength: this.lineVertexArray.length - lineStartIndex
          };
        }
        addSymbols(arrays, quads, sizeVertex, lineOffset, alongLine, feature, writingMode, labelAnchor, lineStartIndex, lineLength) {
          const indexArray = arrays.indexArray;
          const layoutVertexArray = arrays.layoutVertexArray;
          const dynamicLayoutVertexArray = arrays.dynamicLayoutVertexArray;
          const segment = arrays.segments.prepareSegment(4 * quads.length, arrays.layoutVertexArray, arrays.indexArray);
          const glyphOffsetArrayStart = this.glyphOffsetArray.length;
          const vertexStartIndex = segment.vertexLength;
          for (const symbol of quads) {
            const tl = symbol.tl;
            const tr = symbol.tr;
            const bl = symbol.bl;
            const br = symbol.br;
            const tex = symbol.tex;
            const index = segment.vertexLength;
            const y = symbol.glyphOffset[1];
            addVertex(layoutVertexArray, labelAnchor.x, labelAnchor.y, tl.x, y + tl.y, tex.x, tex.y, sizeVertex);
            addVertex(layoutVertexArray, labelAnchor.x, labelAnchor.y, tr.x, y + tr.y, tex.x + tex.w, tex.y, sizeVertex);
            addVertex(layoutVertexArray, labelAnchor.x, labelAnchor.y, bl.x, y + bl.y, tex.x, tex.y + tex.h, sizeVertex);
            addVertex(
              layoutVertexArray,
              labelAnchor.x,
              labelAnchor.y,
              br.x,
              y + br.y,
              tex.x + tex.w,
              tex.y + tex.h,
              sizeVertex
            );
            addDynamicAttributes(dynamicLayoutVertexArray, labelAnchor, 0);
            indexArray.emplaceBack(index, index + 1, index + 2);
            indexArray.emplaceBack(index + 1, index + 2, index + 3);
            segment.vertexLength += 4;
            segment.primitiveLength += 2;
            this.glyphOffsetArray.emplaceBack(symbol.glyphOffset[0]);
          }
          arrays.placedSymbolArray.emplaceBack(
            labelAnchor.x,
            labelAnchor.y,
            glyphOffsetArrayStart,
            this.glyphOffsetArray.length - glyphOffsetArrayStart,
            vertexStartIndex,
            lineStartIndex,
            lineLength,
            labelAnchor.segment,
            sizeVertex ? sizeVertex[0] : 0,
            sizeVertex ? sizeVertex[1] : 0,
            lineOffset[0],
            lineOffset[1],
            writingMode,
            false
          );
          arrays.programConfigurations.populatePaintArrays(arrays.layoutVertexArray.length, feature, feature.index, {});
        }
        _addCollisionDebugVertex(layoutVertexArray, collisionVertexArray, point, anchorX, anchorY, extrude) {
          collisionVertexArray.emplaceBack(0, 0);
          return layoutVertexArray.emplaceBack(
            // pos
            point.x,
            point.y,
            // a_anchor_pos
            anchorX,
            anchorY,
            // extrude
            Math.round(extrude.x),
            Math.round(extrude.y)
          );
        }
        addCollisionDebugVertices(x1, y1, x2, y2, arrays, boxAnchorPoint, symbolInstance, isCircle) {
          const segment = arrays.segments.prepareSegment(4, arrays.layoutVertexArray, arrays.indexArray);
          const index = segment.vertexLength;
          const layoutVertexArray = arrays.layoutVertexArray;
          const collisionVertexArray = arrays.collisionVertexArray;
          const anchorX = symbolInstance.anchorX;
          const anchorY = symbolInstance.anchorY;
          this._addCollisionDebugVertex(
            layoutVertexArray,
            collisionVertexArray,
            boxAnchorPoint,
            anchorX,
            anchorY,
            new Point2(x1, y1)
          );
          this._addCollisionDebugVertex(
            layoutVertexArray,
            collisionVertexArray,
            boxAnchorPoint,
            anchorX,
            anchorY,
            new Point2(x2, y1)
          );
          this._addCollisionDebugVertex(
            layoutVertexArray,
            collisionVertexArray,
            boxAnchorPoint,
            anchorX,
            anchorY,
            new Point2(x2, y2)
          );
          this._addCollisionDebugVertex(
            layoutVertexArray,
            collisionVertexArray,
            boxAnchorPoint,
            anchorX,
            anchorY,
            new Point2(x1, y2)
          );
          segment.vertexLength += 4;
          if (isCircle) {
            const indexArray = arrays.indexArray;
            indexArray.emplaceBack(index, index + 1, index + 2);
            indexArray.emplaceBack(index, index + 2, index + 3);
            segment.primitiveLength += 2;
          } else {
            const indexArray = arrays.indexArray;
            indexArray.emplaceBack(index, index + 1);
            indexArray.emplaceBack(index + 1, index + 2);
            indexArray.emplaceBack(index + 2, index + 3);
            indexArray.emplaceBack(index + 3, index);
            segment.primitiveLength += 4;
          }
        }
        addDebugCollisionBoxes(startIndex, endIndex, symbolInstance) {
          for (let b = startIndex; b < endIndex; b++) {
            const box = this.collisionBoxArray.get(b);
            const x1 = box.x1;
            const y1 = box.y1;
            const x2 = box.x2;
            const y2 = box.y2;
            const isCircle = box.radius > 0;
            this.addCollisionDebugVertices(
              x1,
              y1,
              x2,
              y2,
              isCircle ? this.collisionCircle : this.collisionBox,
              box.anchorPoint,
              symbolInstance,
              isCircle
            );
          }
        }
        generateCollisionDebugBuffers() {
          for (let i = 0; i < this.symbolInstances.length; i++) {
            const symbolInstance = this.symbolInstances.get(i);
            this.addDebugCollisionBoxes(symbolInstance.textBoxStartIndex, symbolInstance.textBoxEndIndex, symbolInstance);
            this.addDebugCollisionBoxes(symbolInstance.iconBoxStartIndex, symbolInstance.iconBoxEndIndex, symbolInstance);
          }
        }
        // These flat arrays are meant to be quicker to iterate over than the source
        // CollisionBoxArray
        _deserializeCollisionBoxesForSymbol(collisionBoxArray, textStartIndex, textEndIndex, iconStartIndex, iconEndIndex) {
          const collisionArrays = {};
          for (let k = textStartIndex; k < textEndIndex; k++) {
            const box = collisionBoxArray.get(k);
            if (box.radius === 0) {
              collisionArrays.textBox = {
                x1: box.x1,
                y1: box.y1,
                x2: box.x2,
                y2: box.y2,
                anchorPointX: box.anchorPointX,
                anchorPointY: box.anchorPointY
              };
              collisionArrays.textFeatureIndex = box.featureIndex;
              break;
            }
            if (!collisionArrays.textCircles) {
              collisionArrays.textCircles = [];
              collisionArrays.textFeatureIndex = box.featureIndex;
            }
            const used = 1;
            collisionArrays.textCircles.push(
              box.anchorPointX,
              box.anchorPointY,
              box.radius,
              box.signedDistanceFromAnchor,
              used
            );
          }
          for (let k = iconStartIndex; k < iconEndIndex; k++) {
            const box = collisionBoxArray.get(k);
            if (box.radius === 0) {
              collisionArrays.iconBox = {
                x1: box.x1,
                y1: box.y1,
                x2: box.x2,
                y2: box.y2,
                anchorPointX: box.anchorPointX,
                anchorPointY: box.anchorPointY
              };
              collisionArrays.iconFeatureIndex = box.featureIndex;
              break;
            }
          }
          return collisionArrays;
        }
        deserializeCollisionBoxes(collisionBoxArray) {
          this.collisionArrays = [];
          for (let i = 0; i < this.symbolInstances.length; i++) {
            const symbolInstance = this.symbolInstances.get(i);
            this.collisionArrays.push(
              this._deserializeCollisionBoxesForSymbol(
                collisionBoxArray,
                symbolInstance.textBoxStartIndex,
                symbolInstance.textBoxEndIndex,
                symbolInstance.iconBoxStartIndex,
                symbolInstance.iconBoxEndIndex
              )
            );
          }
        }
        hasTextData() {
          return this.text.segments.get().length > 0;
        }
        hasIconData() {
          return this.icon.segments.get().length > 0;
        }
        hasCollisionBoxData() {
          return this.collisionBox.segments.get().length > 0;
        }
        hasCollisionCircleData() {
          return this.collisionCircle.segments.get().length > 0;
        }
        addIndicesForPlacedTextSymbol(placedTextSymbolIndex) {
          const placedSymbol = this.text.placedSymbolArray.get(placedTextSymbolIndex);
          const endIndex = placedSymbol.vertexStartIndex + placedSymbol.numGlyphs * 4;
          for (let vertexIndex = placedSymbol.vertexStartIndex; vertexIndex < endIndex; vertexIndex += 4) {
            this.text.indexArray.emplaceBack(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            this.text.indexArray.emplaceBack(vertexIndex + 1, vertexIndex + 2, vertexIndex + 3);
          }
        }
        sortFeatures(angle) {
          if (!this.sortFeaturesByY) return;
          if (this.sortedAngle === angle) return;
          this.sortedAngle = angle;
          if (this.text.segments.get().length > 1 || this.icon.segments.get().length > 1) return;
          const symbolInstanceIndexes = [];
          for (let i = 0; i < this.symbolInstances.length; i++) {
            symbolInstanceIndexes.push(i);
          }
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);
          const rotatedYs = [];
          const featureIndexes = [];
          for (let i = 0; i < this.symbolInstances.length; i++) {
            const symbolInstance = this.symbolInstances.get(i);
            rotatedYs.push(Math.round(sin * symbolInstance.anchorX + cos * symbolInstance.anchorY) | 0);
            featureIndexes.push(symbolInstance.featureIndex);
          }
          symbolInstanceIndexes.sort((aIndex, bIndex) => {
            return rotatedYs[aIndex] - rotatedYs[bIndex] || featureIndexes[bIndex] - featureIndexes[aIndex];
          });
          this.text.indexArray.clear();
          this.icon.indexArray.clear();
          this.featureSortOrder = [];
          for (const i of symbolInstanceIndexes) {
            const symbolInstance = this.symbolInstances.get(i);
            this.featureSortOrder.push(symbolInstance.featureIndex);
            if (symbolInstance.horizontalPlacedTextSymbolIndex >= 0) {
              this.addIndicesForPlacedTextSymbol(symbolInstance.horizontalPlacedTextSymbolIndex);
            }
            if (symbolInstance.verticalPlacedTextSymbolIndex >= 0) {
              this.addIndicesForPlacedTextSymbol(symbolInstance.verticalPlacedTextSymbolIndex);
            }
            const placedIcon = this.icon.placedSymbolArray.get(i);
            if (placedIcon.numGlyphs) {
              const vertexIndex = placedIcon.vertexStartIndex;
              this.icon.indexArray.emplaceBack(vertexIndex, vertexIndex + 1, vertexIndex + 2);
              this.icon.indexArray.emplaceBack(vertexIndex + 1, vertexIndex + 2, vertexIndex + 3);
            }
          }
          if (this.text.indexBuffer) this.text.indexBuffer.updateData(this.text.indexArray);
          if (this.icon.indexBuffer) this.icon.indexBuffer.updateData(this.icon.indexArray);
        }
      };
      register("SymbolBucket", SymbolBucket, {
        omit: ["layers", "collisionBoxArray", "features", "compareText"]
      });
      SymbolBucket.MAX_GLYPHS = 65535;
      SymbolBucket.addDynamicAttributes = addDynamicAttributes;
      module.exports = SymbolBucket;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/token.js
  var require_token = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/token.js"(exports, module) {
      module.exports = resolveTokens;
      function resolveTokens(properties, text) {
        return text.replace(/{([^{}]+)}/g, (match, key) => String(properties[key] ?? ""));
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/symbol_style_layer_properties.js
  var require_symbol_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/symbol_style_layer_properties.js"(exports, module) {
      var { Properties, DataConstantProperty, DataDrivenProperty } = require_properties2();
      var layout = new Properties({
        "symbol-placement": new DataConstantProperty({
          type: "enum",
          values: ["point", "line", "line-center"],
          default: "point",
          expression: { parameters: ["zoom"] }
        }),
        "symbol-spacing": new DataConstantProperty({
          type: "number",
          default: 250,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "symbol-avoid-edges": new DataConstantProperty({
          type: "boolean",
          default: false,
          expression: { parameters: ["zoom"] }
        }),
        "symbol-z-order": new DataConstantProperty({
          type: "enum",
          values: ["viewport-y", "source"],
          default: "viewport-y",
          expression: { parameters: ["zoom"] }
        }),
        "icon-allow-overlap": new DataConstantProperty({
          type: "boolean",
          default: false,
          expression: { parameters: ["zoom"] }
        }),
        "icon-ignore-placement": new DataConstantProperty({
          type: "boolean",
          default: false,
          expression: { parameters: ["zoom"] }
        }),
        "icon-optional": new DataConstantProperty({ type: "boolean", default: false, expression: { parameters: ["zoom"] } }),
        "icon-rotation-alignment": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport", "auto"],
          default: "auto",
          expression: { parameters: ["zoom"] }
        }),
        "icon-size": new DataDrivenProperty({
          type: "number",
          default: 1,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-text-fit": new DataConstantProperty({
          type: "enum",
          values: ["none", "width", "height", "both"],
          default: "none",
          expression: { parameters: ["zoom"] }
        }),
        "icon-text-fit-padding": new DataConstantProperty({
          type: "array",
          value: "number",
          length: 4,
          default: [0, 0, 0, 0],
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "icon-image": new DataDrivenProperty({
          type: "string",
          tokens: true,
          expression: { parameters: ["zoom", "feature"] }
        }),
        "icon-rotate": new DataDrivenProperty({
          type: "number",
          default: 0,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-padding": new DataConstantProperty({
          type: "number",
          default: 2,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "icon-keep-upright": new DataConstantProperty({
          type: "boolean",
          default: false,
          expression: { parameters: ["zoom"] }
        }),
        "icon-offset": new DataDrivenProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-anchor": new DataDrivenProperty({
          type: "enum",
          values: ["center", "left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"],
          default: "center",
          expression: { parameters: ["zoom", "feature"] }
        }),
        "icon-pitch-alignment": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport", "auto"],
          default: "auto",
          expression: { parameters: ["zoom"] }
        }),
        "text-pitch-alignment": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport", "auto"],
          default: "auto",
          expression: { parameters: ["zoom"] }
        }),
        "text-rotation-alignment": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport", "auto"],
          default: "auto",
          expression: { parameters: ["zoom"] }
        }),
        "text-field": new DataDrivenProperty({
          type: "formatted",
          default: "",
          tokens: true,
          expression: { parameters: ["zoom", "feature"] }
        }),
        "text-font": new DataDrivenProperty({
          type: "array",
          value: "string",
          default: ["Open Sans Regular", "Arial Unicode MS Regular"],
          expression: { parameters: ["zoom", "feature"] }
        }),
        "text-size": new DataDrivenProperty({
          type: "number",
          default: 16,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-max-width": new DataDrivenProperty({
          type: "number",
          default: 10,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-line-height": new DataConstantProperty({
          type: "number",
          default: 1.2,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "text-letter-spacing": new DataDrivenProperty({
          type: "number",
          default: 0,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-justify": new DataDrivenProperty({
          type: "enum",
          values: ["left", "center", "right"],
          default: "center",
          expression: { parameters: ["zoom", "feature"] }
        }),
        "text-anchor": new DataDrivenProperty({
          type: "enum",
          values: ["center", "left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"],
          default: "center",
          expression: { parameters: ["zoom", "feature"] }
        }),
        "text-max-angle": new DataConstantProperty({
          type: "number",
          default: 45,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "text-rotate": new DataDrivenProperty({
          type: "number",
          default: 0,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-padding": new DataConstantProperty({
          type: "number",
          default: 2,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "text-keep-upright": new DataConstantProperty({
          type: "boolean",
          default: true,
          expression: { parameters: ["zoom"] }
        }),
        "text-transform": new DataDrivenProperty({
          type: "enum",
          values: ["none", "uppercase", "lowercase"],
          default: "none",
          expression: { parameters: ["zoom", "feature"] }
        }),
        "text-offset": new DataDrivenProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-allow-overlap": new DataConstantProperty({
          type: "boolean",
          default: false,
          expression: { parameters: ["zoom"] }
        }),
        "text-ignore-placement": new DataConstantProperty({
          type: "boolean",
          default: false,
          expression: { parameters: ["zoom"] }
        }),
        "text-optional": new DataConstantProperty({ type: "boolean", default: false, expression: { parameters: ["zoom"] } })
      });
      var paint = new Properties({
        "icon-opacity": new DataDrivenProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-color": new DataDrivenProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-halo-color": new DataDrivenProperty({
          type: "color",
          default: "rgba(0, 0, 0, 0)",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-halo-width": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-halo-blur": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "icon-translate": new DataConstantProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "icon-translate-anchor": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "map",
          expression: { parameters: ["zoom"] }
        }),
        "text-opacity": new DataDrivenProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-color": new DataDrivenProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-halo-color": new DataDrivenProperty({
          type: "color",
          default: "rgba(0, 0, 0, 0)",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-halo-width": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-halo-blur": new DataDrivenProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom", "feature"] }
        }),
        "text-translate": new DataConstantProperty({
          type: "array",
          value: "number",
          length: 2,
          default: [0, 0],
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "text-translate-anchor": new DataConstantProperty({
          type: "enum",
          values: ["map", "viewport"],
          default: "map",
          expression: { parameters: ["zoom"] }
        })
      });
      module.exports = { paint, layout };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/symbol_style_layer.js
  var require_symbol_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/symbol_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var SymbolBucket = require_symbol_bucket();
      var resolveTokens = require_token();
      var { isExpression } = require_style_expressions();
      var assert = require_nanoassert();
      var properties = require_symbol_style_layer_properties();
      var SymbolStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
        recalculate(parameters) {
          super.recalculate(parameters);
          if (this.layout.get("icon-rotation-alignment") === "auto") {
            if (this.layout.get("symbol-placement") !== "point") {
              this.layout._values["icon-rotation-alignment"] = "map";
            } else {
              this.layout._values["icon-rotation-alignment"] = "viewport";
            }
          }
          if (this.layout.get("text-rotation-alignment") === "auto") {
            if (this.layout.get("symbol-placement") !== "point") {
              this.layout._values["text-rotation-alignment"] = "map";
            } else {
              this.layout._values["text-rotation-alignment"] = "viewport";
            }
          }
          if (this.layout.get("text-pitch-alignment") === "auto") {
            this.layout._values["text-pitch-alignment"] = this.layout.get("text-rotation-alignment");
          }
          if (this.layout.get("icon-pitch-alignment") === "auto") {
            this.layout._values["icon-pitch-alignment"] = this.layout.get("icon-rotation-alignment");
          }
        }
        getValueAndResolveTokens(name, feature) {
          const value = this.layout.get(name).evaluate(feature, {});
          const unevaluated = this._unevaluatedLayout._values[name];
          if (!unevaluated.isDataDriven() && !isExpression(unevaluated.value)) {
            return resolveTokens(feature.properties, value);
          }
          return value;
        }
        createBucket(parameters) {
          return new SymbolBucket(parameters);
        }
        queryRadius() {
          return 0;
        }
        queryIntersectsFeature() {
          assert(false);
          return false;
        }
      };
      module.exports = SymbolStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/background_style_layer_properties.js
  var require_background_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/background_style_layer_properties.js"(exports, module) {
      var { Properties, CrossFadedProperty, DataConstantProperty } = require_properties2();
      var paint = new Properties({
        "background-color": new DataConstantProperty({
          type: "color",
          default: "#000000",
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "background-pattern": new CrossFadedProperty({
          type: "string",
          transition: true,
          expression: { parameters: ["zoom"] }
        }),
        "background-opacity": new DataConstantProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        })
      });
      module.exports = { paint };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/background_style_layer.js
  var require_background_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/background_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var properties = require_background_style_layer_properties();
      var BackgroundStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
      };
      module.exports = BackgroundStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/raster_style_layer_properties.js
  var require_raster_style_layer_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/raster_style_layer_properties.js"(exports, module) {
      var { Properties, DataConstantProperty } = require_properties2();
      var paint = new Properties({
        "raster-opacity": new DataConstantProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "raster-hue-rotate": new DataConstantProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "raster-brightness-min": new DataConstantProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "raster-brightness-max": new DataConstantProperty({
          type: "number",
          default: 1,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "raster-saturation": new DataConstantProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "raster-contrast": new DataConstantProperty({
          type: "number",
          default: 0,
          transition: true,
          expression: { interpolated: true, parameters: ["zoom"] }
        }),
        "raster-resampling": new DataConstantProperty({
          type: "enum",
          values: ["linear", "nearest"],
          default: "linear",
          expression: { parameters: ["zoom"] }
        }),
        "raster-fade-duration": new DataConstantProperty({
          type: "number",
          default: 300,
          expression: { interpolated: true, parameters: ["zoom"] }
        })
      });
      module.exports = { paint };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer/raster_style_layer.js
  var require_raster_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer/raster_style_layer.js"(exports, module) {
      var StyleLayer = require_style_layer();
      var properties = require_raster_style_layer_properties();
      var RasterStyleLayer = class extends StyleLayer {
        constructor(layer) {
          super(layer, properties);
        }
      };
      module.exports = RasterStyleLayer;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/create_style_layer.js
  var require_create_style_layer = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/create_style_layer.js"(exports, module) {
      var circle = require_circle_style_layer();
      var heatmap = require_heatmap_style_layer();
      var hillshade = require_hillshade_style_layer();
      var fill = require_fill_style_layer();
      var fillExtrusion = require_fill_extrusion_style_layer();
      var line = require_line_style_layer();
      var symbol = require_symbol_style_layer();
      var background = require_background_style_layer();
      var raster = require_raster_style_layer();
      var subclasses = {
        circle,
        heatmap,
        hillshade,
        fill,
        "fill-extrusion": fillExtrusion,
        line,
        symbol,
        background,
        raster
      };
      module.exports = function createStyleLayer(layer) {
        return new subclasses[layer.type](layer);
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style-spec/feature_filter/index.js
  var require_feature_filter = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style-spec/feature_filter/index.js"(exports, module) {
      var { createExpression } = require_style_expressions();
      module.exports = createFilter;
      createFilter.isExpressionFilter = isExpressionFilter;
      function isExpressionFilter(filter) {
        if (filter === true || filter === false) {
          return true;
        }
        if (!Array.isArray(filter) || filter.length === 0) {
          return false;
        }
        switch (filter[0]) {
          case "has":
            return filter.length >= 2 && filter[1] !== "$id" && filter[1] !== "$type";
          case "in":
          case "!in":
          case "!has":
          case "none":
            return false;
          case "==":
          case "!=":
          case ">":
          case ">=":
          case "<":
          case "<=":
            return filter.length !== 3 || Array.isArray(filter[1]) || Array.isArray(filter[2]);
          case "any":
          case "all":
            for (let i = 1; i < filter.length; i++) {
              const f = filter[i];
              if (typeof f !== "boolean" && !isExpressionFilter(f)) {
                return false;
              }
            }
            return true;
          default:
            return true;
        }
      }
      var filterSpec = {
        type: "boolean",
        default: false,
        transition: false,
        "property-type": "data-driven",
        expression: {
          interpolated: false,
          parameters: ["zoom", "feature"]
        }
      };
      function createFilter(filter) {
        if (filter === null || filter === void 0) {
          return () => true;
        }
        if (!isExpressionFilter(filter)) {
          filter = convertFilter(filter);
        }
        const compiled = createExpression(filter, filterSpec);
        if (compiled.result === "error") {
          throw new Error(compiled.value.map((err) => `${err.key}: ${err.message}`).join(", "));
        }
        return (globalProperties, feature) => compiled.value.evaluate(globalProperties, feature);
      }
      function compare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
      }
      function convertFilter(filter) {
        if (!filter) return true;
        const [op, ...args] = filter;
        if (filter.length <= 1) return op !== "any";
        switch (op) {
          case "!=":
            return convertNegation(convertComparisonOp("==", ...args));
          case "==":
          case "<":
          case ">":
          case "<=":
          case ">=":
            return convertComparisonOp(op, ...args);
          case "any":
            return convertDisjunctionOp(args);
          case "all":
            return ["all", ...args.map(convertFilter)];
          case "none":
            return ["all", ...args.map(convertFilter).map(convertNegation)];
          case "in":
            return convertInOp(args);
          case "!in":
            return convertNegation(convertInOp(args));
          case "has":
            return convertHasOp(args[0]);
          case "!has":
            return convertNegation(convertHasOp(args[0]));
          default:
            return true;
        }
      }
      function convertComparisonOp(op, property, value) {
        switch (property) {
          case "$type":
            return [`filter-type-${op}`, value];
          case "$id":
            return [`filter-id-${op}`, value];
          default:
            return [`filter-${op}`, property, value];
        }
      }
      function convertDisjunctionOp(filters) {
        return ["any", ...filters.map(convertFilter)];
      }
      function convertInOp([property, ...values]) {
        if (values.length === 0) {
          return false;
        }
        switch (property) {
          case "$type":
            return ["filter-type-in", ["literal", values]];
          case "$id":
            return ["filter-id-in", ["literal", values]];
          default:
            return isUniformLarge(values) ? ["filter-in-large", property, ["literal", values.sort(compare)]] : ["filter-in-small", property, ["literal", values]];
        }
      }
      function isUniformLarge(values) {
        if (values.length < 200) return false;
        const type = typeof values[0];
        return values.every((v) => typeof v === type);
      }
      function convertHasOp(property) {
        switch (property) {
          case "$type":
            return true;
          case "$id":
            return ["filter-has-id"];
          default:
            return ["filter-has", property];
        }
      }
      function convertNegation(filter) {
        return ["!", filter];
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style-spec/util/ref_properties.js
  var require_ref_properties = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style-spec/util/ref_properties.js"(exports, module) {
      module.exports = ["type", "source", "source-layer", "minzoom", "maxzoom", "filter", "layout"];
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style-spec/group_by_layout.js
  var require_group_by_layout = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style-spec/group_by_layout.js"(exports, module) {
      var refProperties = require_ref_properties();
      function stringify(obj) {
        if (obj == null) return "null";
        const type = typeof obj;
        if (type === "number" || type === "boolean" || type === "string") return obj;
        if (Array.isArray(obj)) {
          return "[" + obj.map((val) => stringify(val)).join(",") + "]";
        }
        const keys = Object.keys(obj).sort();
        return "{" + keys.map((key) => `${key}:${stringify(obj[key])}`).join(",") + "}";
      }
      function getKey(layer) {
        return refProperties.map((k) => stringify(layer[k])).join("/");
      }
      module.exports = groupByLayout;
      function groupByLayout(layers) {
        const groups = {};
        for (const l of layers) {
          const k = getKey(l);
          const group = groups[k] ??= [];
          group.push(l);
        }
        return Object.values(groups);
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/style_layer_index.js
  var require_style_layer_index = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/style_layer_index.js"(exports, module) {
      var createStyleLayer = require_create_style_layer();
      var { values } = require_object();
      var featureFilter = require_feature_filter();
      var groupByLayout = require_group_by_layout();
      var StyleLayerIndex = class {
        #layerConfigs = {};
        #layers = {};
        constructor(layerConfigs) {
          if (layerConfigs) {
            this.update(layerConfigs);
          }
        }
        replace(layerConfigs) {
          this.#layerConfigs = {};
          this.#layers = {};
          this.update(layerConfigs);
        }
        update(layerConfigs, removedIds = []) {
          for (const layerConfig of layerConfigs) {
            this.#layerConfigs[layerConfig.id] = layerConfig;
            const layer = this.#layers[layerConfig.id] = createStyleLayer(layerConfig);
            layer._featureFilter = featureFilter(layer.filter);
          }
          for (const id of removedIds) {
            delete this.#layerConfigs[id];
            delete this.#layers[id];
          }
          this.familiesBySource = {};
          const groups = groupByLayout(values(this.#layerConfigs));
          for (const layerConfigs2 of groups) {
            const layers = layerConfigs2.map((layerConfig) => this.#layers[layerConfig.id]);
            const layer = layers[0];
            if (layer.visibility === "none") {
              continue;
            }
            const { source = "", sourceLayer = "_geojsonTileLayer" } = layer;
            const sourceGroup = this.familiesBySource[source] ??= {};
            const sourceLayerFamilies = sourceGroup[sourceLayer] ??= [];
            sourceLayerFamilies.push(layers);
          }
        }
      };
      module.exports = StyleLayerIndex;
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/@mapwhit/pbf/index.js
  var require_pbf = __commonJS({
    "node_modules/@mapwhit/pbf/index.js"(exports, module) {
      var assert = require_nanoassert();
      var ieee754 = require_ieee754();
      var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
      var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
      var TEXT_DECODER_MIN_LENGTH = 12;
      var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");
      var Pbf = class _Pbf {
        constructor(buf) {
          this.buf = ArrayBuffer.isView?.(buf) ? buf : new Uint8Array(buf || 0);
          this.pos = 0;
          this.type = 0;
          this.length = this.buf.length;
        }
        destroy() {
          this.buf = null;
        }
        // === READING =================================================================
        readFields(readField, result, end = this.length) {
          while (this.pos < end) {
            const val = this.readVarint();
            const tag = val >> 3;
            const startPos = this.pos;
            this.type = val & 7;
            readField(tag, result, this);
            if (this.pos === startPos) this.skip(val);
          }
          return result;
        }
        readMessage(readField, result) {
          return this.readFields(readField, result, this.readVarint() + this.pos);
        }
        readFixed32() {
          const val = readUInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
        }
        readSFixed32() {
          const val = readInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
        }
        // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
        readFixed64() {
          const val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
        }
        readSFixed64() {
          const val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
        }
        readFloat() {
          const val = ieee754.read(this.buf, this.pos, true, 23, 4);
          this.pos += 4;
          return val;
        }
        readDouble() {
          const val = ieee754.read(this.buf, this.pos, true, 52, 8);
          this.pos += 8;
          return val;
        }
        readVarint(isSigned) {
          const buf = this.buf;
          let b = buf[this.pos++];
          let val = b & 127;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 7;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 14;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 21;
          if (b < 128) return val;
          b = buf[this.pos];
          val |= (b & 15) << 28;
          return readVarintRemainder(val, isSigned, this);
        }
        readVarint64() {
          return this.readVarint(true);
        }
        readSVarint() {
          const num = this.readVarint();
          return num % 2 === 1 ? (num + 1) / -2 : num / 2;
        }
        readBoolean() {
          return Boolean(this.readVarint());
        }
        readString() {
          const end = this.readVarint() + this.pos;
          const pos = this.pos;
          this.pos = end;
          if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
            return readUtf8TextDecoder(this.buf, pos, end);
          }
          return readUtf8(this.buf, pos, end);
        }
        readBytes() {
          const end = this.readVarint() + this.pos;
          const buffer = this.buf.subarray(this.pos, end);
          this.pos = end;
          return buffer;
        }
        // verbose for performance reasons; doesn't affect gzipped size
        readPackedVarint(arr = [], isSigned = false) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readVarint(isSigned));
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readVarint(isSigned));
          return arr;
        }
        readPackedSVarint(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readSVarint());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readSVarint());
          return arr;
        }
        readPackedBoolean(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readBoolean());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readBoolean());
          return arr;
        }
        readPackedFloat(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readFloat());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readFloat());
          return arr;
        }
        readPackedDouble(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readDouble());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readDouble());
          return arr;
        }
        readPackedFixed32(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readFixed32());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readFixed32());
          return arr;
        }
        readPackedSFixed32(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readSFixed32());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readSFixed32());
          return arr;
        }
        readPackedFixed64(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readFixed64());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readFixed64());
          return arr;
        }
        readPackedSFixed64(arr = []) {
          if (this.type !== _Pbf.Bytes) return arr.push(this.readSFixed64());
          const end = readPackedEnd(this);
          while (this.pos < end) arr.push(this.readSFixed64());
          return arr;
        }
        skip(val) {
          const type = val & 7;
          switch (type) {
            case _Pbf.Varint:
              while (this.buf[this.pos++] > 127) {
              }
              break;
            case _Pbf.Bytes:
              this.pos = this.readVarint() + this.pos;
              break;
            case _Pbf.Fixed32:
              this.pos += 4;
              break;
            case _Pbf.Fixed64:
              this.pos += 8;
              break;
            default:
              assert(false, `Unimplemented type: ${type}`);
          }
        }
        // === WRITING =================================================================
        writeTag(tag, type) {
          this.writeVarint(tag << 3 | type);
        }
        realloc(min) {
          let length = this.length || 16;
          while (length < this.pos + min) length *= 2;
          if (length !== this.length) {
            const buf = new Uint8Array(length);
            buf.set(this.buf);
            this.buf = buf;
            this.length = length;
          }
        }
        finish() {
          this.length = this.pos;
          this.pos = 0;
          return this.buf.subarray(0, this.length);
        }
        writeFixed32(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
        }
        writeSFixed32(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
        }
        writeFixed64(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
        }
        writeSFixed64(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
        }
        writeVarint(val) {
          val = +val || 0;
          if (val > 268435455 || val < 0) {
            writeBigVarint(val, this);
            return;
          }
          this.realloc(4);
          this.buf[this.pos++] = val & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = val >>> 7 & 127;
        }
        writeSVarint(val) {
          this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
        }
        writeBoolean(val) {
          this.writeVarint(Boolean(val));
        }
        writeString(str) {
          str = String(str);
          this.realloc(str.length * 4);
          this.pos++;
          const startPos = this.pos;
          this.pos = writeUtf8(this.buf, str, this.pos);
          const len = this.pos - startPos;
          if (len >= 128) makeRoomForExtraLength(startPos, len, this);
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
        }
        writeFloat(val) {
          this.realloc(4);
          ieee754.write(this.buf, val, this.pos, true, 23, 4);
          this.pos += 4;
        }
        writeDouble(val) {
          this.realloc(8);
          ieee754.write(this.buf, val, this.pos, true, 52, 8);
          this.pos += 8;
        }
        writeBytes(buffer) {
          const len = buffer.length;
          this.writeVarint(len);
          this.realloc(len);
          for (let i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
        }
        writeRawMessage(fn, obj) {
          this.pos++;
          const startPos = this.pos;
          fn(obj, this);
          const len = this.pos - startPos;
          if (len >= 128) makeRoomForExtraLength(startPos, len, this);
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
        }
        writeMessage(tag, fn, obj) {
          this.writeTag(tag, _Pbf.Bytes);
          this.writeRawMessage(fn, obj);
        }
        writePackedVarint(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
        }
        writePackedSVarint(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
        }
        writePackedBoolean(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
        }
        writePackedFloat(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
        }
        writePackedDouble(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
        }
        writePackedFixed32(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
        }
        writePackedSFixed32(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
        }
        writePackedFixed64(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
        }
        writePackedSFixed64(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
        }
        writeBytesField(tag, buffer) {
          this.writeTag(tag, _Pbf.Bytes);
          this.writeBytes(buffer);
        }
        writeFixed32Field(tag, val) {
          this.writeTag(tag, _Pbf.Fixed32);
          this.writeFixed32(val);
        }
        writeSFixed32Field(tag, val) {
          this.writeTag(tag, _Pbf.Fixed32);
          this.writeSFixed32(val);
        }
        writeFixed64Field(tag, val) {
          this.writeTag(tag, _Pbf.Fixed64);
          this.writeFixed64(val);
        }
        writeSFixed64Field(tag, val) {
          this.writeTag(tag, _Pbf.Fixed64);
          this.writeSFixed64(val);
        }
        writeVarintField(tag, val) {
          this.writeTag(tag, _Pbf.Varint);
          this.writeVarint(val);
        }
        writeSVarintField(tag, val) {
          this.writeTag(tag, _Pbf.Varint);
          this.writeSVarint(val);
        }
        writeStringField(tag, str) {
          this.writeTag(tag, _Pbf.Bytes);
          this.writeString(str);
        }
        writeFloatField(tag, val) {
          this.writeTag(tag, _Pbf.Fixed32);
          this.writeFloat(val);
        }
        writeDoubleField(tag, val) {
          this.writeTag(tag, _Pbf.Fixed64);
          this.writeDouble(val);
        }
        writeBooleanField(tag, val) {
          this.writeVarintField(tag, Boolean(val));
        }
      };
      Pbf.Varint = 0;
      Pbf.Fixed64 = 1;
      Pbf.Bytes = 2;
      Pbf.Fixed32 = 5;
      module.exports = Pbf;
      function readVarintRemainder(l, s, p) {
        const { buf } = p;
        let b = buf[p.pos++];
        let h = (b & 112) >> 4;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 3;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 10;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 17;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 24;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 1) << 31;
        if (b < 128) return toNum(l, h, s);
        assert(false, "Expected varint not more than 10 bytes");
      }
      function readPackedEnd(pbf) {
        return pbf.type === Pbf.Bytes ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
      }
      function toNum(low, high, isSigned) {
        if (isSigned) {
          return high * 4294967296 + (low >>> 0);
        }
        return (high >>> 0) * 4294967296 + (low >>> 0);
      }
      function writeBigVarint(val, pbf) {
        if (true) {
          assert(val < 18446744073709552e3 && val >= -18446744073709552e3, "Given varint doesn't fit into 10 bytes");
        }
        let low;
        let high;
        if (val >= 0) {
          low = val % 4294967296 | 0;
          high = val / 4294967296 | 0;
        } else {
          low = ~(-val % 4294967296);
          high = ~(-val / 4294967296);
          if (low ^ 4294967295) {
            low = low + 1 | 0;
          } else {
            low = 0;
            high = high + 1 | 0;
          }
        }
        pbf.realloc(10);
        writeBigVarintLow(low, high, pbf);
        writeBigVarintHigh(high, pbf);
      }
      function writeBigVarintLow(low, _high, pbf) {
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos] = low & 127;
      }
      function writeBigVarintHigh(high, pbf) {
        const lsb = (high & 7) << 4;
        pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127;
      }
      function makeRoomForExtraLength(startPos, len, pbf) {
        const extraLen = len <= 16383 ? 1 : len <= 2097151 ? 2 : len <= 268435455 ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));
        pbf.realloc(extraLen);
        for (let i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
      }
      function writePackedVarint(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
      }
      function writePackedSVarint(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
      }
      function writePackedFloat(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
      }
      function writePackedDouble(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
      }
      function writePackedBoolean(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
      }
      function writePackedFixed32(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
      }
      function writePackedSFixed32(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
      }
      function writePackedFixed64(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
      }
      function writePackedSFixed64(arr, pbf) {
        for (let i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
      }
      function readUInt32(buf, pos) {
        return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + buf[pos + 3] * 16777216;
      }
      function writeInt32(buf, val, pos) {
        buf[pos] = val;
        buf[pos + 1] = val >>> 8;
        buf[pos + 2] = val >>> 16;
        buf[pos + 3] = val >>> 24;
      }
      function readInt32(buf, pos) {
        return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + (buf[pos + 3] << 24);
      }
      function readUtf8(buf, pos, end) {
        let str = "";
        let i = pos;
        while (i < end) {
          const b0 = buf[i];
          let c = null;
          let bytesPerSequence = b0 > 239 ? 4 : b0 > 223 ? 3 : b0 > 191 ? 2 : 1;
          if (i + bytesPerSequence > end) break;
          let b1;
          let b2;
          let b3;
          if (bytesPerSequence === 1) {
            if (b0 < 128) {
              c = b0;
            }
          } else if (bytesPerSequence === 2) {
            b1 = buf[i + 1];
            if ((b1 & 192) === 128) {
              c = (b0 & 31) << 6 | b1 & 63;
              if (c <= 127) {
                c = null;
              }
            }
          } else if (bytesPerSequence === 3) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            if ((b1 & 192) === 128 && (b2 & 192) === 128) {
              c = (b0 & 15) << 12 | (b1 & 63) << 6 | b2 & 63;
              if (c <= 2047 || c >= 55296 && c <= 57343) {
                c = null;
              }
            }
          } else if (bytesPerSequence === 4) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            b3 = buf[i + 3];
            if ((b1 & 192) === 128 && (b2 & 192) === 128 && (b3 & 192) === 128) {
              c = (b0 & 15) << 18 | (b1 & 63) << 12 | (b2 & 63) << 6 | b3 & 63;
              if (c <= 65535 || c >= 1114112) {
                c = null;
              }
            }
          }
          if (c === null) {
            c = 65533;
            bytesPerSequence = 1;
          } else if (c > 65535) {
            c -= 65536;
            str += String.fromCharCode(c >>> 10 & 1023 | 55296);
            c = 56320 | c & 1023;
          }
          str += String.fromCharCode(c);
          i += bytesPerSequence;
        }
        return str;
      }
      function readUtf8TextDecoder(buf, pos, end) {
        return utf8TextDecoder.decode(buf.subarray(pos, end));
      }
      function writeUtf8(buf, str, pos) {
        for (let i = 0, c, lead; i < str.length; i++) {
          c = str.charCodeAt(i);
          if (c > 55295 && c < 57344) {
            if (lead) {
              if (c < 56320) {
                buf[pos++] = 239;
                buf[pos++] = 191;
                buf[pos++] = 189;
                lead = c;
                continue;
              }
              c = lead - 55296 << 10 | c - 56320 | 65536;
              lead = null;
            } else {
              if (c > 56319 || i + 1 === str.length) {
                buf[pos++] = 239;
                buf[pos++] = 191;
                buf[pos++] = 189;
              } else {
                lead = c;
              }
              continue;
            }
          } else if (lead) {
            buf[pos++] = 239;
            buf[pos++] = 191;
            buf[pos++] = 189;
            lead = null;
          }
          if (c < 128) {
            buf[pos++] = c;
          } else {
            if (c < 2048) {
              buf[pos++] = c >> 6 | 192;
            } else {
              if (c < 65536) {
                buf[pos++] = c >> 12 | 224;
              } else {
                buf[pos++] = c >> 18 | 240;
                buf[pos++] = c >> 12 & 63 | 128;
              }
              buf[pos++] = c >> 6 & 63 | 128;
            }
            buf[pos++] = c & 63 | 128;
          }
        }
        return pos;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/dictionary_coder.js
  var require_dictionary_coder = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/dictionary_coder.js"(exports, module) {
      var assert = require_nanoassert();
      module.exports = dictionaryCoder;
      function dictionaryCoder(strings) {
        const numberToString = strings.sort();
        const stringToNumber = new Map(numberToString.map((s, i) => [s, i]));
        return {
          encode(string) {
            return stringToNumber.get(string);
          },
          decode(n) {
            assert(n < numberToString.length);
            return numberToString[n];
          }
        };
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/vectortile_to_geojson.js
  var require_vectortile_to_geojson = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/vectortile_to_geojson.js"(exports, module) {
      var Feature = class {
        constructor(vectorTileFeature, z, x, y) {
          this.type = "Feature";
          this._vectorTileFeature = vectorTileFeature;
          vectorTileFeature._z = z;
          vectorTileFeature._x = x;
          vectorTileFeature._y = y;
          this.properties = vectorTileFeature.properties;
          if (vectorTileFeature.id != null) {
            this.id = vectorTileFeature.id;
          }
        }
        get geometry() {
          if (this._geometry === void 0) {
            this._geometry = this._vectorTileFeature.toGeoJSON(
              this._vectorTileFeature._x,
              this._vectorTileFeature._y,
              this._vectorTileFeature._z
            ).geometry;
          }
          return this._geometry;
        }
        set geometry(g) {
          this._geometry = g;
        }
        toJSON() {
          const json = {
            geometry: this.geometry
          };
          for (const i in this) {
            if (i === "_geometry" || i === "_vectorTileFeature") continue;
            json[i] = this[i];
          }
          return json;
        }
      };
      module.exports = Feature;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/feature_index.js
  var require_feature_index = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/feature_index.js"(exports, module) {
      var loadGeometry = require_load_geometry();
      var EXTENT = require_extent();
      var featureFilter = require_feature_filter();
      var Grid = require_grid_index();
      var dictionaryCoder = require_dictionary_coder();
      var vt = require_vector_tile();
      var Protobuf = require_pbf();
      var GeoJSONFeature = require_vectortile_to_geojson();
      var { arraysIntersect } = require_object();
      var { register } = require_transfer_registry();
      var EvaluationParameters = require_evaluation_parameters();
      var { polygonIntersectsBox } = require_intersection_tests();
      var { FeatureIndexArray } = require_array_types();
      var FeatureIndex = class {
        constructor(tileID, grid = new Grid(EXTENT, 16, 0), featureIndexArray = new FeatureIndexArray()) {
          this.tileID = tileID;
          this.grid = grid;
          this.grid3D = new Grid(EXTENT, 16, 0);
          this.featureIndexArray = featureIndexArray;
        }
        insert(feature, geometry, featureIndex, sourceLayerIndex, bucketIndex, is3D) {
          const key = this.featureIndexArray.length;
          this.featureIndexArray.emplaceBack(featureIndex, sourceLayerIndex, bucketIndex);
          const grid = is3D ? this.grid3D : this.grid;
          for (const ring of geometry) {
            const { minX, minY, maxX, maxY } = getBounds(ring);
            if (minX < EXTENT && minY < EXTENT && maxX >= 0 && maxY >= 0) {
              grid.insert(key, minX, minY, maxX, maxY);
            }
          }
        }
        loadVTLayers() {
          if (!this.vtLayers) {
            this.vtLayers = new vt.VectorTile(new Protobuf(this.rawTileData)).layers;
            this.sourceLayerCoder = dictionaryCoder(this.vtLayers ? Object.keys(this.vtLayers) : ["_geojsonTileLayer"]);
          }
          return this.vtLayers;
        }
        // Finds non-symbol features in this tile at a particular position.
        query(args, styleLayers, sourceFeatureState) {
          this.loadVTLayers();
          const params = args.params || {};
          const pixelsToTileUnits = EXTENT / args.tileSize / args.scale;
          const filter = featureFilter(params.filter);
          const queryGeometry = args.queryGeometry;
          const queryPadding = args.queryPadding * pixelsToTileUnits;
          const bounds = getBounds(queryGeometry);
          const matching = this.grid.query(
            bounds.minX - queryPadding,
            bounds.minY - queryPadding,
            bounds.maxX + queryPadding,
            bounds.maxY + queryPadding
          );
          const cameraBounds = getBounds(args.cameraQueryGeometry);
          const matching3D = this.grid3D.query(
            cameraBounds.minX - queryPadding,
            cameraBounds.minY - queryPadding,
            cameraBounds.maxX + queryPadding,
            cameraBounds.maxY + queryPadding,
            (bx1, by1, bx2, by2) => {
              return polygonIntersectsBox(
                args.cameraQueryGeometry,
                bx1 - queryPadding,
                by1 - queryPadding,
                bx2 + queryPadding,
                by2 + queryPadding
              );
            }
          );
          matching.push(...matching3D);
          matching.sort(topDownFeatureComparator);
          const result = {};
          let previousIndex;
          for (let k = 0; k < matching.length; k++) {
            const index = matching[k];
            if (index === previousIndex) continue;
            previousIndex = index;
            const match = this.featureIndexArray.get(index);
            let featureGeometry = null;
            const intersectionTest = (feature, styleLayer) => {
              if (!featureGeometry) {
                featureGeometry = loadGeometry(feature);
              }
              let featureState = {};
              if (feature.id) {
                featureState = sourceFeatureState.getState(styleLayer.sourceLayer || "_geojsonTileLayer", String(feature.id));
              }
              return styleLayer.queryIntersectsFeature(
                queryGeometry,
                feature,
                featureState,
                featureGeometry,
                this.tileID.canonical.z,
                args.transform,
                pixelsToTileUnits,
                args.pixelPosMatrix
              );
            };
            this.loadMatchingFeature(
              result,
              match.bucketIndex,
              match.sourceLayerIndex,
              match.featureIndex,
              filter,
              params.layers,
              styleLayers,
              intersectionTest
            );
          }
          return result;
        }
        loadMatchingFeature(result, bucketIndex, sourceLayerIndex, featureIndex, filter, filterLayerIDs, styleLayers, intersectionTest) {
          const layerIDs = this.bucketLayerIDs[bucketIndex];
          if (filterLayerIDs && !arraysIntersect(filterLayerIDs, layerIDs)) return;
          const sourceLayerName = this.sourceLayerCoder.decode(sourceLayerIndex);
          const sourceLayer = this.vtLayers[sourceLayerName];
          const feature = sourceLayer.feature(featureIndex);
          if (!filter(new EvaluationParameters(this.tileID.overscaledZ), feature)) return;
          const { x, y, z } = this.tileID.canonical;
          for (const layerID of layerIDs) {
            if (filterLayerIDs && !filterLayerIDs.includes(layerID)) {
              continue;
            }
            const styleLayer = styleLayers[layerID];
            if (!styleLayer) continue;
            const intersectionZ = !intersectionTest || intersectionTest(feature, styleLayer);
            if (!intersectionZ) {
              continue;
            }
            const geojsonFeature = new GeoJSONFeature(feature, z, x, y);
            geojsonFeature.layer = styleLayer.serialize();
            const layerResult = result[layerID] ??= [];
            layerResult.push({ featureIndex, feature: geojsonFeature, intersectionZ });
          }
        }
        // Given a set of symbol indexes that have already been looked up,
        // return a matching set of GeoJSONFeatures
        lookupSymbolFeatures(symbolFeatureIndexes, bucketIndex, sourceLayerIndex, filterSpec, filterLayerIDs, styleLayers) {
          const result = {};
          this.loadVTLayers();
          const filter = featureFilter(filterSpec);
          for (const symbolFeatureIndex of symbolFeatureIndexes) {
            this.loadMatchingFeature(
              result,
              bucketIndex,
              sourceLayerIndex,
              symbolFeatureIndex,
              filter,
              filterLayerIDs,
              styleLayers
            );
          }
          return result;
        }
      };
      register("FeatureIndex", FeatureIndex, { omit: ["rawTileData", "sourceLayerCoder"] });
      module.exports = FeatureIndex;
      function getBounds(geometry) {
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        for (const { x, y } of geometry) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        return { minX, minY, maxX, maxY };
      }
      function topDownFeatureComparator(a, b) {
        return b - a;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/anchor.js
  var require_anchor = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/anchor.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var { register } = require_transfer_registry();
      var Anchor = class _Anchor extends Point2 {
        constructor(x, y, angle, segment) {
          super(x, y);
          this.angle = angle;
          if (segment !== void 0) {
            this.segment = segment;
          }
        }
        clone() {
          return new _Anchor(this.x, this.y, this.angle, this.segment);
        }
      };
      register("Anchor", Anchor);
      module.exports = Anchor;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/check_max_angle.js
  var require_check_max_angle = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/check_max_angle.js"(exports, module) {
      module.exports = checkMaxAngle;
      function checkMaxAngle(line, anchor, labelLength, windowSize, maxAngle) {
        if (anchor.segment === void 0) return true;
        let p = anchor;
        let index = anchor.segment + 1;
        let anchorDistance = 0;
        while (anchorDistance > -labelLength / 2) {
          index--;
          if (index < 0) return false;
          anchorDistance -= line[index].dist(p);
          p = line[index];
        }
        anchorDistance += line[index].dist(line[index + 1]);
        index++;
        const recentCorners = [];
        let recentAngleDelta = 0;
        while (anchorDistance < labelLength / 2) {
          const prev = line[index - 1];
          const current = line[index];
          const next = line[index + 1];
          if (!next) return false;
          let angleDelta = prev.angleTo(current) - current.angleTo(next);
          angleDelta = Math.abs((angleDelta + 3 * Math.PI) % (Math.PI * 2) - Math.PI);
          recentCorners.push({
            distance: anchorDistance,
            angleDelta
          });
          recentAngleDelta += angleDelta;
          while (anchorDistance - recentCorners[0].distance > windowSize) {
            recentAngleDelta -= recentCorners.shift().angleDelta;
          }
          if (recentAngleDelta > maxAngle) return false;
          index++;
          anchorDistance += current.dist(next);
        }
        return true;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/get_anchors.js
  var require_get_anchors = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/get_anchors.js"(exports, module) {
      var interpolate = require_interpolate3();
      var Anchor = require_anchor();
      var checkMaxAngle = require_check_max_angle();
      module.exports = { getAnchors, getCenterAnchor };
      function getLineLength(line) {
        let lineLength = 0;
        for (let k = 0; k < line.length - 1; k++) {
          lineLength += line[k].dist(line[k + 1]);
        }
        return lineLength;
      }
      function getAngleWindowSize(shapedText, glyphSize, boxScale) {
        return shapedText ? 3 / 5 * glyphSize * boxScale : 0;
      }
      function getShapedLabelLength(shapedText, shapedIcon) {
        return Math.max(
          shapedText ? shapedText.right - shapedText.left : 0,
          shapedIcon ? shapedIcon.right - shapedIcon.left : 0
        );
      }
      function getCenterAnchor(line, maxAngle, shapedText, shapedIcon, glyphSize, boxScale) {
        const angleWindowSize = getAngleWindowSize(shapedText, glyphSize, boxScale);
        const labelLength = getShapedLabelLength(shapedText, shapedIcon) * boxScale;
        let prevDistance = 0;
        const centerDistance = getLineLength(line) / 2;
        for (let i = 0; i < line.length - 1; i++) {
          const a = line[i];
          const b = line[i + 1];
          const segmentDistance = a.dist(b);
          if (prevDistance + segmentDistance > centerDistance) {
            const t = (centerDistance - prevDistance) / segmentDistance;
            const x = interpolate(a.x, b.x, t);
            const y = interpolate(a.y, b.y, t);
            const anchor = new Anchor(x, y, b.angleTo(a), i);
            anchor._round();
            if (!angleWindowSize || checkMaxAngle(line, anchor, labelLength, angleWindowSize, maxAngle)) {
              return anchor;
            }
            return;
          }
          prevDistance += segmentDistance;
        }
      }
      function getAnchors(line, spacing, maxAngle, shapedText, shapedIcon, glyphSize, boxScale, overscaling, tileExtent) {
        const angleWindowSize = getAngleWindowSize(shapedText, glyphSize, boxScale);
        const shapedLabelLength = getShapedLabelLength(shapedText, shapedIcon);
        const labelLength = shapedLabelLength * boxScale;
        const isLineContinued = line[0].x === 0 || line[0].x === tileExtent || line[0].y === 0 || line[0].y === tileExtent;
        if (spacing - labelLength < spacing / 4) {
          spacing = labelLength + spacing / 4;
        }
        const fixedExtraOffset = glyphSize * 2;
        const offset = !isLineContinued ? (shapedLabelLength / 2 + fixedExtraOffset) * boxScale * overscaling % spacing : spacing / 2 * overscaling % spacing;
        return resample(line, offset, spacing, angleWindowSize, maxAngle, labelLength, isLineContinued, false, tileExtent);
      }
      function resample(line, offset, spacing, angleWindowSize, maxAngle, labelLength, isLineContinued, placeAtMiddle, tileExtent) {
        const halfLabelLength = labelLength / 2;
        const lineLength = getLineLength(line);
        let distance = 0;
        let markedDistance = offset - spacing;
        let anchors = [];
        for (let i = 0; i < line.length - 1; i++) {
          const a = line[i];
          const b = line[i + 1];
          const segmentDist = a.dist(b);
          const angle = b.angleTo(a);
          while (markedDistance + spacing < distance + segmentDist) {
            markedDistance += spacing;
            const t = (markedDistance - distance) / segmentDist;
            const x = interpolate(a.x, b.x, t);
            const y = interpolate(a.y, b.y, t);
            if (x >= 0 && x < tileExtent && y >= 0 && y < tileExtent && markedDistance - halfLabelLength >= 0 && markedDistance + halfLabelLength <= lineLength) {
              const anchor = new Anchor(x, y, angle, i);
              anchor._round();
              if (!angleWindowSize || checkMaxAngle(line, anchor, labelLength, angleWindowSize, maxAngle)) {
                anchors.push(anchor);
              }
            }
          }
          distance += segmentDist;
        }
        if (!placeAtMiddle && !anchors.length && !isLineContinued) {
          anchors = resample(
            line,
            distance / 2,
            spacing,
            angleWindowSize,
            maxAngle,
            labelLength,
            isLineContinued,
            true,
            tileExtent
          );
        }
        return anchors;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/clip_line.js
  var require_clip_line = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/clip_line.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      module.exports = clipLine2;
      function clipLine2(lines, x1, y1, x2, y2) {
        const clippedLines = [];
        for (let l = 0; l < lines.length; l++) {
          const line = lines[l];
          let clippedLine;
          for (let i = 0; i < line.length - 1; i++) {
            let p0 = line[i];
            let p1 = line[i + 1];
            if (p0.x < x1 && p1.x < x1) {
              continue;
            }
            if (p0.x < x1) {
              p0 = new Point2(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)))._round();
            } else if (p1.x < x1) {
              p1 = new Point2(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)))._round();
            }
            if (p0.y < y1 && p1.y < y1) {
              continue;
            }
            if (p0.y < y1) {
              p0 = new Point2(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1)._round();
            } else if (p1.y < y1) {
              p1 = new Point2(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1)._round();
            }
            if (p0.x >= x2 && p1.x >= x2) {
              continue;
            }
            if (p0.x >= x2) {
              p0 = new Point2(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)))._round();
            } else if (p1.x >= x2) {
              p1 = new Point2(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)))._round();
            }
            if (p0.y >= y2 && p1.y >= y2) {
              continue;
            }
            if (p0.y >= y2) {
              p0 = new Point2(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2)._round();
            } else if (p1.y >= y2) {
              p1 = new Point2(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2)._round();
            }
            if (!clippedLine || !p0.equals(clippedLine[clippedLine.length - 1])) {
              clippedLine = [p0];
              clippedLines.push(clippedLine);
            }
            clippedLine.push(p1);
          }
        }
        return clippedLines;
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/shaping.js
  var require_shaping = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/shaping.js"(exports, module) {
      var { charHasUprightVerticalOrientation, charAllowsIdeographicBreaking } = require_script_detection();
      var verticalizePunctuation = require_verticalize_punctuation();
      var { plugin: rtlTextPlugin } = require_rtl_text_plugin();
      var WritingMode = {
        horizontal: 1,
        vertical: 2,
        horizontalOnly: 3
      };
      module.exports = {
        shapeText,
        shapeIcon,
        WritingMode
      };
      var TaggedString = class _TaggedString {
        constructor() {
          this.text = "";
          this.sectionIndex = [];
          this.sections = [];
        }
        static fromFeature(text, defaultFontStack) {
          const result = new _TaggedString();
          for (let i = 0; i < text.sections.length; i++) {
            const section = text.sections[i];
            result.sections.push({
              scale: section.scale || 1,
              fontStack: section.fontStack || defaultFontStack
            });
            result.text += section.text;
            for (let j = 0; j < section.text.length; j++) {
              result.sectionIndex.push(i);
            }
          }
          return result;
        }
        length() {
          return this.text.length;
        }
        getSection(index) {
          return this.sections[this.sectionIndex[index]];
        }
        getCharCode(index) {
          return this.text.charCodeAt(index);
        }
        verticalizePunctuation() {
          this.text = verticalizePunctuation(this.text);
        }
        trim() {
          let beginningWhitespace = 0;
          for (let i = 0; i < this.text.length && whitespace[this.text.charCodeAt(i)]; i++) {
            beginningWhitespace++;
          }
          let trailingWhitespace = this.text.length;
          for (let i = this.text.length - 1; i >= 0 && i >= beginningWhitespace && whitespace[this.text.charCodeAt(i)]; i--) {
            trailingWhitespace--;
          }
          this.text = this.text.substring(beginningWhitespace, trailingWhitespace);
          this.sectionIndex = this.sectionIndex.slice(beginningWhitespace, trailingWhitespace);
        }
        substring(start, end) {
          const substring = new _TaggedString();
          substring.text = this.text.substring(start, end);
          substring.sectionIndex = this.sectionIndex.slice(start, end);
          substring.sections = this.sections;
          return substring;
        }
        toString() {
          return this.text;
        }
        getMaxScale() {
          return this.sectionIndex.reduce((max, index) => Math.max(max, this.sections[index].scale), 0);
        }
      };
      function breakLines(input, lineBreakPoints) {
        const lines = [];
        const text = input.text;
        let start = 0;
        for (const lineBreak of lineBreakPoints) {
          lines.push(input.substring(start, lineBreak));
          start = lineBreak;
        }
        if (start < text.length) {
          lines.push(input.substring(start, text.length));
        }
        return lines;
      }
      function shapeText(text, glyphs, defaultFontStack, maxWidth, lineHeight, textAnchor, textJustify, spacing, translate, verticalHeight, writingMode) {
        const logicalInput = TaggedString.fromFeature(text, defaultFontStack);
        if (writingMode === WritingMode.vertical) {
          logicalInput.verticalizePunctuation();
        }
        const positionedGlyphs = [];
        const shaping = {
          positionedGlyphs,
          text: logicalInput,
          top: translate[1],
          bottom: translate[1],
          left: translate[0],
          right: translate[0],
          writingMode
        };
        let lines;
        const { processBidirectionalText, processStyledBidirectionalText } = rtlTextPlugin;
        if (processBidirectionalText && logicalInput.sections.length === 1) {
          lines = [];
          const untaggedLines = processBidirectionalText(
            logicalInput.toString(),
            determineLineBreaks(logicalInput, spacing, maxWidth, glyphs)
          );
          for (const line of untaggedLines) {
            const taggedLine = new TaggedString();
            taggedLine.text = line;
            taggedLine.sections = logicalInput.sections;
            for (let i = 0; i < line.length; i++) {
              taggedLine.sectionIndex.push(0);
            }
            lines.push(taggedLine);
          }
        } else if (processStyledBidirectionalText) {
          lines = [];
          const processedLines = processStyledBidirectionalText(
            logicalInput.text,
            logicalInput.sectionIndex,
            determineLineBreaks(logicalInput, spacing, maxWidth, glyphs)
          );
          for (const line of processedLines) {
            const taggedLine = new TaggedString();
            taggedLine.text = line[0];
            taggedLine.sectionIndex = line[1];
            taggedLine.sections = logicalInput.sections;
            lines.push(taggedLine);
          }
        } else {
          lines = breakLines(logicalInput, determineLineBreaks(logicalInput, spacing, maxWidth, glyphs));
        }
        shapeLines(shaping, glyphs, lines, lineHeight, textAnchor, textJustify, writingMode, spacing, verticalHeight);
        if (!positionedGlyphs.length) return false;
        shaping.text = shaping.text.toString();
        return shaping;
      }
      var whitespace = {
        [9]: true,
        // tab
        [10]: true,
        // newline
        [11]: true,
        // vertical tab
        [12]: true,
        // form feed
        [13]: true,
        // carriage return
        [32]: true
        // space
      };
      var breakable = {
        [10]: true,
        // newline
        [32]: true,
        // space
        [38]: true,
        // ampersand
        [40]: true,
        // left parenthesis
        [41]: true,
        // right parenthesis
        [43]: true,
        // plus sign
        [45]: true,
        // hyphen-minus
        [47]: true,
        // solidus
        [173]: true,
        // soft hyphen
        [183]: true,
        // middle dot
        [8203]: true,
        // zero-width space
        [8208]: true,
        // hyphen
        [8211]: true,
        // en dash
        [8231]: true
        // interpunct
        // Many other characters may be reasonable breakpoints
        // Consider "neutral orientation" characters at scriptDetection.charHasNeutralVerticalOrientation
        // See https://github.com/mapbox/mapbox-gl-js/issues/3658
      };
      function determineAverageLineWidth(logicalInput, spacing, maxWidth, glyphMap) {
        let totalWidth = 0;
        for (let index = 0; index < logicalInput.length(); index++) {
          const section = logicalInput.getSection(index);
          const positions = glyphMap[section.fontStack];
          const glyph = positions?.[logicalInput.getCharCode(index)];
          if (!glyph) continue;
          totalWidth += glyph.metrics.advance * section.scale + spacing;
        }
        const lineCount = Math.max(1, Math.ceil(totalWidth / maxWidth));
        return totalWidth / lineCount;
      }
      function calculateBadness(lineWidth, targetWidth, penalty, isLastBreak) {
        const raggedness = (lineWidth - targetWidth) ** 2;
        if (isLastBreak) {
          if (lineWidth < targetWidth) {
            return raggedness / 2;
          }
          return raggedness * 2;
        }
        return raggedness + Math.abs(penalty) * penalty;
      }
      function calculatePenalty(codePoint, nextCodePoint) {
        let penalty = 0;
        if (codePoint === 10) {
          penalty -= 1e4;
        }
        if (codePoint === 40 || codePoint === 65288) {
          penalty += 50;
        }
        if (nextCodePoint === 41 || nextCodePoint === 65289) {
          penalty += 50;
        }
        return penalty;
      }
      function evaluateBreak(breakIndex, breakX, targetWidth, potentialBreaks, penalty, isLastBreak) {
        let bestPriorBreak = null;
        let bestBreakBadness = calculateBadness(breakX, targetWidth, penalty, isLastBreak);
        for (const potentialBreak of potentialBreaks) {
          const lineWidth = breakX - potentialBreak.x;
          const breakBadness = calculateBadness(lineWidth, targetWidth, penalty, isLastBreak) + potentialBreak.badness;
          if (breakBadness <= bestBreakBadness) {
            bestPriorBreak = potentialBreak;
            bestBreakBadness = breakBadness;
          }
        }
        return {
          index: breakIndex,
          x: breakX,
          priorBreak: bestPriorBreak,
          badness: bestBreakBadness
        };
      }
      function leastBadBreaks(lastLineBreak) {
        if (!lastLineBreak) {
          return [];
        }
        return leastBadBreaks(lastLineBreak.priorBreak).concat(lastLineBreak.index);
      }
      function determineLineBreaks(logicalInput, spacing, maxWidth, glyphMap) {
        if (!maxWidth) return [];
        if (!logicalInput) return [];
        const potentialLineBreaks = [];
        const targetWidth = determineAverageLineWidth(logicalInput, spacing, maxWidth, glyphMap);
        let currentX = 0;
        for (let i = 0; i < logicalInput.length(); i++) {
          const section = logicalInput.getSection(i);
          const codePoint = logicalInput.getCharCode(i);
          const positions = glyphMap[section.fontStack];
          const glyph = positions?.[codePoint];
          if (glyph && !whitespace[codePoint]) currentX += glyph.metrics.advance * section.scale + spacing;
          if (i < logicalInput.length() - 1 && (breakable[codePoint] || charAllowsIdeographicBreaking(codePoint))) {
            potentialLineBreaks.push(
              evaluateBreak(
                i + 1,
                currentX,
                targetWidth,
                potentialLineBreaks,
                calculatePenalty(codePoint, logicalInput.getCharCode(i + 1)),
                false
              )
            );
          }
        }
        return leastBadBreaks(evaluateBreak(logicalInput.length(), currentX, targetWidth, potentialLineBreaks, 0, true));
      }
      function getAnchorAlignment(anchor) {
        let horizontalAlign = 0.5;
        let verticalAlign = 0.5;
        switch (anchor) {
          case "right":
          case "top-right":
          case "bottom-right":
            horizontalAlign = 1;
            break;
          case "left":
          case "top-left":
          case "bottom-left":
            horizontalAlign = 0;
            break;
        }
        switch (anchor) {
          case "bottom":
          case "bottom-right":
          case "bottom-left":
            verticalAlign = 1;
            break;
          case "top":
          case "top-right":
          case "top-left":
            verticalAlign = 0;
            break;
        }
        return { horizontalAlign, verticalAlign };
      }
      function shapeLines(shaping, glyphMap, lines, lineHeight, textAnchor, textJustify, writingMode, spacing, verticalHeight) {
        const yOffset = -17;
        let x = 0;
        let y = yOffset;
        let maxLineLength = 0;
        const positionedGlyphs = shaping.positionedGlyphs;
        const justify = textJustify === "right" ? 1 : textJustify === "left" ? 0 : 0.5;
        for (const line of lines) {
          line.trim();
          const lineMaxScale = line.getMaxScale();
          if (!line.length()) {
            y += lineHeight;
            continue;
          }
          const lineStartIndex = positionedGlyphs.length;
          for (let i = 0; i < line.length(); i++) {
            const section = line.getSection(i);
            const codePoint = line.getCharCode(i);
            const baselineOffset = (lineMaxScale - section.scale) * 24;
            const positions = glyphMap[section.fontStack];
            const glyph = positions?.[codePoint];
            if (!glyph) continue;
            if (!charHasUprightVerticalOrientation(codePoint) || writingMode === WritingMode.horizontal) {
              positionedGlyphs.push({
                glyph: codePoint,
                x,
                y: y + baselineOffset,
                vertical: false,
                scale: section.scale,
                fontStack: section.fontStack
              });
              x += glyph.metrics.advance * section.scale + spacing;
            } else {
              positionedGlyphs.push({
                glyph: codePoint,
                x,
                y: baselineOffset,
                vertical: true,
                scale: section.scale,
                fontStack: section.fontStack
              });
              x += verticalHeight * section.scale + spacing;
            }
          }
          if (positionedGlyphs.length !== lineStartIndex) {
            const lineLength = x - spacing;
            maxLineLength = Math.max(lineLength, maxLineLength);
            justifyLine(positionedGlyphs, glyphMap, lineStartIndex, positionedGlyphs.length - 1, justify);
          }
          x = 0;
          y += lineHeight * lineMaxScale;
        }
        const { horizontalAlign, verticalAlign } = getAnchorAlignment(textAnchor);
        align(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, lines.length);
        const height = y - yOffset;
        shaping.top += -verticalAlign * height;
        shaping.bottom = shaping.top + height;
        shaping.left += -horizontalAlign * maxLineLength;
        shaping.right = shaping.left + maxLineLength;
      }
      function justifyLine(positionedGlyphs, glyphMap, start, end, justify) {
        if (!justify) return;
        const lastPositionedGlyph = positionedGlyphs[end];
        const positions = glyphMap[lastPositionedGlyph.fontStack];
        const glyph = positions?.[lastPositionedGlyph.glyph];
        if (glyph) {
          const lastAdvance = glyph.metrics.advance * lastPositionedGlyph.scale;
          const lineIndent = (positionedGlyphs[end].x + lastAdvance) * justify;
          for (let j = start; j <= end; j++) {
            positionedGlyphs[j].x -= lineIndent;
          }
        }
      }
      function align(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, lineCount) {
        const shiftX = (justify - horizontalAlign) * maxLineLength;
        const shiftY = (-verticalAlign * lineCount + 0.5) * lineHeight;
        for (let j = 0; j < positionedGlyphs.length; j++) {
          positionedGlyphs[j].x += shiftX;
          positionedGlyphs[j].y += shiftY;
        }
      }
      function shapeIcon(image, iconOffset, iconAnchor) {
        const { horizontalAlign, verticalAlign } = getAnchorAlignment(iconAnchor);
        const dx = iconOffset[0];
        const dy = iconOffset[1];
        const x1 = dx - image.displaySize[0] * horizontalAlign;
        const x2 = x1 + image.displaySize[0];
        const y1 = dy - image.displaySize[1] * verticalAlign;
        const y2 = y1 + image.displaySize[1];
        return { image, top: y1, bottom: y2, left: x1, right: x2 };
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/style/parse_glyph_pbf.js
  var require_parse_glyph_pbf = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/style/parse_glyph_pbf.js"(exports, module) {
      var { AlphaImage } = require_image();
      var Protobuf = require_pbf();
      var border = 3;
      function readFontstacks(tag, glyphs, pbf) {
        if (tag === 1) {
          pbf.readMessage(readFontstack, glyphs);
        }
      }
      function readFontstack(tag, glyphs, pbf) {
        if (tag === 3) {
          const { id, bitmap, width, height, left, top, advance } = pbf.readMessage(readGlyph, {});
          glyphs.push({
            id,
            bitmap: new AlphaImage(
              {
                width: width + 2 * border,
                height: height + 2 * border
              },
              bitmap
            ),
            metrics: { width, height, left, top, advance }
          });
        }
      }
      function readGlyph(tag, glyph, pbf) {
        if (tag === 1) glyph.id = pbf.readVarint();
        else if (tag === 2) glyph.bitmap = pbf.readBytes();
        else if (tag === 3) glyph.width = pbf.readVarint();
        else if (tag === 4) glyph.height = pbf.readVarint();
        else if (tag === 5) glyph.left = pbf.readSVarint();
        else if (tag === 6) glyph.top = pbf.readSVarint();
        else if (tag === 7) glyph.advance = pbf.readVarint();
      }
      function parseGlyph(data) {
        return new Protobuf(data).readFields(readFontstacks, []);
      }
      parseGlyph.GLYPH_PBF_BORDER = border;
      module.exports = parseGlyph;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/quads.js
  var require_quads = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/quads.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var { GLYPH_PBF_BORDER } = require_parse_glyph_pbf();
      function getIconQuads(anchor, shapedIcon, layer, alongLine, shapedText, feature) {
        const image = shapedIcon.image;
        const layout = layer.layout;
        const border = 1;
        const top = shapedIcon.top - border / image.pixelRatio;
        const left = shapedIcon.left - border / image.pixelRatio;
        const bottom = shapedIcon.bottom + border / image.pixelRatio;
        const right = shapedIcon.right + border / image.pixelRatio;
        let tl;
        let tr;
        let br;
        let bl;
        if (layout.get("icon-text-fit") !== "none" && shapedText) {
          const iconWidth = right - left;
          const iconHeight = bottom - top;
          const size = layout.get("text-size").evaluate(feature, {}) / 24;
          const textLeft = shapedText.left * size;
          const textRight = shapedText.right * size;
          const textTop = shapedText.top * size;
          const textBottom = shapedText.bottom * size;
          const textWidth = textRight - textLeft;
          const textHeight = textBottom - textTop;
          const padT = layout.get("icon-text-fit-padding")[0];
          const padR = layout.get("icon-text-fit-padding")[1];
          const padB = layout.get("icon-text-fit-padding")[2];
          const padL = layout.get("icon-text-fit-padding")[3];
          const offsetY = layout.get("icon-text-fit") === "width" ? (textHeight - iconHeight) * 0.5 : 0;
          const offsetX = layout.get("icon-text-fit") === "height" ? (textWidth - iconWidth) * 0.5 : 0;
          const width = layout.get("icon-text-fit") === "width" || layout.get("icon-text-fit") === "both" ? textWidth : iconWidth;
          const height = layout.get("icon-text-fit") === "height" || layout.get("icon-text-fit") === "both" ? textHeight : iconHeight;
          tl = new Point2(textLeft + offsetX - padL, textTop + offsetY - padT);
          tr = new Point2(textLeft + offsetX + padR + width, textTop + offsetY - padT);
          br = new Point2(textLeft + offsetX + padR + width, textTop + offsetY + padB + height);
          bl = new Point2(textLeft + offsetX - padL, textTop + offsetY + padB + height);
        } else {
          tl = new Point2(left, top);
          tr = new Point2(right, top);
          br = new Point2(right, bottom);
          bl = new Point2(left, bottom);
        }
        const angle = layer.layout.get("icon-rotate").evaluate(feature, {}) * Math.PI / 180;
        if (angle) {
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);
          const matrix = [cos, -sin, sin, cos];
          tl._matMult(matrix);
          tr._matMult(matrix);
          bl._matMult(matrix);
          br._matMult(matrix);
        }
        return [{ tl, tr, bl, br, tex: image.paddedRect, writingMode: void 0, glyphOffset: [0, 0] }];
      }
      function getGlyphQuads(anchor, shaping, layer, alongLine, feature, positions) {
        const oneEm = 24;
        const textRotate = layer.layout.get("text-rotate").evaluate(feature, {}) * Math.PI / 180;
        const textOffset = layer.layout.get("text-offset").evaluate(feature, {}).map((t) => t * oneEm);
        const positionedGlyphs = shaping.positionedGlyphs;
        const quads = [];
        for (let k = 0; k < positionedGlyphs.length; k++) {
          const positionedGlyph = positionedGlyphs[k];
          const glyphPositions = positions[positionedGlyph.fontStack];
          const glyph = glyphPositions?.[positionedGlyph.glyph];
          if (!glyph) continue;
          const rect = glyph.rect;
          if (!rect) continue;
          const glyphPadding = 1;
          const rectBuffer = GLYPH_PBF_BORDER + glyphPadding;
          const halfAdvance = glyph.metrics.advance * positionedGlyph.scale / 2;
          const glyphOffset = alongLine ? [positionedGlyph.x + halfAdvance, positionedGlyph.y] : [0, 0];
          const builtInOffset = alongLine ? [0, 0] : [positionedGlyph.x + halfAdvance + textOffset[0], positionedGlyph.y + textOffset[1]];
          const x1 = (glyph.metrics.left - rectBuffer) * positionedGlyph.scale - halfAdvance + builtInOffset[0];
          const y1 = (-glyph.metrics.top - rectBuffer) * positionedGlyph.scale + builtInOffset[1];
          const x2 = x1 + rect.w * positionedGlyph.scale;
          const y2 = y1 + rect.h * positionedGlyph.scale;
          const tl = new Point2(x1, y1);
          const tr = new Point2(x2, y1);
          const bl = new Point2(x1, y2);
          const br = new Point2(x2, y2);
          if (alongLine && positionedGlyph.vertical) {
            const center = new Point2(-halfAdvance, halfAdvance);
            const verticalRotation = -Math.PI / 2;
            const xOffsetCorrection = new Point2(5, 0);
            tl._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
            tr._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
            bl._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
            br._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
          }
          if (textRotate) {
            const sin = Math.sin(textRotate);
            const cos = Math.cos(textRotate);
            const matrix = [cos, -sin, sin, cos];
            tl._matMult(matrix);
            tr._matMult(matrix);
            bl._matMult(matrix);
            br._matMult(matrix);
          }
          quads.push({ tl, tr, bl, br, tex: rect, writingMode: shaping.writingMode, glyphOffset });
        }
        return quads;
      }
      module.exports = {
        getIconQuads,
        getGlyphQuads
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/collision_feature.js
  var require_collision_feature = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/collision_feature.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var CollisionFeature = class {
        /**
         * Create a CollisionFeature, adding its collision box data to the given collisionBoxArray in the process.
         *
         * @param line The geometry the label is placed on.
         * @param anchor The point along the line around which the label is anchored.
         * @param shaped The text or icon shaping results.
         * @param boxScale A magic number used to convert from glyph metrics units to geometry units.
         * @param padding The amount of padding to add around the label edges.
         * @param alignLine Whether the label is aligned with the line or the viewport.
         */
        constructor(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex, shaped, boxScale, padding, alignLine, overscaling, rotate) {
          let y1 = shaped.top * boxScale - padding;
          let y2 = shaped.bottom * boxScale + padding;
          let x1 = shaped.left * boxScale - padding;
          let x2 = shaped.right * boxScale + padding;
          this.boxStartIndex = collisionBoxArray.length;
          if (alignLine) {
            let height = y2 - y1;
            const length = x2 - x1;
            if (height > 0) {
              height = Math.max(10 * boxScale, height);
              this._addLineCollisionCircles(
                collisionBoxArray,
                line,
                anchor,
                anchor.segment,
                length,
                height,
                featureIndex,
                sourceLayerIndex,
                bucketIndex,
                overscaling
              );
            }
          } else {
            if (rotate) {
              const tl = new Point2(x1, y1);
              const tr = new Point2(x2, y1);
              const bl = new Point2(x1, y2);
              const br = new Point2(x2, y2);
              const rotateRadians = rotate * Math.PI / 180;
              tl._rotate(rotateRadians);
              tr._rotate(rotateRadians);
              bl._rotate(rotateRadians);
              br._rotate(rotateRadians);
              x1 = Math.min(tl.x, tr.x, bl.x, br.x);
              x2 = Math.max(tl.x, tr.x, bl.x, br.x);
              y1 = Math.min(tl.y, tr.y, bl.y, br.y);
              y2 = Math.max(tl.y, tr.y, bl.y, br.y);
            }
            collisionBoxArray.emplaceBack(
              anchor.x,
              anchor.y,
              x1,
              y1,
              x2,
              y2,
              featureIndex,
              sourceLayerIndex,
              bucketIndex,
              0,
              0
            );
          }
          this.boxEndIndex = collisionBoxArray.length;
        }
        /**
         * Create a set of CollisionBox objects for a line.
         *
         * @param labelLength The length of the label in geometry units.
         * @param anchor The point along the line around which the label is anchored.
         * @param boxSize The size of the collision boxes that will be created.
         * @private
         */
        _addLineCollisionCircles(collisionBoxArray, line, anchor, segment, labelLength, boxSize, featureIndex, sourceLayerIndex, bucketIndex, overscaling) {
          const step = boxSize / 2;
          const nBoxes = Math.floor(labelLength / step) || 1;
          const overscalingPaddingFactor = 1 + 0.4 * Math.log(overscaling) / Math.LN2;
          const nPitchPaddingBoxes = Math.floor(nBoxes * overscalingPaddingFactor / 2);
          const firstBoxOffset = -boxSize / 2;
          let p = anchor;
          let index = segment + 1;
          let anchorDistance = firstBoxOffset;
          const labelStartDistance = -labelLength / 2;
          const paddingStartDistance = labelStartDistance - labelLength / 4;
          do {
            index--;
            if (index < 0) {
              if (anchorDistance > labelStartDistance) {
                return;
              }
              index = 0;
              break;
            }
            anchorDistance -= line[index].dist(p);
            p = line[index];
          } while (anchorDistance > paddingStartDistance);
          let segmentLength = line[index].dist(line[index + 1]);
          for (let i = -nPitchPaddingBoxes; i < nBoxes + nPitchPaddingBoxes; i++) {
            const boxOffset = i * step;
            let boxDistanceToAnchor = labelStartDistance + boxOffset;
            if (boxOffset < 0) boxDistanceToAnchor += boxOffset;
            if (boxOffset > labelLength) boxDistanceToAnchor += boxOffset - labelLength;
            if (boxDistanceToAnchor < anchorDistance) {
              continue;
            }
            while (anchorDistance + segmentLength < boxDistanceToAnchor) {
              anchorDistance += segmentLength;
              index++;
              if (index + 1 >= line.length) {
                return;
              }
              segmentLength = line[index].dist(line[index + 1]);
            }
            const segmentBoxDistance = boxDistanceToAnchor - anchorDistance;
            const p0 = line[index];
            const p1 = line[index + 1];
            const boxAnchorPoint = p1.sub(p0)._unit()._mult(segmentBoxDistance)._add(p0)._round();
            const paddedAnchorDistance = Math.abs(boxDistanceToAnchor - firstBoxOffset) < step ? 0 : (boxDistanceToAnchor - firstBoxOffset) * 0.8;
            collisionBoxArray.emplaceBack(
              boxAnchorPoint.x,
              boxAnchorPoint.y,
              -boxSize / 2,
              -boxSize / 2,
              boxSize / 2,
              boxSize / 2,
              featureIndex,
              sourceLayerIndex,
              bucketIndex,
              boxSize / 2,
              paddedAnchorDistance
            );
          }
        }
      };
      module.exports = CollisionFeature;
    }
  });

  // node_modules/tinyqueue/index.js
  var tinyqueue_exports = {};
  __export(tinyqueue_exports, {
    default: () => TinyQueue
  });
  var TinyQueue;
  var init_tinyqueue = __esm({
    "node_modules/tinyqueue/index.js"() {
      TinyQueue = class {
        constructor(data = [], compare = (a, b) => a < b ? -1 : a > b ? 1 : 0) {
          this.data = data;
          this.length = this.data.length;
          this.compare = compare;
          if (this.length > 0) {
            for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
          }
        }
        push(item) {
          this.data.push(item);
          this._up(this.length++);
        }
        pop() {
          if (this.length === 0) return void 0;
          const top = this.data[0];
          const bottom = this.data.pop();
          if (--this.length > 0) {
            this.data[0] = bottom;
            this._down(0);
          }
          return top;
        }
        peek() {
          return this.data[0];
        }
        _up(pos) {
          const { data, compare } = this;
          const item = data[pos];
          while (pos > 0) {
            const parent = pos - 1 >> 1;
            const current = data[parent];
            if (compare(item, current) >= 0) break;
            data[pos] = current;
            pos = parent;
          }
          data[pos] = item;
        }
        _down(pos) {
          const { data, compare } = this;
          const halfLength = this.length >> 1;
          const item = data[pos];
          while (pos < halfLength) {
            let bestChild = (pos << 1) + 1;
            const right = bestChild + 1;
            if (right < this.length && compare(data[right], data[bestChild]) < 0) {
              bestChild = right;
            }
            if (compare(data[bestChild], item) >= 0) break;
            data[pos] = data[bestChild];
            pos = bestChild;
          }
          data[pos] = item;
        }
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/util/find_pole_of_inaccessibility.js
  var require_find_pole_of_inaccessibility = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/util/find_pole_of_inaccessibility.js"(exports, module) {
      var { default: Queue } = (init_tinyqueue(), __toCommonJS(tinyqueue_exports));
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var { distToSegmentSquared } = require_intersection_tests();
      module.exports = function(polygonRings, precision = 1, debug = false) {
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        const outerRing = polygonRings[0];
        for (let i = 0; i < outerRing.length; i++) {
          const p = outerRing[i];
          if (!i || p.x < minX) minX = p.x;
          if (!i || p.y < minY) minY = p.y;
          if (!i || p.x > maxX) maxX = p.x;
          if (!i || p.y > maxY) maxY = p.y;
        }
        const width = maxX - minX;
        const height = maxY - minY;
        const cellSize = Math.min(width, height);
        let h = cellSize / 2;
        const cellQueue = new Queue(void 0, compareMax);
        if (cellSize === 0) return new Point2(minX, minY);
        for (let x = minX; x < maxX; x += cellSize) {
          for (let y = minY; y < maxY; y += cellSize) {
            cellQueue.push(new Cell(x + h, y + h, h, polygonRings));
          }
        }
        let bestCell = getCentroidCell(polygonRings);
        let numProbes = cellQueue.length;
        while (cellQueue.length) {
          const cell = cellQueue.pop();
          if (cell.d > bestCell.d || !bestCell.d) {
            bestCell = cell;
            if (debug) console.log("found best %d after %d probes", Math.round(1e4 * cell.d) / 1e4, numProbes);
          }
          if (cell.max - bestCell.d <= precision) continue;
          h = cell.h / 2;
          cellQueue.push(new Cell(cell.p.x - h, cell.p.y - h, h, polygonRings));
          cellQueue.push(new Cell(cell.p.x + h, cell.p.y - h, h, polygonRings));
          cellQueue.push(new Cell(cell.p.x - h, cell.p.y + h, h, polygonRings));
          cellQueue.push(new Cell(cell.p.x + h, cell.p.y + h, h, polygonRings));
          numProbes += 4;
        }
        if (debug) {
          console.log(`num probes: ${numProbes}`);
          console.log(`best distance: ${bestCell.d}`);
        }
        return bestCell.p;
      };
      function compareMax(a, b) {
        return b.max - a.max;
      }
      function Cell(x, y, h, polygon) {
        this.p = new Point2(x, y);
        this.h = h;
        this.d = pointToPolygonDist(this.p, polygon);
        this.max = this.d + this.h * Math.SQRT2;
      }
      function pointToPolygonDist(p, polygon) {
        let inside = false;
        let minDistSq = Number.POSITIVE_INFINITY;
        for (let k = 0; k < polygon.length; k++) {
          const ring = polygon[k];
          for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
            const a = ring[i];
            const b = ring[j];
            if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
            minDistSq = Math.min(minDistSq, distToSegmentSquared(p, a, b));
          }
        }
        return (inside ? 1 : -1) * Math.sqrt(minDistSq);
      }
      function getCentroidCell(polygon) {
        let area2 = 0;
        let x = 0;
        let y = 0;
        const points = polygon[0];
        for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
          const a = points[i];
          const b = points[j];
          const f = a.x * b.y - b.x * a.y;
          x += (a.x + b.x) * f;
          y += (a.y + b.y) * f;
          area2 += f * 3;
        }
        return new Cell(x / area2, y / area2, 0, polygon);
      }
    }
  });

  // node_modules/murmurhash-js/murmurhash3_gc.js
  var require_murmurhash3_gc = __commonJS({
    "node_modules/murmurhash-js/murmurhash3_gc.js"(exports, module) {
      function murmurhash3_32_gc(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
        remainder = key.length & 3;
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 3432918353;
        c2 = 461845907;
        i = 0;
        while (i < bytes) {
          k1 = key.charCodeAt(i) & 255 | (key.charCodeAt(++i) & 255) << 8 | (key.charCodeAt(++i) & 255) << 16 | (key.charCodeAt(++i) & 255) << 24;
          ++i;
          k1 = (k1 & 65535) * c1 + (((k1 >>> 16) * c1 & 65535) << 16) & 4294967295;
          k1 = k1 << 15 | k1 >>> 17;
          k1 = (k1 & 65535) * c2 + (((k1 >>> 16) * c2 & 65535) << 16) & 4294967295;
          h1 ^= k1;
          h1 = h1 << 13 | h1 >>> 19;
          h1b = (h1 & 65535) * 5 + (((h1 >>> 16) * 5 & 65535) << 16) & 4294967295;
          h1 = (h1b & 65535) + 27492 + (((h1b >>> 16) + 58964 & 65535) << 16);
        }
        k1 = 0;
        switch (remainder) {
          case 3:
            k1 ^= (key.charCodeAt(i + 2) & 255) << 16;
          case 2:
            k1 ^= (key.charCodeAt(i + 1) & 255) << 8;
          case 1:
            k1 ^= key.charCodeAt(i) & 255;
            k1 = (k1 & 65535) * c1 + (((k1 >>> 16) * c1 & 65535) << 16) & 4294967295;
            k1 = k1 << 15 | k1 >>> 17;
            k1 = (k1 & 65535) * c2 + (((k1 >>> 16) * c2 & 65535) << 16) & 4294967295;
            h1 ^= k1;
        }
        h1 ^= key.length;
        h1 ^= h1 >>> 16;
        h1 = (h1 & 65535) * 2246822507 + (((h1 >>> 16) * 2246822507 & 65535) << 16) & 4294967295;
        h1 ^= h1 >>> 13;
        h1 = (h1 & 65535) * 3266489909 + (((h1 >>> 16) * 3266489909 & 65535) << 16) & 4294967295;
        h1 ^= h1 >>> 16;
        return h1 >>> 0;
      }
      if (typeof module !== "undefined") {
        module.exports = murmurhash3_32_gc;
      }
    }
  });

  // node_modules/murmurhash-js/murmurhash2_gc.js
  var require_murmurhash2_gc = __commonJS({
    "node_modules/murmurhash-js/murmurhash2_gc.js"(exports, module) {
      function murmurhash2_32_gc(str, seed) {
        var l = str.length, h = seed ^ l, i = 0, k;
        while (l >= 4) {
          k = str.charCodeAt(i) & 255 | (str.charCodeAt(++i) & 255) << 8 | (str.charCodeAt(++i) & 255) << 16 | (str.charCodeAt(++i) & 255) << 24;
          k = (k & 65535) * 1540483477 + (((k >>> 16) * 1540483477 & 65535) << 16);
          k ^= k >>> 24;
          k = (k & 65535) * 1540483477 + (((k >>> 16) * 1540483477 & 65535) << 16);
          h = (h & 65535) * 1540483477 + (((h >>> 16) * 1540483477 & 65535) << 16) ^ k;
          l -= 4;
          ++i;
        }
        switch (l) {
          case 3:
            h ^= (str.charCodeAt(i + 2) & 255) << 16;
          case 2:
            h ^= (str.charCodeAt(i + 1) & 255) << 8;
          case 1:
            h ^= str.charCodeAt(i) & 255;
            h = (h & 65535) * 1540483477 + (((h >>> 16) * 1540483477 & 65535) << 16);
        }
        h ^= h >>> 13;
        h = (h & 65535) * 1540483477 + (((h >>> 16) * 1540483477 & 65535) << 16);
        h ^= h >>> 15;
        return h >>> 0;
      }
      if (typeof module !== void 0) {
        module.exports = murmurhash2_32_gc;
      }
    }
  });

  // node_modules/murmurhash-js/index.js
  var require_murmurhash_js = __commonJS({
    "node_modules/murmurhash-js/index.js"(exports, module) {
      var murmur3 = require_murmurhash3_gc();
      var murmur2 = require_murmurhash2_gc();
      module.exports = murmur3;
      module.exports.murmur3 = murmur3;
      module.exports.murmur2 = murmur2;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/symbol/symbol_layout.js
  var require_symbol_layout = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/symbol/symbol_layout.js"(exports, module) {
      var Anchor = require_anchor();
      var { getAnchors, getCenterAnchor } = require_get_anchors();
      var clipLine2 = require_clip_line();
      var { shapeText, shapeIcon, WritingMode } = require_shaping();
      var { getGlyphQuads, getIconQuads } = require_quads();
      var CollisionFeature = require_collision_feature();
      var warn = require_warn();
      var { allowsVerticalWritingMode, allowsLetterSpacing } = require_script_detection();
      var findPoleOfInaccessibility = require_find_pole_of_inaccessibility();
      var classifyRings = require_classify_rings();
      var EXTENT = require_extent();
      var SymbolBucket = require_symbol_bucket();
      var EvaluationParameters = require_evaluation_parameters();
      var murmur3 = require_murmurhash_js();
      function performSymbolLayout(bucket, glyphMap, glyphPositions, imageMap, imagePositions, showCollisionBoxes) {
        bucket.createArrays();
        const tileSize = 512 * bucket.overscaling;
        bucket.tilePixelRatio = EXTENT / tileSize;
        bucket.compareText = {};
        bucket.iconsNeedLinear = false;
        const layout = bucket.layers[0].layout;
        const unevaluatedLayoutValues = bucket.layers[0]._unevaluatedLayout._values;
        const sizes = {};
        if (bucket.textSizeData.functionType === "composite") {
          const { min, max } = bucket.textSizeData.zoomRange;
          sizes.compositeTextSizes = [
            unevaluatedLayoutValues["text-size"].possiblyEvaluate(new EvaluationParameters(min)),
            unevaluatedLayoutValues["text-size"].possiblyEvaluate(new EvaluationParameters(max))
          ];
        }
        if (bucket.iconSizeData.functionType === "composite") {
          const { min, max } = bucket.iconSizeData.zoomRange;
          sizes.compositeIconSizes = [
            unevaluatedLayoutValues["icon-size"].possiblyEvaluate(new EvaluationParameters(min)),
            unevaluatedLayoutValues["icon-size"].possiblyEvaluate(new EvaluationParameters(max))
          ];
        }
        sizes.layoutTextSize = unevaluatedLayoutValues["text-size"].possiblyEvaluate(
          new EvaluationParameters(bucket.zoom + 1)
        );
        sizes.layoutIconSize = unevaluatedLayoutValues["icon-size"].possiblyEvaluate(
          new EvaluationParameters(bucket.zoom + 1)
        );
        sizes.textMaxSize = unevaluatedLayoutValues["text-size"].possiblyEvaluate(new EvaluationParameters(18));
        const oneEm = 24;
        const lineHeight = layout.get("text-line-height") * oneEm;
        const textAlongLine = layout.get("text-rotation-alignment") === "map" && layout.get("symbol-placement") !== "point";
        const keepUpright = layout.get("text-keep-upright");
        for (const feature of bucket.features) {
          const fontstack = layout.get("text-font").evaluate(feature, {}).join(",");
          const glyphPositionMap = glyphPositions;
          const shapedTextOrientations = {};
          const text = feature.text;
          if (text) {
            const unformattedText = text.toString();
            const textOffset = layout.get("text-offset").evaluate(feature, {}).map((t) => t * oneEm);
            const spacing = layout.get("text-letter-spacing").evaluate(feature, {}) * oneEm;
            const spacingIfAllowed = allowsLetterSpacing(unformattedText) ? spacing : 0;
            const textAnchor = layout.get("text-anchor").evaluate(feature, {});
            const textJustify = layout.get("text-justify").evaluate(feature, {});
            const maxWidth = layout.get("symbol-placement") === "point" ? layout.get("text-max-width").evaluate(feature, {}) * oneEm : 0;
            shapedTextOrientations.horizontal = shapeText(
              text,
              glyphMap,
              fontstack,
              maxWidth,
              lineHeight,
              textAnchor,
              textJustify,
              spacingIfAllowed,
              textOffset,
              oneEm,
              WritingMode.horizontal
            );
            if (allowsVerticalWritingMode(unformattedText) && textAlongLine && keepUpright) {
              shapedTextOrientations.vertical = shapeText(
                text,
                glyphMap,
                fontstack,
                maxWidth,
                lineHeight,
                textAnchor,
                textJustify,
                spacingIfAllowed,
                textOffset,
                oneEm,
                WritingMode.vertical
              );
            }
          }
          let shapedIcon;
          if (feature.icon) {
            const image = imageMap[feature.icon];
            if (image) {
              shapedIcon = shapeIcon(
                imagePositions[feature.icon],
                layout.get("icon-offset").evaluate(feature, {}),
                layout.get("icon-anchor").evaluate(feature, {})
              );
              if (bucket.sdfIcons === void 0) {
                bucket.sdfIcons = image.sdf;
              } else if (bucket.sdfIcons !== image.sdf) {
                warn.once("Style sheet warning: Cannot mix SDF and non-SDF icons in one buffer");
              }
              if (image.pixelRatio !== bucket.pixelRatio) {
                bucket.iconsNeedLinear = true;
              } else if (layout.get("icon-rotate").constantOr(1) !== 0) {
                bucket.iconsNeedLinear = true;
              }
            }
          }
          if (shapedTextOrientations.horizontal || shapedIcon) {
            addFeature2(bucket, feature, shapedTextOrientations, shapedIcon, glyphPositionMap, sizes);
          }
        }
        if (showCollisionBoxes) {
          bucket.generateCollisionDebugBuffers();
        }
      }
      function addFeature2(bucket, feature, shapedTextOrientations, shapedIcon, glyphPositionMap, sizes) {
        const layoutTextSize = sizes.layoutTextSize.evaluate(feature, {});
        const layoutIconSize = sizes.layoutIconSize.evaluate(feature, {});
        let textMaxSize = sizes.textMaxSize.evaluate(feature, {});
        if (textMaxSize === void 0) {
          textMaxSize = layoutTextSize;
        }
        const layout = bucket.layers[0].layout;
        const textOffset = layout.get("text-offset").evaluate(feature, {});
        const iconOffset = layout.get("icon-offset").evaluate(feature, {});
        const glyphSize = 24;
        const fontScale = layoutTextSize / glyphSize;
        const textBoxScale = bucket.tilePixelRatio * fontScale;
        const textMaxBoxScale = bucket.tilePixelRatio * textMaxSize / glyphSize;
        const iconBoxScale = bucket.tilePixelRatio * layoutIconSize;
        const symbolMinDistance = bucket.tilePixelRatio * layout.get("symbol-spacing");
        const textPadding = layout.get("text-padding") * bucket.tilePixelRatio;
        const iconPadding = layout.get("icon-padding") * bucket.tilePixelRatio;
        const textMaxAngle = layout.get("text-max-angle") / 180 * Math.PI;
        const textAlongLine = layout.get("text-rotation-alignment") === "map" && layout.get("symbol-placement") !== "point";
        const iconAlongLine = layout.get("icon-rotation-alignment") === "map" && layout.get("symbol-placement") !== "point";
        const symbolPlacement = layout.get("symbol-placement");
        const textRepeatDistance = symbolMinDistance / 2;
        const addSymbolAtAnchor = (line, anchor) => {
          if (anchor.x < 0 || anchor.x >= EXTENT || anchor.y < 0 || anchor.y >= EXTENT) {
            return;
          }
          addSymbol(
            bucket,
            anchor,
            line,
            shapedTextOrientations,
            shapedIcon,
            bucket.layers[0],
            bucket.collisionBoxArray,
            feature.index,
            feature.sourceLayerIndex,
            bucket.index,
            textBoxScale,
            textPadding,
            textAlongLine,
            textOffset,
            iconBoxScale,
            iconPadding,
            iconAlongLine,
            iconOffset,
            feature,
            glyphPositionMap,
            sizes
          );
        };
        if (symbolPlacement === "line") {
          for (const line of clipLine2(feature.geometry, 0, 0, EXTENT, EXTENT)) {
            const anchors = getAnchors(
              line,
              symbolMinDistance,
              textMaxAngle,
              shapedTextOrientations.vertical || shapedTextOrientations.horizontal,
              shapedIcon,
              glyphSize,
              textMaxBoxScale,
              bucket.overscaling,
              EXTENT
            );
            for (const anchor of anchors) {
              const shapedText = shapedTextOrientations.horizontal;
              if (!shapedText || !anchorIsTooClose(bucket, shapedText.text, textRepeatDistance, anchor)) {
                addSymbolAtAnchor(line, anchor);
              }
            }
          }
        } else if (symbolPlacement === "line-center") {
          for (const line of feature.geometry) {
            if (line.length > 1) {
              const anchor = getCenterAnchor(
                line,
                textMaxAngle,
                shapedTextOrientations.vertical || shapedTextOrientations.horizontal,
                shapedIcon,
                glyphSize,
                textMaxBoxScale
              );
              if (anchor) {
                addSymbolAtAnchor(line, anchor);
              }
            }
          }
        } else if (feature.type === "Polygon") {
          for (const polygon of classifyRings(feature.geometry, 0)) {
            const poi = findPoleOfInaccessibility(polygon, 16);
            addSymbolAtAnchor(polygon[0], new Anchor(poi.x, poi.y, 0));
          }
        } else if (feature.type === "LineString") {
          for (const line of feature.geometry) {
            addSymbolAtAnchor(line, new Anchor(line[0].x, line[0].y, 0));
          }
        } else if (feature.type === "Point") {
          for (const points of feature.geometry) {
            for (const point of points) {
              addSymbolAtAnchor([point], new Anchor(point.x, point.y, 0));
            }
          }
        }
      }
      function addTextVertices(bucket, anchor, shapedText, layer, textAlongLine, feature, textOffset, lineArray, writingMode, placedTextSymbolIndices, glyphPositionMap, sizes) {
        const glyphQuads = getGlyphQuads(anchor, shapedText, layer, textAlongLine, feature, glyphPositionMap);
        const sizeData = bucket.textSizeData;
        let textSizeData = null;
        if (sizeData.functionType === "source") {
          textSizeData = [10 * layer.layout.get("text-size").evaluate(feature, {})];
        } else if (sizeData.functionType === "composite") {
          textSizeData = [
            10 * sizes.compositeTextSizes[0].evaluate(feature, {}),
            10 * sizes.compositeTextSizes[1].evaluate(feature, {})
          ];
        }
        bucket.addSymbols(
          bucket.text,
          glyphQuads,
          textSizeData,
          textOffset,
          textAlongLine,
          feature,
          writingMode,
          anchor,
          lineArray.lineStartIndex,
          lineArray.lineLength
        );
        placedTextSymbolIndices.push(bucket.text.placedSymbolArray.length - 1);
        return glyphQuads.length * 4;
      }
      function addSymbol(bucket, anchor, line, shapedTextOrientations, shapedIcon, layer, collisionBoxArray, featureIndex, sourceLayerIndex, bucketIndex, textBoxScale, textPadding, textAlongLine, textOffset, iconBoxScale, iconPadding, iconAlongLine, iconOffset, feature, glyphPositionMap, sizes) {
        const lineArray = bucket.addToLineVertexArray(anchor, line);
        let textCollisionFeature;
        let iconCollisionFeature;
        let numIconVertices = 0;
        let numGlyphVertices = 0;
        let numVerticalGlyphVertices = 0;
        const key = murmur3(shapedTextOrientations.horizontal ? shapedTextOrientations.horizontal.text : "");
        const placedTextSymbolIndices = [];
        if (shapedTextOrientations.horizontal) {
          const textRotate = layer.layout.get("text-rotate").evaluate(feature, {});
          textCollisionFeature = new CollisionFeature(
            collisionBoxArray,
            line,
            anchor,
            featureIndex,
            sourceLayerIndex,
            bucketIndex,
            shapedTextOrientations.horizontal,
            textBoxScale,
            textPadding,
            textAlongLine,
            bucket.overscaling,
            textRotate
          );
          numGlyphVertices += addTextVertices(
            bucket,
            anchor,
            shapedTextOrientations.horizontal,
            layer,
            textAlongLine,
            feature,
            textOffset,
            lineArray,
            shapedTextOrientations.vertical ? WritingMode.horizontal : WritingMode.horizontalOnly,
            placedTextSymbolIndices,
            glyphPositionMap,
            sizes
          );
          if (shapedTextOrientations.vertical) {
            numVerticalGlyphVertices += addTextVertices(
              bucket,
              anchor,
              shapedTextOrientations.vertical,
              layer,
              textAlongLine,
              feature,
              textOffset,
              lineArray,
              WritingMode.vertical,
              placedTextSymbolIndices,
              glyphPositionMap,
              sizes
            );
          }
        }
        const textBoxStartIndex = textCollisionFeature ? textCollisionFeature.boxStartIndex : bucket.collisionBoxArray.length;
        const textBoxEndIndex = textCollisionFeature ? textCollisionFeature.boxEndIndex : bucket.collisionBoxArray.length;
        if (shapedIcon) {
          const iconQuads = getIconQuads(
            anchor,
            shapedIcon,
            layer,
            iconAlongLine,
            shapedTextOrientations.horizontal,
            feature
          );
          const iconRotate = layer.layout.get("icon-rotate").evaluate(feature, {});
          iconCollisionFeature = new CollisionFeature(
            collisionBoxArray,
            line,
            anchor,
            featureIndex,
            sourceLayerIndex,
            bucketIndex,
            shapedIcon,
            iconBoxScale,
            iconPadding,
            /*align boxes to line*/
            false,
            bucket.overscaling,
            iconRotate
          );
          numIconVertices = iconQuads.length * 4;
          const sizeData = bucket.iconSizeData;
          let iconSizeData = null;
          if (sizeData.functionType === "source") {
            iconSizeData = [10 * layer.layout.get("icon-size").evaluate(feature, {})];
          } else if (sizeData.functionType === "composite") {
            iconSizeData = [
              10 * sizes.compositeIconSizes[0].evaluate(feature, {}),
              10 * sizes.compositeIconSizes[1].evaluate(feature, {})
            ];
          }
          bucket.addSymbols(
            bucket.icon,
            iconQuads,
            iconSizeData,
            iconOffset,
            iconAlongLine,
            feature,
            false,
            anchor,
            lineArray.lineStartIndex,
            lineArray.lineLength
          );
        }
        const iconBoxStartIndex = iconCollisionFeature ? iconCollisionFeature.boxStartIndex : bucket.collisionBoxArray.length;
        const iconBoxEndIndex = iconCollisionFeature ? iconCollisionFeature.boxEndIndex : bucket.collisionBoxArray.length;
        if (bucket.glyphOffsetArray.length >= SymbolBucket.MAX_GLYPHS)
          warn.once("Too many glyphs being rendered in a tile. See https://github.com/mapbox/mapbox-gl-js/issues/2907");
        bucket.symbolInstances.emplaceBack(
          anchor.x,
          anchor.y,
          placedTextSymbolIndices.length > 0 ? placedTextSymbolIndices[0] : -1,
          placedTextSymbolIndices.length > 1 ? placedTextSymbolIndices[1] : -1,
          key,
          textBoxStartIndex,
          textBoxEndIndex,
          iconBoxStartIndex,
          iconBoxEndIndex,
          featureIndex,
          numGlyphVertices,
          numVerticalGlyphVertices,
          numIconVertices,
          0
        );
      }
      function anchorIsTooClose(bucket, text, repeatDistance, anchor) {
        const compareText = bucket.compareText;
        if (!(text in compareText)) {
          compareText[text] = [];
        } else {
          const otherAnchors = compareText[text];
          for (let k = otherAnchors.length - 1; k >= 0; k--) {
            if (anchor.dist(otherAnchors[k]) < repeatDistance) {
              return true;
            }
          }
        }
        compareText[text].push(anchor);
        return false;
      }
      module.exports = {
        performSymbolLayout
      };
    }
  });

  // node_modules/potpack/index.js
  var require_potpack = __commonJS({
    "node_modules/potpack/index.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.potpack = factory());
      })(exports, function() {
        "use strict";
        function potpack(boxes) {
          var area2 = 0;
          var maxWidth = 0;
          for (var i$1 = 0, list = boxes; i$1 < list.length; i$1 += 1) {
            var box = list[i$1];
            area2 += box.w * box.h;
            maxWidth = Math.max(maxWidth, box.w);
          }
          boxes.sort(function(a, b) {
            return b.h - a.h;
          });
          var startWidth = Math.max(Math.ceil(Math.sqrt(area2 / 0.95)), maxWidth);
          var spaces = [{ x: 0, y: 0, w: startWidth, h: Infinity }];
          var width = 0;
          var height = 0;
          for (var i$2 = 0, list$1 = boxes; i$2 < list$1.length; i$2 += 1) {
            var box$1 = list$1[i$2];
            for (var i = spaces.length - 1; i >= 0; i--) {
              var space = spaces[i];
              if (box$1.w > space.w || box$1.h > space.h) {
                continue;
              }
              box$1.x = space.x;
              box$1.y = space.y;
              height = Math.max(height, box$1.y + box$1.h);
              width = Math.max(width, box$1.x + box$1.w);
              if (box$1.w === space.w && box$1.h === space.h) {
                var last = spaces.pop();
                if (i < spaces.length) {
                  spaces[i] = last;
                }
              } else if (box$1.h === space.h) {
                space.x += box$1.w;
                space.w -= box$1.w;
              } else if (box$1.w === space.w) {
                space.y += box$1.h;
                space.h -= box$1.h;
              } else {
                spaces.push({
                  x: space.x + box$1.w,
                  y: space.y,
                  w: space.w - box$1.w,
                  h: box$1.h
                });
                space.y += box$1.h;
                space.h -= box$1.h;
              }
              break;
            }
          }
          return {
            w: width,
            // container width
            h: height,
            // container height
            fill: area2 / (width * height) || 0
            // space utilization
          };
        }
        return potpack;
      });
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/render/image_atlas.js
  var require_image_atlas = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/render/image_atlas.js"(exports, module) {
      var { RGBAImage } = require_image();
      var { register } = require_transfer_registry();
      var potpack = require_potpack();
      var padding = 1;
      var ImagePosition = class {
        constructor(paddedRect, { pixelRatio }) {
          this.paddedRect = paddedRect;
          this.pixelRatio = pixelRatio;
        }
        get tl() {
          return [this.paddedRect.x + padding, this.paddedRect.y + padding];
        }
        get br() {
          return [this.paddedRect.x + this.paddedRect.w - padding, this.paddedRect.y + this.paddedRect.h - padding];
        }
        get tlbr() {
          return this.tl.concat(this.br);
        }
        get displaySize() {
          return [(this.paddedRect.w - padding * 2) / this.pixelRatio, (this.paddedRect.h - padding * 2) / this.pixelRatio];
        }
      };
      var ImageAtlas = class {
        constructor(icons, patterns) {
          const iconPositions = {};
          const patternPositions = {};
          const bins = [];
          for (const id in icons) {
            const src = icons[id];
            const bin = {
              x: 0,
              y: 0,
              w: src.data.width + 2 * padding,
              h: src.data.height + 2 * padding
            };
            bins.push(bin);
            iconPositions[id] = new ImagePosition(bin, src);
          }
          for (const id in patterns) {
            const src = patterns[id];
            const bin = {
              x: 0,
              y: 0,
              w: src.data.width + 2 * padding,
              h: src.data.height + 2 * padding
            };
            bins.push(bin);
            patternPositions[id] = new ImagePosition(bin, src);
          }
          const { w, h } = potpack(bins);
          const image = new RGBAImage({ width: w || 1, height: h || 1 });
          for (const id in icons) {
            const src = icons[id];
            const bin = iconPositions[id].paddedRect;
            RGBAImage.copy(src.data, image, { x: 0, y: 0 }, { x: bin.x + padding, y: bin.y + padding }, src.data);
          }
          for (const id in patterns) {
            const src = patterns[id];
            const bin = patternPositions[id].paddedRect;
            const x = bin.x + padding;
            const y = bin.y + padding;
            const w2 = src.data.width;
            const h2 = src.data.height;
            RGBAImage.copy(src.data, image, { x: 0, y: 0 }, { x, y }, src.data);
            RGBAImage.copy(src.data, image, { x: 0, y: h2 - 1 }, { x, y: y - 1 }, { width: w2, height: 1 });
            RGBAImage.copy(src.data, image, { x: 0, y: 0 }, { x, y: y + h2 }, { width: w2, height: 1 });
            RGBAImage.copy(src.data, image, { x: w2 - 1, y: 0 }, { x: x - 1, y }, { width: 1, height: h2 });
            RGBAImage.copy(src.data, image, { x: 0, y: 0 }, { x: x + w2, y }, { width: 1, height: h2 });
          }
          this.image = image;
          this.iconPositions = iconPositions;
          this.patternPositions = patternPositions;
        }
      };
      ImageAtlas.ImagePosition = ImagePosition;
      module.exports = ImageAtlas;
      register("ImagePosition", ImagePosition);
      register("ImageAtlas", ImageAtlas);
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/render/glyph_atlas.js
  var require_glyph_atlas = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/render/glyph_atlas.js"(exports, module) {
      var { AlphaImage } = require_image();
      var { register } = require_transfer_registry();
      var potpack = require_potpack();
      var padding = 1;
      var GlyphAtlas = class {
        constructor(stacks) {
          const positions = {};
          const bins = [];
          for (const stack in stacks) {
            const glyphs = stacks[stack];
            const stackPositions = positions[stack] = {};
            for (const id in glyphs) {
              const src = glyphs[+id];
              if (!src || src.bitmap.width === 0 || src.bitmap.height === 0) continue;
              const bin = {
                x: 0,
                y: 0,
                w: src.bitmap.width + 2 * padding,
                h: src.bitmap.height + 2 * padding
              };
              bins.push(bin);
              stackPositions[id] = { rect: bin, metrics: src.metrics };
            }
          }
          const { w, h } = potpack(bins);
          const image = new AlphaImage({ width: w ?? 1, height: h ?? 1 });
          for (const stack in stacks) {
            const glyphs = stacks[stack];
            for (const id in glyphs) {
              const src = glyphs[+id];
              if (!src || src.bitmap.width === 0 || src.bitmap.height === 0) continue;
              const bin = positions[stack][id].rect;
              AlphaImage.copy(src.bitmap, image, { x: 0, y: 0 }, { x: bin.x + padding, y: bin.y + padding }, src.bitmap);
            }
          }
          this.image = image;
          this.positions = positions;
        }
      };
      register("GlyphAtlas", GlyphAtlas);
      module.exports = GlyphAtlas;
    }
  });

  // node_modules/@mapbox/whoots-js/index.js
  var require_whoots_js = __commonJS({
    "node_modules/@mapbox/whoots-js/index.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global.WhooTS = {});
      })(exports, function(exports2) {
        function getURL(baseUrl, layer, x, y, z, options) {
          options = options || {};
          var url = baseUrl + "?" + [
            "bbox=" + getTileBBox(x, y, z),
            "format=" + (options.format || "image/png"),
            "service=" + (options.service || "WMS"),
            "version=" + (options.version || "1.1.1"),
            "request=" + (options.request || "GetMap"),
            "srs=" + (options.srs || "EPSG:3857"),
            "width=" + (options.width || 256),
            "height=" + (options.height || 256),
            "layers=" + layer
          ].join("&");
          return url;
        }
        function getTileBBox(x, y, z) {
          y = Math.pow(2, z) - y - 1;
          var min = getMercCoords(x * 256, y * 256, z), max = getMercCoords((x + 1) * 256, (y + 1) * 256, z);
          return min[0] + "," + min[1] + "," + max[0] + "," + max[1];
        }
        function getMercCoords(x, y, z) {
          var resolution = 2 * Math.PI * 6378137 / 256 / Math.pow(2, z), merc_x = x * resolution - 2 * Math.PI * 6378137 / 2, merc_y = y * resolution - 2 * Math.PI * 6378137 / 2;
          return [merc_x, merc_y];
        }
        exports2.getURL = getURL;
        exports2.getTileBBox = getTileBBox;
        exports2.getMercCoords = getMercCoords;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/tile_id.js
  var require_tile_id = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/tile_id.js"(exports, module) {
      var { getTileBBox } = require_whoots_js();
      var assert = require_nanoassert();
      var { register } = require_transfer_registry();
      var Coordinate = require_coordinate();
      var CanonicalTileID = class {
        constructor(z, x, y) {
          assert(z >= 0 && z <= 25);
          assert(x >= 0 && x < 2 ** z);
          assert(y >= 0 && y < 2 ** z);
          this.z = z;
          this.x = x;
          this.y = y;
          this.key = calculateKey(0, z, x, y);
        }
        equals(id) {
          return this.z === id.z && this.x === id.x && this.y === id.y;
        }
        get cacheKey() {
          return this.key;
        }
      };
      var UnwrappedTileID = class {
        constructor(wrap2, canonical) {
          this.wrap = wrap2;
          this.canonical = canonical;
          this.key = calculateKey(wrap2, canonical.z, canonical.x, canonical.y);
        }
      };
      var OverscaledTileID = class _OverscaledTileID {
        constructor(overscaledZ, wrap2, z, x, y) {
          assert(overscaledZ >= z);
          this.overscaledZ = overscaledZ;
          this.wrap = wrap2;
          this.canonical = new CanonicalTileID(z, +x, +y);
          this.key = calculateKey(wrap2, overscaledZ, x, y);
        }
        equals(id) {
          return this.overscaledZ === id.overscaledZ && this.wrap === id.wrap && this.canonical.equals(id.canonical);
        }
        scaledTo(targetZ) {
          assert(targetZ <= this.overscaledZ);
          const zDifference = this.canonical.z - targetZ;
          if (targetZ > this.canonical.z) {
            return new _OverscaledTileID(targetZ, this.wrap, this.canonical.z, this.canonical.x, this.canonical.y);
          }
          return new _OverscaledTileID(
            targetZ,
            this.wrap,
            targetZ,
            this.canonical.x >> zDifference,
            this.canonical.y >> zDifference
          );
        }
        isChildOf(parent) {
          const zDifference = this.canonical.z - parent.canonical.z;
          return parent.overscaledZ === 0 || parent.overscaledZ < this.overscaledZ && parent.canonical.x === this.canonical.x >> zDifference && parent.canonical.y === this.canonical.y >> zDifference;
        }
        children(sourceMaxZoom) {
          if (this.overscaledZ >= sourceMaxZoom) {
            return [
              new _OverscaledTileID(this.overscaledZ + 1, this.wrap, this.canonical.z, this.canonical.x, this.canonical.y)
            ];
          }
          const z = this.canonical.z + 1;
          const x = this.canonical.x * 2;
          const y = this.canonical.y * 2;
          return [
            new _OverscaledTileID(z, this.wrap, z, x, y),
            new _OverscaledTileID(z, this.wrap, z, x + 1, y),
            new _OverscaledTileID(z, this.wrap, z, x, y + 1),
            new _OverscaledTileID(z, this.wrap, z, x + 1, y + 1)
          ];
        }
        isLessThan(rhs) {
          if (this.wrap < rhs.wrap) return true;
          if (this.wrap > rhs.wrap) return false;
          if (this.overscaledZ < rhs.overscaledZ) return true;
          if (this.overscaledZ > rhs.overscaledZ) return false;
          if (this.canonical.x < rhs.canonical.x) return true;
          if (this.canonical.x > rhs.canonical.x) return false;
          if (this.canonical.y < rhs.canonical.y) return true;
          return false;
        }
        get cacheKey() {
          return calculateKey(this.wrap, this.overscaledZ, this.canonical.x, this.canonical.y);
        }
        wrapped() {
          return new _OverscaledTileID(this.overscaledZ, 0, this.canonical.z, this.canonical.x, this.canonical.y);
        }
        unwrapTo(wrap2) {
          return new _OverscaledTileID(this.overscaledZ, wrap2, this.canonical.z, this.canonical.x, this.canonical.y);
        }
        overscaleFactor() {
          return 2 ** (this.overscaledZ - this.canonical.z);
        }
        toUnwrapped() {
          return new UnwrappedTileID(this.wrap, this.canonical);
        }
        toString() {
          return `${this.overscaledZ}/${this.canonical.x}/${this.canonical.y}`;
        }
        toCoordinate() {
          return new Coordinate(this.canonical.x + 2 ** this.wrap, this.canonical.y, this.canonical.z);
        }
      };
      function calculateKey(wrap2, z, x, y) {
        wrap2 *= 2;
        if (wrap2 < 0) wrap2 = wrap2 * -1 - 1;
        const dim = 1 << z;
        return (dim * dim * wrap2 + dim * y + x) * 32 + z;
      }
      register("CanonicalTileID", CanonicalTileID);
      register("OverscaledTileID", OverscaledTileID, { omit: ["posMatrix"] });
      module.exports = {
        CanonicalTileID,
        UnwrappedTileID,
        OverscaledTileID
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/worker_tile.js
  var require_worker_tile = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/worker_tile.js"(exports, module) {
      var FeatureIndex = require_feature_index();
      var { performSymbolLayout } = require_symbol_layout();
      var { CollisionBoxArray } = require_array_types();
      var dictionaryCoder = require_dictionary_coder();
      var SymbolBucket = require_symbol_bucket();
      var LineBucket = require_line_bucket();
      var FillBucket = require_fill_bucket();
      var FillExtrusionBucket = require_fill_extrusion_bucket();
      var { mapObject, values } = require_object();
      var warn = require_warn();
      var assert = require_nanoassert();
      var ImageAtlas = require_image_atlas();
      var GlyphAtlas = require_glyph_atlas();
      var EvaluationParameters = require_evaluation_parameters();
      var { OverscaledTileID } = require_tile_id();
      var WorkerTile = class {
        constructor(params) {
          this.tileID = new OverscaledTileID(
            params.tileID.overscaledZ,
            params.tileID.wrap,
            params.tileID.canonical.z,
            params.tileID.canonical.x,
            params.tileID.canonical.y
          );
          this.uid = params.uid;
          this.zoom = params.zoom;
          this.pixelRatio = params.pixelRatio;
          this.tileSize = params.tileSize;
          this.source = params.source;
          this.overscaling = this.tileID.overscaleFactor();
          this.showCollisionBoxes = params.showCollisionBoxes;
        }
        async parse(data, layerIndex, resources) {
          this.status = "parsing";
          this.data = data;
          this.collisionBoxArray = new CollisionBoxArray();
          const sourceLayerCoder = dictionaryCoder(Object.keys(data.layers));
          const featureIndex = new FeatureIndex(this.tileID);
          featureIndex.bucketLayerIDs = [];
          const buckets = {};
          const options = {
            featureIndex,
            iconDependencies: {},
            patternDependencies: {},
            glyphDependencies: {}
          };
          const layerFamilies = layerIndex.familiesBySource[this.source];
          for (const sourceLayerId in layerFamilies) {
            const sourceLayer = data.layers[sourceLayerId];
            if (!sourceLayer) {
              continue;
            }
            if (sourceLayer.version === 1) {
              warn.once(
                `Vector tile source "${this.source}" layer "${sourceLayerId}" does not use vector tile spec v2 and therefore may have some rendering errors.`
              );
            }
            const sourceLayerIndex = sourceLayerCoder.encode(sourceLayerId);
            const features = [];
            for (let index = 0; index < sourceLayer.length; index++) {
              const feature = sourceLayer.feature(index);
              features.push({ feature, index, sourceLayerIndex });
            }
            for (const family of layerFamilies[sourceLayerId]) {
              const layer = family[0];
              assert(layer.source === this.source);
              if (layer.minzoom && this.zoom < Math.floor(layer.minzoom)) continue;
              if (layer.maxzoom && this.zoom >= layer.maxzoom) continue;
              if (layer.visibility === "none") continue;
              recalculateLayers(family, this.zoom);
              const bucket = buckets[layer.id] = layer.createBucket({
                index: featureIndex.bucketLayerIDs.length,
                layers: family,
                zoom: this.zoom,
                pixelRatio: this.pixelRatio,
                overscaling: this.overscaling,
                collisionBoxArray: this.collisionBoxArray,
                sourceLayerIndex,
                sourceID: this.source
              });
              bucket.populate(features, options);
              featureIndex.bucketLayerIDs.push(family.map((l) => l.id));
            }
          }
          const stacks = mapObject(options.glyphDependencies, (glyphs) => Object.keys(glyphs).map(Number));
          const icons = Object.keys(options.iconDependencies);
          const patterns = Object.keys(options.patternDependencies);
          const tasks = [
            Object.keys(stacks).length ? resources.getGlyphs({ uid: this.uid, stacks }) : {},
            icons.length ? resources.getImages({ icons }) : {},
            patterns.length ? resources.getImages({ icons: patterns }) : {}
          ];
          const [glyphMap, iconMap, patternMap] = await Promise.all(tasks);
          const glyphAtlas = new GlyphAtlas(glyphMap);
          const imageAtlas = new ImageAtlas(iconMap, patternMap);
          for (const key in buckets) {
            const bucket = buckets[key];
            if (bucket instanceof SymbolBucket) {
              recalculateLayers(bucket.layers, this.zoom);
              performSymbolLayout(
                bucket,
                glyphMap,
                glyphAtlas.positions,
                iconMap,
                imageAtlas.iconPositions,
                this.showCollisionBoxes
              );
            } else if (bucket.hasPattern && (bucket instanceof LineBucket || bucket instanceof FillBucket || bucket instanceof FillExtrusionBucket)) {
              recalculateLayers(bucket.layers, this.zoom);
              bucket.addFeatures(options, imageAtlas.patternPositions);
            }
          }
          this.status = "done";
          return {
            buckets: values(buckets).filter((b) => !b.isEmpty()),
            featureIndex,
            collisionBoxArray: this.collisionBoxArray,
            glyphAtlasImage: glyphAtlas.image,
            imageAtlas
          };
        }
      };
      function recalculateLayers(layers, zoom) {
        const parameters = new EvaluationParameters(zoom);
        for (const layer of layers) {
          layer.recalculate(parameters);
        }
      }
      module.exports = WorkerTile;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/vector_tile_worker_source.js
  var require_vector_tile_worker_source = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/vector_tile_worker_source.js"(exports, module) {
      var { VectorTile } = require_vector_tile();
      var Protobuf = require_pbf();
      var WorkerTile = require_worker_tile();
      function loadVectorTile(params) {
        if (!params.response) {
          throw new Error("no tile data");
        }
        const { data } = params.response;
        if (!data) {
          return;
        }
        return {
          vectorTile: new VectorTile(new Protobuf(data))
        };
      }
      var VectorTileWorkerSource = class {
        /**
         * @param [loadVectorData] Optional method for custom loading of a VectorTile
         * object based on parameters passed from the main-thread Source. See
         * {@link VectorTileWorkerSource#loadTile}. The default implementation simply
         * loads the pbf at `params.url`.
         */
        constructor(resources, layerIndex, loadVectorData = loadVectorTile) {
          this.resources = resources;
          this.layerIndex = layerIndex;
          this.loadVectorData = loadVectorData;
        }
        /**
         * Implements {@link WorkerSource#loadTile}. Delegates to
         * {@link VectorTileWorkerSource#loadVectorData} (which by default expects
         * a `params.url` property) for fetching and producing a VectorTile object.
         */
        async loadTile(params) {
          const response = this.loadVectorData(params);
          if (!response) {
            return;
          }
          const { vectorTile, rawData } = response;
          const workerTile = new WorkerTile(params);
          workerTile.vectorTile = vectorTile;
          const result = await workerTile.parse(vectorTile, this.layerIndex, this.resources);
          if (rawData) {
            result.rawTileData = rawData;
          }
          return result;
        }
      };
      module.exports = VectorTileWorkerSource;
    }
  });

  // node_modules/wgs84/index.js
  var require_wgs84 = __commonJS({
    "node_modules/wgs84/index.js"(exports, module) {
      module.exports.RADIUS = 6378137;
      module.exports.FLATTENING = 1 / 298.257223563;
      module.exports.POLAR_RADIUS = 63567523142e-4;
    }
  });

  // node_modules/@mapwhit/geojson-area/index.js
  var require_geojson_area = __commonJS({
    "node_modules/@mapwhit/geojson-area/index.js"(exports, module) {
      var wgs84 = require_wgs84();
      module.exports.geometry = geometry;
      module.exports.ring = ringArea;
      function geometry({ type, coordinates, geometries }) {
        switch (type) {
          case "Polygon":
            return polygonArea(coordinates);
          case "MultiPolygon":
            return coordinates.reduce((area2, p) => area2 + polygonArea(p), 0);
          case "Point":
          case "MultiPoint":
          case "LineString":
          case "MultiLineString":
            return 0;
          case "GeometryCollection":
            return geometries.reduce((area2, g) => area2 + geometry(g), 0);
        }
      }
      function polygonArea(coords) {
        let area2 = 0;
        if (coords && coords.length > 0) {
          area2 += Math.abs(ringArea(coords[0]));
          for (let i = 1; i < coords.length; i++) {
            area2 -= Math.abs(ringArea(coords[i]));
          }
        }
        return area2;
      }
      function ringArea(coords) {
        const len = coords.length - 1;
        if (len < 3) {
          return 0;
        }
        let total = 0;
        let l_x = rad(coords[len - 2][0]), l_y = rad(coords[len - 2][1]);
        let m_x = rad(coords[len - 1][0]), m_y = rad(coords[len - 1][1]);
        let u_x = 0, u_y = 0;
        for (let i = 0; i < len; i++) {
          u_x = rad(coords[i][0]);
          u_y = rad(coords[i][1]);
          total += (u_x - l_x) * Math.sin(m_y);
          l_x = m_x;
          l_y = m_y;
          m_x = u_x;
          m_y = u_y;
        }
        return total * wgs84.RADIUS * wgs84.RADIUS / 2;
      }
      function rad(_) {
        return _ * Math.PI / 180;
      }
    }
  });

  // node_modules/@mapwhit/geojson-rewind/index.js
  var require_geojson_rewind = __commonJS({
    "node_modules/@mapwhit/geojson-rewind/index.js"(exports, module) {
      var geojsonArea = require_geojson_area();
      module.exports = function(gj, outer) {
        return rewind2(gj, !!outer);
      };
      function rewind2(gj, outer) {
        switch (gj && gj.type) {
          case "FeatureCollection":
            gj.features = gj.features.map((f) => rewind2(f, outer));
            return gj;
          case "GeometryCollection":
            gj.geometries = gj.geometries.map((g) => rewind2(g, outer));
            return gj;
          case "Feature":
            gj.geometry = rewind2(gj.geometry, outer);
            return gj;
          case "Polygon":
          case "MultiPolygon":
            return correct(gj, outer);
          default:
            return gj;
        }
      }
      function correct(_, outer) {
        if (_.type === "Polygon") {
          _.coordinates = correctRings(_.coordinates, outer);
        } else if (_.type === "MultiPolygon") {
          _.coordinates = _.coordinates.map((r) => correctRings(r, outer));
        }
        return _;
      }
      function correctRings(_, outer) {
        _[0] = wind(_[0], outer);
        for (let i = 1; i < _.length; i++) {
          _[i] = wind(_[i], !outer);
        }
        return _;
      }
      function wind(_, dir) {
        return geojsonArea.ring(_) >= 0 === dir ? _ : _.reverse();
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/geojson_wrapper.js
  var require_geojson_wrapper = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/geojson_wrapper.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var { VectorTileFeature } = require_vector_tile();
      var EXTENT = require_extent();
      var { toGeoJSON } = VectorTileFeature.prototype;
      var FeatureWrapper = class {
        constructor(feature) {
          this._feature = feature;
          if ("id" in feature && !isNaN(feature.id)) {
            this.id = Number.parseInt(feature.id, 10);
          }
        }
        get type() {
          return this._feature.type;
        }
        get properties() {
          return this._feature.tags;
        }
        get extent() {
          return EXTENT;
        }
        loadGeometry() {
          return this.type === 1 ? this._feature.geometry.map((p) => [makePoint(p)]) : this._feature.geometry.map((ring) => ring.map(makePoint));
        }
        toGeoJSON(x, y, z) {
          return toGeoJSON.call(this, x, y, z);
        }
      };
      var GeoJSONWrapper = class {
        constructor(features) {
          this.layers = { _geojsonTileLayer: this };
          this._features = features;
        }
        get extent() {
          return EXTENT;
        }
        get length() {
          return this._features.length;
        }
        get name() {
          return "_geojsonTileLayer";
        }
        feature(i) {
          return new FeatureWrapper(this._features[i]);
        }
      };
      module.exports = GeoJSONWrapper;
      function makePoint(arr) {
        return new Point2(arr[0], arr[1]);
      }
    }
  });

  // node_modules/@mapwhit/vt-pbf/lib/geojson_wrapper.js
  var require_geojson_wrapper2 = __commonJS({
    "node_modules/@mapwhit/vt-pbf/lib/geojson_wrapper.js"(exports, module) {
      var { default: Point2 } = (init_point_geometry(), __toCommonJS(point_geometry_exports));
      var { VectorTileFeature } = require_vector_tile();
      var FeatureWrapper = class {
        constructor({ id, type, geometry, tags }) {
          this.id = typeof id === "number" ? id : void 0;
          this.type = type;
          this.rawGeometry = type === 1 ? [geometry] : geometry;
          this.properties = tags;
        }
        loadGeometry() {
          const rings = this.rawGeometry;
          this.geometry = [];
          rings.forEach((ring) => {
            const newRing = [];
            for (let j = 0; j < ring.length; j++) {
              newRing.push(new Point2(ring[j][0], ring[j][1]));
            }
            this.geometry.push(newRing);
          });
          return this.geometry;
        }
        bbox() {
          if (!this.geometry) this.loadGeometry();
          const rings = this.geometry;
          let x1 = Number.POSITIVE_INFINITY;
          let x2 = Number.NEGATIVE_INFINITY;
          let y1 = Number.POSITIVE_INFINITY;
          let y2 = Number.NEGATIVE_INFINITY;
          rings.forEach((ring) => {
            ring.forEach((coord) => {
              x1 = Math.min(x1, coord.x);
              x2 = Math.max(x2, coord.x);
              y1 = Math.min(y1, coord.y);
              y2 = Math.max(y2, coord.y);
            });
          });
          return [x1, y1, x2, y2];
        }
      };
      FeatureWrapper.prototype.toGeoJSON = VectorTileFeature.prototype.toGeoJSON;
      var GeoJSONWrapper = class {
        constructor(features, options = {}) {
          this.options = options;
          this.features = features;
          this.length = features.length;
        }
        feature(i) {
          return new FeatureWrapper(this.features[i]);
        }
      };
      module.exports = GeoJSONWrapper;
    }
  });

  // node_modules/@mapwhit/vt-pbf/index.js
  var require_vt_pbf = __commonJS({
    "node_modules/@mapwhit/vt-pbf/index.js"(exports, module) {
      var Pbf = require_pbf();
      var GeoJSONWrapper = require_geojson_wrapper2();
      module.exports = fromVectorTileJs;
      module.exports.fromVectorTileJs = fromVectorTileJs;
      module.exports.fromGeojsonVt = fromGeojsonVt;
      module.exports.GeoJSONWrapper = GeoJSONWrapper;
      function fromVectorTileJs(tile) {
        const out = new Pbf();
        writeTile(tile, out);
        return out.finish();
      }
      function fromGeojsonVt(layers, options = {}) {
        const l = {};
        for (const k in layers) {
          l[k] = new GeoJSONWrapper(layers[k].features, options);
          l[k].name = k;
          l[k].version = options.version;
          l[k].extent = options.extent;
        }
        return fromVectorTileJs({ layers: l });
      }
      function writeTile({ layers }, pbf) {
        for (const key in layers) {
          pbf.writeMessage(3, writeLayer, layers[key]);
        }
      }
      function writeLayer(layer, pbf) {
        pbf.writeVarintField(15, layer.version || 1);
        pbf.writeStringField(1, layer.name || "");
        pbf.writeVarintField(5, layer.extent || 4096);
        const context = {
          keys: [],
          values: [],
          keycache: {},
          valuecache: {}
        };
        for (let i = 0; i < layer.length; i++) {
          context.feature = layer.feature(i);
          pbf.writeMessage(2, writeFeature, context);
        }
        const keys = context.keys;
        for (let i = 0; i < keys.length; i++) {
          pbf.writeStringField(3, keys[i]);
        }
        const values = context.values;
        for (let i = 0; i < values.length; i++) {
          pbf.writeMessage(4, writeValue, values[i]);
        }
      }
      function writeFeature(context, pbf) {
        const feature = context.feature;
        if (feature.id !== void 0) {
          pbf.writeVarintField(1, feature.id);
        }
        pbf.writeMessage(2, writeProperties, context);
        pbf.writeVarintField(3, feature.type);
        pbf.writeMessage(4, writeGeometry, feature);
      }
      function writeProperties(context, pbf) {
        const feature = context.feature;
        const keys = context.keys;
        const values = context.values;
        const keycache = context.keycache;
        const valuecache = context.valuecache;
        for (const key in feature.properties) {
          let value = feature.properties[key];
          let keyIndex = keycache[key];
          if (value === null) continue;
          if (typeof keyIndex === "undefined") {
            keys.push(key);
            keyIndex = keys.length - 1;
            keycache[key] = keyIndex;
          }
          pbf.writeVarint(keyIndex);
          const type = typeof value;
          if (type !== "string" && type !== "boolean" && type !== "number") {
            value = JSON.stringify(value);
          }
          const valueKey = `${type}:${value}`;
          let valueIndex = valuecache[valueKey];
          if (typeof valueIndex === "undefined") {
            values.push(value);
            valueIndex = values.length - 1;
            valuecache[valueKey] = valueIndex;
          }
          pbf.writeVarint(valueIndex);
        }
      }
      function command(cmd, length) {
        return (length << 3) + (cmd & 7);
      }
      function zigzag(num) {
        return num << 1 ^ num >> 31;
      }
      function writeGeometry(feature, pbf) {
        const geometry = feature.loadGeometry();
        const type = feature.type;
        let x = 0;
        let y = 0;
        const rings = geometry.length;
        for (let r = 0; r < rings; r++) {
          const ring = geometry[r];
          let count = 1;
          if (type === 1) {
            count = ring.length;
          }
          pbf.writeVarint(command(1, count));
          const lineCount = type === 3 ? ring.length - 1 : ring.length;
          for (let i = 0; i < lineCount; i++) {
            if (i === 1 && type !== 1) {
              pbf.writeVarint(command(2, lineCount - 1));
            }
            const dx = ring[i].x - x;
            const dy = ring[i].y - y;
            pbf.writeVarint(zigzag(dx));
            pbf.writeVarint(zigzag(dy));
            x += dx;
            y += dy;
          }
          if (type === 3) {
            pbf.writeVarint(command(7, 1));
          }
        }
      }
      function writeValue(value, pbf) {
        const type = typeof value;
        if (type === "string") {
          pbf.writeStringField(1, value);
        } else if (type === "boolean") {
          pbf.writeBooleanField(7, value);
        } else if (type === "number") {
          if (value % 1 !== 0) {
            pbf.writeDoubleField(3, value);
          } else if (value < 0) {
            pbf.writeSVarintField(6, value);
          } else {
            pbf.writeVarintField(5, value);
          }
        }
      }
    }
  });

  // node_modules/kdbush/src/sort.js
  var require_sort = __commonJS({
    "node_modules/kdbush/src/sort.js"(exports, module) {
      "use strict";
      module.exports = sortKD;
      function sortKD(ids, coords, nodeSize, left, right, depth) {
        if (right - left <= nodeSize) return;
        var m = Math.floor((left + right) / 2);
        select(ids, coords, m, left, right, depth % 2);
        sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
        sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
      }
      function select(ids, coords, k, left, right, inc) {
        while (right > left) {
          if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            select(ids, coords, k, newLeft, newRight, inc);
          }
          var t = coords[2 * k + inc];
          var i = left;
          var j = right;
          swapItem(ids, coords, left, k);
          if (coords[2 * right + inc] > t) swapItem(ids, coords, left, right);
          while (i < j) {
            swapItem(ids, coords, i, j);
            i++;
            j--;
            while (coords[2 * i + inc] < t) i++;
            while (coords[2 * j + inc] > t) j--;
          }
          if (coords[2 * left + inc] === t) swapItem(ids, coords, left, j);
          else {
            j++;
            swapItem(ids, coords, j, right);
          }
          if (j <= k) left = j + 1;
          if (k <= j) right = j - 1;
        }
      }
      function swapItem(ids, coords, i, j) {
        swap2(ids, i, j);
        swap2(coords, 2 * i, 2 * j);
        swap2(coords, 2 * i + 1, 2 * j + 1);
      }
      function swap2(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    }
  });

  // node_modules/kdbush/src/range.js
  var require_range = __commonJS({
    "node_modules/kdbush/src/range.js"(exports, module) {
      "use strict";
      module.exports = range;
      function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
        var stack = [0, ids.length - 1, 0];
        var result = [];
        var x, y;
        while (stack.length) {
          var axis = stack.pop();
          var right = stack.pop();
          var left = stack.pop();
          if (right - left <= nodeSize) {
            for (var i = left; i <= right; i++) {
              x = coords[2 * i];
              y = coords[2 * i + 1];
              if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[i]);
            }
            continue;
          }
          var m = Math.floor((left + right) / 2);
          x = coords[2 * m];
          y = coords[2 * m + 1];
          if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[m]);
          var nextAxis = (axis + 1) % 2;
          if (axis === 0 ? minX <= x : minY <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
          }
          if (axis === 0 ? maxX >= x : maxY >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
          }
        }
        return result;
      }
    }
  });

  // node_modules/kdbush/src/within.js
  var require_within = __commonJS({
    "node_modules/kdbush/src/within.js"(exports, module) {
      "use strict";
      module.exports = within;
      function within(ids, coords, qx, qy, r, nodeSize) {
        var stack = [0, ids.length - 1, 0];
        var result = [];
        var r2 = r * r;
        while (stack.length) {
          var axis = stack.pop();
          var right = stack.pop();
          var left = stack.pop();
          if (right - left <= nodeSize) {
            for (var i = left; i <= right; i++) {
              if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) result.push(ids[i]);
            }
            continue;
          }
          var m = Math.floor((left + right) / 2);
          var x = coords[2 * m];
          var y = coords[2 * m + 1];
          if (sqDist(x, y, qx, qy) <= r2) result.push(ids[m]);
          var nextAxis = (axis + 1) % 2;
          if (axis === 0 ? qx - r <= x : qy - r <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
          }
          if (axis === 0 ? qx + r >= x : qy + r >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
          }
        }
        return result;
      }
      function sqDist(ax, ay, bx, by) {
        var dx = ax - bx;
        var dy = ay - by;
        return dx * dx + dy * dy;
      }
    }
  });

  // node_modules/kdbush/src/kdbush.js
  var require_kdbush = __commonJS({
    "node_modules/kdbush/src/kdbush.js"(exports, module) {
      "use strict";
      var sort = require_sort();
      var range = require_range();
      var within = require_within();
      module.exports = kdbush;
      function kdbush(points, getX, getY, nodeSize, ArrayType) {
        return new KDBush(points, getX, getY, nodeSize, ArrayType);
      }
      function KDBush(points, getX, getY, nodeSize, ArrayType) {
        getX = getX || defaultGetX;
        getY = getY || defaultGetY;
        ArrayType = ArrayType || Array;
        this.nodeSize = nodeSize || 64;
        this.points = points;
        this.ids = new ArrayType(points.length);
        this.coords = new ArrayType(points.length * 2);
        for (var i = 0; i < points.length; i++) {
          this.ids[i] = i;
          this.coords[2 * i] = getX(points[i]);
          this.coords[2 * i + 1] = getY(points[i]);
        }
        sort(this.ids, this.coords, this.nodeSize, 0, this.ids.length - 1, 0);
      }
      KDBush.prototype = {
        range: function(minX, minY, maxX, maxY) {
          return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
        },
        within: function(x, y, r) {
          return within(this.ids, this.coords, x, y, r, this.nodeSize);
        }
      };
      function defaultGetX(p) {
        return p[0];
      }
      function defaultGetY(p) {
        return p[1];
      }
    }
  });

  // node_modules/supercluster/index.js
  var require_supercluster = __commonJS({
    "node_modules/supercluster/index.js"(exports, module) {
      "use strict";
      var kdbush = require_kdbush();
      module.exports = supercluster;
      function supercluster(options) {
        return new SuperCluster(options);
      }
      function SuperCluster(options) {
        this.options = extend2(Object.create(this.options), options);
        this.trees = new Array(this.options.maxZoom + 1);
      }
      SuperCluster.prototype = {
        options: {
          minZoom: 0,
          // min zoom to generate clusters on
          maxZoom: 16,
          // max zoom level to cluster the points on
          radius: 40,
          // cluster radius in pixels
          extent: 512,
          // tile extent (radius is calculated relative to it)
          nodeSize: 64,
          // size of the KD-tree leaf node, affects performance
          log: false,
          // whether to log timing info
          // a reduce function for calculating custom cluster properties
          reduce: null,
          // function (accumulated, props) { accumulated.sum += props.sum; }
          // initial properties of a cluster (before running the reducer)
          initial: function() {
            return {};
          },
          // function () { return {sum: 0}; },
          // properties to use for individual points when running the reducer
          map: function(props) {
            return props;
          }
          // function (props) { return {sum: props.my_value}; },
        },
        load: function(points) {
          var log = this.options.log;
          if (log) console.time("total time");
          var timerId = "prepare " + points.length + " points";
          if (log) console.time(timerId);
          this.points = points;
          var clusters = points.map(createPointCluster);
          if (log) console.timeEnd(timerId);
          for (var z = this.options.maxZoom; z >= this.options.minZoom; z--) {
            var now = +Date.now();
            this.trees[z + 1] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);
            clusters = this._cluster(clusters, z);
            if (log) console.log("z%d: %d clusters in %dms", z, clusters.length, +Date.now() - now);
          }
          this.trees[this.options.minZoom] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);
          if (log) console.timeEnd("total time");
          return this;
        },
        getClusters: function(bbox, zoom) {
          var tree = this.trees[this._limitZoom(zoom)];
          var ids = tree.range(lngX(bbox[0]), latY(bbox[3]), lngX(bbox[2]), latY(bbox[1]));
          var clusters = [];
          for (var i = 0; i < ids.length; i++) {
            var c = tree.points[ids[i]];
            clusters.push(c.numPoints ? getClusterJSON(c) : this.points[c.id]);
          }
          return clusters;
        },
        getChildren: function(clusterId, clusterZoom) {
          var origin = this.trees[clusterZoom + 1].points[clusterId];
          var r = this.options.radius / (this.options.extent * Math.pow(2, clusterZoom));
          var points = this.trees[clusterZoom + 1].within(origin.x, origin.y, r);
          var children = [];
          for (var i = 0; i < points.length; i++) {
            var c = this.trees[clusterZoom + 1].points[points[i]];
            if (c.parentId === clusterId) {
              children.push(c.numPoints ? getClusterJSON(c) : this.points[c.id]);
            }
          }
          return children;
        },
        getLeaves: function(clusterId, clusterZoom, limit, offset) {
          limit = limit || 10;
          offset = offset || 0;
          var leaves = [];
          this._appendLeaves(leaves, clusterId, clusterZoom, limit, offset, 0);
          return leaves;
        },
        getTile: function(z, x, y) {
          var tree = this.trees[this._limitZoom(z)];
          var z2 = Math.pow(2, z);
          var extent = this.options.extent;
          var r = this.options.radius;
          var p = r / extent;
          var top = (y - p) / z2;
          var bottom = (y + 1 + p) / z2;
          var tile = {
            features: []
          };
          this._addTileFeatures(
            tree.range((x - p) / z2, top, (x + 1 + p) / z2, bottom),
            tree.points,
            x,
            y,
            z2,
            tile
          );
          if (x === 0) {
            this._addTileFeatures(
              tree.range(1 - p / z2, top, 1, bottom),
              tree.points,
              z2,
              y,
              z2,
              tile
            );
          }
          if (x === z2 - 1) {
            this._addTileFeatures(
              tree.range(0, top, p / z2, bottom),
              tree.points,
              -1,
              y,
              z2,
              tile
            );
          }
          return tile.features.length ? tile : null;
        },
        getClusterExpansionZoom: function(clusterId, clusterZoom) {
          while (clusterZoom < this.options.maxZoom) {
            var children = this.getChildren(clusterId, clusterZoom);
            clusterZoom++;
            if (children.length !== 1) break;
            clusterId = children[0].properties.cluster_id;
          }
          return clusterZoom;
        },
        _appendLeaves: function(result, clusterId, clusterZoom, limit, offset, skipped) {
          var children = this.getChildren(clusterId, clusterZoom);
          for (var i = 0; i < children.length; i++) {
            var props = children[i].properties;
            if (props.cluster) {
              if (skipped + props.point_count <= offset) {
                skipped += props.point_count;
              } else {
                skipped = this._appendLeaves(
                  result,
                  props.cluster_id,
                  clusterZoom + 1,
                  limit,
                  offset,
                  skipped
                );
              }
            } else if (skipped < offset) {
              skipped++;
            } else {
              result.push(children[i]);
            }
            if (result.length === limit) break;
          }
          return skipped;
        },
        _addTileFeatures: function(ids, points, x, y, z2, tile) {
          for (var i = 0; i < ids.length; i++) {
            var c = points[ids[i]];
            tile.features.push({
              type: 1,
              geometry: [[
                Math.round(this.options.extent * (c.x * z2 - x)),
                Math.round(this.options.extent * (c.y * z2 - y))
              ]],
              tags: c.numPoints ? getClusterProperties(c) : this.points[c.id].properties
            });
          }
        },
        _limitZoom: function(z) {
          return Math.max(this.options.minZoom, Math.min(z, this.options.maxZoom + 1));
        },
        _cluster: function(points, zoom) {
          var clusters = [];
          var r = this.options.radius / (this.options.extent * Math.pow(2, zoom));
          for (var i = 0; i < points.length; i++) {
            var p = points[i];
            if (p.zoom <= zoom) continue;
            p.zoom = zoom;
            var tree = this.trees[zoom + 1];
            var neighborIds = tree.within(p.x, p.y, r);
            var numPoints = p.numPoints || 1;
            var wx = p.x * numPoints;
            var wy = p.y * numPoints;
            var clusterProperties = null;
            if (this.options.reduce) {
              clusterProperties = this.options.initial();
              this._accumulate(clusterProperties, p);
            }
            for (var j = 0; j < neighborIds.length; j++) {
              var b = tree.points[neighborIds[j]];
              if (zoom < b.zoom) {
                var numPoints2 = b.numPoints || 1;
                b.zoom = zoom;
                wx += b.x * numPoints2;
                wy += b.y * numPoints2;
                numPoints += numPoints2;
                b.parentId = i;
                if (this.options.reduce) {
                  this._accumulate(clusterProperties, b);
                }
              }
            }
            if (numPoints === 1) {
              clusters.push(p);
            } else {
              p.parentId = i;
              clusters.push(createCluster(wx / numPoints, wy / numPoints, numPoints, i, clusterProperties));
            }
          }
          return clusters;
        },
        _accumulate: function(clusterProperties, point) {
          var properties = point.numPoints ? point.properties : this.options.map(this.points[point.id].properties);
          this.options.reduce(clusterProperties, properties);
        }
      };
      function createCluster(x, y, numPoints, id, properties) {
        return {
          x,
          // weighted cluster center
          y,
          zoom: Infinity,
          // the last zoom the cluster was processed at
          id,
          // index of the first child of the cluster in the zoom level tree
          properties,
          parentId: -1,
          // parent cluster id
          numPoints
        };
      }
      function createPointCluster(p, id) {
        var coords = p.geometry.coordinates;
        return {
          x: lngX(coords[0]),
          // projected point coordinates
          y: latY(coords[1]),
          zoom: Infinity,
          // the last zoom the point was processed at
          id,
          // index of the source feature in the original input array
          parentId: -1
          // parent cluster id
        };
      }
      function getClusterJSON(cluster) {
        return {
          type: "Feature",
          properties: getClusterProperties(cluster),
          geometry: {
            type: "Point",
            coordinates: [xLng(cluster.x), yLat(cluster.y)]
          }
        };
      }
      function getClusterProperties(cluster) {
        var count = cluster.numPoints;
        var abbrev = count >= 1e4 ? Math.round(count / 1e3) + "k" : count >= 1e3 ? Math.round(count / 100) / 10 + "k" : count;
        return extend2(extend2({}, cluster.properties), {
          cluster: true,
          cluster_id: cluster.id,
          point_count: count,
          point_count_abbreviated: abbrev
        });
      }
      function lngX(lng) {
        return lng / 360 + 0.5;
      }
      function latY(lat) {
        var sin = Math.sin(lat * Math.PI / 180), y = 0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI;
        return y < 0 ? 0 : y > 1 ? 1 : y;
      }
      function xLng(x) {
        return (x - 0.5) * 360;
      }
      function yLat(y) {
        var y2 = (180 - y * 360) * Math.PI / 180;
        return 360 * Math.atan(Math.exp(y2)) / Math.PI - 90;
      }
      function extend2(dest, src) {
        for (var id in src) dest[id] = src[id];
        return dest;
      }
      function getX(p) {
        return p.x;
      }
      function getY(p) {
        return p.y;
      }
    }
  });

  // node_modules/geojson-vt/src/simplify.js
  function simplify(coords, first, last, sqTolerance) {
    let maxSqDist = sqTolerance;
    const mid = first + (last - first >> 1);
    let minPosToMid = last - first;
    let index;
    const ax = coords[first];
    const ay = coords[first + 1];
    const bx = coords[last];
    const by = coords[last + 1];
    for (let i = first + 3; i < last; i += 3) {
      const d = getSqSegDist(coords[i], coords[i + 1], ax, ay, bx, by);
      if (d > maxSqDist) {
        index = i;
        maxSqDist = d;
      } else if (d === maxSqDist) {
        const posToMid = Math.abs(i - mid);
        if (posToMid < minPosToMid) {
          index = i;
          minPosToMid = posToMid;
        }
      }
    }
    if (maxSqDist > sqTolerance) {
      if (index - first > 3) simplify(coords, first, index, sqTolerance);
      coords[index + 2] = maxSqDist;
      if (last - index > 3) simplify(coords, index, last, sqTolerance);
    }
  }
  function getSqSegDist(px, py, x, y, bx, by) {
    let dx = bx - x;
    let dy = by - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = bx;
        y = by;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = px - x;
    dy = py - y;
    return dx * dx + dy * dy;
  }
  var init_simplify = __esm({
    "node_modules/geojson-vt/src/simplify.js"() {
    }
  });

  // node_modules/geojson-vt/src/feature.js
  function createFeature(id, type, geom, tags) {
    const feature = {
      id: id == null ? null : id,
      type,
      geometry: geom,
      tags,
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };
    if (type === "Point" || type === "MultiPoint" || type === "LineString") {
      calcLineBBox(feature, geom);
    } else if (type === "Polygon") {
      calcLineBBox(feature, geom[0]);
    } else if (type === "MultiLineString") {
      for (const line of geom) {
        calcLineBBox(feature, line);
      }
    } else if (type === "MultiPolygon") {
      for (const polygon of geom) {
        calcLineBBox(feature, polygon[0]);
      }
    }
    return feature;
  }
  function calcLineBBox(feature, geom) {
    for (let i = 0; i < geom.length; i += 3) {
      feature.minX = Math.min(feature.minX, geom[i]);
      feature.minY = Math.min(feature.minY, geom[i + 1]);
      feature.maxX = Math.max(feature.maxX, geom[i]);
      feature.maxY = Math.max(feature.maxY, geom[i + 1]);
    }
  }
  var init_feature = __esm({
    "node_modules/geojson-vt/src/feature.js"() {
    }
  });

  // node_modules/geojson-vt/src/convert.js
  function convert(data, options) {
    const features = [];
    if (data.type === "FeatureCollection") {
      for (let i = 0; i < data.features.length; i++) {
        convertFeature(features, data.features[i], options, i);
      }
    } else if (data.type === "Feature") {
      convertFeature(features, data, options);
    } else {
      convertFeature(features, { geometry: data }, options);
    }
    return features;
  }
  function convertFeature(features, geojson, options, index) {
    if (!geojson.geometry) return;
    const coords = geojson.geometry.coordinates;
    if (coords && coords.length === 0) return;
    const type = geojson.geometry.type;
    const tolerance = Math.pow(options.tolerance / ((1 << options.maxZoom) * options.extent), 2);
    let geometry = [];
    let id = geojson.id;
    if (options.promoteId) {
      id = geojson.properties[options.promoteId];
    } else if (options.generateId) {
      id = index || 0;
    }
    if (type === "Point") {
      convertPoint(coords, geometry);
    } else if (type === "MultiPoint") {
      for (const p of coords) {
        convertPoint(p, geometry);
      }
    } else if (type === "LineString") {
      convertLine(coords, geometry, tolerance, false);
    } else if (type === "MultiLineString") {
      if (options.lineMetrics) {
        for (const line of coords) {
          geometry = [];
          convertLine(line, geometry, tolerance, false);
          features.push(createFeature(id, "LineString", geometry, geojson.properties));
        }
        return;
      } else {
        convertLines(coords, geometry, tolerance, false);
      }
    } else if (type === "Polygon") {
      convertLines(coords, geometry, tolerance, true);
    } else if (type === "MultiPolygon") {
      for (const polygon of coords) {
        const newPolygon = [];
        convertLines(polygon, newPolygon, tolerance, true);
        geometry.push(newPolygon);
      }
    } else if (type === "GeometryCollection") {
      for (const singleGeometry of geojson.geometry.geometries) {
        convertFeature(features, {
          id,
          geometry: singleGeometry,
          properties: geojson.properties
        }, options, index);
      }
      return;
    } else {
      throw new Error("Input data is not a valid GeoJSON object.");
    }
    features.push(createFeature(id, type, geometry, geojson.properties));
  }
  function convertPoint(coords, out) {
    out.push(projectX(coords[0]), projectY(coords[1]), 0);
  }
  function convertLine(ring, out, tolerance, isPolygon) {
    let x0, y0;
    let size = 0;
    for (let j = 0; j < ring.length; j++) {
      const x = projectX(ring[j][0]);
      const y = projectY(ring[j][1]);
      out.push(x, y, 0);
      if (j > 0) {
        if (isPolygon) {
          size += (x0 * y - x * y0) / 2;
        } else {
          size += Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2));
        }
      }
      x0 = x;
      y0 = y;
    }
    const last = out.length - 3;
    out[2] = 1;
    simplify(out, 0, last, tolerance);
    out[last + 2] = 1;
    out.size = Math.abs(size);
    out.start = 0;
    out.end = out.size;
  }
  function convertLines(rings, out, tolerance, isPolygon) {
    for (let i = 0; i < rings.length; i++) {
      const geom = [];
      convertLine(rings[i], geom, tolerance, isPolygon);
      out.push(geom);
    }
  }
  function projectX(x) {
    return x / 360 + 0.5;
  }
  function projectY(y) {
    const sin = Math.sin(y * Math.PI / 180);
    const y2 = 0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI;
    return y2 < 0 ? 0 : y2 > 1 ? 1 : y2;
  }
  var init_convert = __esm({
    "node_modules/geojson-vt/src/convert.js"() {
      init_simplify();
      init_feature();
    }
  });

  // node_modules/geojson-vt/src/clip.js
  function clip(features, scale, k1, k2, axis, minAll, maxAll, options) {
    k1 /= scale;
    k2 /= scale;
    if (minAll >= k1 && maxAll < k2) return features;
    else if (maxAll < k1 || minAll >= k2) return null;
    const clipped = [];
    for (const feature of features) {
      const geometry = feature.geometry;
      let type = feature.type;
      const min = axis === 0 ? feature.minX : feature.minY;
      const max = axis === 0 ? feature.maxX : feature.maxY;
      if (min >= k1 && max < k2) {
        clipped.push(feature);
        continue;
      } else if (max < k1 || min >= k2) {
        continue;
      }
      let newGeometry = [];
      if (type === "Point" || type === "MultiPoint") {
        clipPoints(geometry, newGeometry, k1, k2, axis);
      } else if (type === "LineString") {
        clipLine(geometry, newGeometry, k1, k2, axis, false, options.lineMetrics);
      } else if (type === "MultiLineString") {
        clipLines(geometry, newGeometry, k1, k2, axis, false);
      } else if (type === "Polygon") {
        clipLines(geometry, newGeometry, k1, k2, axis, true);
      } else if (type === "MultiPolygon") {
        for (const polygon of geometry) {
          const newPolygon = [];
          clipLines(polygon, newPolygon, k1, k2, axis, true);
          if (newPolygon.length) {
            newGeometry.push(newPolygon);
          }
        }
      }
      if (newGeometry.length) {
        if (options.lineMetrics && type === "LineString") {
          for (const line of newGeometry) {
            clipped.push(createFeature(feature.id, type, line, feature.tags));
          }
          continue;
        }
        if (type === "LineString" || type === "MultiLineString") {
          if (newGeometry.length === 1) {
            type = "LineString";
            newGeometry = newGeometry[0];
          } else {
            type = "MultiLineString";
          }
        }
        if (type === "Point" || type === "MultiPoint") {
          type = newGeometry.length === 3 ? "Point" : "MultiPoint";
        }
        clipped.push(createFeature(feature.id, type, newGeometry, feature.tags));
      }
    }
    return clipped.length ? clipped : null;
  }
  function clipPoints(geom, newGeom, k1, k2, axis) {
    for (let i = 0; i < geom.length; i += 3) {
      const a = geom[i + axis];
      if (a >= k1 && a <= k2) {
        addPoint(newGeom, geom[i], geom[i + 1], geom[i + 2]);
      }
    }
  }
  function clipLine(geom, newGeom, k1, k2, axis, isPolygon, trackMetrics) {
    let slice = newSlice(geom);
    const intersect = axis === 0 ? intersectX : intersectY;
    let len = geom.start;
    let segLen, t;
    for (let i = 0; i < geom.length - 3; i += 3) {
      const ax2 = geom[i];
      const ay2 = geom[i + 1];
      const az2 = geom[i + 2];
      const bx = geom[i + 3];
      const by = geom[i + 4];
      const a2 = axis === 0 ? ax2 : ay2;
      const b = axis === 0 ? bx : by;
      let exited = false;
      if (trackMetrics) segLen = Math.sqrt(Math.pow(ax2 - bx, 2) + Math.pow(ay2 - by, 2));
      if (a2 < k1) {
        if (b > k1) {
          t = intersect(slice, ax2, ay2, bx, by, k1);
          if (trackMetrics) slice.start = len + segLen * t;
        }
      } else if (a2 > k2) {
        if (b < k2) {
          t = intersect(slice, ax2, ay2, bx, by, k2);
          if (trackMetrics) slice.start = len + segLen * t;
        }
      } else {
        addPoint(slice, ax2, ay2, az2);
      }
      if (b < k1 && a2 >= k1) {
        t = intersect(slice, ax2, ay2, bx, by, k1);
        exited = true;
      }
      if (b > k2 && a2 <= k2) {
        t = intersect(slice, ax2, ay2, bx, by, k2);
        exited = true;
      }
      if (!isPolygon && exited) {
        if (trackMetrics) slice.end = len + segLen * t;
        newGeom.push(slice);
        slice = newSlice(geom);
      }
      if (trackMetrics) len += segLen;
    }
    let last = geom.length - 3;
    const ax = geom[last];
    const ay = geom[last + 1];
    const az = geom[last + 2];
    const a = axis === 0 ? ax : ay;
    if (a >= k1 && a <= k2) addPoint(slice, ax, ay, az);
    last = slice.length - 3;
    if (isPolygon && last >= 3 && (slice[last] !== slice[0] || slice[last + 1] !== slice[1])) {
      addPoint(slice, slice[0], slice[1], slice[2]);
    }
    if (slice.length) {
      newGeom.push(slice);
    }
  }
  function newSlice(line) {
    const slice = [];
    slice.size = line.size;
    slice.start = line.start;
    slice.end = line.end;
    return slice;
  }
  function clipLines(geom, newGeom, k1, k2, axis, isPolygon) {
    for (const line of geom) {
      clipLine(line, newGeom, k1, k2, axis, isPolygon, false);
    }
  }
  function addPoint(out, x, y, z) {
    out.push(x, y, z);
  }
  function intersectX(out, ax, ay, bx, by, x) {
    const t = (x - ax) / (bx - ax);
    addPoint(out, x, ay + (by - ay) * t, 1);
    return t;
  }
  function intersectY(out, ax, ay, bx, by, y) {
    const t = (y - ay) / (by - ay);
    addPoint(out, ax + (bx - ax) * t, y, 1);
    return t;
  }
  var init_clip = __esm({
    "node_modules/geojson-vt/src/clip.js"() {
      init_feature();
    }
  });

  // node_modules/geojson-vt/src/wrap.js
  function wrap(features, options) {
    const buffer = options.buffer / options.extent;
    let merged = features;
    const left = clip(features, 1, -1 - buffer, buffer, 0, -1, 2, options);
    const right = clip(features, 1, 1 - buffer, 2 + buffer, 0, -1, 2, options);
    if (left || right) {
      merged = clip(features, 1, -buffer, 1 + buffer, 0, -1, 2, options) || [];
      if (left) merged = shiftFeatureCoords(left, 1).concat(merged);
      if (right) merged = merged.concat(shiftFeatureCoords(right, -1));
    }
    return merged;
  }
  function shiftFeatureCoords(features, offset) {
    const newFeatures = [];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      const type = feature.type;
      let newGeometry;
      if (type === "Point" || type === "MultiPoint" || type === "LineString") {
        newGeometry = shiftCoords(feature.geometry, offset);
      } else if (type === "MultiLineString" || type === "Polygon") {
        newGeometry = [];
        for (const line of feature.geometry) {
          newGeometry.push(shiftCoords(line, offset));
        }
      } else if (type === "MultiPolygon") {
        newGeometry = [];
        for (const polygon of feature.geometry) {
          const newPolygon = [];
          for (const line of polygon) {
            newPolygon.push(shiftCoords(line, offset));
          }
          newGeometry.push(newPolygon);
        }
      }
      newFeatures.push(createFeature(feature.id, type, newGeometry, feature.tags));
    }
    return newFeatures;
  }
  function shiftCoords(points, offset) {
    const newPoints = [];
    newPoints.size = points.size;
    if (points.start !== void 0) {
      newPoints.start = points.start;
      newPoints.end = points.end;
    }
    for (let i = 0; i < points.length; i += 3) {
      newPoints.push(points[i] + offset, points[i + 1], points[i + 2]);
    }
    return newPoints;
  }
  var init_wrap = __esm({
    "node_modules/geojson-vt/src/wrap.js"() {
      init_clip();
      init_feature();
    }
  });

  // node_modules/geojson-vt/src/transform.js
  function transformTile(tile, extent) {
    if (tile.transformed) return tile;
    const z2 = 1 << tile.z;
    const tx = tile.x;
    const ty = tile.y;
    for (const feature of tile.features) {
      const geom = feature.geometry;
      const type = feature.type;
      feature.geometry = [];
      if (type === 1) {
        for (let j = 0; j < geom.length; j += 2) {
          feature.geometry.push(transformPoint(geom[j], geom[j + 1], extent, z2, tx, ty));
        }
      } else {
        for (let j = 0; j < geom.length; j++) {
          const ring = [];
          for (let k = 0; k < geom[j].length; k += 2) {
            ring.push(transformPoint(geom[j][k], geom[j][k + 1], extent, z2, tx, ty));
          }
          feature.geometry.push(ring);
        }
      }
    }
    tile.transformed = true;
    return tile;
  }
  function transformPoint(x, y, extent, z2, tx, ty) {
    return [
      Math.round(extent * (x * z2 - tx)),
      Math.round(extent * (y * z2 - ty))
    ];
  }
  var init_transform = __esm({
    "node_modules/geojson-vt/src/transform.js"() {
    }
  });

  // node_modules/geojson-vt/src/tile.js
  function createTile(features, z, tx, ty, options) {
    const tolerance = z === options.maxZoom ? 0 : options.tolerance / ((1 << z) * options.extent);
    const tile = {
      features: [],
      numPoints: 0,
      numSimplified: 0,
      numFeatures: features.length,
      source: null,
      x: tx,
      y: ty,
      z,
      transformed: false,
      minX: 2,
      minY: 1,
      maxX: -1,
      maxY: 0
    };
    for (const feature of features) {
      addFeature(tile, feature, tolerance, options);
    }
    return tile;
  }
  function addFeature(tile, feature, tolerance, options) {
    const geom = feature.geometry;
    const type = feature.type;
    const simplified = [];
    tile.minX = Math.min(tile.minX, feature.minX);
    tile.minY = Math.min(tile.minY, feature.minY);
    tile.maxX = Math.max(tile.maxX, feature.maxX);
    tile.maxY = Math.max(tile.maxY, feature.maxY);
    if (type === "Point" || type === "MultiPoint") {
      for (let i = 0; i < geom.length; i += 3) {
        simplified.push(geom[i], geom[i + 1]);
        tile.numPoints++;
        tile.numSimplified++;
      }
    } else if (type === "LineString") {
      addLine(simplified, geom, tile, tolerance, false, false);
    } else if (type === "MultiLineString" || type === "Polygon") {
      for (let i = 0; i < geom.length; i++) {
        addLine(simplified, geom[i], tile, tolerance, type === "Polygon", i === 0);
      }
    } else if (type === "MultiPolygon") {
      for (let k = 0; k < geom.length; k++) {
        const polygon = geom[k];
        for (let i = 0; i < polygon.length; i++) {
          addLine(simplified, polygon[i], tile, tolerance, true, i === 0);
        }
      }
    }
    if (simplified.length) {
      let tags = feature.tags || null;
      if (type === "LineString" && options.lineMetrics) {
        tags = {};
        for (const key in feature.tags) tags[key] = feature.tags[key];
        tags["mapbox_clip_start"] = geom.start / geom.size;
        tags["mapbox_clip_end"] = geom.end / geom.size;
      }
      const tileFeature = {
        geometry: simplified,
        type: type === "Polygon" || type === "MultiPolygon" ? 3 : type === "LineString" || type === "MultiLineString" ? 2 : 1,
        tags
      };
      if (feature.id !== null) {
        tileFeature.id = feature.id;
      }
      tile.features.push(tileFeature);
    }
  }
  function addLine(result, geom, tile, tolerance, isPolygon, isOuter) {
    const sqTolerance = tolerance * tolerance;
    if (tolerance > 0 && geom.size < (isPolygon ? sqTolerance : tolerance)) {
      tile.numPoints += geom.length / 3;
      return;
    }
    const ring = [];
    for (let i = 0; i < geom.length; i += 3) {
      if (tolerance === 0 || geom[i + 2] > sqTolerance) {
        tile.numSimplified++;
        ring.push(geom[i], geom[i + 1]);
      }
      tile.numPoints++;
    }
    if (isPolygon) rewind(ring, isOuter);
    result.push(ring);
  }
  function rewind(ring, clockwise) {
    let area2 = 0;
    for (let i = 0, len = ring.length, j = len - 2; i < len; j = i, i += 2) {
      area2 += (ring[i] - ring[j]) * (ring[i + 1] + ring[j + 1]);
    }
    if (area2 > 0 === clockwise) {
      for (let i = 0, len = ring.length; i < len / 2; i += 2) {
        const x = ring[i];
        const y = ring[i + 1];
        ring[i] = ring[len - 2 - i];
        ring[i + 1] = ring[len - 1 - i];
        ring[len - 2 - i] = x;
        ring[len - 1 - i] = y;
      }
    }
  }
  var init_tile = __esm({
    "node_modules/geojson-vt/src/tile.js"() {
    }
  });

  // node_modules/geojson-vt/src/index.js
  var src_exports = {};
  __export(src_exports, {
    default: () => geojsonvt
  });
  function toID(z, x, y) {
    return ((1 << z) * y + x) * 32 + z;
  }
  function extend(dest, src) {
    for (const i in src) dest[i] = src[i];
    return dest;
  }
  function geojsonvt(data, options) {
    return new GeoJSONVT(data, options);
  }
  var defaultOptions, GeoJSONVT;
  var init_src = __esm({
    "node_modules/geojson-vt/src/index.js"() {
      init_convert();
      init_clip();
      init_wrap();
      init_transform();
      init_tile();
      defaultOptions = {
        maxZoom: 14,
        // max zoom to preserve detail on
        indexMaxZoom: 5,
        // max zoom in the tile index
        indexMaxPoints: 1e5,
        // max number of points per tile in the tile index
        tolerance: 3,
        // simplification tolerance (higher means simpler)
        extent: 4096,
        // tile extent
        buffer: 64,
        // tile buffer on each side
        lineMetrics: false,
        // whether to calculate line metrics
        promoteId: null,
        // name of a feature property to be promoted to feature.id
        generateId: false,
        // whether to generate feature ids. Cannot be used with promoteId
        debug: 0
        // logging level (0, 1 or 2)
      };
      GeoJSONVT = class {
        constructor(data, options) {
          options = this.options = extend(Object.create(defaultOptions), options);
          const debug = options.debug;
          if (debug) console.time("preprocess data");
          if (options.maxZoom < 0 || options.maxZoom > 24) throw new Error("maxZoom should be in the 0-24 range");
          if (options.promoteId && options.generateId) throw new Error("promoteId and generateId cannot be used together.");
          let features = convert(data, options);
          this.tiles = {};
          this.tileCoords = [];
          if (debug) {
            console.timeEnd("preprocess data");
            console.log("index: maxZoom: %d, maxPoints: %d", options.indexMaxZoom, options.indexMaxPoints);
            console.time("generate tiles");
            this.stats = {};
            this.total = 0;
          }
          features = wrap(features, options);
          if (features.length) this.splitTile(features, 0, 0, 0);
          if (debug) {
            if (features.length) console.log("features: %d, points: %d", this.tiles[0].numFeatures, this.tiles[0].numPoints);
            console.timeEnd("generate tiles");
            console.log("tiles generated:", this.total, JSON.stringify(this.stats));
          }
        }
        // splits features from a parent tile to sub-tiles.
        // z, x, and y are the coordinates of the parent tile
        // cz, cx, and cy are the coordinates of the target tile
        //
        // If no target tile is specified, splitting stops when we reach the maximum
        // zoom or the number of points is low as specified in the options.
        splitTile(features, z, x, y, cz, cx, cy) {
          const stack = [features, z, x, y];
          const options = this.options;
          const debug = options.debug;
          while (stack.length) {
            y = stack.pop();
            x = stack.pop();
            z = stack.pop();
            features = stack.pop();
            const z2 = 1 << z;
            const id = toID(z, x, y);
            let tile = this.tiles[id];
            if (!tile) {
              if (debug > 1) console.time("creation");
              tile = this.tiles[id] = createTile(features, z, x, y, options);
              this.tileCoords.push({ z, x, y });
              if (debug) {
                if (debug > 1) {
                  console.log(
                    "tile z%d-%d-%d (features: %d, points: %d, simplified: %d)",
                    z,
                    x,
                    y,
                    tile.numFeatures,
                    tile.numPoints,
                    tile.numSimplified
                  );
                  console.timeEnd("creation");
                }
                const key = `z${z}`;
                this.stats[key] = (this.stats[key] || 0) + 1;
                this.total++;
              }
            }
            tile.source = features;
            if (cz == null) {
              if (z === options.indexMaxZoom || tile.numPoints <= options.indexMaxPoints) continue;
            } else if (z === options.maxZoom || z === cz) {
              continue;
            } else if (cz != null) {
              const zoomSteps = cz - z;
              if (x !== cx >> zoomSteps || y !== cy >> zoomSteps) continue;
            }
            tile.source = null;
            if (features.length === 0) continue;
            if (debug > 1) console.time("clipping");
            const k1 = 0.5 * options.buffer / options.extent;
            const k2 = 0.5 - k1;
            const k3 = 0.5 + k1;
            const k4 = 1 + k1;
            let tl = null;
            let bl = null;
            let tr = null;
            let br = null;
            let left = clip(features, z2, x - k1, x + k3, 0, tile.minX, tile.maxX, options);
            let right = clip(features, z2, x + k2, x + k4, 0, tile.minX, tile.maxX, options);
            features = null;
            if (left) {
              tl = clip(left, z2, y - k1, y + k3, 1, tile.minY, tile.maxY, options);
              bl = clip(left, z2, y + k2, y + k4, 1, tile.minY, tile.maxY, options);
              left = null;
            }
            if (right) {
              tr = clip(right, z2, y - k1, y + k3, 1, tile.minY, tile.maxY, options);
              br = clip(right, z2, y + k2, y + k4, 1, tile.minY, tile.maxY, options);
              right = null;
            }
            if (debug > 1) console.timeEnd("clipping");
            stack.push(tl || [], z + 1, x * 2, y * 2);
            stack.push(bl || [], z + 1, x * 2, y * 2 + 1);
            stack.push(tr || [], z + 1, x * 2 + 1, y * 2);
            stack.push(br || [], z + 1, x * 2 + 1, y * 2 + 1);
          }
        }
        getTile(z, x, y) {
          z = +z;
          x = +x;
          y = +y;
          const options = this.options;
          const { extent, debug } = options;
          if (z < 0 || z > 24) return null;
          const z2 = 1 << z;
          x = x + z2 & z2 - 1;
          const id = toID(z, x, y);
          if (this.tiles[id]) return transformTile(this.tiles[id], extent);
          if (debug > 1) console.log("drilling down to z%d-%d-%d", z, x, y);
          let z0 = z;
          let x0 = x;
          let y0 = y;
          let parent;
          while (!parent && z0 > 0) {
            z0--;
            x0 = x0 >> 1;
            y0 = y0 >> 1;
            parent = this.tiles[toID(z0, x0, y0)];
          }
          if (!parent || !parent.source) return null;
          if (debug > 1) {
            console.log("found parent tile z%d-%d-%d", z0, x0, y0);
            console.time("drilling down");
          }
          this.splitTile(parent.source, z0, x0, y0, z, x, y);
          if (debug > 1) console.timeEnd("drilling down");
          return this.tiles[id] ? transformTile(this.tiles[id], extent) : null;
        }
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/geojson_worker_source.js
  var require_geojson_worker_source = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/geojson_worker_source.js"(exports, module) {
      var rewind2 = require_geojson_rewind();
      var GeoJSONWrapper = require_geojson_wrapper();
      var vtpbf = require_vt_pbf();
      var supercluster = require_supercluster();
      var { default: geojsonvt2 } = (init_src(), __toCommonJS(src_exports));
      var VectorTileWorkerSource = require_vector_tile_worker_source();
      function loadGeoJSONTile(params) {
        if (!this._geoJSONIndex) {
          if (!this._createGeoJSONIndex) {
            return;
          }
          try {
            this._geoJSONIndex = this._createGeoJSONIndex();
          } finally {
            this._createGeoJSONIndex = null;
          }
        }
        const { z, x, y } = params.tileID.canonical;
        const geoJSONTile = this._geoJSONIndex.getTile(z, x, y);
        if (!geoJSONTile) {
          return;
        }
        const geojsonWrapper = new GeoJSONWrapper(geoJSONTile.features);
        let pbf = vtpbf(geojsonWrapper);
        if (pbf.byteOffset !== 0 || pbf.byteLength !== pbf.buffer.byteLength) {
          pbf = new Uint8Array(pbf);
        }
        return {
          vectorTile: geojsonWrapper,
          rawData: pbf.buffer
        };
      }
      var GeoJSONWorkerSource = class extends VectorTileWorkerSource {
        /**
         * @param [loadGeoJSON] Optional method for custom loading/parsing of
         * GeoJSON based on parameters passed from the main-thread Source.
         * See {@link GeoJSONWorkerSource#loadGeoJSON}.
         */
        constructor(resources, layerIndex, loadGeoJSON) {
          super(resources, layerIndex, loadGeoJSONTile);
          if (loadGeoJSON) {
            this.loadGeoJSON = loadGeoJSON;
          }
        }
        /**
         * Fetches (if appropriate), parses, and index geojson data into tiles. This
         * preparatory method must be called before {@link GeoJSONWorkerSource#loadTile}
         * can correctly serve up tiles.
         *
         * Defers to {@link GeoJSONWorkerSource#loadGeoJSON} for the fetching/parsing,
         * expecting `callback(error, data)` to be called with either an error or a
         * parsed GeoJSON object.
         *
         * @param params
         * @param callback
         */
        loadData(params) {
          const data = this.loadGeoJSON(params);
          this._geoJSONIndex = null;
          this._createGeoJSONIndex = params.cluster ? () => {
            rewind2(data, true);
            return supercluster(params.superclusterOptions).load(data.features);
          } : () => {
            rewind2(data, true);
            return geojsonvt2(data, params.geojsonVtOptions);
          };
        }
        /**
         * Fetch and parse GeoJSON according to the given params.
         *
         * GeoJSON is expected as a literal (string or object) `params.data`.
         *
         * @param params
         * @param [params.data] Literal GeoJSON data. Must be provided.
         */
        loadGeoJSON(params) {
          try {
            return JSON.parse(params.data);
          } catch (e) {
            throw new Error("Input data is not a valid GeoJSON object.");
          }
        }
      };
      module.exports = GeoJSONWorkerSource;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/data/dem_data.js
  var require_dem_data = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/data/dem_data.js"(exports, module) {
      var { RGBAImage } = require_image();
      var warn = require_warn();
      var { register } = require_transfer_registry();
      var DEMData = class {
        constructor(uid, data, encoding) {
          this.uid = uid;
          if (data.height !== data.width) throw new RangeError("DEM tiles must be square");
          if (encoding && encoding !== "mapbox" && encoding !== "terrarium") {
            warn.once(`"${encoding}" is not a valid encoding type. Valid types include "mapbox" and "terrarium".`);
            return;
          }
          const dim = this.dim = data.height;
          this.stride = this.dim + 2;
          this.data = new Int32Array(this.stride * this.stride);
          const pixels = data.data;
          const unpack = encoding === "terrarium" ? this._unpackTerrarium : this._unpackMapbox;
          for (let y = 0; y < dim; y++) {
            for (let x = 0; x < dim; x++) {
              const i = y * dim + x;
              const j = i * 4;
              this.set(x, y, unpack(pixels[j], pixels[j + 1], pixels[j + 2]));
            }
          }
          for (let x = 0; x < dim; x++) {
            this.set(-1, x, this.get(0, x));
            this.set(dim, x, this.get(dim - 1, x));
            this.set(x, -1, this.get(x, 0));
            this.set(x, dim, this.get(x, dim - 1));
          }
          this.set(-1, -1, this.get(0, 0));
          this.set(dim, -1, this.get(dim - 1, 0));
          this.set(-1, dim, this.get(0, dim - 1));
          this.set(dim, dim, this.get(dim - 1, dim - 1));
        }
        set(x, y, value) {
          this.data[this._idx(x, y)] = value + 65536;
        }
        get(x, y) {
          return this.data[this._idx(x, y)] - 65536;
        }
        _idx(x, y) {
          if (x < -1 || x >= this.dim + 1 || y < -1 || y >= this.dim + 1)
            throw new RangeError("out of range source coordinates for DEM data");
          return (y + 1) * this.stride + (x + 1);
        }
        _unpackMapbox(r, g, b) {
          return (r * 256 * 256 + g * 256 + b) / 10 - 1e4;
        }
        _unpackTerrarium(r, g, b) {
          return r * 256 + g + b / 256 - 32768;
        }
        getPixels() {
          return new RGBAImage({ width: this.stride, height: this.stride }, new Uint8Array(this.data.buffer));
        }
        backfillBorder(borderTile, dx, dy) {
          if (this.dim !== borderTile.dim) throw new Error("dem dimension mismatch");
          let xMin = dx * this.dim;
          let xMax = dx * this.dim + this.dim;
          let yMin = dy * this.dim;
          let yMax = dy * this.dim + this.dim;
          switch (dx) {
            case -1:
              xMin = xMax - 1;
              break;
            case 1:
              xMax = xMin + 1;
              break;
          }
          switch (dy) {
            case -1:
              yMin = yMax - 1;
              break;
            case 1:
              yMax = yMin + 1;
              break;
          }
          const ox = -dx * this.dim;
          const oy = -dy * this.dim;
          for (let y = yMin; y < yMax; y++) {
            for (let x = xMin; x < xMax; x++) {
              this.set(x, y, borderTile.get(x + ox, y + oy));
            }
          }
        }
      };
      register("DEMData", DEMData);
      module.exports = DEMData;
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/resources/glyphs.js
  var require_glyphs = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/resources/glyphs.js"(exports, module) {
      var parseGlyphPBF = require_parse_glyph_pbf();
      module.exports = glyphCache;
      var MAX_GLYPH_ID = 65535;
      function glyphCache({ actor, mapId, parseGlyphs = parseGlyphPBF }) {
        const entries = {};
        return {
          getGlyphs
        };
        async function getGlyphs({ stacks }) {
          const all = [];
          for (const [stack, ids] of Object.entries(stacks)) {
            const addedRanges = /* @__PURE__ */ new Set();
            for (const id of ids) {
              if (id > MAX_GLYPH_ID) {
                continue;
              }
              const range = Math.floor(id / 256);
              if (!addedRanges.has(range) && !hasRange(stack, range)) {
                addedRanges.add(range);
                all.push(retrieveGlyphRange({ stack, range }));
              }
            }
          }
          if (all.length > 0) {
            await Promise.all(all);
          }
          const result = {};
          for (const [stack, ids] of Object.entries(stacks)) {
            const entry = getEntry(stack);
            const resultStack = result[stack] ??= {};
            for (const id of ids) {
              if (id <= MAX_GLYPH_ID) {
                resultStack[id] = entry.glyphs[id] ?? null;
              } else {
                resultStack[id] = null;
              }
            }
          }
          return result;
        }
        async function retrieveGlyphRange({ stack, range }) {
          const entry = getEntry(stack);
          const data = await loadGlyphRange(entry, stack, range);
          if (!data) {
            return null;
          }
          for (const glyph of parseGlyphs(data)) {
            entry.glyphs[glyph.id] = glyph;
          }
        }
        async function loadGlyphRange(entry, stack, range) {
          const promise = entry.requests[range] ??= actor.send("loadGlyphRange", { stack, range }, mapId);
          const data = await promise;
          delete entry.requests[range];
          entry.ranges[range] = true;
          return data;
        }
        function getEntry(stack) {
          return entries[stack] ??= { glyphs: {}, requests: {}, ranges: {} };
        }
        function hasRange(stack, range) {
          return getEntry(stack).ranges[range];
        }
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/resources/images.js
  var require_images = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/resources/images.js"(exports, module) {
      module.exports = images;
      function images({ actor, mapId }) {
        const cache = /* @__PURE__ */ new Map();
        const inProgress = /* @__PURE__ */ new Map();
        return {
          getImages
        };
        async function getImages({ icons }) {
          const missing = /* @__PURE__ */ new Set();
          const result = {};
          for (const id of icons) {
            if (cache.has(id)) {
              const image = cache.get(id);
              if (image) {
                result[id] = image;
              }
            } else {
              missing.add(id);
            }
          }
          if (missing.size === 0) {
            return result;
          }
          const active = /* @__PURE__ */ new Set();
          const needed = [...missing];
          for (const id of missing) {
            if (inProgress.has(id)) {
              active.add(inProgress.get(id));
              missing.delete(id);
            }
          }
          if (missing.size > 0) {
            await fetchMissing([...missing]);
          }
          if (active.size > 0) {
            await Promise.all(active);
          }
          for (const id of needed) {
            const image = cache.get(id);
            if (image) {
              result[id] = image;
            }
          }
          return result;
        }
        async function fetchMissing(icons) {
          const promise = actor.send("getImages", { icons }, mapId);
          for (const id of icons) {
            inProgress.set(id, promise);
          }
          const result = await promise;
          for (const id of icons) {
            cache.set(id, result[id]);
          }
          for (const id of icons) {
            inProgress.delete(id);
          }
        }
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/resources/index.js
  var require_resources = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/resources/index.js"(exports, module) {
      var makeGlyphs = require_glyphs();
      var makeImages = require_images();
      module.exports = { resources };
      function resources(actor, mapId) {
        const glyphs = makeGlyphs({ actor, mapId });
        const images = makeImages({ actor, mapId });
        return {
          getGlyphs,
          getImages
        };
        function getGlyphs(params) {
          return glyphs.getGlyphs(params);
        }
        function getImages(params) {
          return images.getImages(params);
        }
      }
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/source/worker.js
  var require_worker = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/source/worker.js"(exports, module) {
      require_polyfill();
      var Actor = require_actor();
      var StyleLayerIndex = require_style_layer_index();
      var VectorTileWorkerSource = require_vector_tile_worker_source();
      var GeoJSONWorkerSource = require_geojson_worker_source();
      var assert = require_nanoassert();
      var { plugin: globalRTLTextPlugin } = require_rtl_text_plugin();
      var DEMData = require_dem_data();
      var { resources } = require_resources();
      var Worker = class {
        #resources = {};
        constructor(self2) {
          this.self = self2;
          this.actor = new Actor(self2, this);
          this.actors = {};
          this.layerIndexes = {};
          this.workerSourceTypes = {
            vector: VectorTileWorkerSource,
            geojson: GeoJSONWorkerSource
          };
          this.workerSources = {};
          this.self.registerWorkerSource = (name, WorkerSource) => {
            if (this.workerSourceTypes[name]) {
              throw new Error(`Worker source with name "${name}" already registered.`);
            }
            this.workerSourceTypes[name] = WorkerSource;
          };
          this.self.registerRTLTextPlugin = (rtlTextPlugin) => {
            if (globalRTLTextPlugin.isLoaded()) {
              throw new Error("RTL text plugin already registered.");
            }
            globalRTLTextPlugin["applyArabicShaping"] = rtlTextPlugin.applyArabicShaping;
            globalRTLTextPlugin["processBidirectionalText"] = rtlTextPlugin.processBidirectionalText;
            globalRTLTextPlugin["processStyledBidirectionalText"] = rtlTextPlugin.processStyledBidirectionalText;
          };
        }
        setLayers(mapId, layers) {
          this.getLayerIndex(mapId).replace(layers);
        }
        updateLayers(mapId, params) {
          this.getLayerIndex(mapId).update(params.layers, params.removedIds);
        }
        loadTile(mapId, params) {
          assert(params.type);
          return this.getWorkerSource(mapId, params.type, params.source).loadTile(params);
        }
        loadDEMTile(mapId, params) {
          const { uid, rawImageData, encoding } = params;
          return new DEMData(uid, rawImageData, encoding);
        }
        removeSource(mapId, params) {
          const { type, source } = params;
          assert(type);
          assert(source);
          const worker = this.workerSources?.[mapId]?.[type]?.[source];
          if (worker) {
            delete this.workerSources[mapId][type][source];
            worker.removeSource?.(params);
          }
        }
        loadRTLTextPlugin(map, pluginURL) {
          if (!globalRTLTextPlugin.isLoaded()) {
            this.self.importScripts(pluginURL);
            if (!globalRTLTextPlugin.isLoaded()) {
              throw new Error(`RTL Text Plugin failed to import scripts from ${pluginURL}`);
            }
          }
        }
        getLayerIndex(mapId) {
          return this.layerIndexes[mapId] ??= new StyleLayerIndex();
        }
        getResources(mapId) {
          return this.#resources[mapId] ??= resources(this.actor, mapId);
        }
        getWorkerSource(mapId, type, source) {
          this.workerSources[mapId] ??= {};
          this.workerSources[mapId][type] ??= {};
          return this.workerSources[mapId][type][source] ??= this.createWorkerSource(type, mapId);
        }
        createWorkerSource(type, mapId) {
          const WorkerSource = this.workerSourceTypes[type];
          return new WorkerSource(this.getResources(mapId), this.getLayerIndex(mapId));
        }
      };
      module.exports = function createWorker(self2) {
        return new Worker(self2);
      };
    }
  });

  // node_modules/@mapwhit/tilerenderer/src/worker.js
  var require_worker2 = __commonJS({
    "node_modules/@mapwhit/tilerenderer/src/worker.js"() {
      var worker = require_worker();
      worker(self);
    }
  });

  // worker.js
  require_worker2();
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
