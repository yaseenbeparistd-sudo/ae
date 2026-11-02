"""Custom exceptions for the Kavach Business Dashboard."""


class KavachDashboardError(Exception):
    """Base exception for the dashboard."""


class ConfigError(KavachDashboardError):
    """Invalid or missing configuration."""


class SourceError(KavachDashboardError):
    """Error reading from a data source."""


class AdapterError(SourceError):
    """Error in a source adapter."""


class KpiCalculationError(KavachDashboardError):
    """Error computing a KPI."""


class StorageError(KavachDashboardError):
    """Error writing to or reading from storage."""


class RefreshLockError(KavachDashboardError):
    """Could not acquire refresh lock."""

