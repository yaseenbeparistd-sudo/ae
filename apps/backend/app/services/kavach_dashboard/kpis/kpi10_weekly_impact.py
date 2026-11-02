"""
KPI-10: Weekly Impact — Incidents Avoided.

Formula:
    without_kavach  = prod_incidents + kavach_caught  (same week)
    reduction_pct   = kavach_caught / without_kavach * 100

Sources: kavach_postgres + servicenow

Golden test values:
    50 caught + 50 PROD = without 100
    Reduction = 50%
    vs baseline = 50% lower
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("WeeklyImpactCalculator")
class WeeklyImpactCalculator(KpiCalculator):
    """Estimates weekly incidents avoided thanks to Kavach detection."""

    def required_aggregations(self) -> list[str]:
        return ["prod_incidents_week", "kavach_caught_week"]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        prod_incidents = aggregates.get("prod_incidents_week")
        kavach_caught = aggregates.get("kavach_caught_week")

        if prod_incidents is None or kavach_caught is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        # Counterfactual: what would have happened without Kavach
        without_kavach = prod_incidents + kavach_caught

        if without_kavach == 0:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": 0.0, "unit": "%", "text": "No incidents this week"},
                components={
                    "prod_incidents": prod_incidents,
                    "kavach_caught": kavach_caught,
                    "without_kavach": 0,
                },
                status="NA",
            )

        reduction_pct = round(kavach_caught / without_kavach * 100, 1)

        # Baseline comparison (optional)
        baseline_rate = aggregates.get("baseline_weekly_rate")
        vs_baseline_pct: float | None = None
        if baseline_rate is not None and baseline_rate > 0:
            vs_baseline_pct = round(
                (baseline_rate - prod_incidents) / baseline_rate * 100, 1
            )

        # Weekly trend series (optional)
        weekly_series = aggregates.get("impact_weekly_series", [])
        series: list[dict[str, Any]] = []
        for week in weekly_series:
            w_prod = week.get("prod_incidents", 0)
            w_caught = week.get("kavach_caught", 0)
            w_without = w_prod + w_caught
            w_reduction = round(w_caught / w_without * 100, 1) if w_without > 0 else 0.0
            series.append({
                "week": week.get("week", ""),
                "prod_incidents": w_prod,
                "kavach_caught": w_caught,
                "without_kavach": w_without,
                "reduction_pct": w_reduction,
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={
                "value": reduction_pct,
                "unit": "%",
                "text": f"{kavach_caught} incidents avoided ({reduction_pct}%)",
            },
            components={
                "prod_incidents": prod_incidents,
                "kavach_caught": kavach_caught,
                "without_kavach": without_kavach,
                "reduction_pct": reduction_pct,
                "baseline_weekly_rate": baseline_rate,
                "vs_baseline_pct": vs_baseline_pct,
            },
            series=series,
        )
