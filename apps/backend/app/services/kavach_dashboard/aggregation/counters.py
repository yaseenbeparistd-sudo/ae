"""
Counting aggregators for the streaming pipeline.

Maintains per-period, per-week, per-flow counters as events flow through the pipeline.
"""
from __future__ import annotations
from collections import defaultdict
from typing import Any
from datetime import datetime

from .base import Aggregator
from ..transform.periods import get_iso_week, get_month_label


class PeriodCounter(Aggregator):
    """Count events by period (before/after) and priority."""

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._counts: dict[str, int] = defaultdict(int)
        self._by_priority: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self._dates: dict[str, set] = defaultdict(set)

    def feed(self, event: dict[str, Any]) -> None:
        period = event.get("period", "unknown")
        priority = event.get("priority", "unknown")
        self._counts[period] += 1
        self._by_priority[period][priority] += 1

        opened = event.get("opened_at")
        if opened:
            if isinstance(opened, datetime):
                self._dates[period].add(opened.date())

    def result(self) -> dict[str, Any]:
        day_counts = {}
        for period, dates in self._dates.items():
            if dates:
                day_counts[period] = (max(dates) - min(dates)).days + 1
            else:
                day_counts[period] = 0

        return {
            "counts": dict(self._counts),
            "by_priority": {k: dict(v) for k, v in self._by_priority.items()},
            "day_counts": day_counts,
        }


class WeeklyCounter(Aggregator):
    """Count events by ISO week."""

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._weekly: dict[str, int] = defaultdict(int)

    def feed(self, event: dict[str, Any]) -> None:
        opened = event.get("opened_at")
        if opened:
            if isinstance(opened, datetime):
                week = get_iso_week(opened.date())
                self._weekly[week] += 1

    def result(self) -> dict[str, Any]:
        return {"weekly": dict(sorted(self._weekly.items()))}


class MonthlyCounter(Aggregator):
    """Count events by month."""

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._monthly: dict[str, int] = defaultdict(int)
        self._month_dates: dict[str, set] = defaultdict(set)

    def feed(self, event: dict[str, Any]) -> None:
        opened = event.get("opened_at")
        if opened:
            if isinstance(opened, datetime):
                month = get_month_label(opened.date())
                self._monthly[month] += 1
                self._month_dates[month].add(opened.date())

    def result(self) -> dict[str, Any]:
        month_days = {}
        for month, dates in self._month_dates.items():
            if dates:
                month_days[month] = (max(dates) - min(dates)).days + 1
            else:
                month_days[month] = 0

        return {
            "monthly": dict(sorted(self._monthly.items())),
            "month_days": month_days,
        }


class FlowCounter(Aggregator):
    """Count events by business flow."""

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._flows: dict[str, int] = defaultdict(int)
        self._flow_priority: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    def feed(self, event: dict[str, Any]) -> None:
        flow = event.get("flow", "unmapped")
        priority = event.get("priority", "unknown")
        self._flows[flow] += 1
        self._flow_priority[flow][priority] += 1

    def result(self) -> dict[str, Any]:
        return {
            "flows": dict(self._flows),
            "flow_priority": {k: dict(v) for k, v in self._flow_priority.items()},
        }

