var util = require('../lib/util');
var decodePath = require('../lib/service/mapbox/util').decodePath;

describe('utils', function () {

  it('findPoint', function () {
    var findPoint = util.findPoint;

    findPoint([0.55, 0.45], [[0, 0], [1, 1]], [0.05, 0.05]).should.eql({
      dist: 0.005000000000000003,
      margin: [0.05, 0.05],
      idx: 0,
      pol: true,
      p: [0.5, 0.5],
      point: [0.55, 0.45]
    });

    findPoint([0.05, 0.96], [[0, 0], [0, 1], [1, 1]], [0.05, 0.05]).should.eql({
      dist: 0.001600000000000003,
      margin: [0.05, 0.05],
      idx: 1,
      pol: true,
      p: [0.05, 1],
      point: [0.05, 0.96]
    });

    findPoint([-0.04, 1.01], [[0, 0], [0, 1], [1, 1]], [0.05, 0.05]).should.eql({
      dist: 0.0017000000000000003,
      margin: [0.05, 0.05],
      idx: 1,
      pol: false,
      p: [0, 1],
      point: [-0.04, 1.01]
    });

    var path = require('./fixtures/path');
    findPoint([-89.42398369139788, 33.55483020029206], decodePath(path), [0.2, 0.2]).should.eql({
      dist: 0.042578377843825475,
      idx: 870,
      margin: [0.2, 0.2],
      p: [-89.26961, 33.41791],
      point: [-89.42398369139788, 33.55483020029206],
      pol: false
    });
  });

});
