"""
Duration aggregator for time-to-fix calculations.

Collects durations in a compact array for median/mean computation.
Only keeps durations, not full ticket data.
"""
from __future__ import annotations
import array
from typing import Any

from .base import Aggregator


class DurationAggregator(Aggregator):
    """Collect fix durations for mean and median computation."""

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._before_durations: array.array = array.array('f')
        self._after_durations: array.array = array.array('f')
        self._kavach_durations: array.array = array.array('f')
        self._open_count_before = 0
        self._open_count_after = 0

    def feed(self, event: dict[str, Any]) -> None:
        opened = event.get("opened_at")
        closed = event.get("closed_at")
        period = event.get("period", "unknown")
        source = event.get("source", "")

        if opened and closed:
            duration_days = (closed - opened).total_seconds() / 86400.0
            if duration_days >= 0:
                if source == "kavach":
                    self._kavach_durations.append(duration_days)
                elif period == "before":
                    self._before_durations.append(duration_days)
                elif period == "after":
                    self._after_durations.append(duration_days)
        elif opened and not closed:
            if period == "before":
                self._open_count_before += 1
            else:
                self._open_count_after += 1

    def _compute_stats(self, durations: array.array) -> dict[str, Any]:
        """Compute mean, median from a duration array."""
        if not durations:
            return {"count": 0, "mean": None, "median": None}

        sorted_d = sorted(durations)
        n = len(sorted_d)
        mean = sum(sorted_d) / n

        if n % 2 == 0:
            median = (sorted_d[n // 2 - 1] + sorted_d[n // 2]) / 2.0
        else:
            median = sorted_d[n // 2]

        return {
            "count": n,
            "mean": round(mean, 2),
            "median": round(median, 2),
        }

    def result(self) -> dict[str, Any]:
        return {
            "before": self._compute_stats(self._before_durations),
            "after": self._compute_stats(self._after_durations),
            "kavach": self._compute_stats(self._kavach_durations),
            "open_backlog": {
                "before": self._open_count_before,
                "after": self._open_count_after,
            },
        }

