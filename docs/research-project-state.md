# Research: Project State Analysis

## 1. Project Structure Overview

```
python-project-386/
├── pyproject.toml              # Python deps (uv, hatchling): flask, flask-cors, gunicorn
├── uv.lock                     # Locked Python dependencies
├── Makefile                    # Build/dev automation (20+ targets)
├── prism.yaml                  # Prism mock config (port 4010)
├── docker-compose.yml          # Dev Docker: Flask (8000) + Vite (3000)
├── Dockerfile                  # Production multi-stage: Node build → Python runtime
├── AGENTS.md                   # AI agent instructions (authoritative spec)
├── README.md                   # Project documentation (169 lines)
├── CHANGELOG.md                # Release notes (v0.1.0 → v0.1.1)
├── typespec/                   # API contract (Design First)
│   ├── main.tsp                # Service definition (15 lines)
│   ├── models.tsp              # Data models (143 lines)
│   └── operations.tsp          # API operations (84 lines)
├── tsp-output/                 # Generated OpenAPI (from `tsp compile`)
│   └── @typespec/openapi3/openapi.yaml  # 390 lines
├── dist/                       # Intended output dir for `make spec` (currently empty/missing)
├── backend/                    # Flask backend (Python 3.12+)
│   ├── __init__.py
│   ├── app.py                  # create_app factory, CORS, blueprints, SPA catch-all (46 lines)
│   ├── errors.py               # ApiError hierarchy: NotFound, Conflict, Validation (39 lines)
│   ├── models.py               # SQLite storage layer (193 lines)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── guest.py            # Public API: 5 endpoints (86 lines)
│   │   └── admin.py            # Admin API: 5 endpoints (79 lines)
│   └── services/
│       ├── __init__.py
│       ├── slots.py            # 30-min slot generation, Europe/Moscow (53 lines)
│       └── validation.py       # Input validation (90 lines)
├── frontend/                   # React 19 + TypeScript + Vite 8 + Mantine 9
│   ├── package.json            # Dependencies & scripts
│   ├── package-lock.json
│   ├── index.html              # SPA entry point
│   ├── vite.config.ts          # Vite config: port 3000, /api proxy → :8000
│   ├── playwright.config.ts    # E2E test config
│   ├── tsconfig.json           # TS project references
│   ├── tsconfig.app.json       # App TS config (path alias @/)
│   ├── tsconfig.node.json
│   ├── .oxlintrc.json          # Linter config
│   └── src/
│       ├── main.tsx            # React entry (StrictMode)
│       ├── App.tsx             # Router + Mantine dark theme (51 lines)
│       ├── index.css           # Global styles (dark bg #18181b)
│       ├── types/
│       │   └── index.ts        # TS types matching OpenAPI models (48 lines)
│       ├── api/
│       │   ├── client.ts       # fetch wrapper with ApiError class (61 lines)
│       │   ├── eventTypes.ts   # Guest event types API (16 lines)
│       │   ├── bookings.ts     # Bookings API (8 lines)
│       │   └── admin.ts        # Admin API (24 lines)
│       ├── pages/
│       │   ├── LandingPage.tsx          # Hero + CTA (36 lines)
│       │   ├── GuestEventTypes.tsx      # Event list + search + create modal (190 lines)
│       │   ├── GuestBooking.tsx         # 3-panel booking: info/calendar/form (193 lines)
│       │   ├── BookingConfirmation.tsx  # Success page (120 lines)
│       │   ├── AdminEventTypes.tsx      # CRUD table + 3 modals (380 lines)
│       │   └── AdminUpcoming.tsx        # Upcoming meetings table (122 lines)
│       └── components/
│           ├── Layout.tsx               # AppShell wrapper (16 lines)
│           ├── Header.tsx               # Top nav bar (60 lines)
│           ├── AdminSidebar.tsx         # Admin navigation sidebar (54 lines)
│           ├── SlotPicker.tsx           # Calendar grid + time slot list (210 lines)
│           ├── BookingForm.tsx          # Name/email/phone form (99 lines)
│           └── CreateEventTypeModal.tsx # Create event modal (122 lines)
├── tests/
│   └── test_models.py          # Backend unit tests (163 lines)
├── frontend/tests/             # E2E tests (Playwright)
│   ├── fixtures/
│   │   ├── api.ts              # Test API helpers (70 lines)
│   │   └── test.ts             # Custom test fixtures (61 lines)
│   ├── landing.spec.ts         # Landing page tests (19 lines)
│   ├── event-types.spec.ts     # Event types CRUD tests (53 lines)
│   ├── admin.spec.ts           # Admin panel tests (66 lines)
│   └── booking.spec.ts         # Booking flow tests (39 lines)
├── data/                       # Runtime SQLite data (gitignored)
├── docs/
│   └── agents/                 # AI agent docs
│       ├── domain.md
│       ├── issue-tracker.md
│       └── triage-labels.md
└── .github/workflows/
    ├── e2e.yml                 # CI: Playwright E2E tests
    ├── release-please.yml      # CI: Automated releases
    ├── hexlet-check.yml        # Hexlet platform check (DO NOT EDIT)
    └── README.md               # Hexlet platform readme (DO NOT EDIT)
```

