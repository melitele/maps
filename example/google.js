(function () {
  var maps = require('maps').init({
    libraries: 'geometry',
    key: window.google_map_key_for_example || 'AIzaSyCc3mQKAZDKu5HCBpd_g4Jb9IUthtx3WA4',
    isGCJ02: function () {
      return true;
    }
  }, function () {

    var dataEl = document.querySelector('#data');
    var points = JSON.parse(dataEl.getAttribute('data-markers'));
    var bnds = bounds(points);
    var path = dataEl.getAttribute('data-polyline');

    var mapContent = [
      function (map) {
        // add markers directly to map 1
        points.forEach(function (pt) {
          maps.marker({
            map: map,
            color: 'violet',
            position: pt
          });
        });
      },
      function (map) {
        // spread markers on map 2
        var spread = maps.spread({
          map: map,
          threshold: 20
        });
        points.forEach(function (pt, i) {
          spread.add(maps.marker({
            map: map,
            icon: {
              path: 'circle',
              fillColor: 'teal',
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 10
            },
            position: pt,
            label: i + 1
          }));
        });
        spread.calculate();
      },
      function (map) {
        // collate markers on map 3
        var collate = maps.collate({
          map: map
        });
        points.forEach(function (pt, i) {
          collate.add(maps.marker({
            map: map,
            color: 'orange',
            position: pt
          }));
        });
        collate.calculate();
      },
      function (map) {
        // spread AND collate markers on map 4
        spread = collate = undefined;
        function calculate() {
          if (spread && collate) {
            spread.calculate();
            collate.calculate();
          }
        }
        var proj = maps.projection({
          map: map,
          calculate: calculate
        });
        spread = maps.spread({
          map: map,
          projection: proj
        });
        collate = maps.collate({
          map: map,
          projection: proj
        });
        points.forEach(function (pt, i) {
          var m;
          if (i % 2) {
            m = maps.marker({
              map: map,
              color: 'orange',
              position: pt,
              zIndex: 1
            });
            collate.add(m);
          }
          else {
            m = maps.marker({
              map: map,
              color: 'teal',
              position: pt,
              zIndex: 2
            });
            spread.add(m);
            collate.add(m, true);
          }
        });
        calculate();
      },
      function (map) {
        sampleMarkers(maps, map);
      },
      function (map) {
        drawCircle(maps, map, points[0]);
      },
      function (map) {
        sampleChina(maps, map);
      },
    ];

    // create 4 maps with polyline
    Array.prototype.slice.call(document.querySelectorAll('.map.google')).forEach(function (mapEl, i) {
      var map = maps.map(mapEl, {
        scrollwheel: false,
        zoomControl: true,
        zoomControlOptions: {
          position: 'RB'
        },
        mapTypeControl: false,
        backgroundColor: '#e5c7e6',
        mapTypeId: 'roadmap'
      });
      if (i <= 3) {
        map.fitBounds(bnds);
        maps.polyline({
          map: map,
          color: '#a21bab',
          path: path
        });
      }
      mapContent[i](map);
      return map;
    });
  });
})();
