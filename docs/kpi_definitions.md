# Kavach Business Dashboard — KPI Definitions & Golden Test Contracts

> **Source Document:** `NextGen2_Business_Dashboard_KPIs_v2.docx`  
> **Default Go-Live Date:** `2026-08-15`  
> **Baseline Benchmark:** Manual QA = \$40/hr, PROD Fix = \$5,000, Pre-prod Fix = \$500

---

## Catalog of 10 Leadership KPIs

### KPI 1: Automation Coverage of the Portfolio
- **Business Question:** What percentage of our testing ecosystem is automated across applications?
- **Formula:**
  $$\text{App Coverage \%} = \frac{\text{Automated Scenarios}}{\text{Total Scenarios}} \times 100$$
  $$\text{Portfolio Coverage \%} = \frac{\sum \text{Automated Scenarios}}{\sum \text{Total Scenarios}} \times 100$$
- **Sources:** `kavach_postgres` (`test_case_proposals`, `generations`)
- **Data Label:** `DEMO`
- **Golden Test Expected:** JDE: 9/15 = 60.0%, MDM: 2/3 = 66.7%, Baxter.com: 4/4 = 100.0%, Netra: 5/6 = 83.3%. Portfolio: 20/28 = **71.4%**.

---

### KPI 2: Scenario Coverage Depth
- **Business Question:** Are critical business flows automated, or are high-risk paths untested?
- **Formula:**
  $$\text{Critical Flow} = \text{Has P0/P1 test OR} \ge 1 \text{ PROD P1/P2 incident}$$
  $$\text{Uncovered Critical \%} = \frac{\text{Critical flows with 0 automated tests}}{\text{Total Critical Flows}} \times 100$$
- **Sources:** `kavach_postgres` + `servicenow` (`incident`)
- **Data Label:** `MIXED`
- **Golden Test Expected:** 10 critical flows identified, 3 uncovered $\rightarrow$ **30.0% Uncovered**, **70.0% Covered**.

---

### KPI 3: Defect Detection Percentage (DDP) per Release
- **Business Question:** Are we catching defects in pre-production before they escape to users?
- **Formula:**
  $$\text{DDP \%} = \frac{\text{Kavach Pre-Prod Defects}}{\text{Kavach Pre-Prod Defects} + \text{PROD Defects}} \times 100$$
- **Sources:** `kavach_postgres` (`support_tickets`) + `servicenow` (`incident`)
- **Data Label:** `MIXED`
- **Golden Test Expected:** 150 Kavach pre-prod + 320 PROD defects $\rightarrow$ DDP **31.9%**.

---

### KPI 4: PROD Defects Before vs After Automation
- **Business Question:** Has production defect volume decreased since Kavach deployment?
- **Formula:**
  $$\text{Rate per 30 days} = \frac{\text{Incident Count}}{\text{Days in Period}} \times 30$$
  $$\text{Reduction \%} = \frac{\text{Rate}_{\text{before}} - \text{Rate}_{\text{after}}}{\text{Rate}_{\text{before}}} \times 100$$
  $$\text{Index} = \frac{\text{Rate}_{\text{after}}}{\text{Rate}_{\text{before}}} \times 100$$
- **Sources:** `servicenow` (`incident`)
- **Data Label:** `REAL`
- **Golden Test Expected:** Before: 996 in 16d ($\text{rate} = 1,867.5/30\text{d}$), After: 4,713 in 69d ($\text{rate} = 2,049.1/30\text{d}$), Reduction: **$-9.7\%$**, Index: **110**.

---

### KPI 5: Defects WoW / MoM After Automation
- **Business Question:** What is the week-over-week and month-over-month trajectory of defects?
- **Formula:**
  $$\text{WoW \%} = \frac{\text{Count}_{\text{current week}} - \text{Count}_{\text{prev week}}}{\text{Count}_{\text{prev week}}} \times 100$$
  $$\text{MoM \%} = \frac{\text{Rate 30d}_{\text{current month}} - \text{Rate 30d}_{\text{prev month}}}{\text{Rate 30d}_{\text{prev month}}} \times 100$$
