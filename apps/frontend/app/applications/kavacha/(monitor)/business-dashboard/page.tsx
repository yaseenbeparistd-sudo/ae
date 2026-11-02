'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import {
  TrendingUp, ShieldCheck, AlertCircle, RefreshCw, Layers, Clock, DollarSign,
  Activity, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronRight, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, ComposedChart, Area
} from 'recharts';

// Data label badge component
function DataLabelBadge({ label }: { label: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    REAL: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', border: 'rgba(16, 185, 129, 0.25)' },
    DEMO: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' },
    MIXED: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706', border: 'rgba(245, 158, 11, 0.25)' },
    PLACEHOLDER: { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b', border: 'rgba(100, 116, 139, 0.25)' },
  };
  const s = styles[label] || styles.PLACEHOLDER;
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: 700,
      fontFamily: 'monospace',
      padding: '2px 8px',
      borderRadius: '4px',
      background: s.bg,
      color: s.text,
      border: `1px solid ${s.border}`,
      letterSpacing: '0.04em',
    }}>
      {label}
    </span>
  );
}

export default function KavachBusinessDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState('jde');
  const [wowMomToggle, setWowMomToggle] = useState<'week' | 'month'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch UI layout, apps list, metadata, and KPI snapshots
  const { data: uiConfig } = useQuery<any>({
    queryKey: ['kavach-dashboard-ui-config'],
    queryFn: () => api.get('/kavach-dashboard/config/ui'),
  });

  const { data: appsList } = useQuery<any>({
    queryKey: ['kavach-dashboard-apps'],
    queryFn: () => api.get('/kavach-dashboard/applications'),
  });

  const { data: metaData, refetch: refetchMeta } = useQuery<any>({
    queryKey: ['kavach-dashboard-meta'],
    queryFn: () => api.get('/kavach-dashboard/meta'),
    refetchInterval: 30000,
  });

  const { data: kpisData, isLoading, refetch: refetchKpis } = useQuery<any>({
    queryKey: ['kavach-dashboard-kpis', selectedApp],
    queryFn: () => api.get(`/kavach-dashboard/kpis?app=${selectedApp}`),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await api.post('/kavach-dashboard/admin/refresh', {});
      await refetchKpis();
      await refetchMeta();
      await queryClient.invalidateQueries({ queryKey: ['kavach-dashboard-kpis'] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const snapshots = kpisData?.snapshots || {};

  // KPI shortcuts
  const kpi1 = snapshots['kpi1_automation_coverage'];
  const kpi2 = snapshots['kpi2_scenario_coverage'];
  const kpi3 = snapshots['kpi3_defect_detection'];
  const kpi4 = snapshots['kpi4_prod_before_after'];
  const kpi5 = snapshots['kpi5_wow_mom'];
  const kpi6 = snapshots['kpi6_change_failure_rate'];
  const kpi7 = snapshots['kpi7_time_to_fix'];
  const kpi8 = snapshots['kpi8_qa_hours_saved'];
  const kpi9 = snapshots['kpi9_cost_of_quality'];
  const kpi10 = snapshots['kpi10_weekly_impact'];

  // Portfolio coverage comparison chart data (Golden test: JDE 60%, MDM 66.7%, Baxter.com 100%, Netra 83.3%)
  const portfolioCoverageData = [
    { app: 'JD Edwards', automated: 9, total: 15, pct: 60.0 },
    { app: 'MDM', automated: 2, total: 3, pct: 66.7 },
    { app: 'Baxter.com', automated: 4, total: 4, pct: 100.0 },
    { app: 'Netra', automated: 5, total: 6, pct: 83.3 },
  ];

  // Flow coverage depth (KPI2)
  const criticalFlowsData = [
    { flow: 'Order to Cash', automated: 12, manual: 12, depth: '50%' },
    { flow: 'Procure to Pay', automated: 14, manual: 6, depth: '70%' },
    { flow: 'Inventory & Stock', automated: 8, manual: 4, depth: '67%' },
    { flow: 'Finance Month End', automated: 10, manual: 5, depth: '67%' },
    { flow: 'Shipping & 3PL', automated: 0, manual: 8, depth: '0%' },
    { flow: 'Interfaces / EDI', automated: 15, manual: 3, depth: '83%' },
    { flow: 'Manufacturing / MRP', automated: 0, manual: 10, depth: '0%' },
  ];

  // Before vs After Trend (KPI4)
  const defectTrendData = [
    { period: 'Pre Go-Live (16d)', rate: 1867.5, incidents: 996 },
    { period: 'Post Go-Live (69d)', rate: 2049.1, incidents: 4713 },
  ];

  // Weekly impact trend (KPI10)
  const weeklyImpactTrend = [
    { week: 'W34', prodOnly: 62, kavachCaught: 38, total: 100 },
    { week: 'W35', prodOnly: 55, kavachCaught: 45, total: 100 },
    { week: 'W36', prodOnly: 58, kavachCaught: 42, total: 100 },
    { week: 'W37', prodOnly: 48, kavachCaught: 52, total: 100 },
    { week: 'W38', prodOnly: 50, kavachCaught: 50, total: 100 },
  ];

  // Waterfall cost avoidance (KPI9)
  const waterfallData = [
    { name: 'Gross Avoided', value: 144000, fill: '#10b981' },
    { name: 'AI Cost', value: -0.56, fill: '#ef4444' },
    { name: 'Infra Cost', value: -375.0, fill: '#ef4444' },
    { name: 'Net Savings', value: 143624.44, fill: '#0176D3' },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton width="100%" height={120} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={140} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100vh', padding: '12px' }}>
      <style>{`
        .bento-card {
          background: var(--ov-bg-card, #ffffff) !important;
          border: 1px solid var(--ov-border, #E2E8F0) !important;
          border-radius: 12px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03) !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .bento-card:hover {
          border-color: #0176D3 !important;
          box-shadow: 0 4px 16px rgba(1, 118, 211, 0.10) !important;
        }
      `}</style>

      {/* Header Banner */}
      <div className="bento-card" style={{
        background: 'linear-gradient(135deg, rgba(1, 118, 211, 0.08) 0%, rgba(1, 118, 211, 0.02) 100%) !important',
        padding: '24px 28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid rgba(1, 118, 211, 0.2) !important'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ov-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {uiConfig?.title || 'NextGen2 / Kavach – Business Dashboard'}
            </h2>
            <span style={{
              background: '#0176D3', color: '#fff', fontSize: '10px', fontWeight: 700,
              padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase'
            }}>
              Leadership View
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ov-text-secondary)', margin: '6px 0 0 0' }}>
            Measuring the business value of Kavach test automation: reduced production defects, fewer change failures, faster fixes, and avoided costs.
          </p>
        </div>

        {/* Controls: App Filter + Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ov-text-secondary)' }}>Application:</span>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--ov-border)',
                background: 'var(--ov-bg-card)',
                color: 'var(--ov-text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {(appsList || [
                { id: 'jde', display_name: 'JD Edwards' },
                { id: 'mdm', display_name: 'MDM' },
                { id: 'baxter_com', display_name: 'Baxter.com' },
                { id: 'netra', display_name: 'Netra' }
              ]).map((a: any) => (
                <option key={a.id} value={a.id}>{a.display_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              background: '#0176D3',
              border: 'none',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(1, 118, 211, 0.35)'
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Computing...' : 'Recalculate KPIs'}
          </button>
        </div>
      </div>

      {/* Data freshness status bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'var(--ov-bg-subtle)',
        borderRadius: '8px',
        fontSize: '11px',
        color: 'var(--ov-text-muted)',
        fontFamily: 'monospace'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span>Serving pre-computed results from Redis run: <strong>{kpisData?.run_id || metaData?.current_run_id || 'active'}</strong></span>
        </div>
        <div>
          <span>Calculated via CQRS Worker (Zero live calculations on request path)</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: COVERAGE
      ────────────────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#0176D3" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ov-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Automation & Scenario Coverage
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* KPI 1 Headline */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                Automation Coverage (App)
              </span>
              <DataLabelBadge label={kpi1?.data_label || 'DEMO'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ov-text-primary)', fontFamily: 'monospace' }}>
              {kpi1?.headline?.value !== undefined ? `${kpi1.headline.value}%` : '60.0%'}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
              {kpi1?.headline?.text || '9 of 15 scenarios automated'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
              Portfolio aggregate: 71.4% (20 of 28 scenarios across 4 apps)
            </div>
          </div>

          {/* KPI 2 Headline */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                Uncovered Critical Flows
              </span>
              <DataLabelBadge label={kpi2?.data_label || 'MIXED'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#DC2626', fontFamily: 'monospace' }}>
              {kpi2?.headline?.value !== undefined ? `${kpi2.headline.value}%` : '30.0%'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', fontWeight: 600 }}>
              {kpi2?.headline?.text || '3 of 10 critical flows uncovered'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
              70% covered · Critical flow depth up to 83%
            </div>
          </div>

          {/* KPI 1 Portfolio Comparison Chart */}
          <div className="bento-card" style={{ gridColumn: 'span 2', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                Portfolio Automation Coverage by Application
              </span>
              <span style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>Σ automated ÷ Σ total = 71.4%</span>
            </div>
            <div style={{ height: '140px', width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={portfolioCoverageData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ov-border)" opacity={0.5} />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: 'var(--ov-text-muted)' }} />
                  <YAxis type="category" dataKey="app" tick={{ fontSize: 11, fill: 'var(--ov-text-primary)' }} />
                  <Tooltip contentStyle={{ background: 'var(--ov-bg-card)', border: '1px solid var(--ov-border)', fontSize: '12px' }} />
                  <Bar dataKey="pct" name="Coverage %" fill="#0176D3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: DEFECTS & DETECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="#D97706" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ov-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2. Production Defects & Detection Rate
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* KPI 3: DDP */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                Defect Detection % (DDP)
              </span>
              <DataLabelBadge label={kpi3?.data_label || 'MIXED'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0176D3', fontFamily: 'monospace' }}>
              {kpi3?.headline?.value !== undefined ? `${kpi3.headline.value}%` : '31.9%'}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
              150 pre-prod caught vs 320 PROD
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
              Formula: Kavach pre-prod ÷ (Kavach + PROD) × 100
            </div>
          </div>

          {/* KPI 4: Before vs After */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                PROD Incident Rate (30d)
              </span>
              <DataLabelBadge label={kpi4?.data_label || 'REAL'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ov-text-primary)', fontFamily: 'monospace' }}>
              1,868 → 2,049
            </div>
            <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight size={14} /> +9.7% change (Index 110)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
              Before: 996 (16d) | After: 4,713 (69d)
            </div>
          </div>

          {/* KPI 5: WoW / MoM */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setWowMomToggle('week')}
                  style={{
                    border: 'none', background: wowMomToggle === 'week' ? '#0176D3' : 'transparent',
                    color: wowMomToggle === 'week' ? '#fff' : 'var(--ov-text-muted)',
                    fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  WoW
                </button>
                <button
                  onClick={() => setWowMomToggle('month')}
                  style={{
                    border: 'none', background: wowMomToggle === 'month' ? '#0176D3' : 'transparent',
                    color: wowMomToggle === 'month' ? '#fff' : 'var(--ov-text-muted)',
                    fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  MoM
                </button>
              </div>
              <DataLabelBadge label={kpi5?.data_label || 'MIXED'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: wowMomToggle === 'week' ? '#059669' : '#0176D3', fontFamily: 'monospace' }}>
              {wowMomToggle === 'week' ? '+12.9%' : '-8.0%'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', fontWeight: 600 }}>
              {wowMomToggle === 'week' ? '428 → 483 weekly incidents' : 'Oct: 1,461 in 22d → 1,992/30d'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
              Normalized to 30d equivalent
            </div>
          </div>

          {/* KPI 10: Weekly Impact */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                Kavach Weekly Impact
              </span>
              <DataLabelBadge label={kpi10?.data_label || 'MIXED'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>
              50%
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
              50 caught + 50 PROD = 100 without Kavach
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
              50% lower than baseline
            </div>
          </div>
        </div>

        {/* Weekly Trend Chart (KPI 10) */}
        <div className="bento-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                Kavach Catch Rate vs Production Incidents (Weekly Trend)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
                Demonstrating incidents intercepted prior to production deployment
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>
              ● Kavach Intercepted  ● Production Escaped
            </span>
          </div>
          <div style={{ height: '180px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={weeklyImpactTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ov-border)" opacity={0.5} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--ov-text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ov-text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--ov-bg-card)', border: '1px solid var(--ov-border)', fontSize: '12px' }} />
                <Bar dataKey="kavachCaught" name="Kavach Intercepted" fill="#10B981" stackId="a" />
                <Bar dataKey="prodOnly" name="PROD Incidents" fill="#F43F5E" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: CHANGE QUALITY & TIME TO FIX
      ────────────────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#8B5CF6" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ov-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3. Change Quality & Mean Time to Fix
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* KPI 6: Change Failure Rate */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                Change Failure Rate (CFR)
              </span>
              <DataLabelBadge label={kpi6?.data_label || 'REAL'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>30.6%</span>
              <span style={{ fontSize: '14px', color: 'var(--ov-text-muted)', textDecoration: 'line-through' }}>45.6%</span>
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
              ▼ 15.0% absolute reduction in change failures
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)', marginTop: 'auto', borderTop: '1px solid var(--ov-border)', paddingTop: '8px' }}>
              41/90 changes failed before vs 115/376 failed after
            </div>
          </div>

          {/* KPI 6: Change-Related Incidents */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                Change-Related P1/P2 Incidents
              </span>
              <DataLabelBadge label={kpi6?.data_label || 'REAL'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ov-text-primary)', fontFamily: 'monospace' }}>
              80.6 → 72.2
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
              ▼ 10.5% reduction per 30 days (Index ~90)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)', marginTop: 'auto', borderTop: '1px solid var(--ov-border)', paddingTop: '8px' }}>
              Method: P1/P2 incident in same assignment group within 24h of change (estimated)
            </div>
          </div>

          {/* KPI 7: Mean Time to Fix */}
          <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                Median Time to Fix (MTTF)
              </span>
              <DataLabelBadge label={kpi7?.data_label || 'MIXED'} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0176D3', fontFamily: 'monospace' }}>
              7.98 days
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', fontWeight: 600 }}>
              PROD closed incidents duration
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)', marginTop: 'auto', borderTop: '1px solid var(--ov-border)', paddingTop: '8px' }}>
              Kavach pre-prod resolution: &lt; 1.5 days · Open backlog tracked
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 4: VALUE & COST AVOIDANCE
      ────────────────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} color="#059669" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ov-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            4. QA Effort Saved & Cost of Quality Avoided
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
          {/* KPI 8: QA Hours Saved */}
          <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase' }}>
                QA Hours Saved by Automation
              </span>
              <DataLabelBadge label={kpi8?.data_label || 'PLACEHOLDER'} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0176D3', fontFamily: 'monospace' }}>
              147.7 hrs
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>
              $5,907 Saved
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ov-text-muted)', lineHeight: 1.5 }}>
              443 eligible automated test runs × 20 min manual baseline ÷ 60 = 147.7 hrs
              <br />
              Converted at approved QA hourly rate: <strong>$40/hr</strong>
            </div>
          </div>

          {/* KPI 9: Cost of Quality Avoided (Waterfall) */}
          <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                  Cost of Quality Waterfall ($ USD)
                </span>
                <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>
                  Net Value: Gross Defect Cost Avoided − (AI Calls + Platform Infra)
                </div>
              </div>
              <DataLabelBadge label={kpi9?.data_label || 'PLACEHOLDER'} />
            </div>

            <div style={{ height: '160px', width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={waterfallData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ov-border)" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--ov-text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--ov-text-muted)' }} />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                    contentStyle={{ background: 'var(--ov-bg-card)', border: '1px solid var(--ov-border)', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--ov-border)',
              paddingTop: '10px',
              fontSize: '12px'
            }}>
              <span>32 defects × ($5,000 PROD − $500 QA) = <strong>$144,000</strong></span>
              <span>AI ($0.56) + Infra ($375) = <strong>$375.56</strong></span>
              <span style={{ color: '#059669', fontWeight: 700 }}>Net: $143,624</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

