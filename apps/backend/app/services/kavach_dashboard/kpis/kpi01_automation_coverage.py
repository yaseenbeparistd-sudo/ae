"""
KPI-01: Automation Coverage.

Formula:
    app_pct     = automated / total * 100
    portfolio_pct = sum(automated) / sum(total) * 100

Sources: kavach_postgres (test_case_proposals + generations)

Golden test values:
    JDE         9/15  = 60.0%
    MDM         2/3   = 66.7%
    Baxter.com  4/4   = 100.0%
    Netra       5/6   = 83.3%
    Portfolio   20/28 = 71.4%
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("AutomationCoverageCalculator")
class AutomationCoverageCalculator(KpiCalculator):
    """Calculates the percentage of test scenarios that have been automated."""

    def required_aggregations(self) -> list[str]:
        return ["automated_count", "total_count"]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        automated = aggregates.get("automated_count")
        total = aggregates.get("total_count")

        if automated is None or total is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        if total == 0:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": 0.0, "unit": "%", "text": "No test cases found"},
                components={"automated": 0, "total": 0},
                status="NA",
            )

        app_pct = round(automated / total * 100, 1)

        # Portfolio-level breakdown (optional, from aggregates)
        portfolio_automated = aggregates.get("portfolio_automated_count")
        portfolio_total = aggregates.get("portfolio_total_count")
        portfolio_pct = None
        if portfolio_total and portfolio_total > 0:
            portfolio_pct = round(portfolio_automated / portfolio_total * 100, 1)

        # Per-app breakdown series (optional)
        app_breakdown = aggregates.get("app_breakdown", [])
        series: list[dict[str, Any]] = []
        for entry in app_breakdown:
            entry_total = entry.get("total", 0)
            entry_auto = entry.get("automated", 0)
            pct = round(entry_auto / entry_total * 100, 1) if entry_total > 0 else 0.0
            series.append({
                "app_id": entry.get("app_id", ""),
                "app_name": entry.get("app_name", ""),
                "automated": entry_auto,
                "total": entry_total,
                "pct": pct,
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={"value": app_pct, "unit": "%", "text": f"{automated}/{total} automated"},
            components={
                "automated": automated,
                "total": total,
                "app_pct": app_pct,
                "portfolio_automated": portfolio_automated,
                "portfolio_total": portfolio_total,
                "portfolio_pct": portfolio_pct,
            },
            series=series,
        )
