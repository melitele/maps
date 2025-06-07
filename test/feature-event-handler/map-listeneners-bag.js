const { describe, it } = require('node:test');
const makeMapListenersBag = require('../../lib/feature-event-handler/map-listeners-bag');

describe('map listeners bag', () => {
  it('should add/remove listeners', t => {
    const h1 = () => {};
    const h2 = () => {};

    const bag = makeMapListenersBag();

    t.assert.ok(bag.add('click', h1), 'first listener for click');
    t.assert.ok(!bag.add('click', h2), 'second listener for click');

    t.assert.ok(bag.add('mouseover', h1), 'first listener for mouseover');
    t.assert.ok(bag.remove('mouseover', h1), 'last listener for mouseover');

    t.assert.ok(!bag.remove('click', h1), '1 listener for click remaining');
    t.assert.ok(bag.remove('click', h2), 'last listener for click');
  });

  it('should keep track of handlers', t => {
    const h1 = () => {};
    const h2 = () => {};

    const bag = makeMapListenersBag();

    bag.add('click', h1);
    t.assert.deepEqual(bag.getListeners('click'), [h1]);

    bag.add('click', h2);
    t.assert.deepEqual(bag.getListeners('click'), [h1, h2]);

    bag.remove('click', h1);
    t.assert.deepEqual(bag.getListeners('click'), [h2]);

    bag.remove('click', h2);
    t.assert.deepEqual(bag.getListeners('click'), []);
  });
});
