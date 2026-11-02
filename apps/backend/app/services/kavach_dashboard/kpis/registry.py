"""
KPI Calculator Registry — Strategy + Registry pattern.

Maps calculator class names from kpis.yaml to actual Python classes.
"""
from __future__ import annotations
from typing import Type
from .base import KpiCalculator

_REGISTRY: dict[str, Type[KpiCalculator]] = {}

ALIASES: dict[str, str] = {
    "AutomationCoverageKpi": "AutomationCoverageCalculator",
    "ScenarioCoverageKpi": "ScenarioCoverageCalculator",
    "DefectDetectionKpi": "DefectDetectionCalculator",
    "ProdBeforeAfterKpi": "ProdBeforeAfterCalculator",
    "DefectsWowMomKpi": "WoWMoMCalculator",
    "ChangeFailureRateKpi": "ChangeFailureRateCalculator",
    "TimeToFixKpi": "TimeToFixCalculator",
    "QaHoursSavedKpi": "QaHoursSavedCalculator",
    "CostOfQualityKpi": "CostOfQualityCalculator",
    "WeeklyImpactKpi": "WeeklyImpactCalculator",
}


def register_kpi(name: str):
    """Decorator to register a KPI calculator class."""
    def decorator(cls: Type[KpiCalculator]) -> Type[KpiCalculator]:
        _REGISTRY[name] = cls
        return cls
    return decorator


def get_calculator_class(name: str) -> Type[KpiCalculator]:
    """Look up a calculator class by its config name."""
    resolved_name = ALIASES.get(name, name)
    if resolved_name in _REGISTRY:
        return _REGISTRY[resolved_name]

    if name in _REGISTRY:
        return _REGISTRY[name]

    available = ", ".join(sorted(_REGISTRY.keys()))
    raise KeyError(f"Unknown KPI calculator '{name}'. Available: {available}")


def list_registered() -> list[str]:
    """Return all registered calculator names."""
    return sorted(_REGISTRY.keys())
