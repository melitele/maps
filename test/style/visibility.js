const { describe, it } = require('node:test');
const { initVisibility, evalVisibility } = require('../../lib/style/visibility');

describe('visibility', () => {
  const map = {
    getLayer: () => true,
    setLayoutProperty: function (_id, prop, value) {
      this[prop] = value;
    }
  };

  it('visibility single field', t => {
    const visibility = [initVisibility('id', 'field')];

    evalVisibility(map, visibility, {
      field: true
    });
    t.assert.equal(map.visibility, 'visible');

    evalVisibility(map, visibility, {});
    t.assert.equal(map.visibility, 'none');
  });

  it('visibility all', t => {
    const visibility = [initVisibility('id', ['all', 'field1', 'field2'])];

    evalVisibility(map, visibility, {});
    t.assert.equal(map.visibility, 'none');

    evalVisibility(map, visibility, {
      field1: true,
      field2: true
    });
    t.assert.equal(map.visibility, 'visible');

    evalVisibility(map, visibility, {
      field1: true
    });
    t.assert.equal(map.visibility, 'none');
  });

  it('visibility any', t => {
    const visibility = [initVisibility('id', ['any', 'field1', 'field2'])];

    evalVisibility(map, visibility, {
      field1: true
    });
    t.assert.equal(map.visibility, 'visible');

    evalVisibility(map, visibility, {});
    t.assert.equal(map.visibility, 'none');

    evalVisibility(map, visibility, {
      field2: true
    });
    t.assert.equal(map.visibility, 'visible');
  });
});
