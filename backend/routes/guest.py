from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from backend.errors import NotFoundError, ConflictError, ValidationError
from backend.models import (
    create_booking,
    get_booking,
    get_event_type,
    list_event_types,
    find_conflicting_booking,
)
from backend.services.slots import generate_slots
from backend.services.validation import validate_booking_create

guest_bp = Blueprint("guest", __name__)


@guest_bp.route("/event-types", methods=["GET"])
def list_types():
    return jsonify(list_event_types())


@guest_bp.route("/event-types/<int:event_type_id>", methods=["GET"])
def get_type(event_type_id: int):
    et = get_event_type(event_type_id)
    if et is None:
        raise NotFoundError(f"Тип события {event_type_id} не найден")
    return jsonify(et)


@guest_bp.route("/event-types/<int:event_type_id>/slots", methods=["GET"])
def list_slots(event_type_id: int):
    et = get_event_type(event_type_id)
    if et is None:
        raise NotFoundError(f"Тип события {event_type_id} не найден")

    from_param = request.args.get("from")
    to_param = request.args.get("to")

    from_dt = None
    to_dt = None

    if from_param:
        from_dt = datetime.fromisoformat(from_param.replace("Z", "+00:00"))
    if to_param:
        to_dt = datetime.fromisoformat(to_param.replace("Z", "+00:00"))

    slots = generate_slots(et["durationMinutes"], from_dt, to_dt)
    return jsonify(slots)


@guest_bp.route("/bookings", methods=["POST"])
def create():
    data = request.get_json(silent=True)
    if not data:
        raise ValidationError("Тело запроса отсутствует")

    validate_booking_create(data)

    starts_at = datetime.fromisoformat(data["startsAt"].replace("Z", "+00:00"))
    starts_utc = starts_at.astimezone(timezone.utc)

    event_type = get_event_type(data["eventTypeId"])
    existing = find_conflicting_booking(starts_utc, event_type["durationMinutes"])
    if existing is not None:
        raise ConflictError("На это время уже есть бронирование")

    booking = create_booking(
        event_type_id=data["eventTypeId"],
        starts_at=starts_utc,
        guest_name=data["guestName"],
        phone=data.get("phone"),
        email=data.get("email"),
    )
    return jsonify(booking), 201


@guest_bp.route("/bookings/<int:booking_id>", methods=["GET"])
def get_booking_by_id(booking_id: int):
    booking = get_booking(booking_id)
    if booking is None:
        raise NotFoundError(f"Бронирование {booking_id} не найдено")
    return jsonify(booking)
