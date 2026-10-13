"""
OneView Monitor — Kavacha API

REST endpoints that expose data from the Kavacha (nextgen2) PostgreSQL
database for the frontend dashboard.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Query
from app.services.kavacha_db import (
    get_overview_summary,
    get_users, get_user_count,
    get_applications, get_application_count,
    get_app_business_impact,
    get_recent_failures,
    get_test_cases, get_test_case_stats,
    get_generations, get_generation_stats,
    get_executions, get_execution_stats,
    get_batches,
    get_schedules, get_schedule_runs,
    get_ai_calls, get_ai_cost_stats,
    get_healing_proposals,
    get_support_tickets, get_support_stats,
    get_documents,
    get_test_suites,
    get_app_maps,
    check_db_health,
)

router = APIRouter()


def _serialise(obj):
    """Make datetime objects JSON-serialisable."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _serialise(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialise(v) for v in obj]
    return obj


# ── Overview ─────────────────────────────────────────────────────────────────

@router.get("/overview")
async def kavacha_overview():
    """Full summary KPIs across all Kavacha entities."""
    return _serialise(get_overview_summary())


@router.get("/health")
async def kavacha_health():
    """Check Kavacha DB connectivity."""
    return _serialise(check_db_health())


@router.get("/business-impact")
async def kavacha_business_impact(limit: int = Query(5, ge=1, le=50)):
    """Application level business impact metrics."""
    return _serialise(get_app_business_impact(limit=limit))


# ── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
async def kavacha_users(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_users(limit, offset), "total": get_user_count()})


# ── Applications ─────────────────────────────────────────────────────────────

@router.get("/applications")
async def kavacha_applications(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_applications(limit, offset), "total": get_application_count()})


# ── Test Cases ───────────────────────────────────────────────────────────────

@router.get("/test-cases")
async def kavacha_test_cases(
    app_id: int | None = None,
    status: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({
        "items": get_test_cases(app_id, status, limit, offset),
        "stats": get_test_case_stats(),
    })


@router.get("/test-cases/stats")
async def kavacha_test_case_stats():
    return _serialise(get_test_case_stats())


# ── Generations ──────────────────────────────────────────────────────────────

@router.get("/generations")
async def kavacha_generations(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({
        "items": get_generations(limit, offset),
        "stats": get_generation_stats(),
    })


@router.get("/generations/stats")
async def kavacha_generation_stats():
    return _serialise(get_generation_stats())


# ── Executions ───────────────────────────────────────────────────────────────

@router.get("/executions")
async def kavacha_executions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({
        "items": get_executions(limit, offset),
        "stats": get_execution_stats(),
    })


@router.get("/executions/stats")
async def kavacha_execution_stats():
    return _serialise(get_execution_stats())


# ── Batches ──────────────────────────────────────────────────────────────────

@router.get("/batches")
async def kavacha_batches(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_batches(limit, offset)})


# ── Schedules ────────────────────────────────────────────────────────────────

@router.get("/schedules")
async def kavacha_schedules(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_schedules(limit, offset)})


@router.get("/schedules/{schedule_id}/runs")
async def kavacha_schedule_runs(schedule_id: int, limit: int = 20):
    return _serialise({"items": get_schedule_runs(schedule_id, limit)})


# ── AI Costs ─────────────────────────────────────────────────────────────────

@router.get("/ai-costs")
async def kavacha_ai_costs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({
        "items": get_ai_calls(limit, offset),
        "stats": get_ai_cost_stats(),
    })


@router.get("/ai-costs/stats")
async def kavacha_ai_cost_summary():
    return _serialise(get_ai_cost_stats())


# ── Healing ──────────────────────────────────────────────────────────────────

@router.get("/healing")
async def kavacha_healing(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_healing_proposals(limit, offset)})


# ── Support ──────────────────────────────────────────────────────────────────

@router.get("/support")
async def kavacha_support(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({
        "items": get_support_tickets(limit, offset),
        "stats": get_support_stats(),
    })


@router.get("/support/stats")
async def kavacha_support_stats():
    return _serialise(get_support_stats())


# ── Documents ────────────────────────────────────────────────────────────────

@router.get("/documents")
async def kavacha_documents(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_documents(limit, offset)})


# ── Test Suites ──────────────────────────────────────────────────────────────

@router.get("/test-suites")
async def kavacha_test_suites(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_test_suites(limit, offset)})


# ── App Maps ─────────────────────────────────────────────────────────────────

@router.get("/app-maps")
async def kavacha_app_maps(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return _serialise({"items": get_app_maps(limit, offset)})


# ── Recent Failures in Plain Language ─────────────────────────────────────────

@router.get("/recent-failures")
async def kavacha_recent_failures(limit: int = Query(5, ge=1, le=50)):
    """Recent failed test executions with human-readable diagnostic context."""
    return _serialise(get_recent_failures(limit=limit))


