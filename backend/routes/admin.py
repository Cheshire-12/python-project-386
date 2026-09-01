from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from backend.errors import NotFoundError, ValidationError
from backend.models import create_event_type, update_event_type, delete_event_type, list_event_types, list_all_bookings
from backend.services.validation import validate_event_type_create, validate_event_type_update

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/event-types", methods=["GET"])
def list_types():
    return jsonify(list_event_types())


@admin_bp.route("/event-types", methods=["POST"])
def create_type():
    data = request.get_json(silent=True)
    if not data:
        raise ValidationError("Тело запроса отсутствует")

    validate_event_type_create(data)

    et = create_event_type(
        name=data["name"],
        description=data["description"],
        duration_minutes=data["durationMinutes"],
    )
    return jsonify(et), 201


@admin_bp.route("/event-types/<int:event_type_id>", methods=["PUT"])
def update_type(event_type_id: int):
    data = request.get_json(silent=True)
    if not data:
        raise ValidationError("Тело запроса отсутствует")

    validate_event_type_update(data, exclude_id=event_type_id)

    et = update_event_type(
        event_type_id=event_type_id,
        name=data["name"],
        description=data["description"],
        duration_minutes=data["durationMinutes"],
    )
    return jsonify(et)


@admin_bp.route("/event-types/<int:event_type_id>", methods=["DELETE"])
def delete_type(event_type_id: int):
    deleted_bookings = delete_event_type(event_type_id)
    if deleted_bookings < 0:
        raise NotFoundError(f"Тип события {event_type_id} не найден")
    return jsonify({"deletedBookings": deleted_bookings})


@admin_bp.route("/bookings/upcoming", methods=["GET"])
def upcoming():
    from_param = request.args.get("from")

    if from_param:
        from_dt = datetime.fromisoformat(from_param.replace("Z", "+00:00")).astimezone(timezone.utc)
    else:
        from_dt = datetime.now(timezone.utc)

    bookings = list_all_bookings()

    future = []
    for b in bookings:
        starts = datetime.fromisoformat(b["startsAt"]).astimezone(timezone.utc)
        if starts > from_dt:
            future.append(b)

    future.sort(key=lambda b: b["startsAt"])

    return jsonify({"bookings": future})
