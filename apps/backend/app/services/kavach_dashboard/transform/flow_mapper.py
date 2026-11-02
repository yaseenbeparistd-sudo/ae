"""
Business flow mapper — maps ticket titles to business flows.

Uses ordered keyword rules from flow_rules.yaml. First match wins.
"""
from __future__ import annotations
import logging
from typing import Any

logger = logging.getLogger(__name__)


class FlowMapper:
    """Map incident/ticket titles to business flows using keyword rules."""

    def __init__(
        self,
        rules: list[dict[str, Any]],
        match_field: str = "title",
        case_sensitive: bool = False,
        unmapped_label: str = "unmapped",
    ) -> None:
        self._match_field = match_field
        self._case_sensitive = case_sensitive
        self._unmapped_label = unmapped_label
        self._stats = {"total": 0, "mapped": 0, "unmapped": 0}

        self._rules = sorted(rules, key=lambda r: r.get("order", 999))
        if not case_sensitive:
            for rule in self._rules:
                rule["_keywords_lower"] = [k.lower() for k in rule.get("keywords", [])]

    def map_flow(self, row: dict[str, Any]) -> str:
        """Determine the business flow for a row. Returns flow name or unmapped_label."""
        self._stats["total"] += 1
        title = str(row.get(self._match_field, row.get("short_description", "")))

        if not self._case_sensitive:
            title = title.lower()

        for rule in self._rules:
            keywords = rule.get("_keywords_lower", rule.get("keywords", []))
            for keyword in keywords:
                if keyword in title:
                    self._stats["mapped"] += 1
                    return rule["flow"]

        self._stats["unmapped"] += 1
        return self._unmapped_label

    @property
    def stats(self) -> dict[str, int]:
        return dict(self._stats)

