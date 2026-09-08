# Changelog

## [0.1.3](https://github.com/Cheshire-12/python-project-386/compare/call-calendar-v0.1.2...call-calendar-v0.1.3) (2026-09-08)


### Features

* add unit tests, CI workflow, and AdminUpcoming duration column ([1f3f0a0](https://github.com/Cheshire-12/python-project-386/commit/1f3f0a0305c9b49fdc5b8be97a408c7cabaf5f58))
* **backend:** SQLite persistence + Docker + Gunicorn ([3fac00d](https://github.com/Cheshire-12/python-project-386/commit/3fac00d8eb4584edcc5c90c1560522ea339b5156))
* **backend:** каскадное удаление типа события + багфиксы (Refs: [#23](https://github.com/Cheshire-12/python-project-386/issues/23)) ([e4ed1d1](https://github.com/Cheshire-12/python-project-386/commit/e4ed1d15840cffb18ed4240950f1a025467be517))
* **ci:** контрактный пайплайн Design First — OpenAPI/JSON Schema/SDK + линтер ruff+oxlint + spec-sync (Refs: [#16](https://github.com/Cheshire-12/python-project-386/issues/16), [#19](https://github.com/Cheshire-12/python-project-386/issues/19), [#20](https://github.com/Cheshire-12/python-project-386/issues/20)) ([83603e2](https://github.com/Cheshire-12/python-project-386/commit/83603e2d821e715230adb9d963bd9368a9cbae2a))
* **docker:** entrypoint.sh для чтения PORT из переменной окружения ([da9dfae](https://github.com/Cheshire-12/python-project-386/commit/da9dfae16c186745dd04104b67e9d827ec696c9c))


### Bug Fixes

* **ci:** install test dependencies with --extra test ([162ed68](https://github.com/Cheshire-12/python-project-386/commit/162ed6851db295633a66ce5a3aeebefdbc267436))
* **docker:** entrypoint.sh — заменить sh на bash для поддержки create_app() ([5c73f1c](https://github.com/Cheshire-12/python-project-386/commit/5c73f1cba1a2133f4c51303f7e1aaabe48c4a5f0))
* **docker:** use uv run for gunicorn in entrypoint.sh ([783cf71](https://github.com/Cheshire-12/python-project-386/commit/783cf71946f3bb8ec6de17c8a795238c6999fc32))
* **docker:** обновить node:18-alpine до node:20-alpine для совместимости с Vite 8 ([cf0b11c](https://github.com/Cheshire-12/python-project-386/commit/cf0b11c2ed76d4aaeee34833696cd7e798c59ea5))
* **frontend:** перф рендера слотов до ~160мс + багфиксы UI (Refs: [#21](https://github.com/Cheshire-12/python-project-386/issues/21), [#23](https://github.com/Cheshire-12/python-project-386/issues/23)) ([2869e3d](https://github.com/Cheshire-12/python-project-386/commit/2869e3da78091c6c1fea05daf84add83cc328255))


### Documentation

* add deployment link to README ([0217258](https://github.com/Cheshire-12/python-project-386/commit/02172588c9aca76941c459e50de398436597c552))
* CONTEXT.md + ADR-0001..0006 по решениям (Refs: [#25](https://github.com/Cheshire-12/python-project-386/issues/25)) ([af48dcd](https://github.com/Cheshire-12/python-project-386/commit/af48dcdac9cea94aed9d5952f8c53e5a655a9d2f))
* Обновлен README.md ([f267fbc](https://github.com/Cheshire-12/python-project-386/commit/f267fbc2580515ca694203eb521c644b88356a6d))

## [0.1.2](https://github.com/Cheshire-12/python-project-386/compare/call-calendar-v0.1.1...call-calendar-v0.1.2) (2026-09-06)


### Documentation

* добавить лог сессии 2026-09-02 (E2E + CI/CD + release-please) ([7402464](https://github.com/Cheshire-12/python-project-386/commit/740246408b80f21d443547100171070ff17f5e3b))

## [0.1.1](https://github.com/Cheshire-12/python-project-386/compare/call-calendar-v0.1.0...call-calendar-v0.1.1) (2026-09-02)


### Features

* add Flask backend + React frontend (Design First) ([be0f805](https://github.com/Cheshire-12/python-project-386/commit/be0f8050ed116356ad13a1ab0afee977a48d6e73))
* CRUD типов событий + улучшения UI ([41d50d6](https://github.com/Cheshire-12/python-project-386/commit/41d50d66f1607fd4a5399ff436d83084681bf5bd))
* CRUD типов событий + улучшения UI ([d3d26be](https://github.com/Cheshire-12/python-project-386/commit/d3d26bef88e0e5e8cd203b632a56bc8897ed6290))
* dark Cal.com-style theme + Flask serves frontend ([5750113](https://github.com/Cheshire-12/python-project-386/commit/5750113e81b647599a4da4179ecad29bd8d58af7))
* Flask backend + React frontend (Design First) ([b140f11](https://github.com/Cheshire-12/python-project-386/commit/b140f11e355d7ae717f5336860bbadb964838ab7))
* каскадное удаление бронирований + багфиксы ([b41a738](https://github.com/Cheshire-12/python-project-386/commit/b41a738ef264bbcd465dfbec330db3c17d302dc5))
* каскадное удаление бронирований + багфиксы ([992d626](https://github.com/Cheshire-12/python-project-386/commit/992d626f28f2fb12a0d2cd7b7813a58644cc61ec))


### Bug Fixes

* **ci:** обновить Node.js до 20 для Playwright ([b8a1340](https://github.com/Cheshire-12/python-project-386/commit/b8a13408f3fa242781f7133e2389613eb5f29cf1))
* **ci:** обновить Node.js до 20 для Playwright ([9a1bd6b](https://github.com/Cheshire-12/python-project-386/commit/9a1bd6b9e1ba9020860277a9696ac2f0946e6930))


### Documentation

* add session log + update stale notes in AGENTS.md ([411a3f8](https://github.com/Cheshire-12/python-project-386/commit/411a3f8f696cea2015027534adb2eaa9409916d9))
* remove kanji from README ([d6c18e5](https://github.com/Cheshire-12/python-project-386/commit/d6c18e505424151e1b801057de469e2e0bf220d2))
* update README to reflect current project state ([14da255](https://github.com/Cheshire-12/python-project-386/commit/14da2554218fa3e49c0a1e9e46c5c33879caad2a))