## 2. Current State of Implementation

**Overall: FULLY IMPLEMENTED.** The project is a complete, working Call Calendar application with all features described in AGENTS.md.

### Implementation Status by Component

| Component | Status | Notes |
|-----------|--------|-------|
| TypeSpec API contract | Complete | 3 files, 242 lines total |
| OpenAPI generation | Complete | `make spec` compiles, output in `tsp-output/` |
| Flask backend | Complete | All routes, models, services, error handling |
| SQLite models | Complete | `event_types` + `bookings` tables with CASCADE delete |
| Slot generation | Complete | 30-min grid, Europe/Moscow, 14-day window |
| Validation | Complete | Event type + booking validation |
| Guest API (5 endpoints) | Complete | List, get, slots, create booking, get booking |
| Admin API (5 endpoints) | Complete | CRUD event types, upcoming meetings |
| React frontend | Complete | All 6 pages, 6 components |
| Dark Cal.com theme | Complete | Mantine dark mode, custom colors |
| E2E tests (Playwright) | Complete | 4 spec files, 9 test cases |
| Backend unit tests | Complete | 16 test cases for models |
| Docker support | Complete | Multi-stage Dockerfile + docker-compose |
| CI/CD | Complete | E2E + Release Please workflows |
| Prism mock | Configured | `prism.yaml` present, Makefile targets |

## 3. Backend Analysis

### 3.1 App Factory (`backend/app.py`, lines 16-46)

- `create_app(frontend_dir, database)` — factory pattern
- CORS enabled, configurable via `CORS_ORIGINS` env var (default: `*`)
- Database path configurable via `DATABASE_URL` env (default: `data/calendar.db`)
- Blueprints registered at `/api` (guest) and `/api/admin` (admin)
- SPA catch-all route serves `frontend/dist/` (falls back to `index.html`)
- `app.py` uses `send_from_directory` for static file serving

### 3.2 Error Handling (`backend/errors.py`, lines 1-39)

Custom exception hierarchy:
- `ApiError(status_code, code, message, details)` — base class
- `NotFoundError` — 404, code `NOT_FOUND`
- `ConflictError` — 409, code `SLOT_BUSY`
- `ValidationError` — 400, code `VALIDATION_ERROR` (with optional `details[]`)
- Also handles 405 Method Not Allowed

All errors returned as JSON: `{ "code": "...", "message": "...", "details"?: [...] }`

### 3.3 SQLite Models (`backend/models.py`, lines 1-193)

**Schema** (lines 12-29):
- `event_types`: id (INTEGER PK AUTOINCREMENT), name (TEXT UNIQUE NOT NULL), description (TEXT NOT NULL DEFAULT ''), duration_minutes (INTEGER NOT NULL DEFAULT 30)
- `bookings`: id (INTEGER PK AUTOINCREMENT), event_type_id (INTEGER FK → event_types.id ON DELETE CASCADE), guest_name (TEXT NOT NULL), phone (TEXT), email (TEXT), starts_at (TEXT NOT NULL), created_at (TEXT NOT NULL)

