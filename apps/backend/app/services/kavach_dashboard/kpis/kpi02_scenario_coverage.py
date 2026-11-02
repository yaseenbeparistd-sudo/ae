"""
KPI-02: Scenario Coverage (Critical Flow Gaps).

Formula:
    critical flow = has P0/P1 test OR >=1 PROD P1/P2 incident
    uncovered_pct = uncovered_critical / total_critical * 100
    covered_pct   = 100 - uncovered_pct

Sources: kavach_postgres + servicenow

Golden test values:
    10 critical flows, 3 uncovered = 30% uncovered, 70% covered
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("ScenarioCoverageCalculator")
class ScenarioCoverageCalculator(KpiCalculator):
    """Calculates the percentage of critical flows that are covered by automation."""

    def required_aggregations(self) -> list[str]:
        return ["total_critical_flows", "uncovered_critical_flows"]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        total_critical = aggregates.get("total_critical_flows")
        uncovered_critical = aggregates.get("uncovered_critical_flows")

        if total_critical is None or uncovered_critical is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "%", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        if total_critical == 0:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": 0.0, "unit": "%", "text": "No critical flows identified"},
                components={"total_critical": 0, "uncovered": 0, "covered": 0},
                status="NA",
            )

        uncovered_pct = round(uncovered_critical / total_critical * 100, 1)
        covered_pct = round(100 - uncovered_pct, 1)
        covered_count = total_critical - uncovered_critical

        # Per-flow detail (optional)
        flow_details = aggregates.get("flow_details", [])
        series: list[dict[str, Any]] = []
        for flow in flow_details:
            series.append({
                "flow": flow.get("flow", ""),
                "is_critical": flow.get("is_critical", False),
                "has_automation": flow.get("has_automation", False),
                "has_prod_incident": flow.get("has_prod_incident", False),
                "covered": flow.get("covered", False),
            })

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={
                "value": uncovered_pct,
                "unit": "%",
                "text": f"{uncovered_critical}/{total_critical} critical flows uncovered",
            },
            components={
                "total_critical": total_critical,
                "uncovered": uncovered_critical,
                "covered": covered_count,
                "uncovered_pct": uncovered_pct,
                "covered_pct": covered_pct,
            },
            series=series,
        )
