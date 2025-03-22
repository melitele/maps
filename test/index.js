const { describe, it } = require('node:test');
const mock = require('mock-require');

mock('dynload', function () {});

const maps = require('../lib');

describe('maps', function () {

  it('init', function () {
    maps.init();
    [ 'collate', 'feature', 'map', 'outline', 'projection', 'spread', 'util']
      .forEach(function (prop) {
        maps.should.have.property(prop);
      });
  });
});
