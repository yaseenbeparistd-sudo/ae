"""
OneView Monitor — Demo Data Service

Generates realistic synthetic data for all applications when DEMO_MODE is enabled.
Every demo data point is flagged as demo — never confusable with live data.
"""

import random
import math
from datetime import datetime, timedelta, timezone
from typing import Any


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _jitter(base: float, pct: float = 0.1) -> float:
    return base * (1 + random.uniform(-pct, pct))


def _time_series(
    hours: int = 24, interval_minutes: int = 5, base: float = 50.0,
    noise: float = 10.0, spike_chance: float = 0.05, spike_magnitude: float = 3.0,
) -> list[dict]:
    """Generate a time-series with realistic variation and occasional spikes."""
    now = utcnow()
    points = []
    steps = (hours * 60) // interval_minutes
    for i in range(steps):
        ts = now - timedelta(minutes=(steps - i) * interval_minutes)
        # Sinusoidal pattern + noise
        phase = (i / steps) * 2 * math.pi
        val = base + math.sin(phase) * (base * 0.15) + random.gauss(0, noise)
        # Occasional spike
        if random.random() < spike_chance:
            val += random.uniform(base * 0.5, base * spike_magnitude)
        points.append({
            "timestamp": ts.isoformat(),
            "value": round(max(0, val), 2),
            "_demo": True,
        })
    return points


