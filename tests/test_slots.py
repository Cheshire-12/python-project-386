from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from backend.app import create_app
from backend import models
from backend.services.slots import generate_slots, MSK, SLOT_STEP


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


class TestGenerateSlots:
    def test_returns_list_of_slots(self):
        slots = generate_slots(30)
        assert isinstance(slots, list)
        assert len(slots) > 0

    def test_slot_has_required_fields(self):
        slots = generate_slots(30)
        for slot in slots[:5]:
            assert "start" in slot
            assert "end" in slot
            assert "available" in slot
            assert isinstance(slot["available"], bool)

    def test_slot_end_equals_start_plus_duration(self):
        slots = generate_slots(30)
        for slot in slots[:5]:
            start = datetime.fromisoformat(slot["start"])
            end = datetime.fromisoformat(slot["end"])
            assert end - start == timedelta(minutes=30)

    def test_60_minute_event_uses_consecutive_slots(self):
        slots = generate_slots(60)
        for slot in slots[:5]:
            start = datetime.fromisoformat(slot["start"])
            end = datetime.fromisoformat(slot["end"])
            assert end - start == timedelta(minutes=60)

    def test_past_slots_are_unavailable(self):
        slots = generate_slots(30)
        now = datetime.now(timezone.utc)
        past_slots = [s for s in slots if datetime.fromisoformat(s["start"]) < now]
        for slot in past_slots:
            assert slot["available"] is False

    def test_with_existing_booking_marks_slot_unavailable(self):
        et = models.create_event_type("1on1", "desc", 30)
        now = datetime.now(timezone.utc)
        from_msk = now.astimezone(MSK).replace(hour=10, minute=0, second=0, microsecond=0)
        booking_start = from_msk.astimezone(timezone.utc)
        models.create_booking(et["id"], booking_start, "Alice")

        from_dt = now.replace(hour=0, minute=0, second=0, microsecond=0)
        to_dt = from_dt + timedelta(days=1)
        slots = generate_slots(30, from_dt=from_dt, to_dt=to_dt)
        booked_slot = next((s for s in slots if s["start"] == booking_start.isoformat()), None)
        if booked_slot:
            assert booked_slot["available"] is False

    def test_custom_from_to_window(self):
        now = datetime.now(timezone.utc)
        from_dt = now + timedelta(hours=1)
        to_dt = from_dt + timedelta(hours=2)
        slots = generate_slots(30, from_dt=from_dt, to_dt=to_dt)
        to_msk = to_dt.astimezone(MSK)
        for slot in slots:
            start = datetime.fromisoformat(slot["start"])
            start_msk = start.astimezone(MSK)
            assert start_msk < to_msk

    def test_slots_aligned_to_30_min_grid(self):
        now = datetime.now(timezone.utc)
        from_msk = now.astimezone(MSK).replace(hour=0, minute=0, second=0, microsecond=0)
        from_dt = from_msk.astimezone(timezone.utc)
        to_dt = from_dt + timedelta(hours=3)
        slots = generate_slots(30, from_dt=from_dt, to_dt=to_dt)
        for slot in slots:
            start = datetime.fromisoformat(slot["start"])
            start_msk = start.astimezone(MSK)
            assert start_msk.minute % 30 == 0
            assert start_msk.second == 0
