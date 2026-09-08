# Календарь звонков (Call Calendar)

Веб-приложение для записи на звонки по аналогии с Cal.com. Гость выбирает тип события, свободный слот и бронирует. Админ управляет типами событий и видит предстоящие встречи.

## Роли

- **Владелец календаря (админ)** — один заранее заданный профиль, используется в админской части. Регистрация и авторизация отсутствуют.
  - Создаёт типы событий (название, описание, длительность в минутах).
  - Редактирует и удаляет типы событий (при удалении каскадно удаляются связанные бронирования).
  - Смотрит страницу предстоящих встреч — все бронирования всех типов событий одним списком.
- **Гость** — бронирует слоты без создания аккаунта и входа.
  - Смотрит доступные типы событий (название, описание, длительность).
  - Выбирает тип события, свободный слот в ближайшие 14 дней и создаёт бронирование (имя + email + телефон).

## Правила домена

1. **Сетка слотов** — 30 минут; события длиннее 30 минут занимают подряд идущие слоты.
2. **Занятость** — на одно время нельзя создать две записи, даже для разных типов событий (пересечение → `409 Conflict`).
3. **Окно записи** — ближайшие 14 дней от текущей даты; вне окна → `422`.
4. **Таймзона** — единая фиксированная таймзона календаря (`Europe/Moscow`).

## Технологии

- **Бэкенд:** Flask (Python ≥ 3.12), SQLite (данные в `data/calendar.db`)
- **Управление зависимостями:** uv + pyproject.toml (hatchling)
- **API-контракт:** TypeSpec → OpenAPI 3.0 (`dist/openapi.yaml`) + JSON Schema (`backend/generated/schemas/` для серверной валидации) + TS-типы клиента (`frontend/src/types/generated/schema.ts`)
- **Фронтенд:** React 19 + TypeScript + Vite + Mantine 9 (тёмная тема Cal.com-стиль)
- **E2E тесты:** Playwright (Chromium)
- **Мокинг:** Prism (опционально, mock/proxy по OpenAPI)
- **Таймзона:** Europe/Moscow

## Структура проекта

```
pyproject.toml           # зависимости проекта (uv, hatchling)
Makefile                 # автоматизация сборки
typespec/                # спецификация TypeSpec (3 файла + tspconfig.yaml)
  main.tsp               # определение сервиса
  models.tsp             # модели данных
  operations.tsp         # операции API
dist/                    # генерируемый OpenAPI 3.0 (make spec)
backend/
  generated/schemas/     # генерируемые JSON Schema контракта (для серверной валидации)
backend/                 # Flask бэкенд (Python ≥ 3.12)
  app.py                 # create_app, CORS, blueprints, catch-all маршрут
  errors.py              # обработка ошибок (ApiError, NotFound, Conflict, Validation)
  models.py              # SQLite хранилище (event_types, bookings)
  routes/
    guest.py             # guest_bp — публичное API
    admin.py             # admin_bp — админское API
  services/
    slots.py             # генерация слотов (30-мин сетка, Europe/Moscow)
    validation.py        # валидация входных данных
frontend/                # React + Vite + Mantine фронтенд
  src/
    api/                 # API-клиент (fetch-обёртка)
      client.ts          # базовый fetch wrapper
      admin.ts           # админ API
      bookings.ts        # API бронирований
      eventTypes.ts      # API типов событий
    types/               # TypeScript-типы (ручные, из OpenAPI)
    pages/               # Страницы
      LandingPage.tsx    # Лендинг
      GuestEventTypes.tsx # Список событий (гость)
      GuestBooking.tsx   # Бронирование (3 панели)
      BookingConfirmation.tsx # Подтверждение
      AdminEventTypes.tsx # CRUD типов событий
      AdminUpcoming.tsx  # Предстоящие встречи
    components/          # Переиспользуемые компоненты
      Layout.tsx         # AppShell с шапкой
      Header.tsx         # Навигация
      AdminSidebar.tsx   # Боковая панель админа
      SlotPicker.tsx     # Календарь + список слотов
      BookingForm.tsx    # Форма бронирования
      CreateEventTypeModal.tsx # Модалка создания события
    App.tsx              # Роутинг + тёмная тема Mantine
  tests/                 # E2E тесты (Playwright)
    fixtures/            # Тестовые хелперы
    *.spec.ts            # Тестовые сценарии
```

## Ключевые команды

```bash
# Установка зависимостей
uv sync                  # Python зависимости (flask, flask-cors)
make backend-install     # то же самое, через Makefile
make frontend-install    # npm зависимости фронтенда

# Спецификация
make spec                # компиляция TypeSpec → dist/openapi.yaml
make spec-watch          # режим слежения

# Разработка (Flask backend + Vite dev server)
make dev                 # make backend-run + make frontend-dev
make backend-run         # Flask на порту 8000 (uv run flask)
make frontend-dev        # Vite dev server на порту 3000

# Сборка
make frontend-build      # production сборка

# E2E тесты
make test-install       # установить Chromium для Playwright
make test-e2e            # запуск Playwright тестов
make test-e2e-ui         # запуск с UI-режимом
make test-e2e-report     # HTML-отчёт

# Prism (опционально, для мокирования без бэкенда)
make prism-mock          # mock server (порт 4010)
make prism-proxy         # проксирование на бэкенд (порт 8000)
make prism-stop          # остановка Prism

# Просмотр спецификации
make openapi
```

## Запуск

1. **Установить зависимости:**
   ```bash
   make backend-install
   make frontend-install
   ```

2. **Сгенерировать OpenAPI:**
   ```bash
   make spec
   ```

3. **Запустить разработку:**
   ```bash
   make dev
   ```
   - Flask backend: `http://localhost:8000` (API + фронтенд из `frontend/dist/`)
   - Vite dev server: `http://localhost:3000` (hot-reload, проксирует `/api` → Flask)

4. **Открыть в браузере:** `http://localhost:3000` (Vite) или `http://localhost:8000` (Flask, нужен `make frontend-build`)

## Маршруты API

**Guest:**
- `GET /api/event-types` — список типов событий
- `GET /api/event-types/:id` — тип события
- `GET /api/event-types/:id/slots` — доступные слоты (параметры: `from`, `to`)
- `POST /api/bookings` — создать бронирование
- `GET /api/bookings/:id` — бронирование

**Admin:**
- `GET /api/admin/event-types` — список типов событий
- `POST /api/admin/event-types` — создать тип события
- `PUT /api/admin/event-types/:id` — обновить тип события
- `DELETE /api/admin/event-types/:id` — удалить тип события (каскадно)
- `GET /api/admin/bookings/upcoming` — предстоящие встречи

## Деплой

Приложение опубликовано на Render: [https://call-calendar-lq6n.onrender.com](https://call-calendar-lq6n.onrender.com)

## E2E тесты

Для запуска тестов необходимо установить Chromium для Playwright:

```bash
make test-install       # установить Chromium (~150 MB)
```

Тесты запускаются через Playwright и автоматически поднимают Flask backend + Vite dev server:

```bash
make test-e2e            # headless
make test-e2e-ui         # интерактивный режим
make test-e2e-report     # HTML-отчёт
```

Конфигурация: `frontend/playwright.config.ts`, тесты в `frontend/tests/`.
