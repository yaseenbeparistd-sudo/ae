"""
Row-level filters for application + assignment group matching.

Filters are applied in the streaming pipeline to keep only rows
belonging to configured applications.
"""
from __future__ import annotations
import logging
from typing import Any

logger = logging.getLogger(__name__)


class ApplicationFilter:
    """Filter rows by application name and assignment groups."""

    def __init__(self, app_name: str, assignment_groups: list[str]) -> None:
        self._app_name = app_name.lower()
        self._groups = {g.lower() for g in assignment_groups} if assignment_groups else set()
        self._stats = {"total": 0, "kept": 0, "dropped_app": 0, "dropped_group": 0}

    def matches(self, row: dict[str, Any], app_field: str = "application", group_field: str = "assignment_group") -> bool:
        """Check if a row matches this application's filter criteria."""
        self._stats["total"] += 1

        # Check application match
        row_app = str(row.get(app_field, "")).lower()
        if row_app and self._app_name not in row_app:
            self._stats["dropped_app"] += 1
            return False

        # Check assignment group match (if groups are configured)
        if self._groups:
            row_group = str(row.get(group_field, "")).lower()
            if row_group and row_group not in self._groups:
                self._stats["dropped_group"] += 1
                return False

        self._stats["kept"] += 1
        return True

    @property
    def stats(self) -> dict[str, int]:
        return dict(self._stats)

