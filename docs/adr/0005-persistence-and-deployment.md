# ADR-0005: SQLite-хранилище, Docker-образ, запуск с портом из PORT, деплой на Render

- **Статус:** принято
- **Дата:** 2026-09-07/08

## Контекст

Приложение должно собираться в образ, стартовать самостоятельно и слушать порт, заданный через переменную окружения `PORT`, а ссылка на опубликованный сервис должна быть в README.

## Решение

- **Хранилище:** SQLite, файл по умолчанию `data/calendar.db` (переопределяется `DATABASE_URL`); инфраструктура «одна запись на время» в `backend/models.py`.
- **Dockerfile:** двухступенчатая сборка — `node:20-alpine` собирает фронтенд (`frontend/dist`), `python:3.12-slim` собирает бэкенд через `uv sync --frozen --no-dev`; runtime запускает `docker/entrypoint.sh`.
- **Порт:** entrypoint запускает `gunicorn --bind "0.0.0.0:${PORT:-8000}"` — порт берётся из `PORT`.
- **Деплой:** `render.yaml` (blueprint, диск на `/app/data`); приложение опубликовано: https://call-calendar-lq6n.onrender.com (ссылка в README).

## Последствия

- В контейнер попадают генерируемые артефакты контракта (`backend/generated/schemas/`, `frontend/dist`) — см. ADR-0004.
- Локальный `docker-compose.yml` для разработки (Flask 8000 + Vite 3000).
- `make docker-build` / `make docker-run` / `make docker-up` для локальной проверки образа.