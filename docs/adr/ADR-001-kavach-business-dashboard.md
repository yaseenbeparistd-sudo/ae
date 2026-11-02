# ADR-001: Kavach Business Dashboard Architecture

## Status
Accepted (2026-11-03)

## Context
Kavach (NextGen2) requires a leadership-facing business dashboard demonstrating whether automated testing is improving application health (fewer production defects, fewer change failures, faster fixes, and reduced cost of quality).

Key requirements:
1. ServiceNow APIs (millions of rows) + Kavach PostgreSQL schema.
2. Hard constraint: No raw ServiceNow records stored anywhere; calculations happen streaming in-memory.
3. High performance: Zero live calculations when the dashboard renders (CQRS-style read model).
4. Config-driven architecture (all KPIs, rules, applications, sources driven by YAML).

## Decision

### 1. Integration into Existing OneView Platform
- **Decision:** Integrate as a service within `apps/backend/app/services/kavach_dashboard/` and a dedicated route `/applications/kavacha/business-dashboard` within `apps/frontend/`.
- **Rationale:** Avoids managing duplicate repositories, authentication, and deployment containers while keeping the codebase cohesive.

### 2. Dual Storage Architecture: Redis Serving Cache + PostgreSQL Durable Store
- **Decision:** Use Redis as the hot serving cache with atomic pointer swapping (`kavach:current_run`), and PostgreSQL tables (`kpi_snapshots`, `kpi_series`, `kpi_run_meta`) as the durable system of record.
- **Rationale:** Prevents catastrophic loss of historical KPI snapshots on Redis restarts or memory eviction.

### 3. Streaming ETL with Anonymized Facts (Option B)
- **Decision:** Stream ServiceNow records via HTTP generator with bounded memory (`page_size=1000`). Calculate rolling statistics, counters, and durations on the fly. Persist only anonymized hash references for incremental sync watermarking.
- **Rationale:** Strictly respects the constraint of storing zero raw ticket descriptions or customer data while supporting incremental refreshes.

### 4. Config-Driven KPI & Layout Engine
- **Decision:** All runtime configurations, sources, application filters, KPI catalog, flow keyword rules, and dashboard layouts reside in `apps/backend/config/kavach_dashboard/*.yaml`, validated by Pydantic v2 models.
- **Rationale:** Adding new applications, adjusting financial parameters ($40/hr, $5,000 fix cost), or updating keyword classification rules requires zero code changes.

### 5. Strategy + Registry Pattern for KPIs
- **Decision:** Each KPI implements `KpiCalculator` registered via `@register_kpi` into a dynamic registry.
- **Rationale:** Modular, isolated, and unit-tested against Section 5.2 golden worked examples.

## Consequences
- High read throughput (< 15ms) on the dashboard API as all metrics are pre-computed.
- Robust execution in both containerized production environments and local sandbox mode (with automatic in-memory fallback when external services are unreachable).

