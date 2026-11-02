"""
Pydantic v2 configuration models for the Kavach Business Dashboard.

Every YAML config file maps to a model tree rooted at ``KavachDashboardConfig``.
All env-var references (fields ending in ``_env``) are plain strings — they are
**not** resolved here; the loader resolves them at startup.
"""
from __future__ import annotations

from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


# ─── helpers ────────────────────────────────────────────────────────────────


def _validate_date_string(value: str) -> str:
    """Ensure a string is a valid ISO-8601 date (YYYY-MM-DD)."""
    date.fromisoformat(value)
    return value


# ─── app.yaml ───────────────────────────────────────────────────────────────


class AppConfig(BaseModel):
    """Top-level ``app`` block."""

    name: str = "kavach-business-dashboard"
    timezone: str = "UTC"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"


class RefreshConfig(BaseModel):
    """Background refresh-job settings."""

    enabled: bool = True
    frequency_minutes: int = Field(default=60, ge=1)
    max_run_minutes: int = Field(default=30, ge=1)
    lock_key: str = "kavach:lock:refresh"


class RetentionConfig(BaseModel):
    """How many completed runs to keep before pruning."""

    keep_runs: int = Field(default=3, ge=1)


# ─── sources.yaml ───────────────────────────────────────────────────────────


class ServiceNowAuthConfig(BaseModel):
    """Authentication configuration for ServiceNow."""

    type: Literal["basic", "oauth"] = "basic"
    username_env: str = ""
    password_env: str = ""


class ServiceNowHttpConfig(BaseModel):
    """HTTP transport tunables for ServiceNow REST calls."""

    timeout_seconds: int = Field(default=60, ge=1)
    page_size: int = Field(default=1000, ge=1)
    max_retries: int = Field(default=5, ge=0)
    backoff_seconds: int = Field(default=2, ge=0)
    rate_limit_per_minute: int = Field(default=60, ge=1)


class ServiceNowTableConfig(BaseModel):
    """A single ServiceNow table endpoint."""

    enabled: bool = True
    path: str


class ServiceNowSourceConfig(BaseModel):
    """Complete ServiceNow data-source configuration."""

    enabled: bool = True
    type: Literal["servicenow_rest"] = "servicenow_rest"
    base_url_env: str = ""
    auth: ServiceNowAuthConfig = Field(default_factory=ServiceNowAuthConfig)
    http: ServiceNowHttpConfig = Field(default_factory=ServiceNowHttpConfig)
    tables: dict[str, ServiceNowTableConfig] = Field(default_factory=dict)
    field_map: dict[str, str] = Field(default_factory=dict)


class KavachPostgresPoolConfig(BaseModel):
    """Connection-pool settings for the Kavach Postgres source."""

    min_size: int = Field(default=1, ge=1)
    max_size: int = Field(default=5, ge=1)

    @model_validator(mode="after")
    def _pool_bounds(self) -> "KavachPostgresPoolConfig":
        if self.min_size > self.max_size:
            raise ValueError(
                f"pool.min_size ({self.min_size}) must be <= pool.max_size ({self.max_size})"
            )
        return self


class KavachPostgresSourceConfig(BaseModel):
    """Complete Kavach Postgres data-source configuration."""

    enabled: bool = True
    type: Literal["postgres"] = "postgres"
    dsn_env: str = ""
    schema_env: str = ""
    pool: KavachPostgresPoolConfig = Field(default_factory=KavachPostgresPoolConfig)
    statement_timeout_seconds: int = Field(default=120, ge=1)


class SourcesConfig(BaseModel):
    """Root wrapper for the ``sources`` block in *sources.yaml*."""

    servicenow: ServiceNowSourceConfig = Field(
        default_factory=ServiceNowSourceConfig
    )
    kavach_postgres: KavachPostgresSourceConfig = Field(
        default_factory=KavachPostgresSourceConfig
    )


# ─── applications.yaml ─────────────────────────────────────────────────────


class ApplicationConfig(BaseModel):
    """A single onboarded application."""

    id: str
    display_name: str
    enabled: bool = False
    servicenow_app_name: str = ""
    assignment_groups: list[str] = Field(default_factory=list)
    region_map: dict[str, str] = Field(default_factory=dict)
    kavach_application_id: int | None = None
    go_live_date: str = ""

    @field_validator("go_live_date")
    @classmethod
    def _check_go_live_date(cls, v: str) -> str:
        if v:
            _validate_date_string(v)
        return v


# ─── kpis.yaml ──────────────────────────────────────────────────────────────


class KpiDefaultsConfig(BaseModel):
    """Global defaults applied to every KPI unless overridden."""

    go_live_date: str = ""
    week_start: Literal[
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ] = "monday"
    exclude_incident_states: list[str] = Field(default_factory=list)
    exclude_change_states: list[str] = Field(default_factory=list)
    transition_week_excluded: bool = True
    rolling_window_weeks: int = Field(default=4, ge=1)

    @field_validator("go_live_date")
    @classmethod
    def _check_go_live_date(cls, v: str) -> str:
        if v:
            _validate_date_string(v)
        return v


