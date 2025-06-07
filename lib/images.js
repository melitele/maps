module.exports = create;

const pixelRatio = global.devicePixelRatio || 1;

function create() {
  const images = new Map();
  const imageQueue = new Map();

  function removeEventListener(cached) {
    if (!cached?.img) {
      return;
    }
    cached.img.removeEventListener('load', cached.handler);
    delete cached.img;
    delete cached.handler;
  }

  function destroy() {
    images.forEach(removeEventListener);
    images.clear();
    imageQueue.clear();
  }

  function addImage(map, name, fn) {
    function handler() {
      const cached = images.get(name);
      const { img } = cached;
      if (map._m) {
        map._m.addImage(name, img);
        if (fn) {
          fn();
        }
      }
      removeEventListener(cached);
    }

    const cached = images.get(name);
    if (!cached) {
      return;
    }
    const { img, url } = cached;
    img.addEventListener('load', handler);
    cached.handler = handler;
    img.setAttribute('src', url);
  }

  function add(map, name, url, size) {
    let resolve;
    const promise = new Promise(res => {
      resolve = res;
    });
    if (images.get(name)) {
      resolve();
      return promise;
    }
    if (map._m && map.ready) {
      const img = document.createElement('img');
      if (size) {
        img.setAttribute('width', size[0] * pixelRatio + 'px');
        img.setAttribute('height', size[1] * pixelRatio + 'px');
      }
      images.set(name, {
        img, // keep element while waiting for loading to complete
        url,
        size
      });
      addImage(map, name, () => resolve());
    } else {
      imageQueue.set(name, {
        url,
        size
      });
      resolve();
    }
    return promise;
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

  async function refresh(map) {
    if (!images.size) {
      return;
    }
    const cachedImages = Array.from(images);
    destroy();
    return Promise.all(cachedImages.map(([name, { url, size }]) => add(map, name, url, size)));
  }

  return {
    add,
    destroy,
    init,
    refresh
  };
}
