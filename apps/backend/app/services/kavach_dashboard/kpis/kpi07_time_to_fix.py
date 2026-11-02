"""
KPI-07: Mean / Median Time to Fix.

Formula:
    duration = closed_at - opened_at (closed tickets only)
    mean = avg(durations)
    median = median(durations)

Sources: servicenow + kavach_postgres

Golden test values:
    Example: opened 15 Oct 08:56, closed 23 Oct 08:22 = 7.98 days
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("TimeToFixCalculator")
class TimeToFixCalculator(KpiCalculator):
    """Calculates mean and median time-to-fix for production incidents."""

    def required_aggregations(self) -> list[str]:
        return ["ttf_durations_days"]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        durations = aggregates.get("ttf_durations_days")

        if durations is None or len(durations) == 0:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "days", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        # Sort for median calculation
        sorted_durations = sorted(durations)
        n = len(sorted_durations)

        # Mean
        mean_days = round(sum(sorted_durations) / n, 2)

        # Median
        if n % 2 == 1:
            median_days = round(sorted_durations[n // 2], 2)
        else:
            median_days = round(
                (sorted_durations[n // 2 - 1] + sorted_durations[n // 2]) / 2, 2
            )

        # Before/after breakdown (optional)
        before_durations = aggregates.get("ttf_before_durations_days", [])
        after_durations = aggregates.get("ttf_after_durations_days", [])

        before_mean = (
            round(sum(before_durations) / len(before_durations), 2)
            if before_durations else None
        )
        after_mean = (
            round(sum(after_durations) / len(after_durations), 2)
            if after_durations else None
        )

        # Weekly series (optional)
        weekly_series = aggregates.get("ttf_weekly_series", [])
        series: list[dict[str, Any]] = []
        for week in weekly_series:
            series.append({
                "week": week.get("week", ""),
                "mean_days": week.get("mean_days", 0),
                "median_days": week.get("median_days", 0),
                "count": week.get("count", 0),
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={
                "value": median_days,
                "unit": "days",
                "text": f"Median TTF {median_days} days",
            },
            components={
                "mean_days": mean_days,
                "median_days": median_days,
                "count": n,
                "min_days": round(sorted_durations[0], 2),
                "max_days": round(sorted_durations[-1], 2),
                "before_mean_days": before_mean,
                "after_mean_days": after_mean,
            },
            series=series,
        )
