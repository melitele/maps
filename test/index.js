var mock = require('mock-require');

mock('load', function () {});

var maps = require('../lib');

describe('maps', function () {

  it('init', function () {
    maps.init();
    [ 'collate', 'info', 'map', 'marker', 'outline', 'polyline', 'projection', 'spread', 'styles', 'util']
      .forEach(function (prop) {
        maps.should.have.property(prop);
      });
  });
});
