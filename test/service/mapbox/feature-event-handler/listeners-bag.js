const assert = require('assert');
const makeListenersBag = require('../../../../lib/service/mapbox/feature-event-handler/listeners-bag');

describe('listeners bag', function () {
  it('should add/remove listeners', function() {
    const h1 = () => {};
    const h2 = () => {};

    let bag = makeListenersBag();

    assert.ok(bag.add('click', 'l1', 'f1', h1), 'first listener for click');
    assert.ok(!bag.add('click', 'l1', 'f1', h2), 'second listener for click');

    assert.ok(bag.add('mouseover', 'l1', 'f1', h1), 'first listener for mouseover');
    assert.ok(bag.remove('mouseover', 'l1', 'f1', h1), 'last listener for mouseover');

    assert.ok(!bag.remove('click', 'l1', 'f1', h1), '1 listener for click remaining');
    assert.ok(bag.remove('click', 'l1', 'f1', h2), 'last listener for click');
  });


  it('should keep track of layers', function() {
    const h1 = () => {};

    let bag = makeListenersBag();

    bag.forType('click').should.eql([]);

    bag.add('click', 'l1', 'f1', h1);

    bag.forType('click').should.eql(['l1']);

    bag.add('click', 'l2', 'f1', h1);

    bag.forType('click').should.eql(['l1', 'l2']);

    bag.remove('click', 'l1', 'f1', h1);

    bag.forType('click').should.eql(['l2']);
  });

  it('should move feature between layers', function() {
    const h1 = () => {};

    let bag = makeListenersBag();

    bag.add('click', 'l1', 'f1', h1);
    bag.add('touchend', 'l1', 'f1', h1);
    bag.add('click', 'l2', 'f2', h1);

    bag.forType('touchend').should.eql(['l1']);
    bag.forType('click').should.eql(['l1', 'l2']);

    bag.move('f1', 'l1', 'l2');

    bag.forType('touchend').should.eql(['l2']);
    bag.forType('click').should.eql(['l2']);
  });


  it('should keep track of handlers', function() {
    const h1 = () => {};
    const h2 = () => {};

    let bag = makeListenersBag();

    bag.add('click', 'l1', 'f1', h1);
    bag.getListeners('click', 'f1').should.eql([ h1 ]);

    bag.add('click', 'l1', 'f1', h2);
    bag.getListeners('click', 'f1').should.eql([ h1, h2 ]);

    bag.remove('click', 'l1', 'f1', h1);
    bag.getListeners('click', 'f1').should.eql([ h2 ]);

    bag.remove('click', 'l1', 'f1', h2);
    bag.getListeners('click', 'f1').should.eql([]);
  });

});
