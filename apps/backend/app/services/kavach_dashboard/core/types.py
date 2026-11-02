"""Core domain types for the Kavach Business Dashboard."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, date
from enum import Enum
from typing import Any


class DataLabel(str, Enum):
    """Label indicating the data provenance of a KPI result."""

    REAL = "REAL"
    DEMO = "DEMO"
    MIXED = "MIXED"
    PLACEHOLDER = "PLACEHOLDER"


class KpiStatus(str, Enum):
    """Outcome status for a single KPI computation."""

    OK = "OK"
    NA = "NA"
    NO_DATA = "NO_DATA"
    ERROR = "ERROR"


class Period(str, Enum):
    """Temporal period relative to the application go-live date."""

    BEFORE = "before"
    AFTER = "after"
    TRANSITION = "transition"


@dataclass(frozen=True)
class TicketEvent:
    """Normalised in-memory ticket representation. Never persisted."""

    source: str  # servicenow | kavach
    table: str  # incident | change_request | execution
    number: str
    app_id: str
    flow: str
    environment: str
    priority: str
    state: str
    assignment_group: str
    opened_at: datetime | None = None
    closed_at: datetime | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    release: str | None = None
    detected_by_automation: bool = False
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass
class KpiResult:
    """Standard KPI result contract — stored in Redis/Postgres."""

    kpi_id: str
    app_id: str
    run_id: str
    data_label: str
    headline: dict[str, Any]  # value, unit, text
    components: dict[str, Any]  # computation details
    series: list[dict[str, Any]]  # time series data
    footnote: str | None = None
    status: str = "OK"
    calculated_at: str = ""


@dataclass
class RunMeta:
    """Metadata for a single refresh run."""

    run_id: str
    status: str  # RUNNING | SUCCESS | FAILED
    started_at: str
    finished_at: str | None = None
    rows_read: int = 0
    kpis_ok: int = 0
    kpis_failed: int = 0
    config_hash: str = ""
    errors: list[str] = field(default_factory=list)

