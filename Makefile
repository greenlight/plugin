.PHONY: plugins

plugins:
	docker build -t greenlight/plugin-valid test/fixtures/plugins/valid
	docker build -t greenlight/plugin-invalid test/fixtures/plugins/invalid
