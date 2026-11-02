"""
Redis client wrapper for the Kavach Business Dashboard.

Handles connection, serialisation, versioned writes, atomic pointer swap,
and retention cleanup. Includes fallback mock storage if Redis server is unreachable in local dev.
"""
from __future__ import annotations
import json
import logging
import time
from typing import Any
import redis

from .keys import RedisKeys

logger = logging.getLogger(__name__)


class KavachRedisClient:
    """Redis client with dashboard-specific operations."""

    def __init__(self, url: str, key_prefix: str = "kavach", ttl_hours: int = 48) -> None:
        self._url = url
        self._prefix = key_prefix
        self._ttl_seconds = ttl_hours * 3600
        self._keys = RedisKeys(prefix=key_prefix)
        self._is_connected = False
        self._fallback_store: dict[str, Any] = {}
        self._fallback_hashes: dict[str, dict[str, Any]] = {}
        self._fallback_zsets: dict[str, dict[str, float]] = {}

        try:
            self._client = redis.Redis.from_url(url, decode_responses=True, socket_connect_timeout=2)
            self._client.ping()
            self._is_connected = True
            logger.info("Connected to Redis at %s", url)
        except Exception as e:
            logger.warning("Redis not reachable at %s (%s). Using in-memory fallback for local dev.", url, e)
            self._client = None
            self._is_connected = False

    @property
    def keys(self) -> RedisKeys:
        return self._keys

    def ping(self) -> bool:
        """Check Redis connectivity."""
        if not self._is_connected or not self._client:
            return False
        try:
            return bool(self._client.ping())
        except Exception:
            return False

    def get_current_run_id(self) -> str | None:
        """Get the current active run ID."""
        key = self._keys.current_run()
        if self._is_connected and self._client:
            try:
                return self._client.get(key)
            except Exception as e:
                logger.error("Redis error in get_current_run_id: %s", e)
        return self._fallback_store.get(key)

    def acquire_lock(self, lock_name: str = "refresh", ttl_seconds: int = 1800) -> bool:
        """Try to acquire a distributed lock. Returns True if acquired."""
        key = self._keys.lock(lock_name)
        if self._is_connected and self._client:
            try:
                return bool(self._client.set(key, "locked", nx=True, px=ttl_seconds * 1000))
            except Exception as e:
                logger.error("Redis error acquiring lock: %s", e)
        if key in self._fallback_store:
            return False
        self._fallback_store[key] = "locked"
        return True

    def extend_lock(self, lock_name: str = "refresh", ttl_seconds: int = 1800) -> bool:
        """Extend lock TTL (heartbeat)."""
        key = self._keys.lock(lock_name)
        if self._is_connected and self._client:
            try:
                return bool(self._client.pexpire(key, ttl_seconds * 1000))
            except Exception:
                return False
        return key in self._fallback_store

    def release_lock(self, lock_name: str = "refresh") -> None:
        """Release the distributed lock."""
        key = self._keys.lock(lock_name)
        if self._is_connected and self._client:
            try:
                self._client.delete(key)
                return
            except Exception as e:
                logger.error("Redis error releasing lock: %s", e)
        self._fallback_store.pop(key, None)

    def write_run_meta(self, run_id: str, meta: dict[str, Any]) -> None:
        """Write run metadata as a Redis hash."""
        key = self._keys.run_meta(run_id)
        serialised = {k: json.dumps(v) if isinstance(v, (list, dict)) else str(v) for k, v in meta.items()}
        if self._is_connected and self._client:
            try:
                self._client.hset(key, mapping=serialised)
                self._client.expire(key, self._ttl_seconds)
                return
            except Exception as e:
                logger.error("Redis error writing run_meta: %s", e)
        self._fallback_hashes[key] = dict(serialised)

    def write_kpi_snapshot(self, run_id: str, kpi_id: str, app_id: str, result: dict[str, Any]) -> None:
        """Write a KPI snapshot result."""
        key = self._keys.kpi_snapshot(run_id, kpi_id, app_id)
        data = json.dumps(result)
        if self._is_connected and self._client:
            try:
                self._client.set(key, data, ex=self._ttl_seconds)
                return
            except Exception as e:
                logger.error("Redis error writing kpi_snapshot: %s", e)
        self._fallback_store[key] = data

    def write_kpi_series(self, run_id: str, kpi_id: str, app_id: str, grain: str, series: list[dict]) -> None:
        """Write KPI time series data."""
        key = self._keys.kpi_series(run_id, kpi_id, app_id, grain)
        data = json.dumps(series)
        if self._is_connected and self._client:
            try:
                self._client.set(key, data, ex=self._ttl_seconds)
                return
            except Exception as e:
                logger.error("Redis error writing kpi_series: %s", e)
        self._fallback_store[key] = data

    def atomic_swap_current_run(self, run_id: str) -> None:
        """Atomically set the current run pointer."""
        curr_key = self._keys.current_run()
        runs_key = self._keys.runs_sorted_set()
        now = time.time()
        if self._is_connected and self._client:
            try:
                pipe = self._client.pipeline()
                pipe.set(curr_key, run_id)
                pipe.zadd(runs_key, {run_id: now})
                pipe.execute()
                logger.info("Swapped current run to %s (Redis)", run_id)
                return
            except Exception as e:
                logger.error("Redis error swapping current run: %s", e)
        self._fallback_store[curr_key] = run_id
        if runs_key not in self._fallback_zsets:
            self._fallback_zsets[runs_key] = {}
        self._fallback_zsets[runs_key][run_id] = now
        logger.info("Swapped current run to %s (in-memory fallback)", run_id)

    def read_kpi_snapshot(self, run_id: str, kpi_id: str, app_id: str) -> dict[str, Any] | None:
        """Read a single KPI snapshot."""
        key = self._keys.kpi_snapshot(run_id, kpi_id, app_id)
        data = None
        if self._is_connected and self._client:
            try:
                data = self._client.get(key)
            except Exception as e:
                logger.error("Redis error reading kpi_snapshot: %s", e)
        if not data:
            data = self._fallback_store.get(key)
        return json.loads(data) if data else None

    def read_kpi_series(self, run_id: str, kpi_id: str, app_id: str, grain: str) -> list[dict] | None:
        """Read KPI series data."""
        key = self._keys.kpi_series(run_id, kpi_id, app_id, grain)
        data = None
        if self._is_connected and self._client:
            try:
                data = self._client.get(key)
            except Exception as e:
                logger.error("Redis error reading kpi_series: %s", e)
        if not data:
            data = self._fallback_store.get(key)
        return json.loads(data) if data else None

    def read_run_meta(self, run_id: str) -> dict[str, Any] | None:
        """Read run metadata."""
        key = self._keys.run_meta(run_id)
        data = None
        if self._is_connected and self._client:
            try:
                data = self._client.hgetall(key)
            except Exception as e:
                logger.error("Redis error reading run_meta: %s", e)
        if not data:
            data = self._fallback_hashes.get(key, {})
        if not data:
            return None
        res = dict(data)
        for k, v in res.items():
            try:
                res[k] = json.loads(v)
            except (json.JSONDecodeError, TypeError):
                pass
        return res

    def read_all_kpi_snapshots(self, run_id: str, kpi_ids: list[str], app_id: str) -> list[dict[str, Any]]:
        """Read all KPI snapshots for a run and app."""
        results = []
        for kpi_id in kpi_ids:
            snapshot = self.read_kpi_snapshot(run_id, kpi_id, app_id)
            if snapshot:
                results.append(snapshot)
        return results

    def cleanup_old_runs(self, keep: int = 3) -> int:
        """Remove old runs, keeping the N most recent successful ones."""
        runs_key = self._keys.runs_sorted_set()
        if self._is_connected and self._client:
            try:
                all_runs = self._client.zrangebyscore(runs_key, "-inf", "+inf")
                if len(all_runs) <= keep:
                    return 0
                to_remove = all_runs[:-keep]
                removed = 0
                for run_id in to_remove:
                    pattern = f"{self._prefix}:run:{run_id}:*"
                    keys = self._client.keys(pattern)
                    if keys:
                        self._client.delete(*keys)
                    self._client.zrem(runs_key, run_id)
                    removed += 1
                return removed
            except Exception as e:
                logger.error("Redis error in cleanup_old_runs: %s", e)
        return 0