**Functions:**
- `get_db()` — per-request SQLite connection with `Row` factory, foreign keys ON (line 32-38)
- `init_db(app)` — creates tables, registers teardown (line 47-53)
- `reset()` — clears all data + resets autoincrement (line 56-61, used by tests)
- `create_event_type(name, description, duration_minutes)` — returns dict with `durationMinutes` alias (line 64-77)
- `get_event_type(event_type_id)` — returns None if not found (line 80-86)
- `update_event_type(...)` — raises NotFoundError/ConflictError (line 89-107)
- `delete_event_type(event_type_id)` — cascades bookings, returns count or -1 (line 110-121)
- `list_event_types()` — all event types (line 124-129)
- `create_booking(event_type_id, starts_at, guest_name, phone, email)` — stores ISO timestamps (line 132-152)
- `get_booking(booking_id)` — with camelCase aliases (line 155-163)
- `list_all_bookings()` — all bookings (line 166-173)
- `find_conflicting_booking(starts_at, duration_minutes, exclude_booking_id)` — O(N) overlap check (line 176-193)

**Key design decisions:**
- Timestamps stored as TEXT (ISO 8601 strings), not native SQLite datetime
- Column aliases in SQL: `duration_minutes AS durationMinutes`, `event_type_id AS eventTypeId`
- `find_conflicting_booking` iterates all bookings in Python (N+1 queries per slot)
- Foreign keys enforced via `PRAGMA foreign_keys = ON`
- Cascade delete: deleting event type deletes all related bookings

### 3.4 Routes

**Guest API** (`backend/routes/guest.py`, lines 1-86):
| Method | Path | Handler | Status |
|--------|------|---------|--------|
| GET | `/api/event-types` | `list_types()` | Returns `list_event_types()` |
| GET | `/api/event-types/<id>` | `get_type()` | Returns single event type or 404 |
| GET | `/api/event-types/<id>/slots` | `list_slots()` | Parses `from`/`to` query params, generates slots |
| POST | `/api/bookings` | `create()` | Validates, checks conflicts, creates booking (201) |
| GET | `/api/bookings/<id>` | `get_booking_by_id()` | Returns booking or 404 |

**Admin API** (`backend/routes/admin.py`, lines 1-79):
| Method | Path | Handler | Status |
|--------|------|---------|--------|
| GET | `/api/admin/event-types` | `list_types()` | Same as guest |
| POST | `/api/admin/event-types` | `create_type()` | Validates + creates (201) |
| PUT | `/api/admin/event-types/<id>` | `update_type()` | Validates + updates |
| DELETE | `/api/admin/event-types/<id>` | `delete_type()` | Returns `{ deletedBookings }` |
| GET | `/api/admin/bookings/upcoming` | `upcoming()` | Filters future bookings, sorted by startsAt |

### 3.5 Services

**Slot Generation** (`backend/services/slots.py`, lines 1-53):
- `MSK = timezone(timedelta(hours=3))` — hardcoded Europe/Moscow
- `SLOT_STEP = 30 minutes` — fixed grid
- `DEFAULT_WINDOW_DAYS = 14`
- `generate_slots(duration_minutes, from_dt, to_dt)`:
  - Aligns to start of day in MSK timezone
  - Steps through 30-min grid from start_of_day to to_dt
  - Checks each slot against current bookings via `find_conflicting_booking`
  - Marks slots as unavailable if: in the past OR conflicting booking exists
  - Returns `[{ start, end, available }]` in UTC ISO format

**Validation** (`backend/services/validation.py`, lines 1-90):
- `validate_event_type_create(data)`:
  - name: string, 1-100 chars, unique
  - description: non-empty string
  - durationMinutes: integer >= 1
- `validate_event_type_update(data, exclude_id)`:
  - Same as create but allows current ID in uniqueness check
- `validate_booking_create(data)`:
  - eventTypeId: positive integer, must exist
  - startsAt: ISO 8601 string with timezone
  - guestName: non-empty string
  - phone: optional string
  - email: optional string
  - All errors collected and raised together as ValidationError with details

## 4. Frontend Analysis

### 4.1 Dependencies (`frontend/package.json`)

**Runtime:**
- react 19.2.8, react-dom 19.2.8
- react-router-dom 7.18.3
- @mantine/core 9.5.2, @mantine/hooks 9.5.2, @mantine/notifications 9.6.0
- @tabler/icons-react 3.46.0
- dayjs 1.11.23

**Dev:**
- vite 8.2.2, @vitejs/plugin-react 6.1.0
- typescript 6.0.2
- @playwright/test 1.62.1
- oxlint 1.79.0
- @typespec/compiler 1.15.0 (for spec compilation)

