const { describe, it } = require('node:test');
const maps = require('../lib');

describe('maps', () => {
  it('init', t => {
    const m = maps.init();
    ['map', 'projection', 'util'].forEach(prop => t.assert.ok(prop in m, `map should have property: ${prop}`));
  });
});
