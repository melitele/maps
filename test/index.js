const { describe, it } = require('node:test');
const maps = require('../lib');

describe('maps', () => {
  it('init', t => {
    const m = maps.init();
    ['collate', 'map', 'outline', 'projection', 'spread', 'util'].forEach(prop =>
      t.assert.ok(prop in m, `map should have property: ${prop}`)
    );
  });
});
