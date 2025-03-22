const { describe, it } = require('node:test');
const maps = require('../lib');

describe('maps', function () {

  it('init', function () {
    const m = maps.init();
    [ 'collate', 'feature', 'map', 'outline', 'projection', 'spread', 'util']
      .forEach(prop => m.should.have.property(prop));
  });
});
