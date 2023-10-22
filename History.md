
2.5.6 / 2023-10-22
==================

 * support displaying MultiPolygon

2.5.5 / 2022-06-26
==================

 * stop waiting for loading image after images collection has been destroyed
 * modernize code to ES6

2.5.4 / 2022-06-16
==================

 * cancel dragging when marker is truly removed not just re-added to change appearance
 * fix attempting to cancel dragging a marker after it has already been removed

2.5.3 / 2022-06-09
==================

 * remove yarn.lock
 * cancel dragging when removing layer
 * cancel dragging if in progress when switching marker from draggable to stationary
 * prevent default handling of mouse down event on draggable marker also during dragging

2.5.2 / 2019-06-18
==================

 * remove code enforcing zoom value to be integral

2.5.1 / 2019-04-24
==================

 * include coordinates in features rendered at a point

2.5.0 / 2019-02-07
==================

 * generic map artifact based on layer defined in map style

2.4.6 / 2019-01-27
==================

 * reduce reloading source tileJSON to either once per session or everytime source is activated

2.4.5 / 2019-01-25
==================

 * handle layers added to map post creation

2.4.4 / 2019-01-24
==================

 * more accurate count of requested tiles

2.4.3 / 2019-01-19
==================

 * send out attribution only when source is in use

2.4.2 / 2018-11-28
==================

 * fix exception thrown when starting animation for default (circle) icon

2.4.1 / 2018-11-16
==================

 * metadata-driven tile caching strategy
 * refactor metadata-driven visibility to a separate file

2.4.0 / 2018-11-12
==================

 * add source hostname to event for collecting statistics
 * collect attributions upon loading tiles and pass it on as event property
 * remove map controls options
 * remove `units` as unnecessary
 * support metadata-driven visibility multi-property options `all` and `any`

2.3.0 / 2018-11-08
==================

 * expose changing visibility of layers
 * remove support for obsolete forward arrow icon
 * fix demo after removing unused service initialization parameters

2.2.5 / 2018-10-25
==================

 * fix finding polyline nodes close to a given point

2.2.4 / 2018-09-05
==================

 * reload tiles when a source changes
 * init styles in the absence of initial callback

2.2.3 / 2018-08-25
==================

 * disable map rotation
 * handle `touchcancel` event
 * `mouseenter` at the beginning of dragging is no longer needed
 * generate `dragcancel` only on touch display

2.2.2 / 2018-08-18
==================

 * generate dragcancel if map starts moving
 * simplify draggable

2.2.1 / 2018-08-10
==================

 * consider standard static layers from style when calculating dynamic layer position based on zindex value

2.2.0 / 2018-08-05
==================

 * add isSupported function to map service

2.1.4 / 2018-08-05
==================

 * add queryRenderedFeatures to map object
 * switch mapbox/map.js to ES6
 * remove special handling for click events

2.1.3 / 2018-08-02
==================

 * fix registering/unregistering map listeners

2.1.2 / 2018-08-02
==================

 * remove console log statement

2.1.1 / 2018-08-02
==================

 * swap layer styling that depends on units
 * delay invoking callback that map is ready until style is loaded

2.1.0 / 2018-07-25
==================

 * remove google-polyline module
 * google polyline is no longer supported as input for drawing polylines and polygons

2.0.2 / 2018-07-24
==================

 * adjust icon position when dragging to account for icon offset

2.0.1 / 2018-07-23
==================

 * switch dependencies monitoring from gemnasium to david
 * remove geodesy module
 * remove dynload module
 * update node version for travis
 * register for map events using new feature event handler
 * add support for map events
 * add counting set
 * add map listener bag
 * optimize layers management in listeners bag

2.0.0 / 2018-07-22
==================

 * compare original implementation of mapboxgl-js with @pirxpilot/mapbox-gl
 * override global variable mapboxgl
 * change example into a separate demo project
 * compare Mapbox and OpenMapTiles in example page
 * remove support for google maps

1.4.1 / 2018-07-19
==================

 * delay redrawing layer until a batch of features is collected

