# ADR-0004: Design First — TypeSpec экспортирует OpenAPI, JSON Schema и клиентский SDK

- **Статус:** принято
- **Дата:** 2026-09-01 (обновлено 2026-09-08)

## Контекст

API-контракт задан до реализации, и все части (frontend, backend, моки) должны жить в одном источнике истины.

## Решение

Используется TypeSpec (Design First) как источник контракта:

1. `typespec/*.tsp` → (эмиттер `@typespec/openapi3`) → `dist/openapi.yaml` — OpenAPI 3.0 (для Prism, документации, кодогенерации).
2. `typespec/*.tsp` → (эмиттер `@typespec/json-schema`, `emitAllModels`) → `backend/generated/schemas/*.json` — JSON Schema для **серверной валидации** тел запросов (`jsonschema` в `backend/services/validation.py`), принимаются только данные, удовлетворяющие контракту.
3. `dist/openapi.yaml` → (`openapi-typescript`) → `frontend/src/types/generated/schema.ts` — типизированный **клиентский SDK**: приложение типизируется по контракту, ручные типы отсутствуют (слой re-export в `src/types/index.ts`).

Генерируемые артефакты коммитятся; CI (`lint.yml`, job `contract-sync`): перегенерирует артефакты и проверяет `git diff --exit-code`, чтобы они не расходились с контрактом.

Опциональные поля `phone`/`email` в контракте объявлены как `string | null` — при отсутствии значения клиент опускает ключ, сервер принимает и `null`, и отсутствие.

## Последствия

- Единый источник истины: изменение API начинается с `typespec/*.tsp`.
- Backend-валидация по генерируемым схемам + доменные правила (окно, конфликт) в Python.
- Frontend-типы генерируются, а не размножаются вручную.
- `make spec` / `make client` пересобирают артефакты; для TypeSpec используется `tspconfig.yaml` (эмиттеры + output-dir).