class DemoDataService:
    """Provides synthetic data flagged as demo for all dashboard views."""

    # ── Dashboard Summary ────────────────────────────────────────────────

    def get_dashboard_summary(self) -> dict[str, Any]:
        return {
            "_demo": True,
            "total_applications": 3,
            "healthy": 2,
            "warning": 1,
            "critical": 0,
            "unknown": 0,
            "total_active_users": random.randint(120, 180),
            "active_sessions": random.randint(80, 140),
            "total_api_requests": random.randint(45000, 65000),
            "total_errors": random.randint(15, 45),
            "estimated_cost": round(random.uniform(120, 280), 2),
            "total_tokens": random.randint(2000000, 5000000),
        }

    # ── Application List ─────────────────────────────────────────────────

    def get_applications(self) -> list[dict]:
        return [
            {
                "id": "netra",
                "name": "Netra",
                "description": "RAG application for Baxter",
                "enabled": True,
                "health_monitoring": True,
                "logs": True,
                "application_metrics": True,
                "custom_adapter": "netra",
                "custom_metrics": [],
                "environment": "prod",
                "version": "2.4.1",
                "owner": "Platform Team",
                "health_state": "healthy",
                "health_score": 92,
                "uptime_percent": 99.94,
                "active_users": random.randint(110, 150),
                "error_count": random.randint(2, 8),
                "request_rate": round(random.uniform(45, 85), 1),
                "last_updated_seconds_ago": random.randint(3, 15),
                "_demo": True,
            },
            {
                "id": "kavacha",
                "name": "NextGen2",
                "description": "Autonomous test automation & security gateway",
                "enabled": True,
                "health_monitoring": True,
                "logs": True,
                "application_metrics": False,
                "custom_adapter": "kavacha",
                "custom_metrics": [],
                "environment": "prod",
                "version": "1.8.3",
                "owner": "Security Team",
                "health_state": "warning",
                "health_score": 74,
                "uptime_percent": 99.82,
                "active_users": random.randint(20, 40),
                "error_count": random.randint(10, 25),
                "request_rate": round(random.uniform(12, 30), 1),
                "last_updated_seconds_ago": random.randint(5, 30),
                "_demo": True,
            },
            {
                "id": "blackline",
                "name": "Blackline",
                "description": "Financial reconciliation platform",
                "enabled": True,
                "health_monitoring": True,
                "logs": True,
                "application_metrics": False,
                "custom_adapter": "blackline",
                "custom_metrics": [],
                "environment": "prod",
                "version": "3.1.0",
                "owner": "Finance Engineering",
                "health_state": "healthy",
                "health_score": 88,
                "uptime_percent": 99.98,
                "active_users": random.randint(30, 60),
                "error_count": random.randint(0, 5),
                "request_rate": round(random.uniform(20, 50), 1),
                "last_updated_seconds_ago": random.randint(3, 20),
                "_demo": True,
            },
        ]

    # ── Health Metrics ───────────────────────────────────────────────────

    def get_health_metrics(self, app_id: str) -> dict[str, Any]:
        configs = {
            "netra": {"cpu_base": 42, "mem_base": 68, "err_base": 1.2, "lat_base": 180},
            "kavacha": {"cpu_base": 36.5, "mem_base": 88.1, "err_base": 0.4, "lat_base": 0},
            "blackline": {"cpu_base": 28, "mem_base": 45, "err_base": 0.4, "lat_base": 120},
        }
        cfg = configs.get(app_id, configs["netra"])

        return {
            "_demo": True,
            "application": app_id,
            "health_state": "healthy",
            "health_score": 85 if app_id == "kavacha" else random.randint(85, 96),
            "uptime_percent": 99.99 if app_id == "kavacha" else round(random.uniform(99.7, 99.99), 2),
            "request_rate": round(random.uniform(30, 100), 1),
            "error_rate": round(_jitter(cfg["err_base"]), 2),
            "error_count": random.randint(5, 50),
            "avg_latency_ms": round(_jitter(cfg["lat_base"]), 1),
            "p50_latency_ms": round(_jitter(cfg["lat_base"] * 0.7), 1),
            "p95_latency_ms": round(_jitter(cfg["lat_base"] * 2.2), 1),
            "p99_latency_ms": round(_jitter(cfg["lat_base"] * 4.5), 1),
            "cpu_usage_percent": round(_jitter(cfg["cpu_base"]), 1),
            "memory_usage_percent": round(_jitter(cfg["mem_base"]), 1),
            "disk_usage_percent": round(random.uniform(25, 55), 1),
            "network_ingress_mbps": round(random.uniform(5, 25), 2),
            "network_egress_mbps": round(random.uniform(2, 15), 2),
            "total_containers": random.randint(3, 8),
            "running_containers": random.randint(3, 7),
            "restart_count": random.randint(0, 3),
            "container_failures": random.randint(0, 1),
            "active_incidents": 1 if app_id == "kavacha" else 0,
            "time_series": {
                "cpu": _time_series(24, 5, cfg["cpu_base"], 5),
                "memory": _time_series(24, 5, cfg["mem_base"], 3),
                "request_rate": _time_series(24, 5, 60, 15, 0.03),
                "error_rate": _time_series(24, 5, cfg["err_base"], 0.5, 0.08, 5),
                "latency_p95": _time_series(24, 5, cfg["lat_base"] * 2, 50),
            },
        }

    # ── Logs ─────────────────────────────────────────────────────────────

    def get_logs(self, app_id: str, limit: int = 100) -> list[dict]:
        levels = ["DEBUG", "INFO", "INFO", "INFO", "INFO", "WARN", "ERROR", "FATAL"]
        weights = [5, 40, 40, 40, 40, 10, 8, 1]
        services = [f"{app_id}-api", f"{app_id}-worker", f"{app_id}-gateway"]
        messages = {
            "DEBUG": ["Cache hit for key user:session:*", "Query plan: sequential scan on metrics"],
            "INFO": [
                "Request completed successfully",
                "User session started",
                "Healthcheck passed",
                "Background job completed",
                "Document indexed successfully",
            ],
            "WARN": [
                "Response time exceeded 500ms threshold",
                "Memory usage above 80%",
                "Rate limit approaching for API key",
                "Retry attempt 2/3 for upstream service",
            ],
            "ERROR": [
                "Request failed: upstream timeout after 30s",
                "Database connection pool exhausted",
                "Failed to parse response from external API",
                "Authentication token validation failed",
            ],
            "FATAL": ["Out of memory: process killed by OOM killer"],
        }

        logs = []
        now = utcnow()
        for i in range(limit):
            level = random.choices(levels, weights=weights, k=1)[0]
            ts = now - timedelta(seconds=random.randint(0, 86400))
            service = random.choice(services)
            logs.append({
                "id": i + 1,
                "timestamp": ts.isoformat(),
                "application_id": app_id,
                "environment": "prod",
                "level": level,
                "message": random.choice(messages.get(level, messages["INFO"])),
                "service": service,
                "container": f"{service}-{random.randint(1, 3):02d}",
                "host": f"host-{random.randint(1, 4):02d}",
                "request_id": f"req_{random.randint(100000, 999999)}",
                "trace_id": f"trace_{random.randint(100000, 999999)}",
                "user_id": f"user_{random.randint(1, 200)}" if random.random() > 0.3 else None,
                "event_metadata": {},
                "_demo": True,
            })
        logs.sort(key=lambda x: x["timestamp"], reverse=True)
        return logs

    # ── Infrastructure ───────────────────────────────────────────────────

    def get_infrastructure(self, app_id: str) -> dict[str, Any]:
        containers = []
        services = ["api", "worker", "gateway", "redis", "postgres"]
        for svc in services[:random.randint(3, 5)]:
            containers.append({
                "container_id": f"c_{random.randint(100000, 999999)}",
                "name": f"{app_id}-{svc}",
                "image": f"baxter/{app_id}-{svc}:latest",
                "status": "running",
                "state": "healthy" if random.random() > 0.1 else "unhealthy",
                "cpu_percent": round(random.uniform(5, 65), 1),
                "memory_usage_mb": round(random.uniform(128, 1024), 1),
                "memory_limit_mb": 2048.0,
                "memory_percent": round(random.uniform(10, 75), 1),
                "network_rx_mb": round(random.uniform(10, 500), 1),
                "network_tx_mb": round(random.uniform(5, 200), 1),
                "block_read_mb": round(random.uniform(1, 100), 1),
                "block_write_mb": round(random.uniform(1, 50), 1),
                "pid_count": random.randint(5, 50),
                "restart_count": random.randint(0, 3),
                "created_at": (utcnow() - timedelta(days=random.randint(1, 30))).isoformat(),
                "ports": [{"container": 8080, "host": 8080 + random.randint(0, 100)}],
                "labels": {"app": app_id, "service": svc},
                "_demo": True,
            })

        return {
            "_demo": True,
            "cpu_usage_percent": round(random.uniform(25, 60), 1),
            "memory_usage_percent": round(random.uniform(40, 75), 1),
            "network_rx_mbps": round(random.uniform(5, 30), 2),
            "network_tx_mbps": round(random.uniform(2, 20), 2),
            "total_containers": len(containers),
            "running_containers": len(containers),
            "error_count": random.randint(0, 5),
            "containers": containers,
            "time_series": {
                "cpu": _time_series(24, 5, 40, 8),
                "memory": _time_series(24, 5, 60, 5),
                "network_io": _time_series(24, 5, 15, 5),
            },
        }

    # ── Netra-specific ───────────────────────────────────────────────────

    def get_netra_users(self) -> dict[str, Any]:
        return {
            "_demo": True,
            "total_users": 342,
            "active_users": random.randint(120, 160),
            "new_users_period": random.randint(8, 25),
            "logged_in_users": random.randint(100, 140),
            "logged_out_users": random.randint(180, 220),
            "users_in_session": random.randint(60, 100),
            "dau": random.randint(90, 140),
            "wau": random.randint(200, 280),
            "mau": random.randint(300, 342),
            "users": [
                {
                    "user_id": f"user_{i}",
                    "username": f"user{i}@baxter.com",
                    "role": random.choice(["analyst", "engineer", "manager", "admin"]),
                    "last_login": (utcnow() - timedelta(hours=random.randint(0, 72))).isoformat(),
                    "session_count": random.randint(5, 50),
                    "api_requests": random.randint(100, 2000),
                    "token_usage": random.randint(5000, 100000),
                    "estimated_cost": round(random.uniform(0.5, 25.0), 2),
                    "_demo": True,
                }
                for i in range(1, 21)
            ],
        }

    def get_netra_sessions(self) -> dict[str, Any]:
        return {
            "_demo": True,
            "total_sessions": random.randint(800, 1200),
            "active_sessions": random.randint(60, 100),
            "completed_sessions": random.randint(700, 1100),
            "avg_session_duration_minutes": round(random.uniform(12, 35), 1),
            "longest_session_minutes": round(random.uniform(120, 240), 1),
            "session_failures": random.randint(2, 10),
            "session_timeout_count": random.randint(5, 15),
        }

    def get_netra_api_usage(self) -> dict[str, Any]:
        return {
            "_demo": True,
            "total_requests": random.randint(45000, 65000),
            "requests_per_minute": round(random.uniform(30, 80), 1),
            "requests_per_hour": random.randint(2000, 5000),
            "requests_per_day": random.randint(40000, 70000),
            "success_count": random.randint(40000, 60000),
            "error_count": random.randint(50, 200),
            "error_rate_percent": round(random.uniform(0.1, 1.5), 2),
            "avg_latency_ms": round(random.uniform(100, 300), 1),
            "p95_latency_ms": round(random.uniform(300, 800), 1),
            "p99_latency_ms": round(random.uniform(600, 1500), 1),
            "endpoints": [
                {"path": "/api/v1/query", "method": "POST", "count": random.randint(10000, 20000), "avg_latency_ms": round(random.uniform(200, 500), 1), "error_rate": round(random.uniform(0, 2), 2)},
                {"path": "/api/v1/documents", "method": "GET", "count": random.randint(5000, 10000), "avg_latency_ms": round(random.uniform(50, 150), 1), "error_rate": round(random.uniform(0, 1), 2)},
                {"path": "/api/v1/embed", "method": "POST", "count": random.randint(8000, 15000), "avg_latency_ms": round(random.uniform(100, 300), 1), "error_rate": round(random.uniform(0, 0.5), 2)},
                {"path": "/api/v1/chat", "method": "POST", "count": random.randint(15000, 25000), "avg_latency_ms": round(random.uniform(500, 1200), 1), "error_rate": round(random.uniform(0.1, 1), 2)},
            ],
            "time_series": {
                "requests": _time_series(24, 5, 50, 15),
                "errors": _time_series(24, 5, 2, 1, 0.05, 8),
                "latency": _time_series(24, 5, 200, 50),
            },
        }

    def get_netra_tokens(self) -> dict[str, Any]:
        return {
            "_demo": True,
            "total_tokens": random.randint(3000000, 6000000),
            "input_tokens": random.randint(2000000, 4000000),
            "output_tokens": random.randint(800000, 2000000),
            "total_ai_requests": random.randint(20000, 40000),
            "avg_tokens_per_request": random.randint(100, 300),
            "per_model": [
                {"model": "gpt-4o", "tokens": random.randint(1500000, 3000000), "requests": random.randint(10000, 20000), "cost": round(random.uniform(60, 150), 2)},
                {"model": "gpt-4o-mini", "tokens": random.randint(500000, 1500000), "requests": random.randint(5000, 15000), "cost": round(random.uniform(5, 20), 2)},
                {"model": "text-embedding-3-small", "tokens": random.randint(800000, 2000000), "requests": random.randint(8000, 15000), "cost": round(random.uniform(1, 5), 2)},
            ],
            "time_series": _time_series(24, 5, 2000, 500),
        }

    def get_netra_cost(self) -> dict[str, Any]:
        return {
            "_demo": True,
            "total_estimated_cost": round(random.uniform(150, 350), 2),
            "cost_today": round(random.uniform(8, 25), 2),
            "cost_this_week": round(random.uniform(50, 120), 2),
            "cost_this_month": round(random.uniform(150, 350), 2),
            "avg_cost_per_request": round(random.uniform(0.001, 0.01), 4),
            "currency": "USD",
            "time_series": _time_series(24, 60, 1.5, 0.5),
        }

    # ── Alerts ───────────────────────────────────────────────────────────

    def get_alerts(self, app_id: str | None = None) -> list[dict]:
        alerts = [
            {
                "id": "alert_001",
                "alert_rule_id": "rule_001",
                "application_id": "kavacha",
                "metric": "error_rate",
                "condition": "greater_than",
                "threshold": 5.0,
                "current_value": 7.2,
                "severity": "warning",
                "state": "triggered",
                "started_at": (utcnow() - timedelta(minutes=45)).isoformat(),
                "resolved_at": None,
                "acknowledged_by": None,
                "acknowledged_at": None,
                "notification_sent": True,
                "_demo": True,
            },
            {
                "id": "alert_002",
                "alert_rule_id": "rule_002",
                "application_id": "netra",
                "metric": "p95_latency_ms",
                "condition": "greater_than",
                "threshold": 800.0,
                "current_value": 542.0,
                "severity": "info",
                "state": "resolved",
                "started_at": (utcnow() - timedelta(hours=3)).isoformat(),
                "resolved_at": (utcnow() - timedelta(hours=2)).isoformat(),
                "acknowledged_by": "admin@baxter.com",
                "acknowledged_at": (utcnow() - timedelta(hours=2, minutes=30)).isoformat(),
                "notification_sent": True,
                "_demo": True,
            },
        ]
        if app_id:
            return [a for a in alerts if a["application_id"] == app_id]
        return alerts
