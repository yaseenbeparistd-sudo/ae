"""Abstract base class for streaming aggregators."""
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any


class Aggregator(ABC):
    """Base class for streaming aggregators. Fed one normalised row at a time."""

    @abstractmethod
    def feed(self, event: dict[str, Any]) -> None:
        """Process a single normalised event."""
        ...

    @abstractmethod
    def result(self) -> dict[str, Any]:
        """Return the aggregated result."""
        ...

    def reset(self) -> None:
        """Reset aggregator state for a new run."""
        pass

