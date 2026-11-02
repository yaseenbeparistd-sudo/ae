# Kavach Business Dashboard — Run & Operations Guide

> **Single Source of Truth:** How to run, test, configure, and maintain the NextGen2 / Kavach Business Dashboard within OneView.

---

## 1. Quick Start

### Prerequisites
- **Python:** 3.11 or 3.12 (with active virtual environment `.venv`)
- **Node.js:** 20+ (with npm)
- **Databases (Optional for Local Dev):** PostgreSQL (port 5432) and Redis (port 6379).  
  *Note: If Redis or Postgres are offline, the dashboard automatically operates using an in-memory fallback store.*

---

## 2. Running Locally (Step-by-Step)

### Step 1: Start Databases (Optional / Recommended)
If using Docker for PostgreSQL & Redis:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Step 2: Start the FastAPI Backend
Open a terminal in the root directory:
```powershell
# Activate Python Virtual Environment
.\.venv\Scripts\Activate.ps1

# Set Python Path & Run Backend API
$env:PYTHONPATH = "apps/backend"
uvicorn app.main:app --reload --port 8000
```
- **API Base:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`
- **Kavach Dashboard API:** `http://localhost:8000/api/v1/kavach-dashboard/ready`

### Step 3: Start the Next.js Frontend
Open a separate terminal in the root directory:
```powershell
cd apps/frontend
npm install
npm run dev
```
- **Frontend Dashboard:** `http://localhost:3000`
- **NextGen2 Overview:** `http://localhost:3000/applications/kavacha`
- **Leadership Business Dashboard:** `http://localhost:3000/applications/kavacha/business-dashboard`

---

## 3. Running with Docker Compose (Full Stack)

To run the entire platform (PostgreSQL, Redis, FastAPI Backend, Next.js Web) in containers:
```bash
docker-compose up --build -d
```
To stop the stack:
```bash
docker-compose down
```

---

## 4. CLI Tools (`apps/backend/app/services/kavach_dashboard/cli.py`)

A built-in CLI tool is provided for validating configs and triggering on-demand pipeline calculations:

### Validate All YAML Configurations
Validates syntax, Pydantic v2 schemas, unique KPI IDs, and rule references:
```bash
python apps/backend/app/services/kavach_dashboard/cli.py validate-config
```
*Expected Output:*
```text
[OK] Configuration is valid!
  App Name:     kavach-business-dashboard
  Applications: 4 configured
  KPIs:         10 configured (10 enabled)
  Flow Rules:   9 rules
  UI Sections:  4 sections
```

### Trigger On-Demand KPI Refresh
Streams source data, computes all 10 KPIs, writes to Redis + PostgreSQL, and updates the active run pointer:
```bash
python apps/backend/app/services/kavach_dashboard/cli.py refresh
```
*Expected Output:*
```text
[INFO] Executing refresh cycle...
[OK] Refresh completed: status=SUCCESS
  Run ID:      20261102T2010Z-830609
  Rows Read:   6772
  KPIs OK:     10
  KPIs Failed: 0
```

---

## 5. Running Golden Unit Tests

The test suite validates all 10 KPI calculations against the exact mathematical worked examples from Section 5.2 of `NextGen2_Business_Dashboard_KPIs_v2.docx`:

```bash
python tests/test_kavach_kpis.py
```
*Expected Output:*
```text
Ran 9 tests in 0.002s
OK
```

### Covered Golden Test Contracts:
1. **KPI 1 (Automation Coverage):** JDE 9/15 = 60.0%, Portfolio = 71.4%
2. **KPI 2 (Scenario Coverage Depth):** 10 critical flows, 3 uncovered = 30.0%
3. **KPI 3 (Defect Detection Percentage):** 150 Kavach + 320 PROD = 31.9% DDP
4. **KPI 4 (PROD Before vs After):** 996 (16d) vs 4,713 (69d) = 1,867.5 vs 2,049.1 per 30d (-9.7%, Index 110)
5. **KPI 5 (Defects WoW / MoM):** 428 → 483 (+12.9% WoW); Oct 1,461 in 22d (-8.0% MoM)
6. **KPI 6 (Change Failure Rate):** 41/90 vs 115/376 = 45.6% vs 30.6% CFR (-15.0% absolute, -10.5% rate)
7. **KPI 7 (Median Time to Fix):** INC duration = 7.98 days
8. **KPI 8 (QA Hours Saved):** 443 runs × 20 min @ $40/hr = 147.7 hrs, $5,907 saved
9. **KPI 9 (Cost of Quality Avoided):** 32 defects, gross $144,000, AI $0.56, infra $375 = Net $143,624
10. **KPI 10 (Kavach Weekly Impact):** 50 caught + 50 PROD = 100 without Kavach (50% avoided)

