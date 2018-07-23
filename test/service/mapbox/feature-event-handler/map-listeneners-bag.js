const assert = require('assert');
const makeMapListenersBag = require('../../../../lib/service/mapbox/feature-event-handler/map-listeners-bag');

describe('map listeners bag', function () {
  it('should add/remove listeners', function() {
    const h1 = () => {};
    const h2 = () => {};

    let bag = makeMapListenersBag();

    assert.ok(bag.add('click', h1), 'first listener for click');
    assert.ok(!bag.add('click', h2), 'second listener for click');

    assert.ok(bag.add('mouseover', h1), 'first listener for mouseover');
    assert.ok(bag.remove('mouseover', h1), 'last listener for mouseover');

    assert.ok(!bag.remove('click', h1), '1 listener for click remaining');
    assert.ok(bag.remove('click', h2), 'last listener for click');
  });


  it('should keep track of handlers', function() {
    const h1 = () => {};
    const h2 = () => {};

    let bag = makeMapListenersBag();

    bag.add('click', h1);
    bag.getListeners('click').should.eql([ h1 ]);

    bag.add('click', h2);
    bag.getListeners('click').should.eql([ h1, h2 ]);

    bag.remove('click', h1);
    bag.getListeners('click').should.eql([ h2 ]);

    bag.remove('click', h2);
    bag.getListeners('click').should.eql([]);
  });

});
