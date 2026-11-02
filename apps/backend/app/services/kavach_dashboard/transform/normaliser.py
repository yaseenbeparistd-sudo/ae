"""
Row normaliser — converts raw source rows into memory-safe normalized structures.

TicketEvents are in-memory only and never persisted as raw data.
"""
from __future__ import annotations
import hashlib
import logging
from datetime import datetime, date
from typing import Any

logger = logging.getLogger(__name__)


def _parse_datetime(value: Any) -> datetime | None:
    """Parse a datetime from various formats."""
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        for fmt in [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%d %H:%M:%S.%f",
            "%Y-%m-%d",
        ]:
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
    return None


def hash_ticket_number(number: str, source: str) -> str:
    """Create a non-reversible hash of a ticket number for the fact table."""
    return hashlib.sha256(f"{source}:{number}".encode()).hexdigest()[:16]


def normalise_servicenow_row(
    row: dict[str, Any],
    table: str,
    app_id: str,
    flow: str,
    go_live_date: date,
) -> dict[str, Any]:
    """Normalise a ServiceNow row into standard internal format."""
    opened_at = _parse_datetime(row.get("opened_at"))
    closed_at = _parse_datetime(row.get("closed_at"))
    start_date = _parse_datetime(row.get("start_date"))
    end_date = _parse_datetime(row.get("end_date"))

    ref_date = opened_at.date() if opened_at else (start_date.date() if start_date else None)
    if ref_date:
        if ref_date < go_live_date:
            period = "before"
        elif ref_date == go_live_date:
            period = "transition"
        else:
            period = "after"
    else:
        period = "unknown"

    return {
        "ticket_hash": hash_ticket_number(row.get("number", ""), "servicenow"),
        "source": "servicenow",
        "table": table,
        "number": row.get("number", ""),
        "app_id": app_id,
        "flow": flow,
        "environment": "PROD",
        "priority": str(row.get("priority", "")),
        "state": str(row.get("state", "")),
        "assignment_group": str(row.get("assignment_group", "")),
        "opened_at": opened_at,
        "closed_at": closed_at,
        "start_date": start_date,
        "end_date": end_date,
        "period": period,
        "detected_by_automation": False,
    }


def normalise_kavach_row(
    row: dict[str, Any],
    table: str,
    go_live_date: date,
) -> dict[str, Any]:
    """Normalise a Kavach PostgreSQL row."""
    created_at = _parse_datetime(row.get("created_at"))
    ref_date = created_at.date() if created_at else None
    if ref_date:
        period = "before" if ref_date < go_live_date else "after"
    else:
        period = "unknown"

    return {
        "source": "kavach",
        "table": table,
        "app_id": str(row.get("app_id", "")),
        "app_name": str(row.get("app_name", "")),
        "flow": "",
        "environment": str(row.get("environment", "")),
        "priority": str(row.get("severity", row.get("priority", ""))),
        "state": str(row.get("status", row.get("result", ""))),
        "opened_at": created_at,
        "closed_at": _parse_datetime(row.get("resolved_at", row.get("closed_at"))),
        "period": period,
        "detected_by_automation": True,
        "result": row.get("result"),
        "duration_ms": row.get("duration_ms"),
        "cost_usd": row.get("cost_usd"),
        "total_test_cases": row.get("total_test_cases"),
        "automated_count": row.get("automated_count"),
        "tags": row.get("tags"),
        "release_tag": row.get("release_tag"),
    }