---

## 6. API Endpoints Reference

All endpoints are mounted under `/api/v1/kavach-dashboard/`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service liveness probe |
| `GET` | `/ready` | Readiness check (Redis connectivity + active run ID) |
| `GET` | `/meta` | Current active run metadata, refresh time, and status |
| `GET` | `/config/ui` | Returns `ui.yaml` section & widget layout for dynamic rendering |
| `GET` | `/applications` | List of enabled applications (JDE, MDM, Baxter.com, Netra) |
| `GET` | `/kpis?app={id}` | Complete snapshot map of all 10 KPIs for an application |
| `GET` | `/kpis/{kpi_id}?app={id}` | Single KPI snapshot result |
| `GET` | `/kpis/{kpi_id}/series?app={id}&grain=week` | Time-series data for trends and charts |
| `POST`| `/admin/refresh` | Triggers an immediate recalculation cycle |

---

## 7. Configuration & Customization Guide

All configuration files reside in [`apps/backend/config/kavach_dashboard/`](apps/backend/config/kavach_dashboard/):

### Adding or Enabling an Application
Edit [`applications.yaml`](apps/backend/config/kavach_dashboard/applications.yaml):
```yaml
applications:
  - id: mdm
    display_name: MDM
    enabled: true                     # Change to true
    servicenow_app_name: "MDM Master" # ServiceNow CI name
    assignment_groups:
      - "MDM_SUPPORT_TEAM"
    go_live_date: "2026-08-15"
```

### Adding a Business Flow Keyword Rule
Edit [`flow_rules.yaml`](apps/backend/config/kavach_dashboard/flow_rules.yaml):
```yaml
rules:
  - order: 10
    flow: supply_chain
    keywords: ["freight", "customs", "container", "carrier", "logistics"]
```
*Rules are evaluated in order; the first matched keyword assigns the flow.*

### Updating Financial Benchmarks
Edit [`kpis.yaml`](apps/backend/config/kavach_dashboard/kpis.yaml):
```yaml
  - id: kpi8_qa_hours_saved
    params:
      manual_minutes_per_test: 25   # Adjust manual testing time
      qa_hourly_rate_usd: 45        # Adjust QA hourly rate ($)

  - id: kpi9_cost_of_quality
    params:
      prod_fix_cost_usd: 6000       # Adjust PROD defect fix cost ($)
      preprod_fix_cost_usd: 500     # Adjust pre-prod defect cost ($)
      infra_cost_per_month_usd: 200 # Adjust platform infra cost ($)
```

---

## 8. Troubleshooting & FAQ

### Q: Redis is not running locally. Will the backend crash?
**A:** No. `KavachRedisClient` includes an automated in-memory fallback. If Redis is unreachable, the system transparently caches runs and metadata in memory so you can develop locally without running Docker.

### Q: How do I connect to real ServiceNow APIs instead of synthetic data?
**A:** Set the following environment variables in `.env`:
```bash
SNOW_BASE_URL="https://your-instance.service-now.com"
SNOW_USERNAME="svc_kavach"
SNOW_PASSWORD="your_service_account_password"
```
When `SNOW_BASE_URL` is populated, `ServiceNowAdapter` automatically connects, authenticates, and streams real paged records. When empty, it falls back to the synthetic golden test stream.

### Q: Are raw ServiceNow tickets stored anywhere?
**A:** No. Enforced by design constraint C3, raw records are processed as streaming generators in memory and discarded immediately after updating counters and duration arrays.

---

## 9. Architecture Decision Record & Documentation Links
- **Architecture Decision Record:** [`docs/adr/ADR-001-kavach-business-dashboard.md`](docs/adr/ADR-001-kavach-business-dashboard.md)
- **Architecture Deep Dive:** [`docs/architecture.md`](docs/architecture.md)
- **KPI Catalog & Math:** [`docs/kpi_definitions.md`](docs/kpi_definitions.md)

