PROJECT=demo
NODE_BIN=./node_modules/.bin
SRC = index.js $(wildcard lib/*.js)
CSS = \
	${PROJECT}.css

all: compile

compile: build/build.js build/worker.js build/build.css

build:
	mkdir -p $@

build/build.css: $(CSS) | build
	cat $^ > $@

build/build.js: node_modules $(SRC) | build
	$(NODE_BIN)/esbuild \
		--bundle \
		--define:DEBUG="true" \
		--define:global=globalThis \
		--external:fs \
		--external:path \
		--global-name=$(PROJECT) \
		--outfile=$@ \
		index.js

build/worker.js: node_modules $(SRC) | build
	$(NODE_BIN)/esbuild \
		--bundle \
		--define:DEBUG="true" \
		--define:global=globalThis \
		--external:fs \
		--external:path \
		--global-name=$(PROJECT) \
		--outfile=$@ \
		worker.js

.DELETE_ON_ERROR: build/build.js build/worker.js

node_modules: package.json
	yarn && touch $@

clean:
	rm -fr build

distclean: clean
	rm -fr node_modules

.PHONY: clean all compile test
