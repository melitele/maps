const { describe, it } = require('node:test');
const { findPoint } = require('../lib/util');

describe('utils', () => {
  it('findPoint', t => {
    t.assert.deepEqual(
      findPoint(
        [0.55, 0.45],
        [
          [0, 0],
          [1, 1]
        ],
        [0.05, 0.05]
      ),
      {
        dist: 0.005000000000000003,
        margin: [0.05, 0.05],
        idx: 0,
        pol: true,
        p: [0.5, 0.5],
        point: [0.55, 0.45]
      }
    );

    t.assert.deepEqual(
      findPoint(
        [0.05, 0.96],
        [
          [0, 0],
          [0, 1],
          [1, 1]
        ],
        [0.05, 0.05]
      ),
      {
        dist: 0.001600000000000003,
        margin: [0.05, 0.05],
        idx: 1,
        pol: true,
        p: [0.05, 1],
        point: [0.05, 0.96]
      }
    );

    t.assert.deepEqual(
      findPoint(
        [-0.04, 1.01],
        [
          [0, 0],
          [0, 1],
          [1, 1]
        ],
        [0.05, 0.05]
      ),
      {
        dist: 0.0017000000000000003,
        margin: [0.05, 0.05],
        idx: 1,
        pol: false,
        p: [0, 1],
        point: [-0.04, 1.01]
      }
    );

    t.assert.deepEqual(
      findPoint(
        [0.01, 1.01],
        [
          [0, 0],
          [0, 1],
          [1, 1]
        ],
        [0.05, 0.05]
      ),
      {
        dist: 0.0002000000000000002,
        margin: [0.05, 0.05],
        idx: 1,
        pol: false,
        p: [0, 1],
        point: [0.01, 1.01]
      }
    );
  });
});
