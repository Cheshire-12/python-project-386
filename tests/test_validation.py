from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from backend.app import create_app
from backend import models
from backend.errors import ValidationError
from backend.services.validation import (
    validate_booking_create,
    validate_event_type_create,
    validate_event_type_update,
)


@pytest.fixture()
def app(tmp_path):
    db_path = str(tmp_path / "test.db")
    app = create_app(database=db_path)
    with app.app_context():
        yield app


@pytest.fixture(autouse=True)
def _reset(app):
    models.reset()
    yield
    models.reset()


class TestValidateEventTypeCreate:
    def test_valid(self):
        validate_event_type_create({"name": "1on1", "description": "desc", "durationMinutes": 30})

    def test_missing_name(self):
        with pytest.raises(ValidationError) as exc_info:
            validate_event_type_create({"description": "desc", "durationMinutes": 30})
        assert any("name" in e for e in exc_info.value.details)

    def test_empty_name(self):
        with pytest.raises(ValidationError):
            validate_event_type_create({"name": "", "description": "desc", "durationMinutes": 30})

    def test_name_too_long(self):
        with pytest.raises(ValidationError):
            validate_event_type_create({"name": "x" * 101, "description": "desc", "durationMinutes": 30})

    def test_duplicate_name(self):
        models.create_event_type("dup", "desc", 30)
        with pytest.raises(ValidationError) as exc_info:
            validate_event_type_create({"name": "dup", "description": "other", "durationMinutes": 30})
        assert any("уже существует" in e for e in exc_info.value.details)

    def test_invalid_duration(self):
        with pytest.raises(ValidationError):
            validate_event_type_create({"name": "x", "description": "desc", "durationMinutes": 0})

    def test_missing_description(self):
        with pytest.raises(ValidationError):
            validate_event_type_create({"name": "x", "durationMinutes": 30})


class TestValidateEventTypeUpdate:
    def test_valid(self):
        et = models.create_event_type("old", "desc", 30)
        validate_event_type_update({"name": "old", "description": "new", "durationMinutes": 60}, et["id"])

    def test_same_name_same_id(self):
        et = models.create_event_type("old", "desc", 30)
        validate_event_type_update({"name": "old", "description": "new", "durationMinutes": 60}, et["id"])

    def test_same_name_different_id(self):
        models.create_event_type("a", "desc", 30)
        et_b = models.create_event_type("b", "desc", 30)
        with pytest.raises(ValidationError):
            validate_event_type_update({"name": "a", "description": "desc", "durationMinutes": 30}, et_b["id"])


class TestValidateBookingCreate:
    def test_valid(self):
        et = models.create_event_type("1on1", "desc", 30)
        future = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        validate_booking_create({"eventTypeId": et["id"], "startsAt": future, "guestName": "Alice"})

    def test_missing_event_type_id(self):
        with pytest.raises(ValidationError):
            validate_booking_create({"startsAt": "2026-01-01T10:00:00+00:00", "guestName": "Alice"})

    def test_nonexistent_event_type(self):
        with pytest.raises(ValidationError):
            validate_booking_create({"eventTypeId": 999, "startsAt": "2026-01-01T10:00:00+00:00", "guestName": "Alice"})

    def test_missing_starts_at(self):
        et = models.create_event_type("1on1", "desc", 30)
        with pytest.raises(ValidationError):
            validate_booking_create({"eventTypeId": et["id"], "guestName": "Alice"})

    def test_invalid_starts_at_format(self):
        et = models.create_event_type("1on1", "desc", 30)
        with pytest.raises(ValidationError):
            validate_booking_create({"eventTypeId": et["id"], "startsAt": "not-a-date", "guestName": "Alice"})

    def test_starts_at_without_timezone(self):
        et = models.create_event_type("1on1", "desc", 30)
        with pytest.raises(ValidationError) as exc_info:
            validate_booking_create({"eventTypeId": et["id"], "startsAt": "2026-01-01T10:00:00", "guestName": "Alice"})
        assert any("часовой зоне" in e for e in exc_info.value.details)

    def test_missing_guest_name(self):
        et = models.create_event_type("1on1", "desc", 30)
        future = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        with pytest.raises(ValidationError):
            validate_booking_create({"eventTypeId": et["id"], "startsAt": future})

    def test_starts_at_in_past(self):
        et = models.create_event_type("1on1", "desc", 30)
        past = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        with pytest.raises(ValidationError) as exc_info:
            validate_booking_create({"eventTypeId": et["id"], "startsAt": past, "guestName": "Alice"})
        assert any("прошлом" in e for e in exc_info.value.details)

    def test_starts_at_beyond_14_days(self):
        et = models.create_event_type("1on1", "desc", 30)
        too_later = (datetime.now(timezone.utc) + timedelta(days=15)).isoformat()
        with pytest.raises(ValidationError) as exc_info:
            validate_booking_create({"eventTypeId": et["id"], "startsAt": too_later, "guestName": "Alice"})
        assert any("14 дней" in e for e in exc_info.value.details)

    def test_starts_at_exactly_14_days_is_valid(self):
        et = models.create_event_type("1on1", "desc", 30)
        exactly = (datetime.now(timezone.utc) + timedelta(days=13, hours=23, minutes=59)).isoformat()
        validate_booking_create({"eventTypeId": et["id"], "startsAt": exactly, "guestName": "Alice"})

    def test_optional_phone_and_email(self):
        et = models.create_event_type("1on1", "desc", 30)
        future = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        validate_booking_create(
            {"eventTypeId": et["id"], "startsAt": future, "guestName": "Alice", "phone": None, "email": None}
        )

    def test_invalid_phone_type(self):
        et = models.create_event_type("1on1", "desc", 30)
        future = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        with pytest.raises(ValidationError):
            validate_booking_create({"eventTypeId": et["id"], "startsAt": future, "guestName": "Alice", "phone": 123})
