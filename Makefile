all:
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/
	@npm install -d

test:
	@node scripts/runtests.js

testf:
	@node_modules/nodeunit/bin/nodeunit ${file}

lint:
	@node scripts/runlint.js

.PHONY: all test testf lint