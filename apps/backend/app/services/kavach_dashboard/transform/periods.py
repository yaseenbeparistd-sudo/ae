"""
Period and time-window utilities.

Handles week boundaries (Monday-Sunday), month normalisation,
before/after go-live splitting, and transition week detection.
"""
from __future__ import annotations
from datetime import date, datetime, timedelta
from typing import Any


def get_iso_week(dt: date | datetime) -> str:
    """Get ISO week label like '2026-W34'. Week starts Monday."""
    if isinstance(dt, datetime):
        dt = dt.date()
    iso_year, iso_week, _ = dt.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"


def get_month_label(dt: date | datetime) -> str:
    """Get month label like '2026-10'."""
    if isinstance(dt, datetime):
        dt = dt.date()
    return f"{dt.year}-{dt.month:02d}"


def get_week_start(dt: date) -> date:
    """Get the Monday of the week containing dt."""
    return dt - timedelta(days=dt.weekday())


def get_week_end(dt: date) -> date:
    """Get the Sunday of the week containing dt."""
    return get_week_start(dt) + timedelta(days=6)


def is_complete_week(week_start: date, data_end: date) -> bool:
    """Check if a week is complete (Sunday is before or on data_end)."""
    return get_week_end(week_start) <= data_end


def is_transition_week(week_start: date, go_live: date) -> bool:
    """Check if a week straddles the go-live date."""
    week_end = get_week_end(week_start)
    return week_start <= go_live <= week_end


def normalise_to_30_days(count: int | float, actual_days: int) -> float:
    """Normalise a count to a 30-day equivalent. For partial months."""
    if actual_days <= 0:
        return 0.0
    return round(count / actual_days * 30, 1)


def split_before_after(
    events: list[dict[str, Any]],
    go_live: date,
    exclude_transition: bool = True,
) -> tuple[list[dict], list[dict]]:
    """Split events into before and after go-live, optionally excluding transition week."""
    before = []
    after = []
    for ev in events:
        period = ev.get("period", "unknown")
        if period == "before":
            before.append(ev)
        elif period == "after":
            after.append(ev)
        elif period == "transition" and not exclude_transition:
            after.append(ev)
    return before, after


def bucket_by_week(events: list[dict[str, Any]], date_field: str = "opened_at") -> dict[str, list[dict]]:
    """Group events by ISO week."""
    buckets: dict[str, list[dict]] = {}
    for ev in events:
        dt = ev.get(date_field)
        if dt:
            if isinstance(dt, datetime):
                dt = dt.date()
            week = get_iso_week(dt)
            buckets.setdefault(week, []).append(ev)
    return dict(sorted(buckets.items()))


def bucket_by_month(events: list[dict[str, Any]], date_field: str = "opened_at") -> dict[str, list[dict]]:
    """Group events by month."""
    buckets: dict[str, list[dict]] = {}
    for ev in events:
        dt = ev.get(date_field)
        if dt:
            if isinstance(dt, datetime):
                dt = dt.date()
            month = get_month_label(dt)
            buckets.setdefault(month, []).append(ev)
    return dict(sorted(buckets.items()))