### 4.2 App Structure (`frontend/src/App.tsx`)

- MantineProvider with dark theme, blue primary color
- BrowserRouter with 6 routes inside Layout wrapper:
  - `/` → LandingPage
  - `/event-types` → GuestEventTypes
  - `/event-types/:id` → GuestBooking
  - `/bookings/:id` → BookingConfirmation
  - `/admin/event-types` → AdminEventTypes
  - `/admin/upcoming` → AdminUpcoming

### 4.3 TypeScript Types (`frontend/src/types/index.ts`, lines 1-48)

Manually defined, matching TypeSpec models:
- `EntityId = number`
- `EventType { id, name, description, durationMinutes }`
- `EventTypeCreate { name, description, durationMinutes }`
- `Slot { start, end, available }`
- `Booking { id, eventTypeId, guestName, phone?, email?, startsAt, createdAt }`
- `BookingCreate { eventTypeId, startsAt, guestName, phone?, email? }`
- `UpcomingMeetings { bookings: Booking[] }`
- `ApiError { code, message, details? }`

### 4.4 API Client (`frontend/src/api/`)

**client.ts** (61 lines):
- `BASE_URL = '/api'`
- Custom `ApiError` class with `status`, `code`, `details`
- `request<T>(path, options)` — fetch wrapper with JSON parsing, error handling
- Handles 204 No Content, empty body responses
- Exports `api` object with `get`, `post`, `put`, `delete` methods

**eventTypes.ts** (16 lines):
- `list()` → GET `/event-types`
- `get(id)` → GET `/event-types/:id`
- `listSlots(id, from?, to?)` → GET `/event-types/:id/slots?from=...&to=...`

**bookings.ts** (8 lines):
- `create(data)` → POST `/bookings`
- `get(id)` → GET `/bookings/:id`

**admin.ts** (24 lines):
- `eventTypes.list()`, `.create()`, `.update()`, `.delete()`
- `bookings.upcoming(from?)` → GET `/admin/bookings/upcoming`

### 4.5 Pages

**LandingPage.tsx** (36 lines): Hero with title, description, CTA button, timezone badge.

**GuestEventTypes.tsx** (190 lines):
- Fetches event types on mount
- Search filter (name + description)
- Card-based list with name, description, duration badge
- "Book" button links to `/event-types/:id`
- "Copy link" action with clipboard API + notification
- Create button opens CreateEventTypeModal
- Loading/error states

**GuestBooking.tsx** (193 lines):
- 3-panel layout (Cal.com style):
  - Left: Event info (name, description, duration, timezone selector)
  - Center+Right: SlotPicker calendar + time slots, BookingForm
- Timezone selector (6 options, default Europe/Moscow) — cosmetic only, doesn't convert slots
- Fetches event type + slots on mount
- On submit: creates booking, navigates to confirmation
- Error handling for both fetch and submit

**BookingConfirmation.tsx** (120 lines):
- Fetches booking by ID
- Displays: success badge, name, email, phone, time, booking ID
- "Back to events" link

**AdminEventTypes.tsx** (380 lines):
- AdminSidebar + content area (3-column grid)
- Table: ID, Name, Description, Duration, Actions (edit/delete)
- Create modal: name, description, duration fields
- Edit modal: same fields, pre-filled
- Delete confirmation modal with cascade warning
- Notifications on delete success

**AdminUpcoming.tsx** (122 lines):
- AdminSidebar + content area
- Fetches upcoming bookings + event types
- Table: Guest (name), Time (formatted), Event Name (looked up from map), Contacts (email, phone)
- Loading/error/empty states

### 4.6 Components

**Layout.tsx** (16 lines): Mantine AppShell with 60px header, padding "md".

**Header.tsx** (60 lines): Top bar with logo "Календарь звонков", "События" link, "Админ" link. Active state highlighting based on `location.pathname`.

**AdminSidebar.tsx** (54 lines): 240px sidebar with "Типы событий" and "Предстоящие встречи" nav items.

**SlotPicker.tsx** (210 lines):
- Two-panel: calendar grid (left) + time slot list (right)
- Monthly calendar with day navigation, dots for available dates
- Time slots: 12h/24h toggle, green dots for available, filled green for selected
- Custom dark theme styling throughout

