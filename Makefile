.PHONY: spec dev preview openapi help prism-mock prism-proxy prism-stop

spec:
	npm run spec:compile

spec-watch:
	npm run spec:watch

dev:
	npm run dev

preview:
	npm run preview

openapi:
	@cat dist/openapi.yaml

prism-mock:
	npx @stoplight/prism-cli mock dist/openapi.yaml --port 4010

prism-proxy:
	npx @stoplight/prism-cli proxy dist/openapi.yaml http://localhost:8000 --port 4010

prism-stop:
	@pkill -f "@stoplight/prism-cli" || true

help:
	@echo "Available targets:"
	@echo "  make spec          - Compile TypeSpec to OpenAPI 3.0"
	@echo "  make spec-watch    - Watch-mode TypeSpec compilation"
	@echo "  make dev           - Start Vite development server"
	@echo "  make preview       - Preview production build"
	@echo "  make openapi       - Display the OpenAPI spec"
	@echo "  make prism-mock    - Start Prism mock server (port 4010)"
	@echo "  make prism-proxy   - Start Prism proxy to TypeSpec backend"
	@echo "  make prism-stop    - Stop Prism server"