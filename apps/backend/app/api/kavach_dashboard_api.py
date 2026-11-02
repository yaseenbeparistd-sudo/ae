"""
Kavach Business Dashboard — Read API.

Serves pre-computed KPI results from Redis/serving cache.
Strictly read-only for dashboard rendering (no live calculations on request path).
"""
from __future__ import annotations
import logging
import os
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.core.config import get_settings
from app.services.kavach_dashboard.config.loader import load_kavach_dashboard_config
from app.services.kavach_dashboard.storage.redis_client import KavachRedisClient
from app.services.kavach_dashboard.pipeline.orchestrator import PipelineOrchestrator
from app.services.kavach_dashboard.sources.servicenow.client import ServiceNowAdapter
from app.services.kavach_dashboard.sources.postgres.adapter import KavachPostgresAdapter

logger = logging.getLogger(__name__)

router = APIRouter()
settings = get_settings()

# Initialize config and clients (singleton)
CONFIG_DIR = Path(__file__).resolve().parent.parent.parent / "config" / "kavach_dashboard"
_config = None
_redis_client = None
_orchestrator = None


def get_dashboard_config():
    global _config
    if _config is None:
        _config = load_kavach_dashboard_config(CONFIG_DIR)
    return _config


def get_redis_client():
    global _redis_client
    if _redis_client is None:
        redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
        _redis_client = KavachRedisClient(url=redis_url, key_prefix="kavach")
    return _redis_client


def get_orchestrator():
    global _orchestrator
    if _orchestrator is None:
        cfg = get_dashboard_config()
        rc = get_redis_client()
        adapters = {
            "servicenow": ServiceNowAdapter("", "", ""),
            "kavach_postgres": KavachPostgresAdapter(""),
        }
        _orchestrator = PipelineOrchestrator(cfg, rc, None, adapters)
    return _orchestrator


def ensure_initial_run():
    """Ensure at least one run exists in the store; if not, triggers an initial calculation."""
    rc = get_redis_client()
    if not rc.get_current_run_id():
        orch = get_orchestrator()
        orch.run()


@router.get("/health", tags=["Kavach Business Dashboard"])
async def health_check():
    """Liveness check for the dashboard service."""
    return {"status": "healthy", "service": "kavach-business-dashboard"}


@router.get("/ready", tags=["Kavach Business Dashboard"])
async def ready_check():
    """Readiness check: checks Redis and current active run."""
    ensure_initial_run()
    rc = get_redis_client()
    current_run = rc.get_current_run_id()
    return {
        "status": "ready" if current_run else "initializing",
        "redis_connected": rc.ping(),
        "current_run_id": current_run,
    }


@router.get("/meta", tags=["Kavach Business Dashboard"])
async def get_meta():
    """Get metadata for the current run, last refresh time, and status."""
    ensure_initial_run()
    rc = get_redis_client()
    current_run = rc.get_current_run_id()
    if not current_run:
        raise HTTPException(status_code=503, detail="No active KPI run available")

    meta = rc.read_run_meta(current_run)
    return {
        "current_run_id": current_run,
        "meta": meta,
        "is_stale": False,
    }


@router.get("/config/ui", tags=["Kavach Business Dashboard"])
async def get_ui_config():
    """Returns the UI layout configuration (sections and widgets)."""
    cfg = get_dashboard_config()
    d = cfg.ui.dashboard if hasattr(cfg.ui, 'dashboard') else cfg.ui
    return {
        "title": d.title,
        "default_application": d.default_application,
        "filters": d.filters,
        "sections": [s.model_dump() for s in d.sections],
        "kpis": [k.model_dump() for k in cfg.kpis if k.enabled],
    }


@router.get("/applications", tags=["Kavach Business Dashboard"])
async def list_applications():
    """Returns the list of configured applications."""
    cfg = get_dashboard_config()
    return [
        {
            "id": app.id,
            "display_name": app.display_name,
            "enabled": app.enabled,
            "go_live_date": str(app.go_live_date) if app.go_live_date else "2026-08-15",
        }
        for app in cfg.applications
    ]


@router.get("/kpis", tags=["Kavach Business Dashboard"])
async def get_all_kpis(app: str = Query("jde", description="Application ID")):
    """Get all enabled KPI snapshots for the specified application."""
    ensure_initial_run()
    cfg = get_dashboard_config()
    rc = get_redis_client()
    current_run = rc.get_current_run_id()

    if not current_run:
        raise HTTPException(status_code=503, detail="No active KPI run available")

    enabled_kpi_ids = [k.id for k in cfg.kpis if k.enabled]
    snapshots = rc.read_all_kpi_snapshots(current_run, enabled_kpi_ids, app)

    # Convert list to dict keyed by kpi_id for easier frontend consumption
    by_id = {s["kpi_id"]: s for s in snapshots}
    return {
        "run_id": current_run,
        "app_id": app,
        "snapshots": by_id,
        "items": snapshots,
    }


@router.get("/kpis/{kpi_id}", tags=["Kavach Business Dashboard"])
async def get_kpi_snapshot(kpi_id: str, app: str = Query("jde", description="Application ID")):
    """Get a single KPI snapshot."""
    ensure_initial_run()
    rc = get_redis_client()
    current_run = rc.get_current_run_id()
    if not current_run:
        raise HTTPException(status_code=503, detail="No active KPI run available")

    snapshot = rc.read_kpi_snapshot(current_run, kpi_id, app)
    if not snapshot:
        raise HTTPException(status_code=404, detail=f"KPI '{kpi_id}' not found for app '{app}'")
    return snapshot


@router.get("/kpis/{kpi_id}/series", tags=["Kavach Business Dashboard"])
async def get_kpi_series(
    kpi_id: str,
    app: str = Query("jde", description="Application ID"),
    grain: str = Query("week", regex="^(week|month|release)$"),
):
    """Get time series data for a specific KPI."""
    ensure_initial_run()
    rc = get_redis_client()
    current_run = rc.get_current_run_id()
    if not current_run:
        raise HTTPException(status_code=503, detail="No active KPI run available")

    series = rc.read_kpi_series(current_run, kpi_id, app, grain)
    return {
        "run_id": current_run,
        "kpi_id": kpi_id,
        "app_id": app,
        "grain": grain,
        "series": series or [],
    }


@router.post("/admin/refresh", status_code=status.HTTP_202_ACCEPTED, tags=["Kavach Business Dashboard"])
async def trigger_refresh():
    """Trigger an immediate KPI refresh cycle."""
    orch = get_orchestrator()
    meta = orch.run()
    return {
        "message": "Refresh executed",
        "run_id": meta.get("run_id"),
        "status": meta.get("status"),
        "kpis_ok": meta.get("kpis_ok"),
        "rows_read": meta.get("rows_read"),
    }
