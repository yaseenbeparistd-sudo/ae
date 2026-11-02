"""
Abstract base class for all KPI calculators.

Every KPI implements a single calculator class that:
1. Declares which aggregator outputs it needs
2. Computes headline, components, and series from aggregates
3. Returns a KpiResult

Adding a new KPI = one new class + one config entry in kpis.yaml
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from ..config.models import KpiConfig, KpiDefaultsConfig


@dataclass
class KpiResult:
    """Standard KPI result contract — stored in Redis and Postgres."""
    kpi_id: str
    app_id: str
    run_id: str
    data_label: str
    headline: dict[str, Any]
    components: dict[str, Any]
    series: list[dict[str, Any]]
    footnote: str | None = None
    status: str = "OK"  # OK | NA | NO_DATA | ERROR
    calculated_at: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "kpi_id": self.kpi_id,
            "app_id": self.app_id,
            "run_id": self.run_id,
            "data_label": self.data_label,
            "headline": self.headline,
            "components": self.components,
            "series": self.series,
            "footnote": self.footnote,
            "status": self.status,
            "calculated_at": self.calculated_at,
        }


class KpiCalculator(ABC):
    """Base class for all KPI calculators."""

    def __init__(self, config: KpiConfig, defaults: KpiDefaultsConfig) -> None:
        self.config = config
        self.defaults = defaults

    @property
    def kpi_id(self) -> str:
        return self.config.id

    @property
    def data_label(self) -> str:
        return self.config.data_label

    @abstractmethod
    def required_aggregations(self) -> list[str]:
        """Return list of aggregation keys this KPI needs."""
        ...

    @abstractmethod
    def calculate(
        self,
        app_id: str,
        run_id: str,
        aggregates: dict[str, Any],
        go_live_date: date,
    ) -> KpiResult:
        """Compute the KPI from pre-aggregated data."""
        ...

    def _make_result(
        self,
        app_id: str,
        run_id: str,
        headline: dict[str, Any],
        components: dict[str, Any],
        series: list[dict[str, Any]] | None = None,
        status: str = "OK",
    ) -> KpiResult:
        """Helper to build a KpiResult with standard fields."""
        return KpiResult(
            kpi_id=self.kpi_id,
            app_id=app_id,
            run_id=run_id,
            data_label=self.data_label,
            headline=headline,
            components=components,
            series=series or [],
            footnote=self.config.params.get("footnote"),
            status=status,
            calculated_at=datetime.utcnow().isoformat() + "Z",
        )
