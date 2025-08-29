import test from 'node:test';
import makeListenersBag from '../../lib/event-handler/listeners-bag.js';

test('map listeners bag', async t => {
  await t.test('should add/remove listeners', t => {
    const h1 = () => {};
    const h2 = () => {};

    const bag = makeListenersBag();

    t.assert.ok(bag.add('click', h1), 'first listener for click');
    t.assert.ok(!bag.add('click', h2), 'second listener for click');

    t.assert.ok(bag.add('mouseover', h1), 'first listener for mouseover');
    t.assert.ok(bag.remove('mouseover', h1), 'last listener for mouseover');

    t.assert.ok(!bag.remove('click', h1), '1 listener for click remaining');
    t.assert.ok(bag.remove('click', h2), 'last listener for click');
  });

  await t.test('should keep track of handlers', t => {
    const h1 = () => {};
    const h2 = () => {};

    const bag = makeListenersBag();

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
