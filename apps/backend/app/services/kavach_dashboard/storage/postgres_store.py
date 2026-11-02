"""
PostgreSQL durable store for KPI snapshots and series.

Provides durable historical KPI data that survives Redis restarts.
"""
from __future__ import annotations
import json
import logging
from datetime import datetime
from typing import Any

import psycopg2
import psycopg2.extras

logger = logging.getLogger(__name__)

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS kpi_snapshots (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL,
    kpi_id VARCHAR(64) NOT NULL,
    app_id VARCHAR(64) NOT NULL,
    data_label VARCHAR(16) NOT NULL,
    headline JSONB NOT NULL,
    components JSONB NOT NULL,
    footnote TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'OK',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(run_id, kpi_id, app_id)
);

CREATE TABLE IF NOT EXISTS kpi_series (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL,
    kpi_id VARCHAR(64) NOT NULL,
    app_id VARCHAR(64) NOT NULL,
    grain VARCHAR(16) NOT NULL,
    series_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(run_id, kpi_id, app_id, grain)
);

CREATE TABLE IF NOT EXISTS kpi_run_meta (
    run_id VARCHAR(64) PRIMARY KEY,
    status VARCHAR(16) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    rows_read INTEGER DEFAULT 0,
    kpis_ok INTEGER DEFAULT 0,
    kpis_failed INTEGER DEFAULT 0,
    config_hash VARCHAR(64),
    errors JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_ticket_facts (
    id SERIAL PRIMARY KEY,
    ticket_hash VARCHAR(64) NOT NULL,
    source VARCHAR(16) NOT NULL,
    table_name VARCHAR(32) NOT NULL,
    app_id VARCHAR(64) NOT NULL,
    flow VARCHAR(64),
    priority VARCHAR(8),
    assignment_group VARCHAR(128),
    state VARCHAR(32),
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    period VARCHAR(16),
    detected_by_automation BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(ticket_hash, source)
);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_run ON kpi_snapshots(run_id);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_kpi ON kpi_snapshots(kpi_id, app_id);
CREATE INDEX IF NOT EXISTS idx_kpi_series_run ON kpi_series(run_id);
CREATE INDEX IF NOT EXISTS idx_ticket_facts_app ON kpi_ticket_facts(app_id, source);
CREATE INDEX IF NOT EXISTS idx_ticket_facts_hash ON kpi_ticket_facts(ticket_hash);
"""


class KpiPostgresStore:
    """Durable PostgreSQL store for KPI results and ticket facts."""

    def __init__(self, dsn: str, schema: str = "public") -> None:
        self._dsn = dsn
        self._schema = schema
        self._connected = False

    def _get_connection(self):
        """Get a new database connection."""
        conn = psycopg2.connect(self._dsn, connect_timeout=3)
        conn.autocommit = False
        if self._schema != "public":
            with conn.cursor() as cur:
                cur.execute(f"SET search_path TO {self._schema}, public")
        return conn

    def init_tables(self) -> bool:
        """Create KPI tables if they don't exist."""
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute(CREATE_TABLES_SQL)
            conn.commit()
            conn.close()
            self._connected = True
            logger.info("KPI history tables initialised")
            return True
        except Exception as e:
            logger.warning("Could not initialise KPI tables in PostgreSQL (%s). Working in memory.", e)
            return False

    def save_run_meta(self, meta: dict[str, Any]) -> None:
        """Insert or update run metadata."""
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO kpi_run_meta (run_id, status, started_at, finished_at, rows_read, kpis_ok, kpis_failed, config_hash, errors)
                    VALUES (%(run_id)s, %(status)s, %(started_at)s, %(finished_at)s, %(rows_read)s, %(kpis_ok)s, %(kpis_failed)s, %(config_hash)s, %(errors)s::jsonb)
                    ON CONFLICT (run_id) DO UPDATE SET
                        status = EXCLUDED.status,
                        finished_at = EXCLUDED.finished_at,
                        rows_read = EXCLUDED.rows_read,
                        kpis_ok = EXCLUDED.kpis_ok,
                        kpis_failed = EXCLUDED.kpis_failed,
                        errors = EXCLUDED.errors
                """, {
                    **meta,
                    "errors": json.dumps(meta.get("errors", [])),
                })
            conn.commit()
            conn.close()
        except Exception as e:
            logger.warning("Failed to save run meta to Postgres: %s", e)

    def save_kpi_snapshot(self, result: dict[str, Any]) -> None:
        """Save a KPI snapshot result."""
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO kpi_snapshots (run_id, kpi_id, app_id, data_label, headline, components, footnote, status, calculated_at)
                    VALUES (%(run_id)s, %(kpi_id)s, %(app_id)s, %(data_label)s, %(headline)s::jsonb, %(components)s::jsonb, %(footnote)s, %(status)s, %(calculated_at)s)
                    ON CONFLICT (run_id, kpi_id, app_id) DO UPDATE SET
                        headline = EXCLUDED.headline,
                        components = EXCLUDED.components,
                        status = EXCLUDED.status,
                        calculated_at = EXCLUDED.calculated_at
                """, {
                    "run_id": result["run_id"],
                    "kpi_id": result["kpi_id"],
                    "app_id": result["app_id"],
                    "data_label": result["data_label"],
                    "headline": json.dumps(result["headline"]),
                    "components": json.dumps(result["components"]),
                    "footnote": result.get("footnote"),
                    "status": result["status"],
                    "calculated_at": result.get("calculated_at", datetime.utcnow().isoformat()),
                })
            conn.commit()
            conn.close()
        except Exception as e:
            logger.warning("Failed to save KPI snapshot to Postgres: %s", e)

    def save_kpi_series(self, run_id: str, kpi_id: str, app_id: str, grain: str, series: list[dict]) -> None:
        """Save KPI series data."""
        try:
            conn = self._get_connection()
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO kpi_series (run_id, kpi_id, app_id, grain, series_data)
                    VALUES (%s, %s, %s, %s, %s::jsonb)
                    ON CONFLICT (run_id, kpi_id, app_id, grain) DO UPDATE SET
                        series_data = EXCLUDED.series_data
                """, (run_id, kpi_id, app_id, grain, json.dumps(series)))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.warning("Failed to save KPI series to Postgres: %s", e)

    def get_latest_snapshots(self, app_id: str) -> list[dict[str, Any]]:
        """Get the most recent KPI snapshots for an app."""
        try:
            conn = self._get_connection()
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute("""
                    SELECT s.* FROM kpi_snapshots s
                    INNER JOIN (
                        SELECT run_id FROM kpi_run_meta
                        WHERE status = 'SUCCESS'
                        ORDER BY started_at DESC LIMIT 1
                    ) latest ON s.run_id = latest.run_id
                    WHERE s.app_id = %s
                    ORDER BY s.kpi_id
                """, (app_id,))
                rows = cur.fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as e:
            logger.warning("Failed to get latest snapshots from Postgres: %s", e)
            return []

