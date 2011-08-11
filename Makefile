all:
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/
	@npm install -d

test:
	@node scripts/runtests.js

lint:
	@node scripts/runlint.js

.PHONY: all test lint