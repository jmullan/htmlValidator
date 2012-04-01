all:
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/
	@npm install -d

tests := $(shell find . -name '*.test.js' ! -path "*node_modules/*")
reporter = dot
# for options, see http://visionmedia.github.com/mocha/#usage
args =
test:
	@node_modules/mocha/bin/mocha --reporter ${reporter} ${opts} ${tests}

watch-tests:
	@make test reporter=min opts="--watch ${opts}" tests=${tests}

files := $(shell find . -name '*.js' ! -path "*node_modules/*")
lint:
	@node_modules/nodelint/nodelint ${files} --config=scripts/config-lint.js

.PHONY: all test watch-tests lint
