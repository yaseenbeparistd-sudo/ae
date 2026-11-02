"""
Kavach Business Dashboard CLI.

Usage:
  python -m app.services.kavach_dashboard.cli validate-config
  python -m app.services.kavach_dashboard.cli refresh
"""
import argparse
import sys
from pathlib import Path

# Ensure apps/backend is in sys.path
backend_root = Path(__file__).resolve().parent.parent.parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.services.kavach_dashboard.config.loader import load_kavach_dashboard_config
from app.services.kavach_dashboard.storage.redis_client import KavachRedisClient
from app.services.kavach_dashboard.pipeline.orchestrator import PipelineOrchestrator
from app.services.kavach_dashboard.sources.servicenow.client import ServiceNowAdapter
from app.services.kavach_dashboard.sources.postgres.adapter import KavachPostgresAdapter


def validate_config():
    try:
        cfg = load_kavach_dashboard_config()
        print("[OK] Configuration is valid!")
        print(f"  App Name:     {cfg.app.name}")
        print(f"  Applications: {len(cfg.applications)} configured")
        print(f"  KPIs:         {len(cfg.kpis)} configured ({sum(1 for k in cfg.kpis if k.enabled)} enabled)")
        print(f"  Flow Rules:   {len(cfg.flow_rules.rules)} rules")
        sections = cfg.ui.dashboard.sections if hasattr(cfg.ui, 'dashboard') else cfg.ui.sections
        print(f"  UI Sections:  {len(sections)} sections")
        return 0
    except Exception as e:
        print(f"[ERROR] Configuration error: {e}", file=sys.stderr)
        return 1


def refresh_once():
    try:
        cfg = load_kavach_dashboard_config()
        rc = KavachRedisClient(url="redis://localhost:6379/0", key_prefix=cfg.redis.key_prefix)
        adapters = {
            "servicenow": ServiceNowAdapter("", "", ""),
            "kavach_postgres": KavachPostgresAdapter(""),
        }
        orch = PipelineOrchestrator(cfg, rc, None, adapters)
        print("[INFO] Executing refresh cycle...")
        meta = orch.run()
        print(f"[OK] Refresh completed: status={meta.get('status')}")
        print(f"  Run ID:      {meta.get('run_id')}")
        print(f"  Rows Read:   {meta.get('rows_read')}")
        print(f"  KPIs OK:     {meta.get('kpis_ok')}")
        print(f"  KPIs Failed: {meta.get('kpis_failed')}")
        return 0 if meta.get("status") == "SUCCESS" else 1
    except Exception as e:
        print(f"[ERROR] Refresh failed: {e}", file=sys.stderr)
        return 1


def main():
    parser = argparse.ArgumentParser(description="Kavach Business Dashboard CLI")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("validate-config", help="Validate all YAML configuration files")
    subparsers.add_parser("refresh", help="Trigger a single refresh cycle")

    args = parser.parse_args()

    if args.command == "validate-config":
        sys.exit(validate_config())
    elif args.command == "refresh":
        sys.exit(refresh_once())
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
