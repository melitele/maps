all: check build

check: lint

lint:
	jshint index.js lib

build: build/build.js

build/build.js: node_modules index.js
	mkdir -p build
	browserify --require ./index.js:maps --outfile $@

node_modules: package.json
	npm install

clean:
	rm -fr build node_modules

.PHONY: clean lint check all build
