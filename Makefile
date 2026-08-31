.PHONY: spec spec-watch dev backend-run frontend-dev preview openapi help prism-mock prism-proxy prism-stop frontend-install frontend-build

spec:
	npx tsp compile typespec --emit @typespec/openapi3 --output-dir dist
	cp dist/@typespec/openapi3/openapi.yaml dist/openapi.yaml
	rm -rf dist/@typespec

spec-watch:
	cd frontend && npm run spec:watch

dev: backend-run frontend-dev

backend-run:
	FLASK_APP=backend.app flask run --port 8000

frontend-dev:
	cd frontend && npm run dev

frontend-install:
	cd frontend && npm install

frontend-build:
	cd frontend && npm run build

preview:
	cd frontend && npm run preview

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
	@echo "  make spec            - Compile TypeSpec to OpenAPI 3.0"
	@echo "  make spec-watch      - Watch-mode TypeSpec compilation"
	@echo "  make dev             - Start Flask backend + Vite dev server"
	@echo "  make backend-run     - Start Flask backend (port 8000)"
	@echo "  make frontend-dev    - Start Vite dev server (port 3000)"
	@echo "  make frontend-install- Install frontend dependencies"
	@echo "  make frontend-build  - Build frontend for production"
	@echo "  make preview         - Preview production build"
	@echo "  make openapi         - Display the OpenAPI spec"
	@echo "  make prism-mock      - Start Prism mock server (port 4010)"
	@echo "  make prism-proxy     - Start Prism proxy to backend"
	@echo "  make prism-stop      - Stop Prism server"
