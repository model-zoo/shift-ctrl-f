.PHONY: all build

PACKAGE_VERSION:=$(shell jq -r .version < package.json)

fmt:
	prettier --write .

check:
	prettier --check .

develop:
	yarn run start

build:
	npm install
	NODE_ENV=production yarn run build
	mkdir -p dist
	cd build && zip -r ../dist/shift-ctrl-f-$(PACKAGE_VERSION).zip .

all:
	build