1.4.0 / 2018-07-19
==================

 * fire mouseenter and mouseover taking into account zindex
 * delay handling events by map to give features the first chance
 * use per feature events
 * simplify handleClickEvent
 * add support for per-feature events
 * reduce number of layers by collating features
 * change visiblity to opacity
 * marker animation as updating layer option
 * re-implement markers as data-driven layers
 * parametrize layout and paint properties
 * remove obsolete circle and drag handle controls
 * unify defining sources for layers
 * fix polygon

1.3.9 / 2018-07-16
==================

 * adjust pointer margin for touch events
 * improve clicking and dragging stops on touch devices
 * make touch/mouse events more forgiving
 * simplify creation of geometry for queryRenderedFeatures

1.3.8 / 2018-07-16
==================

 * eliminate transparent layers

1.3.7 / 2018-07-15
==================

 * add support for OSM handling per feature events
 * fix deleting empty array when all event handlers have been removed

1.3.6 / 2018-07-07
==================

 * support touch events for dragging objects

1.3.5 / 2018-07-03
==================

 * propagate click event for object with highest zindex
 * change marker icon to be its active area

1.3.4 / 2018-07-03
==================

 * replace eviltransform with @pirxpilot/eviltransform

1.3.3 / 2018-06-30
==================

 * fix icon offset

1.3.2 / 2018-06-30
==================

 * support mouseenter and mouseleave as mouse events
 * make area around marker sensitive to mouse
 * cast mouse pointer onto polyline unless dragging

1.3.1 / 2018-06-18
==================

 * refresh marker after adding its image to sprite atlas

1.3.0 / 2018-06-16
==================

 * fix changing visibility of polylines
 * fix changing icon of markers not added to map
 * stop using built-in mapbox-gl controls
 * add zoom control
 * add scale control
 * normalize screen coordinates of mouse events on polyline
 * fix calculating point on polyline closest to mouse cursor
 * marker icon getter
 * make polyline draggable

1.2.2 / 2018-06-11
==================

 * allow markers with icons to overlap
 * fix changing marker icon

1.2.1 / 2018-06-10
==================

 * upgrade mapbox-gl to 0.45.0 in example
 * allow markers overlap
 * separate layers that belong to different maps
 * fix initializing images with more than one map on page

1.2.0 / 2018-06-02
==================

 * attribution callback as alternatve to element

1.1.2 / 2018-05-31
==================

 * fit map to bounds without animation if the style loading is not finished

1.1.1 / 2018-05-30
==================

 * animate zooming
 * fix rendering of labels below markers
 * change scale control units dynamically

1.1.0 / 2018-05-23
==================

 * implement marker labels in OSM maps
 * fix spreading markers on OSM map
 * refactor example separating code for google and osm maps

1.0.17 / 2018-05-19
===================

 * support using OSM map service as primary

1.0.16 / 2018-01-23
===================

 * normalize longitude before checking if coordinates are in China

1.0.15 / 2017-12-14
===================

 * add support for fullscreenControl[Options] for google and OSM
 * fix projection.position

1.0.14 / 2017-10-13
===================

 * return marker position as 2-element array regardless of the service

1.0.13 / 2017-06-11
===================

 * adjust minZoom and maxZoom to Mapbox values

1.0.12 / 2017-06-04
===================

 * check if marker is already added to the map

1.0.11 / 2017-06-04
===================

 * use 'once' to call onReady when stylesheet is loaded
 * assume all operations on the OSM map are done after style is loaded

1.0.10 / 2017-06-03
===================

 * default style and ability to set style after OSM map has been created

1.0.9 / 2017-06-02
==================

 * fix setting marker position in China

1.0.8 / 2017-06-02
==================

 * fix checking coordinates in China

1.0.7 / 2017-05-30
==================

 * fix unregister all event handlers for an object

1.0.6 / 2017-05-30
==================

 * resize circle
 * geodesy 1.1.1
 * drag circle
 * send events when circle center or radius changes
 * fix calculating circle radius
 * circle demo
 * don't optimize markers in demo
 * polyfill Object.assign in demo

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
