"""
KPI-04: Prod Incidents — Before vs After Go-Live.

Formula:
    rate_30d       = count / days * 30
    reduction_pct  = (before - after) / before * 100
    index          = after_rate / before_rate * 100

Sources: servicenow

Golden test values:
    Before: 996 in 16 days → rate 1867.5/30d
    After:  4713 in 69 days → rate 2049.1/30d
    Reduction: -9.7%  (negative = incidents increased)
    Index: 110
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("ProdBeforeAfterCalculator")
class ProdBeforeAfterCalculator(KpiCalculator):
    """Compares production incident rates before and after Kavach go-live."""

    def required_aggregations(self) -> list[str]:
        return [
            "before_count", "before_days",
            "after_count", "after_days",
        ]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        before_count = aggregates.get("before_count")
        before_days = aggregates.get("before_days")
        after_count = aggregates.get("after_count")
        after_days = aggregates.get("after_days")

        if any(v is None for v in [before_count, before_days, after_count, after_days]):
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        if before_days == 0 or after_days == 0:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "Insufficient time range"},
                components={
                    "before_count": before_count, "before_days": before_days,
                    "after_count": after_count, "after_days": after_days,
                },
                status="NA",
            )

        # Normalise both periods to a 30-day rate
        before_rate = round(before_count / before_days * 30, 1)
        after_rate = round(after_count / after_days * 30, 1)

        # Reduction percentage (positive = fewer incidents after)
        if before_rate > 0:
            reduction_pct = round((before_rate - after_rate) / before_rate * 100, 1)
        else:
            reduction_pct = 0.0

        # Index: after_rate relative to before_rate (100 = same)
        index = round(after_rate / before_rate * 100) if before_rate > 0 else 0

        # Weekly series (optional)
        weekly_series = aggregates.get("prod_weekly_series", [])
        series: list[dict[str, Any]] = []
        for week in weekly_series:
            series.append({
                "week": week.get("week", ""),
                "count": week.get("count", 0),
                "period": week.get("period", ""),
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={
                "value": reduction_pct,
                "unit": "%",
                "text": f"Incident reduction {reduction_pct}%",
            },
            components={
                "before_count": before_count,
                "before_days": before_days,
                "before_rate_30d": before_rate,
                "after_count": after_count,
                "after_days": after_days,
                "after_rate_30d": after_rate,
                "reduction_pct": reduction_pct,
                "index": index,
            },
            series=series,
        )
