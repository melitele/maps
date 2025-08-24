module.exports = create;

const pixelRatio = global.devicePixelRatio || 1;

function create() {
  const images = new Map();
  const imageQueue = new Map();

  function destroy() {
    images.clear();
    imageQueue.clear();
  }

  function add(map, name, url, size) {
    if (images.has(name)) {
      return;
    }
    if (map._m && map.ready) {
      images.set(name, { url, size });
      const img = document.createElement('img');
      if (size) {
        img.setAttribute('width', size[0] * pixelRatio + 'px');
        img.setAttribute('height', size[1] * pixelRatio + 'px');
      }
      img.setAttribute('src', url);
      map._m.addImage(name, img);
      return;
    }
    imageQueue.set(name, {
      url,
      size
    });
  }

  function init(map) {
    if (!imageQueue.size) {
      return;
    }
    imageQueue.forEach(({ url, size }, name) => {
      add(map, name, url, size);
    });
    imageQueue.clear();
  }

  function refresh(map) {
    if (!images.size) {
      return;
    }
    const cachedImages = Array.from(images);
    destroy();
    cachedImages.forEach(([name, { url, size }]) => add(map, name, url, size));
  }

  return {
    add,
    destroy,
    init,
    refresh
  };
}
