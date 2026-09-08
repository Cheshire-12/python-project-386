from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta
from functools import cache
from pathlib import Path

from jsonschema import Draft202012Validator

from backend.errors import ValidationError
from backend.models import get_event_type, list_event_types

BOOKING_WINDOW_DAYS = 14

SCHEMAS_DIR = Path(__file__).resolve().parents[1] / "generated" / "schemas"


def _load_schema(name: str) -> dict:
    file_path = SCHEMAS_DIR / f"{name}.json"
    return json.loads(file_path.read_text(encoding="utf-8"))


def _inline_refs(node):
    """Резолв относительных $ref между файлами схем контракта (плоская структура)."""
    if isinstance(node, dict):
        ref = node.get("$ref")
        if isinstance(ref, str) and ref.endswith(".json"):
            return _inline_refs(_load_schema(ref.rsplit(".", 1)[0]))
        return {key: _inline_refs(value) for key, value in node.items()}
    if isinstance(node, list):
        return [_inline_refs(item) for item in node]
    return node


@cache
def _schema_validator(name: str) -> Draft202012Validator:
    return Draft202012Validator(_inline_refs(_load_schema(name)))


def validate_schema(schema_name: str, data: dict) -> list[str]:
    return [
        f"schema {schema_name}: {error.message}"
        for error in _schema_validator(schema_name).iter_errors(data)
    ]


def validate_event_type_create(data: dict) -> None:
    errors = validate_schema("EventTypeCreate", data)

    name = data.get("name")
    if not isinstance(name, str) or not (1 <= len(name) <= 100):
        errors.append("name: должно быть строкой от 1 до 100 символов")
    else:
        for et in list_event_types():
            if et["name"] == name:
                errors.append(f"name: тип события с именем '{name}' уже существует")
                break

    description = data.get("description")
    if not isinstance(description, str) or len(description) < 1:
        errors.append("description: должно быть непустой строкой")

    duration = data.get("durationMinutes")
    if not isinstance(duration, int) or duration < 1:
        errors.append("durationMinutes: должно быть целым числом >= 1")

    if errors:
        raise ValidationError(details=errors)


def validate_event_type_update(data: dict, exclude_id: int) -> None:
    errors = validate_schema("EventTypeCreate", data)

    name = data.get("name")
    if not isinstance(name, str) or not (1 <= len(name) <= 100):
        errors.append("name: должно быть строкой от 1 до 100 символов")
    else:
        for et in list_event_types():
            if et["name"] == name and et["id"] != exclude_id:
                errors.append(f"name: тип события с именем '{name}' уже существует")
                break

    description = data.get("description")
    if not isinstance(description, str) or len(description) < 1:
        errors.append("description: должно быть непустой строкой")

    duration = data.get("durationMinutes")
    if not isinstance(duration, int) or duration < 1:
        errors.append("durationMinutes: должно быть целым числом >= 1")

    if errors:
        raise ValidationError(details=errors)


def validate_booking_create(data: dict) -> None:
    errors = validate_schema("BookingCreate", data)

    event_type_id = data.get("eventTypeId")
    if not isinstance(event_type_id, int) or event_type_id < 1:
        errors.append("eventTypeId: должно быть положительным целым числом")
    elif get_event_type(event_type_id) is None:
        errors.append(f"eventTypeId: тип события {event_type_id} не найден")

    starts_at = data.get("startsAt")
    if not isinstance(starts_at, str):
        errors.append("startsAt: должно быть строкой ISO 8601")
    else:
        try:
            parsed = datetime.fromisoformat(starts_at)
            if parsed.tzinfo is None:
                errors.append("startsAt: время должно содержать информацию о часовой зоне")
            else:
                now = datetime.now(UTC)
                window_end = now + timedelta(days=BOOKING_WINDOW_DAYS)
                if parsed < now:
                    errors.append("startsAt: время бронирования не может быть в прошлом")
                elif parsed >= window_end:
                    errors.append(
                        f"startsAt: время бронирования должно быть в пределах {BOOKING_WINDOW_DAYS} дней"
                    )
        except (ValueError, TypeError):
            errors.append("startsAt: неверный формат ISO 8601")

    guest_name = data.get("guestName")
    if not isinstance(guest_name, str) or len(guest_name) < 1:
        errors.append("guestName: должно быть непустой строкой")

    phone = data.get("phone")
    if phone is not None and not isinstance(phone, str):
        errors.append("phone: должно быть строкой")

    email = data.get("email")
    if email is not None and not isinstance(email, str):
        errors.append("email: должно быть строкой")

    if errors:
        raise ValidationError(details=errors)
