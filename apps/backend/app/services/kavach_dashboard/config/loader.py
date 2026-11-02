"""
Config loader for the Kavach Business Dashboard.

Reads all YAML files from the config directory, merges them into a single
dict, and validates via the Pydantic root model ``KavachDashboardConfig``.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import yaml

from app.services.kavach_dashboard.config.models import (
    FlowRulesConfig,
    KavachDashboardConfig,
    UiConfig,
)
from app.services.kavach_dashboard.core.errors import ConfigError

logger = logging.getLogger(__name__)

# Default location relative to the repository root.
_DEFAULT_CONFIG_DIR = (
    Path(__file__).resolve().parents[4] / "config" / "kavach_dashboard"
)

# Maps each YAML filename to the top-level keys it provides.
_FILE_KEY_MAP: dict[str, list[str]] = {
    "app.yaml": ["app", "refresh", "retention"],
    "sources.yaml": ["sources"],
    "applications.yaml": ["applications"],
    "kpis.yaml": ["defaults", "kpis"],
    "flow_rules.yaml": [],  # entire file → flow_rules
    "cache.yaml": ["redis"],
    "ui.yaml": [],  # entire file → ui
}


def load_yaml(path: Path) -> dict[str, Any]:
    """Load a single YAML file and return its contents as a dict.

    Raises ``ConfigError`` if the file is missing, unreadable, or not valid
    YAML.
    """
    if not path.exists():
        raise ConfigError(f"Config file not found: {path}")

    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = yaml.safe_load(fh)
    except yaml.YAMLError as exc:
        raise ConfigError(f"Invalid YAML in {path}: {exc}") from exc
    except OSError as exc:
        raise ConfigError(f"Cannot read {path}: {exc}") from exc

    if data is None:
        return {}
    if not isinstance(data, dict):
        raise ConfigError(f"Expected a mapping at top level of {path}, got {type(data).__name__}")

    return data


def _merge_app_yaml(merged: dict[str, Any], data: dict[str, Any]) -> None:
    """Merge keys from *app.yaml* into the aggregate dict."""
    for key in ("app", "refresh", "retention"):
        if key in data:
            merged[key] = data[key]


def _merge_sources_yaml(merged: dict[str, Any], data: dict[str, Any]) -> None:
    """Merge keys from *sources.yaml*."""
    if "sources" in data:
        merged["sources"] = data["sources"]


def _merge_applications_yaml(merged: dict[str, Any], data: dict[str, Any]) -> None:
    """Merge keys from *applications.yaml*."""
    if "applications" in data:
        merged["applications"] = data["applications"]


def _merge_kpis_yaml(merged: dict[str, Any], data: dict[str, Any]) -> None:
    """Merge keys from *kpis.yaml*."""
    for key in ("defaults", "kpis"):
        if key in data:
            merged[key] = data[key]


def _merge_flow_rules_yaml(merged: dict[str, Any], data: dict[str, Any]) -> None:
    """Merge keys from *flow_rules.yaml* — the whole file maps to ``flow_rules``."""
    merged["flow_rules"] = data


def _merge_cache_yaml(merged: dict[str, Any], data: dict[str, Any]) -> None:
    """Merge keys from *cache.yaml*."""
    if "redis" in data:
        merged["redis"] = data["redis"]


def _merge_ui_yaml(merged: dict[str, Any], data: dict[str, Any]) -> None:
    """Merge keys from *ui.yaml* — the whole file maps to ``ui``."""
    merged["ui"] = data


# Registry of merge functions keyed by YAML filename.
_MERGERS: dict[str, Any] = {
    "app.yaml": _merge_app_yaml,
    "sources.yaml": _merge_sources_yaml,
    "applications.yaml": _merge_applications_yaml,
    "kpis.yaml": _merge_kpis_yaml,
    "flow_rules.yaml": _merge_flow_rules_yaml,
    "cache.yaml": _merge_cache_yaml,
    "ui.yaml": _merge_ui_yaml,
}


def load_kavach_dashboard_config(
    config_dir: Path | None = None,
) -> KavachDashboardConfig:
    """Load, merge, and validate all Kavach dashboard YAML config files.

    Parameters
    ----------
    config_dir:
        Directory containing the YAML files.  Defaults to
        ``apps/backend/config/kavach_dashboard/`` relative to the repo root.

    Returns
    -------
    KavachDashboardConfig
        Fully validated root configuration object.

    Raises
    ------
    ConfigError
        On missing files, invalid YAML, or Pydantic validation failures.
    """
    config_dir = config_dir or _DEFAULT_CONFIG_DIR

    if not config_dir.is_dir():
        raise ConfigError(f"Config directory does not exist: {config_dir}")

    merged: dict[str, Any] = {}

    for filename, merger in _MERGERS.items():
        filepath = config_dir / filename
        logger.debug("Loading config file: %s", filepath)
        data = load_yaml(filepath)
        merger(merged, data)

    # Validate the merged dict against the Pydantic models.
    try:
        config = KavachDashboardConfig.model_validate(merged)
    except Exception as exc:
        raise ConfigError(
            f"Config validation failed: {exc}"
        ) from exc

    logger.info(
        "Kavach dashboard config loaded: %d applications, %d KPIs, %d flow rules",
        len(config.applications),
        len(config.kpis),
        len(config.flow_rules.rules),
    )
    return config

