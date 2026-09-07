from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from backend.app import create_app
from backend import models


@pytest.fixture()
def app(tmp_path):
    db_path = str(tmp_path / "test.db")
    app = create_app(database=db_path)
    app.config["TESTING"] = True
    with app.app_context():
        yield app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def _reset(app):
    models.reset()
    yield
    models.reset()


def _future_iso(hours=1):
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


class TestGuestEventTypes:
    def test_list_empty(self, client):
        resp = client.get("/api/event-types")
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_list_with_data(self, client):
        models.create_event_type("1on1", "Weekly sync", 30)
        models.create_event_type("standup", "Daily standup", 15)
        resp = client.get("/api/event-types")
        assert resp.status_code == 200
        names = {et["name"] for et in resp.get_json()}
        assert names == {"1on1", "standup"}

    def test_get_existing(self, client):
        et = models.create_event_type("1on1", "Weekly sync", 30)
        resp = client.get(f"/api/event-types/{et['id']}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "1on1"
        assert data["durationMinutes"] == 30

    def test_get_nonexistent(self, client):
        resp = client.get("/api/event-types/999")
        assert resp.status_code == 404
        assert resp.get_json()["code"] == "NOT_FOUND"


class TestGuestSlots:
    def test_list_slots(self, client):
        et = models.create_event_type("1on1", "Weekly sync", 30)
        resp = client.get(f"/api/event-types/{et['id']}/slots")
        assert resp.status_code == 200
        slots = resp.get_json()
        assert len(slots) > 0
        for slot in slots:
            assert "start" in slot
            assert "end" in slot
            assert "available" in slot

    def test_list_slots_nonexistent_event_type(self, client):
        resp = client.get("/api/event-types/999/slots")
        assert resp.status_code == 404


class TestGuestBookings:
    def test_create_booking(self, client):
        et = models.create_event_type("1on1", "Weekly sync", 30)
        resp = client.post(
            "/api/bookings",
            json={
                "eventTypeId": et["id"],
                "startsAt": _future_iso(1),
                "guestName": "Alice",
                "email": "alice@example.com",
                "phone": "123",
            },
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["guestName"] == "Alice"
        assert data["eventTypeId"] == et["id"]

    def test_create_booking_missing_fields(self, client):
        resp = client.post("/api/bookings", json={})
        assert resp.status_code == 400
        assert resp.get_json()["code"] == "VALIDATION_ERROR"

    def test_create_booking_conflict(self, client):
        et = models.create_event_type("1on1", "Weekly sync", 30)
        starts = _future_iso(1)
        client.post(
            "/api/bookings",
            json={"eventTypeId": et["id"], "startsAt": starts, "guestName": "Alice"},
        )
        resp = client.post(
            "/api/bookings",
            json={"eventTypeId": et["id"], "startsAt": starts, "guestName": "Bob"},
        )
        assert resp.status_code == 409
        assert resp.get_json()["code"] == "SLOT_BUSY"

    def test_get_booking(self, client):
        et = models.create_event_type("1on1", "Weekly sync", 30)
        b = models.create_booking(et["id"], datetime.now(timezone.utc) + timedelta(hours=1), "Alice")
        resp = client.get(f"/api/bookings/{b['id']}")
        assert resp.status_code == 200
        assert resp.get_json()["guestName"] == "Alice"

    def test_get_booking_nonexistent(self, client):
        resp = client.get("/api/bookings/999")
        assert resp.status_code == 404


class TestAdminEventTypes:
    def test_list(self, client):
        models.create_event_type("1on1", "Weekly sync", 30)
        resp = client.get("/api/admin/event-types")
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1

    def test_create(self, client):
        resp = client.post(
            "/api/admin/event-types",
            json={"name": "1on1", "description": "Weekly sync", "durationMinutes": 30},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["name"] == "1on1"

    def test_create_invalid(self, client):
        resp = client.post("/api/admin/event-types", json={"name": ""})
        assert resp.status_code == 400

    def test_update(self, client):
        et = models.create_event_type("old", "old desc", 30)
        resp = client.put(
            f"/api/admin/event-types/{et['id']}",
            json={"name": "new", "description": "new desc", "durationMinutes": 60},
        )
        assert resp.status_code == 200
        assert resp.get_json()["name"] == "new"

    def test_delete(self, client):
        et = models.create_event_type("del", "desc", 30)
        resp = client.delete(f"/api/admin/event-types/{et['id']}")
        assert resp.status_code == 200
        assert resp.get_json()["deletedBookings"] == 0

    def test_delete_cascades_bookings(self, client):
        et = models.create_event_type("del", "desc", 30)
        now = datetime.now(timezone.utc)
        models.create_booking(et["id"], now + timedelta(hours=1), "a")
        models.create_booking(et["id"], now + timedelta(hours=2), "b")
        resp = client.delete(f"/api/admin/event-types/{et['id']}")
        assert resp.status_code == 200
        assert resp.get_json()["deletedBookings"] == 2

    def test_delete_nonexistent(self, client):
        resp = client.delete("/api/admin/event-types/999")
        assert resp.status_code == 404


class TestAdminUpcoming:
    def test_empty(self, client):
        resp = client.get("/api/admin/bookings/upcoming")
        assert resp.status_code == 200
        assert resp.get_json()["bookings"] == []

    def test_with_future_bookings(self, client):
        et = models.create_event_type("1on1", "Weekly sync", 30)
        now = datetime.now(timezone.utc)
        b = models.create_booking(et["id"], now + timedelta(hours=1), "Alice")
        resp = client.get("/api/admin/bookings/upcoming")
        assert resp.status_code == 200
        bookings = resp.get_json()["bookings"]
        assert len(bookings) == 1
        assert bookings[0]["id"] == b["id"]
