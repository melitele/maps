NODE_BIN=./node_modules/.bin

all: check test build

check: lint

lint:
	$(NODE_BIN)/jshint index.js lib test

build: build/build.js

build/build.js: node_modules index.js lib/* lib/**/*
	mkdir -p build
	$(NODE_BIN)/browserify --require ./index.js:maps --outfile $@
	echo "window.google_map_key_for_example = '${GOOGLE_MAPS_KEY}';" >> $@

node_modules: package.json
	npm install

test:
	./node_modules/.bin/mocha --recursive --require should

clean:
	rm -fr build node_modules

.PHONY: clean lint check all test build
