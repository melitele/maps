const { describe, it } = require('node:test');
const makeListenersBag = require('../../lib/feature-event-handler/listeners-bag');

describe('listeners bag', () => {
  it('should add/remove listeners', t => {
    const h1 = () => {};
    const h2 = () => {};

    const bag = makeListenersBag();

    t.assert.ok(bag.add('click', 'l1', 'f1', h1), 'first listener for click');
    t.assert.ok(!bag.add('click', 'l1', 'f1', h2), 'second listener for click');

    t.assert.ok(bag.add('mouseover', 'l1', 'f1', h1), 'first listener for mouseover');
    t.assert.ok(bag.remove('mouseover', 'l1', 'f1', h1), 'last listener for mouseover');

    t.assert.ok(!bag.remove('click', 'l1', 'f1', h1), '1 listener for click remaining');
    t.assert.ok(bag.remove('click', 'l1', 'f1', h2), 'last listener for click');
  });

  it('should keep track of layers', t => {
    const h1 = () => {};

    const bag = makeListenersBag();

    t.assert.deepEqual(bag.forType('click'), []);

    bag.add('click', 'l1', 'f1', h1);

    t.assert.deepEqual(bag.forType('click'), ['l1']);

    bag.add('click', 'l2', 'f1', h1);

    t.assert.deepEqual(bag.forType('click'), ['l1', 'l2']);

    bag.remove('click', 'l1', 'f1', h1);

    t.assert.deepEqual(bag.forType('click'), ['l2']);
  });

  it('should keep track of handlers', t => {
    const h1 = () => {};
    const h2 = () => {};

    const bag = makeListenersBag();

    bag.add('click', 'l1', 'f1', h1);
    t.assert.deepEqual(bag.getListeners('click', 'f1'), [h1]);

    bag.add('click', 'l1', 'f1', h2);
    t.assert.deepEqual(bag.getListeners('click', 'f1'), [h1, h2]);

    bag.remove('click', 'l1', 'f1', h1);
    t.assert.deepEqual(bag.getListeners('click', 'f1'), [h2]);

    bag.remove('click', 'l1', 'f1', h2);
    t.assert.deepEqual(bag.getListeners('click', 'f1'), []);
  });
});
