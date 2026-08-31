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
dist/                  # генерируемый OpenAPI 3.0 (npm run spec)
frontend/              # React + Vite + Mantine фронтенд
├── src/
│   ├── api/           # API-клиент (fetch-обёртка)
│   ├── types/         # TypeScript-типы из OpenAPI
│   ├── pages/         # Страницы (Landing, Guest, Admin)
│   ├── components/    # Переиспользуемые компоненты
│   └── App.tsx        # Роутинг
Makefile               # автоматизация сборки
prism.yaml             # конфигурация Prism mock
```

## Ключевые команды

```bash
# Установка зависимостей
make frontend-install

# Разработка (Prism mock + Vite dev server)
make dev

# Только Vite dev server (без Prism)
make frontend-dev

# Спецификация
make spec              # компиляция TypeSpec → dist/openapi.yaml
make spec-watch        # режим слежения

# Сборка
make frontend-build    #.production сборка

# Prism
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
   - Vite dev server: `http://localhost:3000`
   - Prism mock: `http://localhost:4010`

4. **Открыть в браузере:** `http://localhost:3000`

## Технологии

- **Бэкенд:** Flask (Python ≥ 3.12) + SQLite (пока не реализован)
- **API-контракт:** TypeSpec → OpenAPI 3.0
- **Фронтенд:** React 19 + TypeScript + Vite + Mantine 9
- **Мокинг:** Prism (mock/proxy по OpenAPI)
- **Таймзона:** Europe/Moscow
