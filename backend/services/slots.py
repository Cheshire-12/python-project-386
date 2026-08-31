from __future__ import annotations

from datetime import datetime, timedelta, timezone

from backend.models import find_conflicting_booking

MSK = timezone(timedelta(hours=3))
SLOT_STEP = timedelta(minutes=30)
DEFAULT_WINDOW_DAYS = 14


def generate_slots(
    duration_minutes: int,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
) -> list[dict]:
    now = datetime.now(timezone.utc)

    if from_dt is None:
        from_dt = now
    if to_dt is None:
        to_dt = now + timedelta(days=DEFAULT_WINDOW_DAYS)

    from_msk = from_dt.astimezone(MSK)
    to_msk = to_dt.astimezone(MSK)

    start_of_day = from_msk.replace(hour=0, minute=0, second=0, microsecond=0)
    end_limit = to_msk

    slots: list[dict] = []
    current = start_of_day

    while current < end_limit:
        slot_start_utc = current.astimezone(timezone.utc)
        slot_end_utc = (current + timedelta(minutes=duration_minutes)).astimezone(timezone.utc)

        available = True
        if slot_start_utc < now:
            available = False
        else:
            existing = find_conflicting_booking(slot_start_utc, duration_minutes)
            if existing is not None:
                available = False

        slots.append({
            "start": slot_start_utc.isoformat(),
            "end": slot_end_utc.isoformat(),
            "available": available,
        })

        current += SLOT_STEP

    return slots
