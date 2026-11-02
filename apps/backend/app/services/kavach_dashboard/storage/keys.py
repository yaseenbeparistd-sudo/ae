"""
Redis key builders — all keys in one place.

Key pattern:
  kavach:current_run                                          -> run_id
  kavach:lock:refresh                                         -> lock
  kavach:run:{run_id}:meta                                    -> hash
  kavach:run:{run_id}:kpi:{kpi_id}:app:{app_id}:snapshot     -> JSON
  kavach:run:{run_id}:kpi:{kpi_id}:app:{app_id}:series:{g}   -> JSON list
  kavach:run:{run_id}:kpi:kpi2_scenario_coverage:app:{app_id}:flows -> JSON
  kavach:runs                                                 -> sorted set
"""

class RedisKeys:
    """Centralised key builder for all Redis keys."""

    def __init__(self, prefix: str = "kavach") -> None:
        self.prefix = prefix

    def current_run(self) -> str:
        return f"{self.prefix}:current_run"

    def lock(self, name: str = "refresh") -> str:
        return f"{self.prefix}:lock:{name}"

    def run_meta(self, run_id: str) -> str:
        return f"{self.prefix}:run:{run_id}:meta"

    def kpi_snapshot(self, run_id: str, kpi_id: str, app_id: str) -> str:
        return f"{self.prefix}:run:{run_id}:kpi:{kpi_id}:app:{app_id}:snapshot"

    def kpi_series(self, run_id: str, kpi_id: str, app_id: str, grain: str) -> str:
        return f"{self.prefix}:run:{run_id}:kpi:{kpi_id}:app:{app_id}:series:{grain}"

    def kpi_flows(self, run_id: str, kpi_id: str, app_id: str) -> str:
        return f"{self.prefix}:run:{run_id}:kpi:{kpi_id}:app:{app_id}:flows"

    def runs_sorted_set(self) -> str:
        return f"{self.prefix}:runs"

