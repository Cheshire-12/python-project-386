#!/bin/bash
set -e

mkdir -p /app/data

exec uv run gunicorn "backend.app:create_app()" \
  --bind "0.0.0.0:${PORT:-8000}" \
  --timeout 60
