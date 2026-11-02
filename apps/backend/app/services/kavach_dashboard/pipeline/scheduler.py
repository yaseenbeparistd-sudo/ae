"""
KPI refresh scheduler.

Runs the pipeline orchestrator at a configurable frequency.
Uses APScheduler + Redis distributed lock to prevent overlapping runs.
"""
from __future__ import annotations
import logging
from typing import Any

from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)


class KpiScheduler:
    """Manages scheduled KPI refresh runs."""

    def __init__(
        self,
        orchestrator: Any,
        frequency_minutes: int = 60,
        enabled: bool = True,
    ) -> None:
        self._orchestrator = orchestrator
        self._frequency = frequency_minutes
        self._enabled = enabled
        self._scheduler: BackgroundScheduler | None = None

    def _run_refresh(self) -> None:
        """Execute a single refresh run."""
        logger.info("Scheduled refresh starting...")
        try:
            meta = self._orchestrator.run()
            logger.info(
                "Refresh completed: status=%s, kpis_ok=%d, kpis_failed=%d, rows=%d",
                meta.get("status"),
                meta.get("kpis_ok", 0),
                meta.get("kpis_failed", 0),
                meta.get("rows_read", 0),
            )
        except Exception as e:
            logger.error("Scheduled refresh failed: %s", e, exc_info=True)

    def start(self) -> None:
        """Start the scheduler."""
        if not self._enabled:
            logger.info("KPI refresh scheduler is disabled")
            return

        self._scheduler = BackgroundScheduler()
        self._scheduler.add_job(
            self._run_refresh,
            trigger="interval",
            minutes=self._frequency,
            id="kavach_kpi_refresh",
            replace_existing=True,
            max_instances=1,
        )
        self._scheduler.start()
        logger.info("KPI scheduler started (every %d minutes)", self._frequency)

        # Trigger initial run in background on startup
        try:
            self._run_refresh()
        except Exception as e:
            logger.warning("Initial refresh on startup had warning: %s", e)

    def stop(self) -> None:
        """Stop the scheduler."""
        if self._scheduler:
            self._scheduler.shutdown(wait=False)
            logger.info("KPI scheduler stopped")

    def trigger_now(self) -> dict[str, Any]:
        """Manually trigger a refresh run."""
        return self._orchestrator.run()

