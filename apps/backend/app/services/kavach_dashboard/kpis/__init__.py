"""KPI calculators package — imports all KPI modules for auto-registration."""
from .base import KpiCalculator, KpiResult
from .registry import register_kpi, get_calculator_class, list_registered

# Import all KPI implementations so @register_kpi executes
from . import kpi01_automation_coverage
from . import kpi02_scenario_coverage
from . import kpi03_defect_detection
from . import kpi04_prod_before_after
from . import kpi05_wow_mom
from . import kpi06_change_failure_rate
from . import kpi07_time_to_fix
from . import kpi08_qa_hours_saved
from . import kpi09_cost_of_quality
from . import kpi10_weekly_impact

__all__ = [
    "KpiCalculator",
    "KpiResult",
    "register_kpi",
    "get_calculator_class",
    "list_registered",
]
