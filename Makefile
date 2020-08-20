.PHONY: all build

fmt:
	prettier --write .

check:
	prettier --check .

develop:
	yarn run start

build:
	NODE_ENV=production yarn run build

all:
	build
