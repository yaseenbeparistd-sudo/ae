"""
KPI-06: Change Failure Rate.

Formula:
    change_related = P1/P2 incident in same assignment group within 24h of change end
    cfr = failed_changes / total_changes * 100

    Before/After comparison:
        before: X failed in N days, after: Y failed in M days
        reduction_pct = (before_cfr - after_cfr) / before_cfr * 100
        index = after_cfr / before_cfr * 100

Sources: servicenow (incident + change_request)

Golden test values:
    Before: 43 in 16d vs After: 166 in 69d
    CFR Before: 45.6%, After: 30.6%
    Before rate → After rate: 80.6 → 72.2
    Reduction: 10.5%, index ~90
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("ChangeFailureRateCalculator")
class ChangeFailureRateCalculator(KpiCalculator):
    """Calculates the change failure rate and before/after comparison."""

    def required_aggregations(self) -> list[str]:
        return [
            "total_changes", "failed_changes",
            "before_failed", "before_total", "before_days",
            "after_failed", "after_total", "after_days",
        ]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        total_changes = aggregates.get("total_changes")
        failed_changes = aggregates.get("failed_changes")

        if total_changes is None or failed_changes is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        # Overall CFR
        if total_changes > 0:
            cfr = round(failed_changes / total_changes * 100, 1)
        else:
            cfr = 0.0

        # Before / After comparison
        before_failed = aggregates.get("before_failed", 0)
        before_total = aggregates.get("before_total", 0)
        before_days = aggregates.get("before_days", 0)
        after_failed = aggregates.get("after_failed", 0)
        after_total = aggregates.get("after_total", 0)
        after_days = aggregates.get("after_days", 0)

        before_cfr = round(before_failed / before_total * 100, 1) if before_total > 0 else 0.0
        after_cfr = round(after_failed / after_total * 100, 1) if after_total > 0 else 0.0

        # Normalised failure rates (per 30 days)
        before_rate_30d = round(before_failed / before_days * 30, 1) if before_days > 0 else 0.0
        after_rate_30d = round(after_failed / after_days * 30, 1) if after_days > 0 else 0.0

        # Reduction percentage and index
        if before_rate_30d > 0:
            reduction_pct = round((before_rate_30d - after_rate_30d) / before_rate_30d * 100, 1)
            index = round(after_rate_30d / before_rate_30d * 100)
        else:
            reduction_pct = 0.0
            index = 0

        # Weekly series (optional)
        weekly_series = aggregates.get("cfr_weekly_series", [])
        series: list[dict[str, Any]] = []
        for week in weekly_series:
            w_total = week.get("total_changes", 0)
            w_failed = week.get("failed_changes", 0)
            w_cfr = round(w_failed / w_total * 100, 1) if w_total > 0 else 0.0
            series.append({
                "week": week.get("week", ""),
                "total_changes": w_total,
                "failed_changes": w_failed,
                "cfr": w_cfr,
                "period": week.get("period", ""),
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={"value": cfr, "unit": "%", "text": f"CFR {cfr}%"},
            components={
                "total_changes": total_changes,
                "failed_changes": failed_changes,
                "cfr": cfr,
                "before_failed": before_failed,
                "before_total": before_total,
                "before_days": before_days,
                "before_cfr": before_cfr,
                "before_rate_30d": before_rate_30d,
                "after_failed": after_failed,
                "after_total": after_total,
                "after_days": after_days,
                "after_cfr": after_cfr,
                "after_rate_30d": after_rate_30d,
                "reduction_pct": reduction_pct,
                "index": index,
            },
            series=series,
        )
