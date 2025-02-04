const { describe, it } = require('node:test');
const { initVisibility, evalVisibility } = require('../../../../lib/service/mapbox/style/visibility');

describe('visibility', function () {
  let map = {
    getLayer: () => true,
    setLayoutProperty: function (id, prop, value) {
      this[prop] = value;
    }
  };

  it('visibility single field', function () {
    let visibility = [ initVisibility('id', 'field') ];

    evalVisibility(map, visibility, {
      field: true
    });
    map.visibility.should.eql('visible');

    evalVisibility(map, visibility, {});
    map.visibility.should.eql('none');
  });

  it('visibility all', function () {
    let visibility = [ initVisibility('id', ['all', 'field1', 'field2']) ];

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
    let visibility = [ initVisibility('id', ['any', 'field1', 'field2']) ];

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
