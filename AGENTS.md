# AGENTS.md
Инструкции для ИИ агентов работающих в этом проекте.

## Обзор проекта
Веб-приложение "Календарь звонков": бэкенд на Flask (Python >= 3.12) + SQLite, API-контракт задан через TypeSpec (`typespec/main.tsp`, `typespec/models.tsp`, `typespec/operations.tsp`), фронтенд на React 19 + TypeScript + Vite + Mantine 9, Prism для мокирования API при разработке.
- **Подход Design First**: контракт задается до реализации
- **Бэкенд отдельно**: Flask + SQLite (заготовка есть, отдаёт API + фронтенд)
- **Фронтенд**: `frontend/` — отдельный Vite-проект с React + Mantine
- **Таймзона**: `Europe/Moscow` (единая для всего календаря)
- **Бэкенд**: Flask на порту 8000 (порт 5000 занят macOS AirPlay)

## Структура проекта
- `typespec/` — спецификация TypeSpec (3 файла): эндпоинты, модели, операции
- `dist/` — генерируемый OpenAPI 3.0 (`make spec`)
- `frontend/` — React + Vite + Mantine фронтенд
  - `src/api/` — API-клиент (fetch-обёртка)
  - `src/types/` — TypeScript-типы из OpenAPI
  - `src/pages/` — Страницы (Landing, Guest, Admin)
  - `src/components/` — Переиспользуемые компоненты
- `Makefile` — автоматизация: `make dev`, `make spec`, `make prism-mock`
- `prism.yaml` — конфигурация Prism HTTP mock/proxy (порт 4010)

## Ключевые команды
```bash
# Установка зависимостей
make frontend-install    # cd frontend && npm install

# Спецификация
make spec              # компиляция TypeSpec → dist/openapi.yaml
make spec-watch        # режим слежения

# Разработка (Flask backend + Vite dev server)
make dev               # make backend-run + make frontend-dev
make backend-run       # cd backend && flask run --port 8000
make frontend-dev      # cd frontend && npm run dev (порт 3000)

# Сборка
make frontend-build    # production сборка

# Prism
make prism-mock        # Prism mock server (порт 4010)
make prism-proxy       # проксирование через Prism на бэкенд http://localhost:8000
make prism-stop        # остановка Prism

# Просмотр спецификации
make openapi           # cat dist/openapi.yaml
```

## Правила домена (из TypeSpec)
1. Сетка слотов: 30 минут. События > 30 мин занимают последовательные слоты.
2. Занятость: На одно время нельзя создать две записи (даже разных типов событий) → 409 Conflict (SlotConflictError).
3. Окно записи: Ближайшие 14 дней от текущей даты. Вне окна → 422 ValidationError.
4. Таймзона: Единая фиксированная (Europe/Moscow). Все времена как utcDateTime, отображаются в этой таймзоне.

## Типы данных и модели (из models.tsp)
- EventType: id (EntityId/int32), name, description, durationMinutes (int32)
- Slot: start/end (utcDateTime), available (boolean)
- Booking: id, eventTypeId, guestName, phone?, email?, startsAt, createdAt
- BookingCreate: eventTypeId, startsAt, guestName, phone?, email?
- UpcomingMeetings: { bookings: Booking[] }

## Ошибки:
- ValidationError (400) — неверные входные данные
- NotFoundError (404) — ресурс не найден
- ConflictError (409) — слот занят другим бронированием (SLOT_BUSY)

## Маршруты API (из operations.tsp)
- Guest: GET /api/event-types, GET /api/event-types/{id}, GET /api/event-types/{id}/slots, POST /api/bookings, GET /api/bookings/{id}
- Admin: GET /api/admin/event-types, POST /api/admin/event-types, GET /api/admin/bookings/upcoming

## Маршруты фронтенда (react-router-dom)
- `/` — Лендинг
- `/event-types` — Список событий (Guest)
- `/event-types/:id` — Бронирование (Cal.com-стиль: 3 панели)
- `/bookings/:id` — Подтверждение бронирования
- `/admin/event-types` — Управление типами событий (sidebar + контент)
- `/admin/upcoming` — Предстоящие встречи

## Требования к окружению
- Node.js 18+ для фронтенда и Prism
- Python 3.12+ + Flask + SQLite для бэкенда (заготовка на порту 8000)
- `make frontend-install` — установить зависимости фронтенда
- `make spec` — сгенерировать OpenAPI перед запуском

### Возможные подводные камни
- dist/openapi.yaml отсутствует — сгенерировать через make spec
- Prism mock отдает ответы по контракту до того, как бэкенд готов — полезен для фронтенд-разработки
- Vite проксирует `/api` на `http://localhost:8000` (Flask)
- Все datetime в API передаются как utcDateTime, сервер интерпретирует в Europe/Moscow

## Лог сессий

### 2026-09-01 — Dark theme + Flask serves frontend

**Сделано:**
- Тёмная тема Mantine (background #18181b, cards #25262b)
- GuestEventTypes: переделка с поиском, кнопкой «Создать», карточками
- GuestBooking: 3-панельный layout (инфо | календарь | слоты)
- SlotPicker: тёмный календарь с зелёными точками доступности
- CreateEventTypeModal: новая модалка создания события
- AdminSidebar/AdminEventTypes/AdminUpcoming: тёмная тема
- BookingForm/BookingConfirmation: тёмная тема
- Flask catch-all маршрут отдаёт frontend/dist/ для SPA
- Vite proxy target исправлен с 5000 на 8000
- Git push: commit 5750113

**Изменённые файлы:** 17 (14 modified + 2 new + 1 untracked)

## Важные замечания
- .github/workflows/hexlet-check.yml и .github/workflows/README.md — служебные файлы Hexlet: их **нельзя редактировать, удалять или переименовывать.**
