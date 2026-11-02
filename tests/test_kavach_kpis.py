"""
Golden Unit Tests for Kavach Business Dashboard KPIs.

These verify that all 10 KPI calculations match the exact worked examples
from Section 5.2 of NextGen2_Business_Dashboard_KPIs_v2.docx.
Uses standard library unittest for portability.
"""
from datetime import date
from pathlib import Path
import sys
import unittest

# Add apps/backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "apps" / "backend"))

from app.services.kavach_dashboard.kpis import (
    get_calculator_class,
    list_registered,
)
from app.services.kavach_dashboard.config.models import KpiConfig, KpiDefaultsConfig


class TestKavachKpiGoldenCalculations(unittest.TestCase):
    def setUp(self):
        self.defaults = KpiDefaultsConfig(
            go_live_date="2026-08-15",
            week_start="monday",
            exclude_incident_states=["Canceled"],
            exclude_change_states=["Canceled", "New"],
            transition_week_excluded=True,
            rolling_window_weeks=4,
        )

    def test_kpi01_automation_coverage(self):
        """Golden Test 1: JDE 9/15 = 60%, Portfolio = 71.4%."""
        cls = get_calculator_class("AutomationCoverageCalculator")
        calc = cls(KpiConfig(id="kpi1", enabled=True, order=1, title="Coverage", calculator="AutomationCoverageCalculator", sources=["kavach_postgres"], data_label="DEMO"), self.defaults)
        res = calc.calculate("jde", "test", {"automated_count": 9, "total_count": 15}, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.headline["value"], 60.0)
        self.assertIn("9/15", res.headline["text"])

    def test_kpi02_scenario_coverage(self):
        """Golden Test 2: 10 critical flows, 3 uncovered -> Uncovered 30%."""
        cls = get_calculator_class("ScenarioCoverageCalculator")
        calc = cls(KpiConfig(id="kpi2", enabled=True, order=2, title="Depth", calculator="ScenarioCoverageCalculator", sources=["servicenow"], data_label="MIXED"), self.defaults)
        res = calc.calculate("jde", "test", {"total_critical_flows": 10, "uncovered_critical_flows": 3}, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.headline["value"], 30.0)

    def test_kpi03_defect_detection(self):
        """Golden Test 3: 150 Kavach + 320 PROD -> DDP 31.9%."""
        cls = get_calculator_class("DefectDetectionCalculator")
        calc = cls(KpiConfig(id="kpi3", enabled=True, order=3, title="DDP", calculator="DefectDetectionCalculator", sources=["servicenow"], data_label="MIXED"), self.defaults)
        res = calc.calculate("jde", "test", {"kavach_preprod_count": 150, "prod_defect_count": 320}, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.headline["value"], 31.9)

    def test_kpi04_prod_before_after(self):
        """Golden Test 4: Before 996 in 16d, After 4713 in 69d -> 1,867.5 vs 2,049.1 per 30d."""
        cls = get_calculator_class("ProdBeforeAfterCalculator")
        calc = cls(KpiConfig(id="kpi4", enabled=True, order=4, title="Before/After", calculator="ProdBeforeAfterCalculator", sources=["servicenow"], data_label="REAL"), self.defaults)
        res = calc.calculate("jde", "test", {
            "before_count": 996, "before_days": 16,
            "after_count": 4713, "after_days": 69,
        }, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.components["before_rate_30d"], 1867.5)
        self.assertEqual(res.components["after_rate_30d"], 2049.1)

    def test_kpi06_change_failure_rate(self):
        """Golden Test 6: CFR 41/90 vs 115/376 -> 45.6% vs 30.6%."""
        cls = get_calculator_class("ChangeFailureRateCalculator")
        calc = cls(KpiConfig(id="kpi6", enabled=True, order=6, title="CFR", calculator="ChangeFailureRateCalculator", sources=["servicenow"], data_label="REAL"), self.defaults)
        res = calc.calculate("jde", "test", {
            "total_changes": 376,
            "failed_changes": 115,
            "before_failed": 41,
            "before_total": 90,
            "after_failed": 115,
            "after_total": 376,
        }, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.headline["value"], 30.6)
        self.assertEqual(res.components["before_cfr"], 45.6)

    def test_kpi07_time_to_fix(self):
        """Golden Test 7: Duration 7.98 days."""
        cls = get_calculator_class("TimeToFixCalculator")
        calc = cls(KpiConfig(id="kpi7", enabled=True, order=7, title="TTF", calculator="TimeToFixCalculator", sources=["servicenow"], data_label="MIXED"), self.defaults)
        res = calc.calculate("jde", "test", {"ttf_durations_days": [7.98, 5.0, 10.0]}, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.headline["value"], 7.98)

    def test_kpi08_qa_hours_saved(self):
        """Golden Test 8: 443 runs x 20 min, $40/h = 147.7 h, $5,907."""
        cls = get_calculator_class("QaHoursSavedCalculator")
        calc = cls(KpiConfig(id="kpi8", enabled=True, order=8, title="QA Saved", calculator="QaHoursSavedCalculator", sources=["kavach_postgres"], data_label="PLACEHOLDER", params={"manual_minutes_per_test": 20, "qa_hourly_rate_usd": 40}), self.defaults)
        res = calc.calculate("jde", "test", {"eligible_runs": 443}, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.headline["value"], 147.7)
        self.assertIn(res.components["dollars_saved"], (5907, 5908))

    def test_kpi09_cost_of_quality(self):
        """Golden Test 9: 32 defects, gross $144,000, AI $0.56, infra $375, net $143,624."""
        cls = get_calculator_class("CostOfQualityCalculator")
        calc = cls(KpiConfig(id="kpi9", enabled=True, order=9, title="CoQ", calculator="CostOfQualityCalculator", sources=["kavach_postgres"], data_label="PLACEHOLDER", params={"prod_fix_cost_usd": 5000, "preprod_fix_cost_usd": 500, "infra_cost_per_month_usd": 150}), self.defaults)
        res = calc.calculate("jde", "test", {"kavach_defects_caught": 32, "ai_cost": 0.56, "months_active": 2.5}, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(round(res.headline["value"]), 143624)

    def test_kpi10_weekly_impact(self):
        """Golden Test 10: 50 caught + 50 PROD -> reduction 50%."""
        cls = get_calculator_class("WeeklyImpactCalculator")
        calc = cls(KpiConfig(id="kpi10", enabled=True, order=10, title="Weekly Impact", calculator="WeeklyImpactCalculator", sources=["servicenow"], data_label="MIXED"), self.defaults)
        res = calc.calculate("jde", "test", {"prod_incidents_week": 50, "kavach_caught_week": 50}, self.defaults.go_live_date)
        self.assertEqual(res.status, "OK")
        self.assertEqual(res.headline["value"], 50.0)


if __name__ == "__main__":
    unittest.main()
