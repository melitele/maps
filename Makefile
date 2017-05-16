PROJECT=maps
SRC=$(wildcard index.js lib/*.js lib/*/*.js lib/*/*/*.js)
NODE_BIN=./node_modules/.bin

all: check test compile

check: lint

lint: | node_modules
	$(NODE_BIN)/jshint index.js lib test

compile: build/build.js

build/build.js: $(SRC) | node_modules
	mkdir -p $(@D)
	$(NODE_BIN)/browserify --require ./index.js:$(PROJECT) --outfile $@
	echo "window.google_map_key_for_example = '${GOOGLE_MAPS_KEY}';" >> $@
	echo "window.osm_map_style_url_for_example = '${OSM_MAP_STYLE}';" >> $@

.DELETE_ON_ERROR: build/build.js

node_modules: package.json
	yarn && touch $@

test:
	./node_modules/.bin/mocha --recursive --require should

clean:
	rm -fr build

distclean: clean
	rm -rf node_modules

.PHONY: clean distclean lint check all test compile
