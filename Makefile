all:
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/
	@npm install -d

test:
	@node scripts/runtests.js

test-file:
	@node_modules/mocha/bin/mocha --reporter spec ${file}

watch-test:
	@node_modules/mocha/bin/mocha --reporter min --watch ${file}

lint:
	@node scripts/runlint.js

.PHONY: all test test-file watch-test lint
