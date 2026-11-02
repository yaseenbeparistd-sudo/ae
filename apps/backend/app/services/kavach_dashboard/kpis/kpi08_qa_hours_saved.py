"""
KPI-08: QA Hours Saved.

Formula:
    hours   = eligible_runs * manual_minutes / 60
    dollars = hours * hourly_rate

Sources: kavach_postgres + config params

Golden test values:
    443 runs * 20 min = 147.7 hours
    $40/hr = $5,907
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("QaHoursSavedCalculator")
class QaHoursSavedCalculator(KpiCalculator):
    """Estimates manual QA hours saved by Kavach automation."""

    def required_aggregations(self) -> list[str]:
        return ["eligible_runs"]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        eligible_runs = aggregates.get("eligible_runs")

        if eligible_runs is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "hours", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        # Read config params with defaults
        manual_minutes = self.config.params.get("manual_minutes_per_run", 20)
        hourly_rate = self.config.params.get("hourly_rate", 40)

        hours_saved = round(eligible_runs * manual_minutes / 60, 1)
        dollars_saved = round(hours_saved * hourly_rate, 2)

        # Weekly series (optional)
        weekly_series = aggregates.get("qa_weekly_series", [])
        series: list[dict[str, Any]] = []
        for week in weekly_series:
            week_runs = week.get("eligible_runs", 0)
            week_hours = round(week_runs * manual_minutes / 60, 1)
            series.append({
                "week": week.get("week", ""),
                "eligible_runs": week_runs,
                "hours_saved": week_hours,
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={
                "value": hours_saved,
                "unit": "hours",
                "text": f"{hours_saved}h saved (${dollars_saved:,.0f})",
            },
            components={
                "eligible_runs": eligible_runs,
                "manual_minutes_per_run": manual_minutes,
                "hourly_rate": hourly_rate,
                "hours_saved": hours_saved,
                "dollars_saved": dollars_saved,
            },
            series=series,
        )
