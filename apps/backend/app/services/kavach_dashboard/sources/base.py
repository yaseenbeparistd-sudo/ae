"""
Abstract base class for data source adapters.

All adapters yield pages of rows as generators to maintain constant memory.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Generator


class SourceAdapter(ABC):
    """Base class for all data source adapters."""

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Unique source identifier matching config."""
        ...

    @abstractmethod
    def iter_pages(
        self,
        table: str,
        filters: dict[str, Any] | None = None,
        fields: list[str] | None = None,
    ) -> Generator[list[dict[str, Any]], None, None]:
        """Yield pages of rows from the source. Each page is a list of dicts."""
        ...

    @abstractmethod
    def health_check(self) -> bool:
        """Check if the source is reachable."""
        ...

    def close(self) -> None:
        """Clean up resources."""
        pass

