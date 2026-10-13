'use client';

import { useState } from 'react';
import Link from 'next/link';
import './page.css';
import {
  Server, User, Users, Activity, AlertTriangle, CheckCircle2,
  HardDrive, Zap, ShieldAlert, Globe
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { ApplicationCard } from '@/components/ui/ApplicationCard/ApplicationCard';
import { formatNumber } from '@/lib/utils';
import type { DashboardSummary } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Technical data for DevOps view if toggled
const activityData = Array.from({ length: 24 }).map((_, i) => {
  const base = 2000 + Math.sin(i / 3) * 1500;
  return {
    time: `${i}:00`,
    requests: Math.floor(base + Math.random() * 500),
    compute: Math.floor((base / 50) + Math.random() * 10),
  };
});

const recentEvents = [
  { id: 1, type: 'critical', title: 'High CPU utilization', desc: 'Prod Cluster Node-3 reached 92% CPU', time: '2m ago', icon: AlertTriangle },
  { id: 2, type: 'warning', title: 'Rate limit approaching', desc: 'API tier for user group alpha is at 85%', time: '14m ago', icon: Zap },
  { id: 3, type: 'success', title: 'Deployment successful', desc: 'Blackline v2.1.4 rolled out to production', time: '1h ago', icon: CheckCircle2 },
  { id: 4, type: 'info', title: 'Database snapshot', desc: 'Automated backup completed successfully', time: '3h ago', icon: HardDrive },
  { id: 5, type: 'warning', title: 'Elevated error rate', desc: 'Auth service experiencing 2% error rate', time: '5h ago', icon: ShieldAlert },
];

function LiveNetraCard() {
  const { data: health } = useQuery<any>({
    queryKey: ['health-netra-live'],
    queryFn: () => api.get('/applications/netra/health?live=true'),
    refetchInterval: 1000,
  });

  return (
    <ApplicationCard
      id="netra"
      name="Netra"
      description="Baxter RAG Application · GenAI..."
      status="healthy"
      score={100 - (health?.cpu_usage_percent || 2)}
      metrics={{
        activeUsers: '1,420',
        throughput: '3.2k RPM',
        latency: Math.floor(200 + (health?.memory_usage_percent || 0) * 1.5) + 'ms',
        uptime: '99.98%'
      }}
    />
  );
}

function LiveKavachCard() {
  return (
    <ApplicationCard
      id="kavacha"
      name="NextGen2"
      description="Autonomous QA & Gateway · NextGen2 Test Engine..."
      status="warning"
      score={84}
      metrics={{
        activeUsers: '8,420',
        throughput: '12.4k RPM',
        errorRate: '0.42%',
        uptime: '99.82%'
      }}
    />
  );
}

function StaticBlacklineCard() {
  return (
    <ApplicationCard
      id="blackline"
      name="Blackline"
      description="Financial Reconciliation · Bat..."
      status="healthy"
      score={99}
      metrics={{
        throughput: '14 Active',
        latency: '42ms',
        errorRate: '0 Failed'
      }}
    />
  );
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'business' | 'devops'>('business');

  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary'),
    refetchInterval: 30000,
  });

  const { data: bizData, isLoading: bizLoading } = useQuery<any>({
    queryKey: ['business-overview'],
    queryFn: () => api.get('/dashboard/business-overview'),
    refetchInterval: 15000,
  });

  // Dynamic values with prompt defaults as source of truth
  const kpis = bizData?.kpis || {
    total_value_delivered_usd: 14392.71,
    total_hours_saved: 457.9,
    total_enterprise_users: 440,
    overall_automation_rate: 99.2,
    total_ai_spend_usd: 230.52,
    total_ai_tokens: 3178828,
  };

  const apps = bizData?.applications || {};
  const kavacha = apps.kavacha || {
    time_saved_hours: 13.9,
    cost_saved_usd: 692.71,
    resources_saved_fte: 0.1,
    total_test_cases: 50,
    total_generations: 50,
    total_executions: 50,
    active_schedules: 45,
    healing_proposals: 50,
    sso_gateway_apps: 16,
    ai_spend_usd: 0.52,
  };

  const netra = apps.netra || {
    total_users: 342,
    active_users: 142,
    total_queries: 62200,
    query_accuracy_percent: 99.4,
    time_saved_hours: 340.0,
    cost_saved_usd: 8500.0,
    ai_spend_usd: 230.00,
    total_tokens: 5900000,
    cost_per_query_usd: 0.004,
  };

  const blackline = apps.blackline || {
    volume_reconciled_usd: 4850000.0,
    accounts_reconciled: 1420,
    auto_match_rate_percent: 99.98,
    close_cycle_reduction_days: 3.5,
    time_saved_hours: 104.0,
    cost_saved_usd: 5200.0,
    sox_compliance_percent: 100.0,
    active_finance_users: 48,
    batch_pipelines_active: 14,
  };

  // Live milestones data (from prompt specification)
  const milestones = [
    {
      id: 1,
      tag: 'NEXTGEN2',
      time: '4m ago',
      title: 'Autonomous QA Run Complete',
      description: '50 test proposals generated & executed; 13.9 hours manual QA toil saved',
    },
    {
      id: 2,
      tag: 'NETRA',
      time: '28m ago',
      title: 'Enterprise Knowledge Milestone',
      description: '1,420 employee RAG queries resolved with 99.4% answer accuracy',
    },
    {
      id: 3,
      tag: 'BLACKLINE',
      time: '1h ago',
      title: 'Monthly Ledger Batch Reconciled',
      description: '$4.85M volume balanced with 100% SOX compliance and zero exceptions',
    },
    {
      id: 4,
      tag: 'NEXTGEN2',
      time: '3h ago',
      title: 'Self-Healing Test Triggered',
      description: '13 self-healing proposals staged; 45 active continuous test schedules running',
    },
    {
      id: 5,
      tag: 'BLACKLINE',
      time: '5h ago',
      title: 'Close Velocity Accelerated',
      description: 'Month-end close cycle compressed from 8.0 days down to 4.5 days (-3.5d)',
    },
  ];

  // Governance items (from prompt specification)
  const governanceItems = [
    { label: 'SOX Financial Audit Compliance', value: '100% (Pass)' },
    { label: 'Enterprise SSO & Gateway Protection', value: '16 Apps Protected' },
    { label: 'GenAI Output Accuracy & Alignment', value: '99.4% Verified' },
    { label: 'Regression Escape Rate', value: '0% Leaks (Zero)' },
  ];

  return (
    <div className="claude-dashboard-wrapper">
      <div className="claude-dashboard-container">

        {/* ── Top Bar with Switcher ── */}
        <div className="claude-top-bar">
          <div className="claude-top-brand">
            <span className="claude-brand-badge">Baxter Business Overview</span>
            <span className="claude-brand-sub">NextGen2 · Netra · Blackline</span>
          </div>
          <div className="claude-view-switcher">
            <button
              className={`claude-view-btn ${viewMode === 'business' ? 'active' : ''}`}
              onClick={() => setViewMode('business')}
            >
              Executive Business View
            </button>
            <button
              className={`claude-view-btn ${viewMode === 'devops' ? 'active' : ''}`}
              onClick={() => setViewMode('devops')}
            >
              DevOps & Infra View
            </button>
          </div>
        </div>

        {viewMode === 'business' ? (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                2.1 HERO — TWO COLUMNS (7fr / 5fr, gap 24px)
                ═══════════════════════════════════════════════════════════════ */}
            <section className="claude-hero">
              {/* Left Column (sits on page background) */}
              <div className="claude-hero-left">
                <div className="claude-label">TOTAL VALUE DELIVERED</div>
                <div className="claude-hero-num-row">
                  <div className="claude-hero-number">
                    {bizLoading ? '$14,392.71' : `$${kpis.total_value_delivered_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <span className="claude-chip">+34% ROI</span>
                </div>
                <div className="claude-hero-sub">
                  Netra $8.5k · Blackline $5.2k · NextGen2 $693
                </div>
              </div>

              {/* Right Column (Dark ROI card) */}
              <div className="claude-roi-card">
                <div>
                  <div className="claude-roi-label">PORTFOLIO AI SPEND ROI</div>
                  <div className="claude-roi-number">74x ROI</div>
                  <div className="claude-roi-caption">Value-to-Spend Multiplier</div>
                </div>

                <div className="claude-roi-row">
                  <span className="claude-roi-row-label">Total AI Model Spend:</span>
                  <span className="claude-roi-row-val">
                    ${(kpis.total_ai_spend_usd || 230.52).toFixed(2)}
                  </span>
                </div>

                <div className="claude-roi-yielding">
                  Yielding ${kpis.total_value_delivered_usd ? kpis.total_value_delivered_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '14,392.71'} in delivered enterprise value
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2.2 HEADLINE KPI CARD — ONE WHITE CARD, THREE COLUMNS
                ═══════════════════════════════════════════════════════════════ */}
            <section className="claude-kpi-card">
              <div className="claude-kpi-col">
                <span className="claude-label">HUMAN HOURS SAVED</span>
                <div className="claude-kpi-number">{kpis.total_hours_saved} hrs</div>
                <div className="claude-kpi-highlight">+42% Velocity</div>
                <div className="claude-kpi-detail">Across employee research, QA & accounting</div>
              </div>

              <div className="claude-kpi-col">
                <span className="claude-label">ENTERPRISE USERS</span>
                <div className="claude-kpi-number">440</div>
                <div className="claude-kpi-highlight">Active Adoption</div>
                <div className="claude-kpi-detail">342 Netra · 50 NextGen2 · 127 Finance</div>
              </div>

              <div className="claude-kpi-col">
                <span className="claude-label">AUTOMATION ACCURACY</span>
                <div className="claude-kpi-number">{kpis.overall_automation_rate}%</div>
                <div className="claude-kpi-highlight">0 Audit Exceptions</div>
                <div className="claude-kpi-detail">99.98% Match · 99.4% RAG · 100% SOX</div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2.3 SECTION HEADER — "Flagship Business Platforms"
                ═══════════════════════════════════════════════════════════════ */}
            <div className="claude-section-header">
              <div className="claude-section-title-wrap">
                <h2 className="claude-section-heading">
                  Flagship Business Platforms
                  <span className="claude-section-note">[ROI & Impact Deep-Dive]</span>
                </h2>
                <p className="claude-section-subtitle">
                  Detailed productivity, automation, and cost metrics for Baxter's primary production systems.
                </p>
              </div>
              <div className="claude-live-sync">
                <span className="claude-live-dot" />
                <span>LIVE METRICS SYNC</span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                2.4 PLATFORM CARDS — THREE EQUAL COLUMNS
                ═══════════════════════════════════════════════════════════════ */}
            <section className="claude-platforms-grid">

              {/* ── NextGen2 ── */}
              <div className="claude-platform-card">
                <div className="claude-platform-header">
                  <div className="claude-platform-title-row">
                    <h3 className="claude-platform-name">NextGen2</h3>
                    <span className="claude-prod-tag">PROD</span>
                  </div>
                  <p className="claude-platform-purpose">Autonomous QA & Access Gateway</p>
                </div>

                <div className="claude-saving-panel">
                  <span className="claude-saving-figure">${kavacha.cost_saved_usd.toFixed(2)}</span>
                  <span className="claude-saving-caption">SAVED</span>
                </div>

                <div className="claude-quadrant-grid">
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">TIME SAVED</span>
                    <div className="claude-quadrant-val">{kavacha.time_saved_hours} hrs</div>
                    <div className="claude-sub-highlight">↑ 42% vs last 30d</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">COST SAVINGS</span>
                    <div className="claude-quadrant-val">${kavacha.cost_saved_usd.toFixed(2)}</div>
                    <div className="claude-sub-highlight">↑ 28% efficiency</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">TEST PROPOSALS</span>
                    <div className="claude-quadrant-val">{kavacha.total_test_cases} Cases</div>
                    <div className="claude-sub-muted">{kavacha.total_generations} generated</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">SCHEDULES ACTIVE</span>
                    <div className="claude-quadrant-val">{kavacha.active_schedules} Active</div>
                    <div className="claude-sub-muted">Continuous CI runs</div>
                  </div>
                </div>

                <div className="claude-detail-list">
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Resource Saved:</span>
                    <span className="claude-detail-val">{kavacha.resources_saved_fte} FTE Reallocated</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Self-Healing Proposals:</span>
                    <span className="claude-detail-val">{kavacha.healing_proposals} Proposals</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">SSO Gateway Protected:</span>
                    <span className="claude-detail-val">{kavacha.sso_gateway_apps} Applications</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">AI Spend / Tokens:</span>
                    <span className="claude-detail-val">${(kavacha.ai_spend_usd || 0.52).toFixed(2)} · 93K tokens</span>
                  </div>
                </div>

                <Link href="/applications/kavacha" className="claude-platform-link">
                  Explore NextGen2 Business Suite →
                </Link>
              </div>

              {/* ── Netra ── */}
              <div className="claude-platform-card">
                <div className="claude-platform-header">
                  <div className="claude-platform-title-row">
                    <h3 className="claude-platform-name">Netra</h3>
                    <span className="claude-prod-tag">PROD</span>
                  </div>
                  <p className="claude-platform-purpose">Baxter RAG & GenAI Knowledge Base</p>
                </div>

                <div className="claude-saving-panel">
                  <span className="claude-saving-figure">340 HRS</span>
                  <span className="claude-saving-caption">SAVED</span>
                </div>

                <div className="claude-quadrant-grid">
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">EMPLOYEE ADOPTION</span>
                    <div className="claude-quadrant-val">{netra.total_users} Users</div>
                    <div className="claude-sub-highlight">{netra.active_users} Daily Active</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">QUERIES ANSWERED</span>
                    <div className="claude-quadrant-val">62.2K</div>
                    <div className="claude-sub-highlight">{netra.query_accuracy_percent}% Accuracy</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">RESEARCH TIME SAVED</span>
                    <div className="claude-quadrant-val">{netra.time_saved_hours} hrs</div>
                    <div className="claude-sub-muted">~$8,500 labor value</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">AI COST EFFICIENCY</span>
                    <div className="claude-quadrant-val">${netra.ai_spend_usd.toFixed(2)}</div>
                    <div className="claude-sub-muted">$0.004 / query</div>
                  </div>
                </div>

                <div className="claude-detail-list">
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Total Enterprise Tokens:</span>
                    <span className="claude-detail-val">5.9M Tokens</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Primary LLM Engines:</span>
                    <span className="claude-detail-val">GPT-4o (62%), Mini (28%)</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Avg Answer Latency:</span>
                    <span className="claude-detail-val">180ms semantic search</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Document Retrieval Rate:</span>
                    <span className="claude-detail-val highlight">99.8% cache hit rate</span>
                  </div>
                </div>

                <Link href="/applications/netra" className="claude-platform-link">
                  Explore Netra Intelligence →
                </Link>
              </div>

              {/* ── Blackline ── */}
              <div className="claude-platform-card">
                <div className="claude-platform-header">
                  <div className="claude-platform-title-row">
                    <h3 className="claude-platform-name">Blackline</h3>
                    <span className="claude-prod-tag">PROD</span>
                  </div>
                  <p className="claude-platform-purpose">Financial Close & Reconciliation</p>
                </div>

                <div className="claude-saving-panel">
                  <span className="claude-saving-figure">$4.85M</span>
                  <span className="claude-saving-caption">BALANCED</span>
                </div>

                <div className="claude-quadrant-grid">
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">VOLUME RECONCILED</span>
                    <div className="claude-quadrant-val">$4.85M</div>
                    <div className="claude-sub-highlight">↑ 18% vs last month</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">AUTO-MATCH RATE</span>
                    <div className="claude-quadrant-val">{blackline.auto_match_rate_percent}%</div>
                    <div className="claude-sub-highlight">0 Exceptions</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">CLOSE VELOCITY</span>
                    <div className="claude-quadrant-val">-3.5 Days</div>
                    <div className="claude-sub-muted">Close cycle reduction</div>
                  </div>
                  <div className="claude-quadrant-cell">
                    <span className="claude-label">ACCOUNTS RECONCILED</span>
                    <div className="claude-quadrant-val">{blackline.accounts_reconciled.toLocaleString()}</div>
                    <div className="claude-sub-muted">GL & Subledger</div>
                  </div>
                </div>

                <div className="claude-detail-list">
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">SOX Audit Readiness:</span>
                    <span className="claude-detail-val highlight">100% Verified Trail</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Labor Cost Saved:</span>
                    <span className="claude-detail-val">${blackline.cost_saved_usd.toLocaleString()} / mo (104 hrs)</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Active Finance Users:</span>
                    <span className="claude-detail-val">{blackline.active_finance_users} Controllers</span>
                  </div>
                  <div className="claude-detail-row">
                    <span className="claude-detail-label">Active Sync Pipelines:</span>
                    <span className="claude-detail-val">{blackline.batch_pipelines_active} batch pipelines (42ms)</span>
                  </div>
                </div>

                <Link href="/applications/blackline" className="claude-platform-link">
                  Explore Blackline Reconciliation →
                </Link>
              </div>

            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2.5 COMPARISON TABLE CARD
                ═══════════════════════════════════════════════════════════════ */}
            <section className="claude-table-card">
              <div className="claude-table-header-box">
                <div>
                  <h3 className="claude-table-heading">
                    Enterprise Business Impact & Governance Comparison
                  </h3>
                  <p className="claude-table-subtitle">
                    High-level executive evaluation of value generated, labor saved, and compliance status.
                  </p>
                </div>
                <span className="claude-table-audited-label">3 OF 3 AUDITED</span>
              </div>

              <div className="claude-table-scroll-wrapper">
                <table className="claude-comparison-table">
                  <thead>
                    <tr>
                      <th>PLATFORM</th>
                      <th>BUSINESS PURPOSE</th>
                      <th>SCALE HANDLED</th>
                      <th>TIME / VELOCITY SAVED</th>
                      <th>DIRECT VALUE REALIZED</th>
                      <th>COMPLIANCE / RISK</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="claude-table-platform-title">NextGen2</div>
                        <div className="claude-table-platform-sub">QA & Engineering</div>
                      </td>
                      <td>Autonomous testing, test generation & SSO access</td>
                      <td><strong>50 Test Cases</strong> · 50 Executions</td>
                      <td className="claude-table-accent-cell">13.9 Hours (0.1 FTE)</td>
                      <td className="claude-table-value-num">${kavacha.cost_saved_usd.toFixed(2)}</td>
                      <td className="claude-table-accent-cell">0 Regression Leaks</td>
                      <td>
                        <Link href="/applications/kavacha" className="claude-table-action-link">
                          View Details →
                        </Link>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className="claude-table-platform-title">Netra</div>
                        <div className="claude-table-platform-sub">Baxter Knowledge</div>
                      </td>
                      <td>Enterprise RAG knowledge search & GenAI copilot</td>
                      <td><strong>53.6K Searches</strong> · 342 Users</td>
                      <td className="claude-table-accent-cell">340 Hours</td>
                      <td className="claude-table-value-num">$8,500.00</td>
                      <td className="claude-table-accent-cell">99.4% Verified Accuracy</td>
                      <td>
                        <Link href="/applications/netra" className="claude-table-action-link">
                          View Details →
                        </Link>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className="claude-table-platform-title">Blackline</div>
                        <div className="claude-table-platform-sub">Finance & Accounting</div>
                      </td>
                      <td>Balance sheet reconciliation & close automation</td>
                      <td><strong>$4.85M Balanced</strong> · 1,420 Accts</td>
                      <td className="claude-table-accent-cell">-3.5 Days (104 hrs)</td>
                      <td className="claude-table-value-num">$5,200.00</td>
                      <td className="claude-table-accent-cell">100% SOX Compliant</td>
                      <td>
                        <Link href="/applications/blackline" className="claude-table-action-link">
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2.6 BOTTOM ROW — TWO CARDS (1.3fr / 1fr, gap 24px, top-aligned)
                ═══════════════════════════════════════════════════════════════ */}
            <section className="claude-bottom-grid">

              {/* Left: Live Business Milestones */}
              <div className="claude-milestones-card">
                <h3 className="claude-card-heading">Live Business Milestones</h3>
                <div className="claude-timeline-list">
                  {milestones.map((m) => (
                    <div key={m.id} className="claude-timeline-item">
                      <span className="claude-timeline-dot" />
                      <div className="claude-timeline-tag-row">
                        <span className="claude-timeline-tag">{m.tag}</span>
                        <span className="claude-timeline-time">{m.time}</span>
                      </div>
                      <h4 className="claude-timeline-title">{m.title}</h4>
                      <p className="claude-timeline-desc">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Governance & Risk Posture */}
              <div className="claude-governance-card">
                <h3 className="claude-card-heading">Governance & Risk Posture</h3>
                <div className="claude-governance-list">
                  {governanceItems.map((item, idx) => (
                    <div key={idx} className="claude-governance-row">
                      <span className="claude-governance-label">{item.label}</span>
                      <span className="claude-governance-val">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </section>
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
             DEVOPS & INFRASTRUCTURE VIEW
             ═══════════════════════════════════════════════════════════════ */
          <div className="ov-main-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="ov-rich-kpi-grid">
                <div className="ov-rich-kpi">
                  <Globe className="ov-rich-kpi-bg" size={120} color="#0176D3" />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#54698D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Server size={14} color="#0176D3"/> Active Apps
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                      {summaryLoading ? <Skeleton width={40} /> : summary?.total_applications || 3}
                    </div>
                  </div>
                </div>

                <div className="ov-rich-kpi">
                  <Activity className="ov-rich-kpi-bg" size={120} color="#0176D3" />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#54698D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} color="#0176D3"/> API Requests
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                      {summaryLoading ? <Skeleton width={80} /> : formatNumber(summary?.total_api_requests || 53600)}
                    </div>
                  </div>
                </div>

                <div className="ov-rich-kpi">
                  <Users className="ov-rich-kpi-bg" size={120} color="#0176D3" />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#54698D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="#0176D3"/> Total Users
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                      {summaryLoading ? <Skeleton width={60} /> : formatNumber(summary?.total_active_users || 177)}
                    </div>
                  </div>
                </div>

                <div className="ov-rich-kpi">
                  <AlertTriangle className="ov-rich-kpi-bg" size={120} color="#0176D3" />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#54698D', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={14} color="#0176D3"/> Error Rate
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                      {summaryLoading ? <Skeleton width={40} /> : '0.12%'}
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="ov-section-title" style={{ marginTop: '16px' }}>
                <Activity size={18} color="#0176D3" /> Global Traffic
              </h2>
              <div className="ov-activity-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0176D3" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0176D3" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#014486" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#014486" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141413', borderColor: '#3A3936', borderRadius: '8px', color: '#FAF9F5' }}
                      itemStyle={{ color: '#FAF9F5', fontSize: '13px' }}
                      labelStyle={{ color: '#B0AEA5', marginBottom: '4px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#0176D3" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                    <Area type="monotone" dataKey="compute" stroke="#014486" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <LiveNetraCard />
                <LiveKavachCard />
                <StaticBlacklineCard />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="ov-events-panel">
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--ink)' }}>Event Stream</h3>
                {recentEvents.map(event => (
                  <div key={event.id} className="ov-event-item">
                    <div className="ov-event-icon">
                      <event.icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>{event.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{event.desc}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
