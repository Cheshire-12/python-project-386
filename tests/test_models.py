from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from backend import models
from backend.app import create_app
from backend.errors import ConflictError, NotFoundError


@pytest.fixture()
def app(tmp_path):
    db_path = str(tmp_path / "test.db")
    app = create_app(database=db_path)
    app.config["TESTING"] = True
    with app.app_context():
        yield app


@pytest.fixture(autouse=True)
def _reset_models(app):
    models.reset()
    yield
    models.reset()


class TestEventTypes:
    def test_create_and_get(self):
        et = models.create_event_type("1on1", "Weekly sync", 30)
        assert et["id"] == 1
        assert et["name"] == "1on1"
        assert et["description"] == "Weekly sync"
        assert et["durationMinutes"] == 30

        fetched = models.get_event_type(et["id"])
        assert fetched == et

    def test_get_nonexistent_returns_none(self):
        assert models.get_event_type(999) is None

    def test_list_event_types(self):
        models.create_event_type("a", "desc a", 30)
        models.create_event_type("b", "desc b", 60)
        result = models.list_event_types()
        assert len(result) == 2
        names = {et["name"] for et in result}
        assert names == {"a", "b"}

    def test_create_duplicate_name_raises_conflict(self):
        models.create_event_type("dup", "desc", 30)
        with pytest.raises(ConflictError):
            models.create_event_type("dup", "other", 45)

    def test_update_event_type(self):
        et = models.create_event_type("old", "old desc", 30)
        updated = models.update_event_type(et["id"], "new", "new desc", 60)
        assert updated["name"] == "new"
        assert updated["description"] == "new desc"
        assert updated["durationMinutes"] == 60

        fetched = models.get_event_type(et["id"])
        assert fetched["name"] == "new"

    def test_update_nonexistent_raises_not_found(self):
        with pytest.raises(NotFoundError):
            models.update_event_type(999, "x", "y", 30)

    def test_update_duplicate_name_raises_conflict(self):
        models.create_event_type("a", "desc a", 30)
        et_b = models.create_event_type("b", "desc b", 30)
        with pytest.raises(ConflictError):
            models.update_event_type(et_b["id"], "a", "desc b", 30)

    def test_delete_event_type(self):
        et = models.create_event_type("del", "desc", 30)
        deleted = models.delete_event_type(et["id"])
        assert deleted == 0
        assert models.get_event_type(et["id"]) is None

    def test_delete_cascades_bookings(self):
        et = models.create_event_type("del", "desc", 30)
        now = datetime.now(UTC)
        models.create_booking(et["id"], now + timedelta(hours=1), "guest")
        models.create_booking(et["id"], now + timedelta(hours=2), "guest2")
        deleted = models.delete_event_type(et["id"])
        assert deleted == 2

    def test_delete_nonexistent_returns_negative(self):
        assert models.delete_event_type(999) == -1


class TestBookings:
    def test_create_and_get(self):
        et = models.create_event_type("mtg", "meeting", 30)
        starts = datetime.now(UTC) + timedelta(hours=1)
        b = models.create_booking(et["id"], starts, "Alice", phone="123", email="a@b.com")
        assert b["id"] == 1
        assert b["eventTypeId"] == et["id"]
        assert b["guestName"] == "Alice"
        assert b["phone"] == "123"
        assert b["email"] == "a@b.com"
        assert "startsAt" in b
        assert "createdAt" in b

        fetched = models.get_booking(b["id"])
        assert fetched == b

    def test_create_booking_optional_fields(self):
        et = models.create_event_type("mtg", "meeting", 30)
        starts = datetime.now(UTC) + timedelta(hours=1)
        b = models.create_booking(et["id"], starts, "Bob")
        assert b["guestName"] == "Bob"
        assert b["phone"] is None
        assert b["email"] is None

    def test_get_booking_nonexistent_returns_none(self):
        assert models.get_booking(999) is None

    def test_list_all_bookings(self):
        et = models.create_event_type("mtg", "meeting", 30)
        now = datetime.now(UTC)
        models.create_booking(et["id"], now + timedelta(hours=1), "a")
        models.create_booking(et["id"], now + timedelta(hours=2), "b")
        result = models.list_all_bookings()
        assert len(result) == 2


class TestConflictDetection:
    def test_no_conflict_when_slots_disjoint(self):
        et = models.create_event_type("mtg", "meeting", 30)
        now = datetime.now(UTC)
        models.create_booking(et["id"], now + timedelta(hours=1), "a")
        conflict = models.find_conflicting_booking(now + timedelta(hours=2), 30)
        assert conflict is None

    def test_conflict_when_slots_overlap(self):
        et = models.create_event_type("mtg", "meeting", 30)
        now = datetime.now(UTC)
        models.create_booking(et["id"], now + timedelta(hours=1), "a")
        conflict = models.find_conflicting_booking(now + timedelta(hours=1), 30)
        assert conflict is not None

    def test_exclude_booking_from_conflict_check(self):
        et = models.create_event_type("mtg", "meeting", 30)
        now = datetime.now(UTC)
        b = models.create_booking(et["id"], now + timedelta(hours=1), "a")
        conflict = models.find_conflicting_booking(
            now + timedelta(hours=1), 30, exclude_booking_id=b["id"]
        )
        assert conflict is None


class TestReset:
    def test_reset_clears_all_data(self):
        et = models.create_event_type("mtg", "meeting", 30)
        now = datetime.now(UTC)
        models.create_booking(et["id"], now + timedelta(hours=1), "a")
        models.reset()
        assert models.list_event_types() == []
        assert models.list_all_bookings() == []
