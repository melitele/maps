const { describe, it } = require('node:test');
const { initCaching, evalCaching } = require('../../../../lib/service/mapbox/style/caching');

describe('caching', function () {
  let map = {
    refresh: function () {}
  };
  let config = {
    SOURCE_LOADER_STRATEGY: {},
    notify: function () {}
  };

  it('caching default', function () {
    let caching = [ initCaching('id', {
      default: 'do-nothing'
    }) ];

    evalCaching(map, config, caching, {});
    config.SOURCE_LOADER_STRATEGY.id.should.eql('do-nothing');
  });

  it('caching single option', function () {
    let caching = [ initCaching('id', {
      default: 'do-nothing',
      'network-only': 'field'
    }) ];

    evalCaching(map, config, caching, {
      field: true
    });
    config.SOURCE_LOADER_STRATEGY.id.should.eql('network-only');

    evalCaching(map, config, caching, {});
    config.SOURCE_LOADER_STRATEGY.id.should.eql('do-nothing');
  });

  it('caching multiple options', function () {
    let caching = [ initCaching('id', {
      default: 'do-nothing',
      'network-only': 'field1',
      'cache-only': 'field2'
    }) ];

    evalCaching(map, config, caching, {
      field1: true
    });
    config.SOURCE_LOADER_STRATEGY.id.should.eql('network-only');

    evalCaching(map, config, caching, {
      field2: true
    });
    config.SOURCE_LOADER_STRATEGY.id.should.eql('cache-only');

    evalCaching(map, config, caching, {});
    config.SOURCE_LOADER_STRATEGY.id.should.eql('do-nothing');
  });
});
