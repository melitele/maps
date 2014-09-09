var off = [
  { "visibility": "off" }
], on = [
  { "visibility": "on" }
], light = [
  { "saturation": -40 }
];

var styles = [
  {
    "featureType": "all",
    "elementType": "labels",
    "stylers": light
  },{
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      { "saturation": -100 },
      { "lightness": 60 }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "saturation": -40 },
      { "lightness": -10 }
    ]
  },{
    "featureType": "poi",
    "stylers": off
  },{
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      { "color": "#d0d0d0" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#707070" }
    ]
  },{
    "featureType": "administrative.locality",
    "stylers": off
  },{
    "featureType": "administrative.neighborhood",
    "stylers": off
  },{
    "featureType": "administrative.land_parcel",
    "stylers": off
  },{
    "featureType": "landscape.man_made",
    "stylers": off
  },{
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": light
  },{
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": on.concat(light)
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text",
    "stylers": off
  }
];

module.exports = styles;
