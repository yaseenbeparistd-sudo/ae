"""
KPI-05: Week-over-Week / Month-over-Month Trend.

Formula:
    wow_pct = (current_week - prev_week) / prev_week * 100
    mom: normalised to 30-day rate, then compared

Sources: kavach_postgres + servicenow

Golden test values:
    Weeks: 428 → 483 = WoW +12.9%
    Oct: 1461 in 22d → 1992/30d, MoM -8.0%
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("WoWMoMCalculator")
class WoWMoMCalculator(KpiCalculator):
    """Calculates week-over-week and month-over-month incident trends."""

    def required_aggregations(self) -> list[str]:
        return [
            "current_week_count", "prev_week_count",
            "current_month_count", "current_month_days",
            "prev_month_count", "prev_month_days",
        ]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        current_week = aggregates.get("current_week_count")
        prev_week = aggregates.get("prev_week_count")
        current_month_count = aggregates.get("current_month_count")
        current_month_days = aggregates.get("current_month_days")
        prev_month_count = aggregates.get("prev_month_count")
        prev_month_days = aggregates.get("prev_month_days")

        if current_week is None or prev_week is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        # Week-over-Week
        if prev_week > 0:
            wow_pct = round((current_week - prev_week) / prev_week * 100, 1)
        else:
            wow_pct = 0.0 if current_week == 0 else 100.0

        # Month-over-Month (normalised to 30-day rate)
        mom_pct: float | None = None
        current_month_rate: float | None = None
        prev_month_rate: float | None = None

        if (current_month_count is not None and current_month_days is not None
                and prev_month_count is not None and prev_month_days is not None):
            if current_month_days > 0:
                current_month_rate = round(current_month_count / current_month_days * 30, 1)
            if prev_month_days > 0:
                prev_month_rate = round(prev_month_count / prev_month_days * 30, 1)

            if prev_month_rate and prev_month_rate > 0 and current_month_rate is not None:
                mom_pct = round(
                    (current_month_rate - prev_month_rate) / prev_month_rate * 100, 1
                )

        # Weekly series (optional)
        weekly_series = aggregates.get("weekly_trend_series", [])
        series: list[dict[str, Any]] = []
        for week in weekly_series:
            series.append({
                "week": week.get("week", ""),
                "count": week.get("count", 0),
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={
                "value": wow_pct,
                "unit": "%",
                "text": f"WoW {'+' if wow_pct >= 0 else ''}{wow_pct}%",
            },
            components={
                "current_week": current_week,
                "prev_week": prev_week,
                "wow_pct": wow_pct,
                "current_month_count": current_month_count,
                "current_month_days": current_month_days,
                "current_month_rate_30d": current_month_rate,
                "prev_month_count": prev_month_count,
                "prev_month_days": prev_month_days,
                "prev_month_rate_30d": prev_month_rate,
                "mom_pct": mom_pct,
            },
            series=series,
        )
