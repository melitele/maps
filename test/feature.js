const { describe, it } = require('node:test');
const feature = require('../lib/feature');

describe('feature', () => {
  it('create', t => {
    const data = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const ft = feature({
      source: '_source',
      data
    });
    t.assert.ok('_data' in ft);
    t.assert.deepEqual(ft._data, data);
    t.assert.equal(ft._source, '_source');
  });

  it('position', t => {
    const data = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const ft = feature({
      source: '_source',
      data
    });
    t.assert.deepEqual(ft.position(), [0, 0]);
    ft.position([1, 1]);
    t.assert.deepEqual(ft.position(), [1, 1]);
  });
});
