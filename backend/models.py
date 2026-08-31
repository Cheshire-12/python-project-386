from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


_event_types: dict[int, dict[str, Any]] = {}
_bookings: dict[int, dict[str, Any]] = {}
_event_type_counter: int = 0
_booking_counter: int = 0


def reset() -> None:
    global _event_type_counter, _booking_counter
    _event_types.clear()
    _bookings.clear()
    _event_type_counter = 0
    _booking_counter = 0


def next_event_type_id() -> int:
    global _event_type_counter
    _event_type_counter += 1
    return _event_type_counter


def next_booking_id() -> int:
    global _booking_counter
    _booking_counter += 1
    return _booking_counter


def create_event_type(name: str, description: str, duration_minutes: int) -> dict[str, Any]:
    for et in _event_types.values():
        if et["name"] == name:
            from backend.errors import ConflictError
            raise ConflictError(f"Тип события с именем '{name}' уже существует")
    et = {
        "id": next_event_type_id(),
        "name": name,
        "description": description,
        "durationMinutes": duration_minutes,
    }
    _event_types[et["id"]] = et
    return et


def get_event_type(event_type_id: int) -> dict[str, Any] | None:
    return _event_types.get(event_type_id)


def list_event_types() -> list[dict[str, Any]]:
    return list(_event_types.values())


def create_booking(
    event_type_id: int,
    starts_at: datetime,
    guest_name: str,
    phone: str | None = None,
    email: str | None = None,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    booking = {
        "id": next_booking_id(),
        "eventTypeId": event_type_id,
        "guestName": guest_name,
        "startsAt": starts_at.isoformat(),
        "createdAt": now.isoformat(),
    }
    if phone:
        booking["phone"] = phone
    if email:
        booking["email"] = email
    _bookings[booking["id"]] = booking
    return booking


def get_booking(booking_id: int) -> dict[str, Any] | None:
    return _bookings.get(booking_id)


def list_all_bookings() -> list[dict[str, Any]]:
    return list(_bookings.values())


def find_conflicting_booking(
    starts_at: datetime,
    duration_minutes: int,
    exclude_booking_id: int | None = None,
) -> dict[str, Any] | None:
    new_start = starts_at
    new_end = starts_at + timedelta(minutes=duration_minutes)
    for b in _bookings.values():
        if exclude_booking_id is not None and b["id"] == exclude_booking_id:
            continue
        b_start = datetime.fromisoformat(b["startsAt"])
        et = get_event_type(b["eventTypeId"])
        if et is None:
            continue
        b_end = b_start + timedelta(minutes=et["durationMinutes"])
        if new_start < b_end and new_end > b_start:
            return b
    return None
