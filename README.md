# Календарь звонков (Call Calendar)

## Роли

- **Владелец календаря** — один заранее заданный профиль, используется в админской части. Регистрация и авторизация отсутствуют.
  - Создаёт типы событий (`id` задаёт сам владелец, slug), задавая название, описание и длительность в минутах.
  - Смотрит страницу предстоящих встреч — все бронирования всех типов событий одним списком.
- **Гость** — бронирует слоты без создания аккаунта и входа.
  - Смотрит виды брони (название, описание, длительность).
  - Выбирает тип события, свободный слот в ближайшие 14 дней и создаёт бронирование (имя + email).

## Правила домена

1. **Сетка слотов** — 30 минут; события длиннее 30 минут занимают подряд идущие слоты.
2. **Занятость** — на одно время нельзя создать две записи, даже для разных типов событий (пересечение → `409 Conflict`).
3. **Окно записи** — ближайшие 14 дней от текущей даты; вне окна → `422`.
4. **Таймзона** — единая фиксированная таймзона календаря (`Europe/Moscow`).

## Структура проекта

```
typespec/              # спецификация TypeSpec (3 файла)
dist/                  # генерируемый OpenAPI 3.0 (make spec)
backend/               # Flask бэкенд (Python ≥ 3.12 + SQLite)
├── app.py             # create_app, CORS, blueprints, catch-all маршрут
├── routes/            # guest_bp, admin_bp
└── errors.py          # обработка ошибок
frontend/              # React + Vite + Mantine фронтенд
├── src/
│   ├── api/           # API-клиент (fetch-обёртка)
│   ├── types/         # TypeScript-типы из OpenAPI
│   ├── pages/         # Страницы (Landing, GuestEventTypes, GuestBooking, BookingConfirmation, AdminEventTypes, AdminUpcoming)
│   ├── components/    # Переиспользуемые компоненты (Header, Layout, SlotPicker, BookingForm, CreateEventTypeModal, AdminSidebar)
│   └── App.tsx        # Роутинг + тёмная тема Mantine
Makefile               # автоматизация сборки
prism.yaml             # конфигурация Prism mock (опционально)
```

## Ключевые команды

```bash
# Установка зависимостей
make frontend-install

# Разработка (Flask backend + Vite dev server)
make dev               # make backend-run + make frontend-dev
make backend-run       # Flask на порту 8000
make frontend-dev      # Vite dev server на порту 3000

# Только фронтенд (без бэкенда)
make frontend-dev

# Спецификация
make spec              # компиляция TypeSpec → dist/openapi.yaml
make spec-watch        # режим слежения

# Сборка
make frontend-build    # production сборка

# Prism (опционально, для мокирования без бэкенда)
make prism-mock        # mock server (порт 4010)
make prism-proxy       # проксирование на бэкенд (порт 8000)
make prism-stop        # остановка Prism

# Просмотр спецификации
make openapi
```

## Запуск

1. **Установить зависимости:**
   ```bash
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

## Технологии

- **Бэкенд:** Flask (Python ≥ 3.12) + SQLite, отдаёт API и фронтенд
- **API-контракт:** TypeSpec → OpenAPI 3.0
- **Фронтенд:** React 19 + TypeScript + Vite + Mantine 9 (тёмная тема Cal.com-стиль)
- **Мокинг:** Prism (опционально, mock/proxy по OpenAPI)
- **Таймзона:** Europe/Moscow
