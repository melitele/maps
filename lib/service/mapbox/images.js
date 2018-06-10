
module.exports = create;

var pixelRatio = window.devicePixelRatio || 1;

function create() {
  var images = {};
  var imageQueue = {};

  function destroy() {
    images = {};
    imageQueue = {};
  }

  function addImage(map, name, img, url) {

    function handler() {
      if (map._m) {
        map._m.addImage(name, img);
      }
      img.removeEventListener('load', handler);
    }

    img.addEventListener('load', handler);
    img.setAttribute('src', url);
  }

  function add(map, name, url, size) {
    var img;
    if (images[name]) {
      return;
    }
    if (map._m && map.ready) {
      images[name] = true;
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