- **Sources:** `kavach_postgres` + `servicenow` (`incident`)
- **Data Label:** `MIXED`
- **Golden Test Expected:** Weekly: 428 $\rightarrow$ 483 ($\text{WoW} = \mathbf{+12.9\%}$). Monthly: Oct 1,461 in 22d ($1,992/30\text{d}$) vs Sept 2,165 in 30d ($\text{MoM} = \mathbf{-8.0\%}$).

---

### KPI 6: Change Failure Rate & Change-Related Incidents
- **Business Question:** How often do production changes cause outages or severe incidents?
- **Formula:**
  $$\text{Change Related Incident} = \text{P1/P2 incident in same assignment group within 24h of change end}$$
  $$\text{CFR \%} = \frac{\text{Failed Changes}}{\text{Total Changes}} \times 100$$
- **Sources:** `servicenow` (`incident`, `change_request`)
- **Data Label:** `REAL (link estimated)`
- **Golden Test Expected:** Before: 41/90 failed (CFR **45.6%**), 43 incidents in 16d ($80.6/30\text{d}$). After: 115/376 failed (CFR **30.6%**), 166 incidents in 69d ($72.2/30\text{d}$). Reduction: **$10.5\%$**, Index: **$\approx 90$**.

---

### KPI 7: Mean Time to Fix (MTTF)
- **Business Question:** How quickly are defects diagnosed and resolved?
- **Formula:**
  $$\text{Fix Duration} = \text{closed\_at} - \text{opened\_at} \quad (\text{closed tickets only})$$
  $$\text{Headline Metric} = \text{Median Duration (days)}$$
- **Sources:** `servicenow` (`incident`) + `kavach_postgres` (`support_tickets`)
- **Data Label:** `MIXED`
- **Golden Test Expected:** INC opened 15 Oct 08:56, closed 23 Oct 08:22 $\rightarrow$ **7.98 days**.

---

### KPI 8: QA Hours Saved
- **Business Question:** How much manual testing capacity is eliminated by automated runs?
- **Formula:**
  $$\text{Hours Saved} = \frac{\sum \text{Eligible Automated Runs} \times \text{Manual Minutes (20)}}{60}$$
  $$\text{Cost Value} = \text{Hours Saved} \times \text{QA Hourly Rate (\$40/hr)}$$
- **Sources:** `kavach_postgres` (`executions`) + config parameters
- **Data Label:** `PLACEHOLDER`
- **Golden Test Expected:** 443 eligible runs $\times$ 20 min $\rightarrow$ **147.7 hours saved**, **\$5,907 (\$5,908)**.

---

### KPI 9: Cost of Quality Avoided
- **Business Question:** What is the net financial return of Kavach after infrastructure & AI costs?
- **Formula:**
  $$\text{Gross Avoided} = \text{Kavach Defects} \times (\text{PROD Fix Cost (\$5,000)} - \text{QA Fix Cost (\$500)})$$
  $$\text{Platform Cost} = \sum \text{ai\_calls.cost\_usd} + (\text{Infra Cost (\$150/mo)} \times \text{Months Active (2.5)})$$
  $$\text{Net Savings} = \text{Gross Avoided} - \text{Platform Cost}$$
- **Sources:** `kavach_postgres` (`support_tickets`, `ai_calls`) + config parameters
- **Data Label:** `PLACEHOLDER`
- **Golden Test Expected:** 32 defects $\times$ \$4,500 = \$144,000 gross. AI \$0.56 + infra \$375.00 = \$375.56. Net savings = **\$143,624**.

---

### KPI 10: Kavach Weekly Impact ("100 $\rightarrow$ 50")
- **Business Question:** How many incidents would have hit production this week if Kavach were absent?
- **Formula:**
  $$\text{Without Kavach} = \text{PROD Incidents} + \text{Kavach Intercepted Defects}$$
  $$\text{Reduction \%} = \frac{\text{Kavach Intercepted}}{\text{Without Kavach}} \times 100$$
- **Sources:** `kavach_postgres` + `servicenow` (`incident`)
- **Data Label:** `MIXED`
- **Golden Test Expected:** 50 caught + 50 PROD $\rightarrow$ Without Kavach = 100, Reduction = **50.0%**.

