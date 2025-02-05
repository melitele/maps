const { before, after, describe, it } = require('node:test');
const should = require('should');

const create = require('../../../lib/service/mapbox/images');

describe('images', function () {
  const url = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTAgMEgyNlYyNkgxNkwxMyAzMEwxMCAyNkgwWiIgZmlsbD0iI2Y4MDAxMiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjAuNSIvPjxwYXRoIGQ9Ik02LjggNEM2LjIgNCA1LjggNC40IDUuOCA1VjIxQzUuOCAyMS41IDYuMyAyMiA2LjggMjJIMTUuOEMxNi4zIDIyIDE2LjggMjEuNSAxNi44IDIxVjE2SDE3LjNDMTcuOCAxNiAxNy44IDE2LjUgMTcuOCAxNi41VjE4LjVDMTcuOCAxOS41IDE4LjMgMjAgMTkuMyAyMCAyMC4zIDIwIDIwLjggMTkuNSAyMC44IDE4LjUgMjAuOCAxNy4zIDIwLjggMTQgMjAuOCAxMyAyMC44IDEyIDE4LjggMTEgMTguOCAxMFY3SDE3LjhMMTYuOCA2VjVDMTYuOCA0LjQgMTYuMyA0IDE1LjggNFpNNy44IDZIMTQuOFYxMEg3LjhaTTE2LjggOUgxNy44VjEwLjVDMTcuOCAxMS41IDE5LjggMTIuNSAxOS44IDEzLjVWMTguNUMxOS44IDE5IDE5LjMgMTkgMTkuMyAxOVMxOC44IDE5IDE4LjggMTguNUMxOC44IDE4LjUgMTguOCAxNi41IDE4LjggMTYgMTguOCAxNS41IDE4LjMgMTUgMTcuOCAxNSAxNy40IDE1IDE2LjggMTUgMTYuOCAxNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';

  before(function () {
    this.jsdom = require('jsdom-global')(undefined, {
      resources: 'usable'
    });
  });

  after(function () {
    this.jsdom();
  });

  it('destroy', function (_, done) {
    let destroyed;

    const images = create();
    images.add({
      _m: {
        addImage: () => should.not.exist(destroyed)
      },
      ready: true
    }, 'x', url);

    images.destroy();
    destroyed = true;
    setTimeout(done, 1);
  });

});