**BookingForm.tsx** (99 lines):
- Name (required), Email (required), Phone (optional)
- Displays selected slot info
- Submit button with loading overlay

**CreateEventTypeModal.tsx** (122 lines):
- Name, Description, Duration fields
- Calls `adminApi.eventTypes.create()`
- Error display, loading state

### 4.7 Vite Configuration (`frontend/vite.config.ts`)

- React plugin
- Path alias: `@` → `./src`
- Dev server: port 3000
- Proxy: `/api` → `http://localhost:8000` (Flask backend)

## 5. API Specification

### 5.1 TypeSpec Files

**models.tsp** (143 lines):
- `EntityId` scalar extends int32
- `EventType` — id, name (1-100), description (min 1), durationMinutes (min 1)
- `EventTypeCreate` — same minus id
- `Slot` — start/end (utcDateTime), available (boolean)
- `Booking` — id, eventTypeId, guestName, phone?, email?, startsAt, createdAt
- `BookingCreate` — eventTypeId, startsAt, guestName, phone?, email?
- `UpcomingMeetings` — { bookings: Booking[] }
- `Created<T>` — 201 wrapper
- `NotFoundError` — 404
- `ConflictError` — 409, SLOT_BUSY
- `ValidationError` — 400, details?: string[]

**operations.tsp** (84 lines):
- Guest: `GET /event-types`, `GET /event-types/{id}`, `GET /event-types/{id}/slots`, `POST /bookings`, `GET /bookings/{id}`
- Admin: `GET /admin/event-types`, `POST /admin/event-types`, `PUT /admin/event-types/{id}`, `DELETE /admin/event-types/{id}`, `GET /admin/bookings/upcoming`

### 5.2 Generated OpenAPI (`tsp-output/@typespec/openapi3/openapi.yaml`, 390 lines)

- OpenAPI 3.0.0
- **Note:** Server URL incorrectly says `http://localhost:5000` (should be 8000)
- All 10 endpoints properly defined
- Request/response schemas match TypeSpec models
- Error responses documented

## 6. What's Missing / Needs Implementation

### 6.1 Critical Issues

1. **`dist/openapi.yaml` missing** — The `dist/` directory is gitignored and doesn't exist in the repo. Running `make spec` compiles TypeSpec but outputs to `tsp-output/` directory, then copies to `dist/openapi.yaml`. The Makefile `spec` target (line 3-6) expects the output at `dist/@typespec/openapi3/openapi.yaml` but the current TypeSpec output goes to `tsp-output/@typespec/openapi3/openapi.yaml`. This is a **build path mismatch** — the Makefile `spec` target will fail or produce incorrect results.

2. **OpenAPI server URL mismatch** — The generated OpenAPI at `tsp-output/@typespec/openapi3/openapi.yaml` line 388-390 says `http://localhost:5000`, but the actual backend runs on port 8000. The TypeSpec `main.tsp` line 12-14 defines `http://localhost:8000`, so this may be a stale cached output.

3. **No `dist/` directory for Prism** — `prism.yaml` references `dist/openapi.yaml`, and `Makefile` prism targets use `dist/openapi.yaml`. Without running `make spec`, Prism won't work.

### 6.2 Backend Gaps

4. **No booking window validation** — `validate_booking_create()` in `validation.py` (lines 57-90) does NOT check if `startsAt` falls within the 14-day booking window. The AGENTS.md spec says "Окно записи: Ближайшие 14 дней от текущей даты. Вне окна -> 422 ValidationError." This validation rule is **not enforced**.

5. **N+1 query in slot generation** — `slots.py` line 41 calls `find_conflicting_booking()` for each 30-min slot, which in `models.py` line 183-192 iterates ALL bookings and for each calls `get_event_type()`. For a 14-day window with 672 slots, this could be extremely slow.

6. **`find_conflicting_booking` N+1 in event type lookup** — `models.py` line 187: `et = get_event_type(b["eventTypeId"])` is called inside a loop over all bookings. Should be optimized with a cache or JOIN.

7. **No booking cancellation endpoint** — The spec doesn't explicitly require it, but there's no way to cancel a booking.

8. **No authentication** — By design (spec says "авторизация в системе отсутствует"), but admin endpoints are completely open.

### 6.3 Frontend Gaps

