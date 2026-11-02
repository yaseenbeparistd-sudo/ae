"""
Change-incident linking aggregator for KPI6.

Maintains a compact in-memory index of change end times per assignment group,
then matches incidents via binary search within a configurable time window.
"""
from __future__ import annotations
import bisect
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from .base import Aggregator

logger = logging.getLogger(__name__)


class ChangeWindowAggregator(Aggregator):
    """
    Link incidents to changes by assignment group + time window.
    
    Phase 1: Feed all changes to build the index.
    Phase 2: Feed incidents to find matches.
    """

    def __init__(self, window_hours: int = 24, incident_priorities: list[str] | None = None) -> None:
        self._window = timedelta(hours=window_hours)
        self._priorities = set(incident_priorities or ["1", "2"])
        self.reset()

    def reset(self) -> None:
        self._change_index: dict[str, list[float]] = defaultdict(list)
        self._total_changes: dict[str, int] = defaultdict(int)
        self._failed_changes: dict[str, int] = defaultdict(int)
        self._change_related_incidents: dict[str, int] = defaultdict(int)
        self._total_incidents: dict[str, int] = defaultdict(int)
        self._changes_indexed = 0
        self._incidents_checked = 0
        self._matches_found = 0

    def feed_change(self, event: dict[str, Any]) -> None:
        """Index a change request by its end time and group."""
        end_date = event.get("end_date") or event.get("closed_at")
        group = event.get("assignment_group", "")
        period = event.get("period", "unknown")
        state = event.get("state", "")

        if not end_date or not group:
            return

        if isinstance(end_date, datetime):
            timestamp = end_date.timestamp()
            self._change_index[group].append(timestamp)
            self._total_changes[period] = self._total_changes.get(period, 0) + 1

            if state.lower() in ("failed", "backed out", "incomplete"):
                self._failed_changes[period] = self._failed_changes.get(period, 0) + 1

            self._changes_indexed += 1

    def feed_incident(self, event: dict[str, Any]) -> None:
        """Check if an incident is change-related."""
        priority = event.get("priority", "")
        group = event.get("assignment_group", "")
        opened = event.get("opened_at")
        period = event.get("period", "unknown")

        self._total_incidents[period] = self._total_incidents.get(period, 0) + 1
        self._incidents_checked += 1

        if priority not in self._priorities or not group or not opened:
            return

        if not isinstance(opened, datetime):
            return

        change_times = self._change_index.get(group)
        if not change_times:
            return

        incident_ts = opened.timestamp()
        window_start = incident_ts - self._window.total_seconds()

        left = bisect.bisect_left(change_times, window_start)
        right = bisect.bisect_right(change_times, incident_ts)

        if left < right:
            self._change_related_incidents[period] = self._change_related_incidents.get(period, 0) + 1
            self._matches_found += 1

    def feed(self, event: dict[str, Any]) -> None:
        table = event.get("table", "")
        if table == "change_request":
            self.feed_change(event)
        elif table == "incident":
            self.feed_incident(event)

    def finalise_index(self) -> None:
        """Sort all change time lists for binary search."""
        for group in self._change_index:
            self._change_index[group].sort()

    def result(self) -> dict[str, Any]:
        return {
            "change_related_incidents": dict(self._change_related_incidents),
            "total_incidents": dict(self._total_incidents),
            "total_changes": dict(self._total_changes),
            "failed_changes": dict(self._failed_changes),
            "changes_indexed": self._changes_indexed,
            "incidents_checked": self._incidents_checked,
            "matches_found": self._matches_found,
        }

