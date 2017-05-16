
1.0.5 / 2017-05-16
==================

 * use dynload module directly
 * remove unused component-query module
 * fix service.util initialization
 * fix package metadata

1.0.4 / 2017-05-16
==================

 * replace lodash.assign with Object.assign

1.0.3 / 2017-05-07
==================

 * account for pixel ratio when calculating icon size and offset
 * upgrade test to mapbox-gl 0.37.0

1.0.2 / 2017-05-07
==================

 * marker bounce
 * render map objects according to z-index
 * implement dragging that bypasses Mapbox event handling to propagate drag events
 * implement markers as map layers instead of DOM elements
 * method to destroy map
 * adjust Mapbox handle size to agree with Google

1.0.1 / 2017-05-01
==================

 * prevent clicks on map objects rendered as layers from reaching map
 * handle as a special kind of circular marker
 * draggable layers
 * handle mouse-sensitive outline for polylines
 * let specific layer handle global map events
 * expose calculating map coordinates for mouse event
 * support changing visibility on map objects implemented as layers
 * improve Mapbox markers

1.0.0 / 2017-04-27
==================

 * implement polygon
 * implement circle
 * refactor polyline
 * pass map ready callback in options
 * handle markers with shapes other than circle
 * component-query 0.0.3
 * panBy method to pan map by offset
 * handle events uniformly
 * addControl method to add custom control to map
 * pass parameters and retrieve results from projection as map-independent objects
 * add safeguards to Mapbox map projection
 * enforce integral (not fractional) zoom value
 * only send query parameters that Google Maps understands
 * add setter capability to bounds with fitBounds semantics
 * add safeguards to Google map projection
 * support setting position of street view control in Google map
 * transform between GCJ-02 and WGS-84 when needed
 * eviltransform 0.2.2

0.9.0 / 2017-04-18
==================

 * render attribution separately from the OSM map
 * implement a wrapper around Mapbox GL map as a service
 * google-polyline 2.0.3
 * set zoom in addition to zoom in and out
 * change google map type including custom
 * old interface is not compatible with map switching
 * use service-independent constants in the example

0.8.0 / 2017-04-15
==================

 * change into a facade for various mapping frameworks, not just Google Maps API

0.7.2 / 2017-04-14
==================

 * change package name to maps-facade

0.7.1 / 2017-03-08
==================

 * update dependencies to new names

0.7.0 / 2017-02-15
==================

 * change package name
 * remove references to component
 * update links following the repo transfer
 * specify key for the demo

0.6.0 / 2016-11-16
==================

 * default to released version of Google Maps API

0.5.5 / 2016-11-05
==================

 * fix marker label displayed twice

0.5.4 / 2016-02-23
==================

 * remove `sensor` option

0.5.3 / 2015-09-09
==================

 * enable browserify builds

0.5.2 / 2014-09-09
==================

 * add common/example map styling

0.5.1 / 2014-03-09
==================

 * set center animating map move
 * reset collection of markers handled by projections
 * restore marker label when readding to map

0.5.0 / 2014-03-02
==================

 * add outline utility

0.4.1 / 2013-12-08
==================

  * Specify protocol to load google maps over HTTP or HTTPS
  * Typos in the example

0.4.0 / 2013-12-07
==================

 * add marker collator
 * add marker spreader
 * add marker label

0.3.0 / 2013-11-10
==================

 * add marker.animation

0.2.0 / 2013-11-10
==================

 * add map.panToBounds method
 * map.bounds returns an array of points

0.1.0 / 2013-10-12
==================

 * map.polyline added
 * util.decodePath added
 * create and add marker to the map in one shot
 * map.fitBounds added
 * initial implementation
