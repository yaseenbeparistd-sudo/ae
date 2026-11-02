"""Source adapter registry."""
from __future__ import annotations
from typing import Type
from .base import SourceAdapter

_SOURCE_REGISTRY: dict[str, Type[SourceAdapter]] = {}

def register_source(name: str):
    """Decorator to register a source adapter class."""
    def decorator(cls: Type[SourceAdapter]) -> Type[SourceAdapter]:
        _SOURCE_REGISTRY[name] = cls
        return cls
    return decorator

def get_source_class(name: str) -> Type[SourceAdapter]:
    if name not in _SOURCE_REGISTRY:
        raise KeyError(f"Unknown source adapter '{name}'. Available: {list(_SOURCE_REGISTRY.keys())}")
    return _SOURCE_REGISTRY[name]

