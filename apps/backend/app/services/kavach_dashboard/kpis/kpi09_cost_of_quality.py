"""
KPI-09: Cost of Quality / Net Savings.

Formula:
    gross_savings = kavach_defects * (prod_cost_per_defect - preprod_cost_per_defect)
    cost          = ai_cost + infra_monthly_cost * months_active
    net_savings   = gross_savings - cost

Sources: kavach_postgres + config params

Golden test values:
    32 defects * ($5,000 - $500) = $144,000 gross
    AI cost $0.56 + infra $150 * 2.5 months = $375.56 total cost
    Net = $143,624.44
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from .base import KpiCalculator, KpiResult
from .registry import register_kpi

logger = logging.getLogger(__name__)


@register_kpi("CostOfQualityCalculator")
class CostOfQualityCalculator(KpiCalculator):
    """Calculates net cost savings from Kavach's early defect detection."""

    def required_aggregations(self) -> list[str]:
        return ["kavach_defects_caught", "ai_cost", "months_active"]

    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        kavach_defects = aggregates.get("kavach_defects_caught")
        ai_cost = aggregates.get("ai_cost", 0.0)
        months_active = aggregates.get("months_active")

        if kavach_defects is None or months_active is None:
            return self._make_result(
                app_id=app_id,
                run_id=run_id,
                headline={"value": None, "unit": "$", "text": "No data"},
                components={},
                status="NO_DATA",
            )

        # Read config params with defaults
        prod_cost_per_defect = self.config.params.get("prod_cost_per_defect", 5000)
        preprod_cost_per_defect = self.config.params.get("preprod_cost_per_defect", 500)
        infra_monthly_cost = self.config.params.get("infra_monthly_cost", 150)

        # Gross savings: defects caught early * cost difference
        cost_avoidance_per_defect = prod_cost_per_defect - preprod_cost_per_defect
        gross_savings = round(kavach_defects * cost_avoidance_per_defect, 2)

        # Total cost of running Kavach
        total_cost = round(ai_cost + infra_monthly_cost * months_active, 2)

        # Net savings
        net_savings = round(gross_savings - total_cost, 2)

        # ROI percentage
        roi_pct = round(net_savings / total_cost * 100, 1) if total_cost > 0 else 0.0

        return self._make_result(
            app_id=app_id,
            run_id=run_id,
            headline={
                "value": net_savings,
                "unit": "$",
                "text": f"Net savings ${net_savings:,.0f}",
            },
            components={
                "kavach_defects_caught": kavach_defects,
                "prod_cost_per_defect": prod_cost_per_defect,
                "preprod_cost_per_defect": preprod_cost_per_defect,
                "cost_avoidance_per_defect": cost_avoidance_per_defect,
                "gross_savings": gross_savings,
                "ai_cost": ai_cost,
                "infra_monthly_cost": infra_monthly_cost,
                "months_active": months_active,
                "total_cost": total_cost,
                "net_savings": net_savings,
                "roi_pct": roi_pct,
            },
        )
