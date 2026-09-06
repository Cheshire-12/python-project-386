FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

FROM python:3.12-slim AS runtime
WORKDIR /app

COPY --from=frontend-build /app/frontend/dist ./frontend/dist
COPY pyproject.toml uv.lock ./
COPY backend/ ./backend/

RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

ENV DATABASE_URL=/app/data/calendar.db
ENV FRONTEND_DIR=/app/frontend/dist
ENV CORS_ORIGINS=*
ENV PORT=8000

EXPOSE 8000

CMD ["gunicorn", "backend.app:create_app()", "--bind", "0.0.0.0:8000", "--timeout", "60"]