class KpiConfig(BaseModel):
    """Definition of a single KPI from the catalogue."""

    id: str
    enabled: bool = True
    order: int = Field(ge=1)
    title: str
    calculator: str
    sources: list[str] = Field(min_length=1)
    data_label: Literal["REAL", "DEMO", "MIXED", "PLACEHOLDER"] = "REAL"
    params: dict[str, Any] = Field(default_factory=dict)


# ─── flow_rules.yaml ───────────────────────────────────────────────────────


class FlowMatchConfig(BaseModel):
    """Matching strategy for the flow-rule engine."""

    field: str = "title"
    case_sensitive: bool = False
    strategy: Literal["first_match"] = "first_match"


class FlowRuleConfig(BaseModel):
    """A single keyword-based flow mapping rule."""

    order: int = Field(ge=1)
    flow: str
    keywords: list[str] = Field(min_length=1)


class FlowRulesConfig(BaseModel):
    """Root model for *flow_rules.yaml*."""

    match: FlowMatchConfig = Field(default_factory=FlowMatchConfig)
    unmapped_label: str = "unmapped"
    non_defect_flows: list[str] = Field(default_factory=list)
    rules: list[FlowRuleConfig] = Field(default_factory=list)


# ─── cache.yaml ─────────────────────────────────────────────────────────────


class RedisConfig(BaseModel):
    """Redis cache settings."""

    url_env: str = "REDIS_URL"
    key_prefix: str = "kavach"
    ttl_hours: int = Field(default=48, ge=1)
    serializer: Literal["json", "msgpack"] = "json"


# ─── ui.yaml ────────────────────────────────────────────────────────────────


class WidgetConfig(BaseModel):
    """A single widget inside a dashboard section."""

    kpi: str
    type: str
    series: str | None = None
    marker: str | None = None
    toggle: list[str] | None = None


class SectionConfig(BaseModel):
    """A dashboard section containing one or more widgets."""

    id: str
    title: str
    widgets: list[WidgetConfig] = Field(min_length=1)


class DashboardLayoutConfig(BaseModel):
    """Complete dashboard layout definition."""

    title: str = ""
    default_application: str = ""
    filters: list[str] = Field(default_factory=list)
    sections: list[SectionConfig] = Field(default_factory=list)


class UiConfig(BaseModel):
    """Root wrapper for *ui.yaml*."""

    dashboard: DashboardLayoutConfig = Field(default_factory=DashboardLayoutConfig)


# ─── Root aggregate ─────────────────────────────────────────────────────────


class KavachDashboardConfig(BaseModel):
    """
    Root configuration object that aggregates every sub-config.

    Constructed by the loader after merging all YAML files and validating
    them against the Pydantic models.
    """

    # app.yaml
    app: AppConfig = Field(default_factory=AppConfig)
    refresh: RefreshConfig = Field(default_factory=RefreshConfig)
    retention: RetentionConfig = Field(default_factory=RetentionConfig)

    # sources.yaml
    sources: SourcesConfig = Field(default_factory=SourcesConfig)

    # applications.yaml
    applications: list[ApplicationConfig] = Field(default_factory=list)

    # kpis.yaml
    defaults: KpiDefaultsConfig = Field(default_factory=KpiDefaultsConfig)
    kpis: list[KpiConfig] = Field(default_factory=list)

    # flow_rules.yaml
    flow_rules: FlowRulesConfig = Field(default_factory=FlowRulesConfig)

    # cache.yaml
    redis: RedisConfig = Field(default_factory=RedisConfig)

    # ui.yaml
    ui: UiConfig = Field(default_factory=UiConfig)

    @model_validator(mode="after")
    def _validate_kpi_ids_unique(self) -> "KavachDashboardConfig":
        """Ensure no duplicate KPI ids."""
        seen: set[str] = set()
        for kpi in self.kpis:
            if kpi.id in seen:
                raise ValueError(f"Duplicate KPI id: {kpi.id}")
            seen.add(kpi.id)
        return self

    @model_validator(mode="after")
    def _validate_widget_kpi_refs(self) -> "KavachDashboardConfig":
        """Ensure every widget references an existing KPI id."""
        kpi_ids = {k.id for k in self.kpis}
        if not kpi_ids:
            return self  # nothing to validate yet
        for section in self.ui.dashboard.sections:
            for widget in section.widgets:
                if widget.kpi not in kpi_ids:
                    raise ValueError(
                        f"Widget in section '{section.id}' references unknown "
                        f"KPI '{widget.kpi}'"
                    )
        return self

    @model_validator(mode="after")
    def _validate_app_ids_unique(self) -> "KavachDashboardConfig":
        """Ensure no duplicate application ids."""
        seen: set[str] = set()
        for app in self.applications:
            if app.id in seen:
                raise ValueError(f"Duplicate application id: {app.id}")
            seen.add(app.id)
        return self

