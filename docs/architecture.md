# Kavach Business Dashboard — Architecture Specification

> **Version:** 2.0 (CQRS Read Model)  
> **Target Audience:** Solution Architects, Senior Engineers, SRE  
> **Integration:** OneView Observability Platform

---

## 1. Architectural Pattern: CQRS-Style Pre-Computed Read Model

The Kavach Business Dashboard uses a decoupled **Write Path (KPI Worker)** and **Read Path (FastAPI Read API)**. Calculations never execute on the request path when a user opens the dashboard, ensuring sub-15ms response latencies and complete protection against ServiceNow API rate limits.

```
+-------------------------------------------------------------------------+
|                              SOURCES                                    |
|   +--------------------------+          +---------------------------+   |
|   |   ServiceNow REST API    |          | Kavach PostgreSQL Schema  |   |
|   |  (incidents, changes)    |          | (tests, runs, executions) |   |
|   +--------------------------+          +---------------------------+   |
+-----------------|-------------------------------------|-----------------+
                  |                                     |
                  v                                     v
+-------------------------------------------------------------------------+
|                  KPI WORKER (Scheduled Background ETL)                  |
|                                                                         |
|   1. Streaming Generators (page_size=1000, bounded memory)              |
|   2. In-Memory Filter (App name + Assignment groups)                    |
|   3. Flow Mapper (ordered first-match keyword rules)                    |
|   4. Normaliser (TicketEvent - in-memory only, no raw storage)          |
|   5. Streaming Aggregators (Counters, Durations Array, Change Index)    |
|   6. KPI Calculators 1-10 (Strategy + Registry Pattern)                 |
|   7. Atomic Swap (SET kavach:current_run -> run_id)                      |
+-----------------|-------------------------------------|-----------------+
                  |                                     |
                  v                                     v
+------------------------------------+  +---------------------------------+
|      REDIS SERVING CACHE           |  |    POSTGRESQL DURABLE STORE     |
|  - kavach:current_run              |  |  - kpi_snapshots (historical)   |
|  - kavach:run:{id}:snapshot        |  |  - kpi_series (weekly/monthly)  |
|  - kavach:run:{id}:series          |  |  - kpi_run_meta (audit trail)   |
|  - kavach:run:{id}:meta            |  |  - kpi_ticket_facts (hashes)    |
+-----------------|------------------+  +---------------------------------+
                  |
                  v
+-------------------------------------------------------------------------+
|                        READ API (FastAPI)                               |
|   GET  /api/v1/kavach-dashboard/meta                                    |
|   GET  /api/v1/kavach-dashboard/config/ui                               |
|   GET  /api/v1/kavach-dashboard/applications                            |
|   GET  /api/v1/kavach-dashboard/kpis?app={id}                           |
|   GET  /api/v1/kavach-dashboard/kpis/{id}?app={id}                      |
|   POST /api/v1/kavach-dashboard/admin/refresh                           |
+-----------------|-------------------------------------------------------+
                  |
                  v
+-------------------------------------------------------------------------+
|                   REACT DASHBOARD (Next.js 16)                          |
|   - 4 Sections: Coverage, Defects, Change Quality, Value                |
|   - Recharts Visualizations & Waterfall Cost Avoidance                  |
|   - Data Label Badges: REAL, DEMO, MIXED, PLACEHOLDER                  |
+-------------------------------------------------------------------------+
```

---

## 2. Hard Constraints Enforced

1. **Zero Raw ServiceNow Persistence:**
   - No ServiceNow record bodies, descriptions, or customer identifiers are written to disk, PostgreSQL, Redis, or logs.
   - Streaming iterators process one page at a time in memory and immediately discard records after feeding aggregators.
2. **Config-Driven Architecture:**
   - Every KPI definition, weight, threshold, financial rate (\$40/hr manual QA rate, \$5,000 PROD defect cost), application filter, and UI widget layout resides in `apps/backend/config/kavach_dashboard/*.yaml`.
   - Modifying business rules requires zero code changes or deployments.
3. **Resilience & Fault Isolation:**
   - If a refresh run fails, the atomic pointer `kavach:current_run` retains the last known good run ID. The dashboard remains operational and indicates data age.
   - If Redis is unavailable in local developer environments, an in-memory fallback maintains full operational capability.

