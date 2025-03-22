const { describe, it } = require('node:test');
const feature = require('../lib/feature');

describe('feature', () => {
  it('create', () => {
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
    ft.should.have.property('_data');
    ft._data.should.deepEqual(data);
    ft.should.have.property('_source', '_source');
  });

  it('position', () => {
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
    ft.position().should.deepEqual([0, 0]);
    ft.position([1, 1]);
    ft.position().should.deepEqual([1, 1]);
  });
});
