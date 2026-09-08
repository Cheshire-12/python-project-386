from __future__ import annotations

import os
import sqlite3
from datetime import UTC, datetime, timedelta
from typing import Any

from flask import current_app, g

from backend.errors import ConflictError, NotFoundError

SCHEMA = """
CREATE TABLE IF NOT EXISTS event_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    duration_minutes INTEGER NOT NULL DEFAULT 30
);

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    starts_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        db = sqlite3.connect(current_app.config["DATABASE"])
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        g.db = db
    return g.db


def close_db(e: Any = None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app: Any) -> None:
    db_path = app.config["DATABASE"]
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    db = sqlite3.connect(db_path)
    db.executescript(SCHEMA)
    db.close()
    app.teardown_appcontext(close_db)


def reset() -> None:
    db = get_db()
    db.execute("DELETE FROM bookings")
    db.execute("DELETE FROM event_types")
    db.execute("DELETE FROM sqlite_sequence WHERE name IN ('event_types', 'bookings')")
    db.commit()


def create_event_type(name: str, description: str, duration_minutes: int) -> dict[str, Any]:
    db = get_db()
    try:
        cur = db.execute(
            "INSERT INTO event_types (name, description, duration_minutes) VALUES (?, ?, ?)",
            (name, description, duration_minutes),
        )
        db.commit()
    except sqlite3.IntegrityError:
        raise ConflictError(f"Тип события с именем '{name}' уже существует")
    return dict(db.execute(
        "SELECT id, name, description, duration_minutes AS durationMinutes FROM event_types WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone())


def get_event_type(event_type_id: int) -> dict[str, Any] | None:
    db = get_db()
    row = db.execute(
        "SELECT id, name, description, duration_minutes AS durationMinutes FROM event_types WHERE id = ?",
        (event_type_id,),
    ).fetchone()
    return dict(row) if row else None


def update_event_type(
    event_type_id: int, name: str, description: str, duration_minutes: int
) -> dict[str, Any]:
    db = get_db()
    existing = db.execute("SELECT id FROM event_types WHERE id = ?", (event_type_id,)).fetchone()
    if existing is None:
        raise NotFoundError(f"Тип события {event_type_id} не найден")
    try:
        db.execute(
            "UPDATE event_types SET name = ?, description = ?, duration_minutes = ? WHERE id = ?",
            (name, description, duration_minutes, event_type_id),
        )
        db.commit()
    except sqlite3.IntegrityError:
        raise ConflictError(f"Тип события с именем '{name}' уже существует")
    return dict(db.execute(
        "SELECT id, name, description, duration_minutes AS durationMinutes FROM event_types WHERE id = ?",
        (event_type_id,),
    ).fetchone())


def delete_event_type(event_type_id: int) -> int:
    db = get_db()
    existing = db.execute("SELECT id FROM event_types WHERE id = ?", (event_type_id,)).fetchone()
    if existing is None:
        return -1
    count = db.execute(
        "SELECT COUNT(*) FROM bookings WHERE event_type_id = ?", (event_type_id,)
    ).fetchone()[0]
    db.execute("DELETE FROM bookings WHERE event_type_id = ?", (event_type_id,))
    db.execute("DELETE FROM event_types WHERE id = ?", (event_type_id,))
    db.commit()
    return count


def list_event_types() -> list[dict[str, Any]]:
    db = get_db()
    rows = db.execute(
        "SELECT id, name, description, duration_minutes AS durationMinutes FROM event_types"
    ).fetchall()
    return [dict(r) for r in rows]


def create_booking(
    event_type_id: int,
    starts_at: datetime,
    guest_name: str,
    phone: str | None = None,
    email: str | None = None,
) -> dict[str, Any]:
    db = get_db()
    now = datetime.now(UTC).isoformat()
    cur = db.execute(
        "INSERT INTO bookings (event_type_id, guest_name, phone, email, starts_at, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (event_type_id, guest_name, phone, email, starts_at.isoformat(), now),
    )
    db.commit()
    return dict(db.execute(
        "SELECT id, event_type_id AS eventTypeId, guest_name AS guestName, "
        "phone, email, starts_at AS startsAt, created_at AS createdAt "
        "FROM bookings WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone())


def get_booking(booking_id: int) -> dict[str, Any] | None:
    db = get_db()
    row = db.execute(
        "SELECT id, event_type_id AS eventTypeId, guest_name AS guestName, "
        "phone, email, starts_at AS startsAt, created_at AS createdAt "
        "FROM bookings WHERE id = ?",
        (booking_id,),
    ).fetchone()
    return dict(row) if row else None


def list_all_bookings() -> list[dict[str, Any]]:
    db = get_db()
    rows = db.execute(
        "SELECT id, event_type_id AS eventTypeId, guest_name AS guestName, "
        "phone, email, starts_at AS startsAt, created_at AS createdAt "
        "FROM bookings"
    ).fetchall()
    return [dict(r) for r in rows]


def find_conflicting_booking(
    starts_at: datetime,
    duration_minutes: int,
    exclude_booking_id: int | None = None,
) -> dict[str, Any] | None:
    new_start = starts_at
    new_end = starts_at + timedelta(minutes=duration_minutes)
    event_types = {et["id"]: et for et in list_event_types()}
    for b in list_all_bookings():
        if exclude_booking_id is not None and b["id"] == exclude_booking_id:
            continue
        b_start = datetime.fromisoformat(b["startsAt"])
        et = event_types.get(b["eventTypeId"])
        if et is None:
            continue
        b_end = b_start + timedelta(minutes=et["durationMinutes"])
        if new_start < b_end and new_end > b_start:
            return b
    return None
