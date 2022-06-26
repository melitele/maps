/*global global */

module.exports = create;

const pixelRatio = global.devicePixelRatio || 1;

function create() {
  let images = {};
  let imageQueue = {};

  function destroy() {
    images = {};
    imageQueue = {};
  }

  function addImage(map, name, img, url, fn) {

    function handler() {
      if (map._m) {
        map._m.addImage(name, img);
        if (fn) {
          fn();
        }
      }
      img.removeEventListener('load', handler);
    }

    img.addEventListener('load', handler);
    img.setAttribute('src', url);
  }

  function add(map, name, url, size, fn) {
    let img;
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
      addImage(map, name, img, url, fn);
    }
    else {
      imageQueue[name] = {
        url,
        size
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
    add,
    destroy,
    init
  };
}