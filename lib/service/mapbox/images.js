/*global global */

module.exports = create;

var pixelRatio = global.devicePixelRatio || 1;

function create() {
  var imageQueue = {};

  function destroy() {
    imageQueue = {};
  }

  function addImage(map, name, img, url) {

    function handler() {
      if (map._m && !map._m.hasImage(name)) {
        map._m.addImage(name, img);
      }
      img.removeEventListener('load', handler);
    }

    img.addEventListener('load', handler);
    img.setAttribute('src', url);
  }

  function add(map, name, url, size) {
    var img;
    if (map._m && map.ready) {
      if (map._m.hasImage(name)) {
        return;
      }
      img = document.createElement('img');
      if (size) {
        img.setAttribute('width', (size[0] * pixelRatio) + 'px');
        img.setAttribute('height', (size[1] * pixelRatio) + 'px');
      }
      addImage(map, name, img, url);
    }
    else {
      imageQueue[name] = {
        url: url,
        size: size
      };
    }
  }

  function init(map) {
    Object.keys(imageQueue).forEach(function (name) {
      add(map, name, imageQueue[name].url, imageQueue[name].size);
    });
    imageQueue = {};
  }

  return {
    add: add,
    destroy: destroy,
    init: init
  };
}