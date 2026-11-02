"""
KPI-03: Defect Detection Percentage (DDP).

Formula:
    ddp = kavach_preprod / (kavach_preprod + prod_count) * 100

Sources: kavach_postgres + servicenow

Golden test values:
    150 Kavach pre-prod + 320 PROD = 31.9%
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("DefectDetectionCalculator")
class DefectDetectionCalculator(KpiCalculator):
    """Calculates the defect detection percentage (pre-prod vs prod)."""

    def required_aggregations(self) -> list[str]:
        return ["kavach_preprod_count", "prod_defect_count"]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        kavach_preprod = aggregates.get("kavach_preprod_count")
        prod_count = aggregates.get("prod_defect_count")

        if kavach_preprod is None or prod_count is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        total = kavach_preprod + prod_count
        if total == 0:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": 0.0, "unit": "%", "text": "No defects found"},
                components={"kavach_preprod": 0, "prod_count": 0, "total": 0},
                status="NA",
            )

        ddp = round(kavach_preprod / total * 100, 1)

        # Weekly series (optional)
        weekly_series = aggregates.get("ddp_weekly_series", [])
        series: list[dict[str, Any]] = []
        for week in weekly_series:
            week_preprod = week.get("kavach_preprod", 0)
            week_prod = week.get("prod_count", 0)
            week_total = week_preprod + week_prod
            week_ddp = round(week_preprod / week_total * 100, 1) if week_total > 0 else 0.0
            series.append({
                "week": week.get("week", ""),
                "kavach_preprod": week_preprod,
                "prod_count": week_prod,
                "ddp": week_ddp,
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={"value": ddp, "unit": "%", "text": f"DDP {ddp}%"},
            components={
                "kavach_preprod": kavach_preprod,
                "prod_count": prod_count,
                "total": total,
                "ddp": ddp,
            },
            series=series,
        )
