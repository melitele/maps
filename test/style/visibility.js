const { describe, it } = require('node:test');
const { initVisibility, evalVisibility } = require('../../lib/style/visibility');

describe('visibility', function () {
  const map = {
    getLayer: () => true,
    setLayoutProperty: function (_id, prop, value) {
      this[prop] = value;
    }
  };

  it('visibility single field', function () {
    const visibility = [initVisibility('id', 'field')];

    evalVisibility(map, visibility, {
      field: true
    });
    map.visibility.should.eql('visible');

    evalVisibility(map, visibility, {});
    map.visibility.should.eql('none');
  });

  it('visibility all', function () {
    const visibility = [initVisibility('id', ['all', 'field1', 'field2'])];

    evalVisibility(map, visibility, {});
    map.visibility.should.eql('none');

    evalVisibility(map, visibility, {
      field1: true,
      field2: true
    });
    map.visibility.should.eql('visible');

    evalVisibility(map, visibility, {
      field1: true
    });
    map.visibility.should.eql('none');
  });

  it('visibility any', function () {
    const visibility = [initVisibility('id', ['any', 'field1', 'field2'])];

    evalVisibility(map, visibility, {
      field1: true
    });
    map.visibility.should.eql('visible');

    evalVisibility(map, visibility, {});
    map.visibility.should.eql('none');

    evalVisibility(map, visibility, {
      field2: true
    });
    map.visibility.should.eql('visible');
  });
});