9. **Timezone selector is cosmetic only** — `GuestBooking.tsx` line 38 stores timezone selection but never passes it to the API or converts slot times. The time is always displayed in UTC regardless of selection.

10. **Email field required in BookingForm but optional in API** — `BookingForm.tsx` line 78 has `required` on the email field, but the API spec allows optional email. This is a UX decision (not necessarily wrong, but differs from spec).

11. **No responsive design for 3-panel layout** — `GuestBooking.tsx` lines 102-111 use a hardcoded flex layout with `maxWidth: 1200` that may not work well on mobile.

12. **Inline styles throughout** — Heavy use of `style={{}}` instead of Mantine's `sx` prop or CSS modules. Not necessarily wrong but inconsistent with Mantine best practices.

13. **No error handling for slot loading failure** — `GuestBooking.tsx` line 59: `.catch(() => {})` silently swallows errors when fetching slots.

### 6.4 Testing Gaps

14. **No backend route tests** — `tests/test_models.py` only tests the models layer. There are no tests for Flask routes (HTTP request/response testing with Flask test client).

15. **No validation service tests** — `backend/services/validation.py` is untested directly.

16. **No slot generation tests** — `backend/services/slots.py` is untested.

17. **E2E tests are basic** — 9 test cases total, covering happy paths. No edge case testing (conflict detection, validation errors, past slot booking).

### 6.5 Build/Config Issues

18. **Makefile `spec` target may not work** — The `tsp compile` command outputs to `dist/@typespec/openapi3/openapi.yaml` but the actual TypeSpec output seems to go to `tsp-output/`. Need to verify if the `--output-dir dist` flag works correctly.

19. **`frontend/index.html` has wrong title** — Line 7: `<title>frontend</title>` should be `<title>Календарь звонков</title>`.

## 7. Key Code Patterns and Conventions

### Backend Patterns

1. **Factory pattern** — `create_app()` with optional `frontend_dir` and `database` params for testing
2. **Request-scoped DB** — `get_db()` uses Flask's `g` object for per-request connection
3. **Blueprint organization** — Guest and Admin separated into different blueprints
4. **Service layer** — Business logic in `services/` (slots, validation), separate from routes
5. **Error hierarchy** — Custom `ApiError` subclasses with HTTP status codes and error codes
6. **SQL aliases** — Column aliases in SQL queries to match camelCase API response format (`duration_minutes AS durationMinutes`)
7. **Cascade delete** — SQLite `ON DELETE CASCADE` + manual cleanup in `delete_event_type()`

### Frontend Patterns

1. **API client abstraction** — Centralized `api` object with typed methods, custom `ApiError` class
2. **Component co-location** — Pages in `pages/`, reusable components in `components/`
3. **TypeScript types** — Manual types in `types/index.ts` matching OpenAPI models
4. **Mantine dark theme** — Custom color palette, inline dark bg colors (`#18181b`, `#25262b`, `#1a1b1e`)
5. **React hooks** — `useState`/`useEffect` for state management (no Redux/Zustand)
6. **Path aliases** — `@/` mapped to `./src/` in Vite + TypeScript

### Testing Patterns

1. **E2E with fixtures** — Playwright test fixtures for creating test data (`createTestEvent`, `createTestBooking`, `getAvailableSlot`)
2. **Auto-start servers** — Playwright config auto-starts Flask + Vite
3. **Backend unit tests** — pytest with `tmp_path` fixture for isolated SQLite DB
4. **Reset between tests** — `models.reset()` called before/after each test

### Git/CI Patterns

1. **Conventional Commits** — Enforced via AGENTS.md, Release Please integration
2. **Release Please** — Automated version bumps + CHANGELOG generation
3. **E2E CI** — GitHub Actions runs Playwright on push/PR to main
4. **DO NOT EDIT** — `.github/workflows/hexlet-check.yml` and `README.md` are Hexlet platform files

### Important Gotchas

- **Port 5000 on macOS** is occupied by AirPlay, so Flask runs on port 8000
- **SQLite data** in `data/calendar.db` is gitignored — each environment starts fresh
- **Prism** can mock the API before the backend is ready — useful for frontend-only development
- **Vite proxies** `/api` requests to Flask on port 8000 in dev mode
- **All datetime in API** is passed as `utcDateTime`, server interprets in Europe/Moscow timezone
