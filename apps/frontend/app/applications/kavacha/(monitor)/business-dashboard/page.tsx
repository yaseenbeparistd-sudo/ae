'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import {
  Calendar, RefreshCw, ChevronDown, Check
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, ComposedChart, ReferenceLine
} from 'recharts';

export default function KavachQualityDashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [defectsPeriod, setDefectsPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Query live API with graceful fallback
  const { data: kpisData } = useQuery<any>({
    queryKey: ['kavach-dashboard-kpis', 'jde'],
    queryFn: () => api.get('/kavach-dashboard/kpis?app=jde'),
  });

  // ── 1. Production Incidents Trend (Before vs After Kavach Go-Live Aug 15) ──
  const incidentsTrendData = [
    { date: '06 Jul', before: 518, after: null, total: 518 },
    { date: '13 Jul', before: 502, after: null, total: 502 },
    { date: '20 Jul', before: 535, after: null, total: 535 },
    { date: '27 Jul', before: 510, after: null, total: 510 },
    { date: '03 Aug', before: 524, after: null, total: 524 },
    { date: '10 Aug', before: 512, after: null, total: 512 },
    { date: '17 Aug', before: null, after: 495, total: 495 },
    { date: '24 Aug', before: null, after: 480, total: 480 },
    { date: '31 Aug', before: null, after: 465, total: 465 },
    { date: '07 Sep', before: null, after: 455, total: 455 },
    { date: '14 Sep', before: null, after: 442, total: 442 },
    { date: '21 Sep', before: null, after: 435, total: 435 },
    { date: '28 Sep', before: null, after: 425, total: 425 },
    { date: '05 Oct', before: null, after: 415, total: 415 },
    { date: '12 Oct', before: null, after: 455, total: 455 },
    { date: '19 Oct', before: null, after: 396, total: 396 },
  ];

  // ── 2. Defects Trend (WoW) Line Data ──
  const wowDefectsTrend = [
    { date: '06 Jul', prodDefects: 5.3, preProdDefects: 5.1 },
    { date: '13 Jul', prodDefects: 4.2, preProdDefects: 6.8 },
    { date: '20 Jul', prodDefects: 6.1, preProdDefects: 5.2 },
    { date: '27 Jul', prodDefects: 4.3, preProdDefects: 6.4 },
    { date: '03 Aug', prodDefects: 4.1, preProdDefects: 7.2 },
    { date: '10 Aug', prodDefects: 4.2, preProdDefects: 6.1 },
    { date: '17 Aug', prodDefects: 4.2, preProdDefects: 7.0 },
    { date: '24 Aug', prodDefects: 3.5, preProdDefects: 7.4 },
    { date: '31 Aug', prodDefects: 2.1, preProdDefects: 8.1 },
    { date: '07 Sep', prodDefects: 2.2, preProdDefects: 6.5 },
    { date: '14 Sep', prodDefects: 1.8, preProdDefects: 7.3 },
    { date: '21 Sep', prodDefects: 1.2, preProdDefects: 8.5 },
    { date: '28 Sep', prodDefects: 0.8, preProdDefects: 6.9 },
    { date: '05 Oct', prodDefects: 0.8, preProdDefects: 7.8 },
    { date: '12 Oct', prodDefects: 0.9, preProdDefects: 7.6 },
    { date: '19 Oct', prodDefects: 0.9, preProdDefects: 7.7 },
  ];

  // ── 3. Scenario Coverage by Business Flow (9 Flows) ──
  const scenarioFlows = [
    { name: 'Order to Cash', automated: 8, total: 10, pct: 80, uncovered: false },
    { name: 'Procure to Pay', automated: 6, total: 8, pct: 75, uncovered: false },
    { name: 'Inventory', automated: 7, total: 9, pct: 78, uncovered: false },
    { name: 'Shipping', automated: 5, total: 7, pct: 71, uncovered: false },
    { name: 'Finance Month-End', automated: 6, total: 8, pct: 75, uncovered: false },
    { name: 'Interfaces/EDI', automated: 3, total: 7, pct: 43, uncovered: true },
    { name: 'Access/Security', automated: 5, total: 6, pct: 83, uncovered: false },
    { name: 'Manufacturing', automated: 2, total: 5, pct: 40, uncovered: true },
    { name: 'Master Data', automated: 4, total: 6, pct: 67, uncovered: false },
  ];

  // ── 4. Defects by Business Flow (61 Pre-prod, 17 Production = 78 total) ──
  const defectsByFlow = [
    { name: 'Order to Cash', preProd: 15, prod: 5, total: 20 },
    { name: 'Finance Month-End', preProd: 9, prod: 4, total: 13 },
    { name: 'Shipping', preProd: 7, prod: 3, total: 10 },
    { name: 'Inventory', preProd: 6, prod: 3, total: 9 },
    { name: 'Procure to Pay', preProd: 6, prod: 2, total: 8 },
    { name: 'Interfaces/EDI', preProd: 6, prod: 2, total: 8 },
    { name: 'Access/Security', preProd: 4, prod: 1, total: 5 },
    { name: 'Manufacturing', preProd: 3, prod: 1, total: 4 },
    { name: 'Master Data', preProd: 1, prod: 0, total: 1 },
  ];

  // ── 5. Weekly / Monthly Defects After Automation ──
  const weeklyDefectsData = [
    { period: 'W1', preProd: 4, prod: 3 },
    { period: 'W2', preProd: 6, prod: 2 },
    { period: 'W3', preProd: 7, prod: 2 },
    { period: 'W4', preProd: 8, prod: 1 },
    { period: 'W5', preProd: 6, prod: 1 },
    { period: 'W6', preProd: 8, prod: 1 },
    { period: 'W7', preProd: 7, prod: 1 },
    { period: 'W8', preProd: 8, prod: 1 },
  ];

  const monthlyDefectsData = [
    { period: 'Sep', preProd: 25, prod: 8 },
    { period: 'Oct', preProd: 36, prod: 9 },
  ];

  // ── 6. QA Effort Combo Chart Data ──
  const qaHoursComboData = [
    { week: 'W1', weekly: 156, running: 156 },
    { week: 'W2', weekly: 156, running: 312 },
    { week: 'W3', weekly: 156, running: 468 },
    { week: 'W4', weekly: 156, running: 624 },
    { week: 'W5', weekly: 156, running: 780 },
    { week: 'W6', weekly: 156, running: 936 },
    { week: 'W7', weekly: 156, running: 1092 },
    { week: 'W8', weekly: 156, running: 1248 },
  ];

  return (
    <div className="kq-dashboard-container">
      <style>{`
        /* Root & Layout Sizing */
        .kq-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          max-width: 100%;
          min-height: 100vh;
          background: #F8FAFC;
          padding: 16px 20px;
          box-sizing: border-box;
          color: #1E293B;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow-x: hidden;
        }

        /* Standard Card */
        .kq-card {
          background: #FFFFFF !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 8px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03) !important;
          box-sizing: border-box;
          min-width: 0; /* Prevents flex/grid blowouts */
          transition: all 0.2s ease !important;
        }
        .kq-card:hover {
          border-color: #CBD5E1 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
        }

        /* ── Responsive Grids ── */
        
        /* Row 1: Top 7 KPI Cards */
        .kq-grid-kpis {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 10px;
          width: 100%;
        }

        /* Row 2: Charts + Callout */
        .kq-grid-row2 {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1.25fr) minmax(0, 0.65fr);
          gap: 12px;
          width: 100%;
        }

        /* Row 3: Flows Breakdown */
        .kq-grid-row3 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          width: 100%;
        }

        /* Row 4: Bottom 5 Cards */
        .kq-grid-row4 {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          width: 100%;
        }

        /* Tooltip */
        .custom-tooltip {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
        }

        /* ── Media Queries for Responsive Adaptation ── */

        /* Laptops & Standard Monitors (under 1440px) */
        @media (max-width: 1400px) {
          .kq-grid-kpis {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          .kq-grid-row2 {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          .kq-callout-card {
            grid-column: span 2;
          }
          .kq-grid-row4 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        /* Small Laptops / Tablets Landscape (under 1120px) */
        @media (max-width: 1120px) {
          .kq-grid-kpis {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .kq-grid-row3 {
            grid-template-columns: 1fr;
          }
          .kq-grid-row4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Mobile & Portrait Tablets (under 768px) */
        @media (max-width: 768px) {
          .kq-dashboard-container {
            padding: 12px;
            gap: 10px;
          }
          .kq-grid-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .kq-grid-row2 {
            grid-template-columns: 1fr;
          }
          .kq-callout-card {
            grid-column: span 1;
          }
          .kq-grid-row3 {
            grid-template-columns: 1fr;
          }
          .kq-grid-row4 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .kq-grid-kpis {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── TOP HEADER ── */}
      <div>
        <h1 style={{
          fontSize: 'clamp(18px, 1.8vw, 22px)',
          fontWeight: 700,
          color: '#1E293B',
          margin: '0 0 2px 0',
          letterSpacing: '-0.01em'
        }}>
          Kavach Quality Dashboard
        </h1>
        <div style={{ fontSize: 'clamp(11px, 1vw, 13px)', color: '#64748B' }}>
          Autonomous Core ERP Quality Orchestrator
        </div>
      </div>

      {/* ── CONTEXT / FILTER BAR ── */}
      <div className="kq-card" style={{
        padding: '10px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Left: Application Details */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '13px'
        }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#475569',
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            padding: '2px 7px',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}>
            ORACLE
          </span>
          <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>
            JDE (JD Edwards EnterpriseOne)
          </span>
          <span style={{ color: '#64748B' }}>
            Global ERP Operations
          </span>
          <span style={{ color: '#CBD5E1', display: 'inline-block' }}>|</span>
          <span>
            <span style={{ color: '#64748B' }}>Owner: </span>
            <strong style={{ color: '#1E293B' }}>ERP Systems</strong>
          </span>
          <span style={{ color: '#CBD5E1', display: 'inline-block' }}>|</span>
          <span>
            <span style={{ color: '#64748B' }}>Automation Go-Live: </span>
            <strong style={{ color: '#1E293B' }}>Aug 15, 2026</strong>
          </span>
        </div>

        {/* Right: Region Switcher & Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Region Tabs */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '2px',
            borderRadius: '6px',
            gap: '2px'
          }}>
            {['EMEA', 'APAC', 'LATAM', 'UCAN', 'Global'].map((region) => {
              const active = selectedRegion === region;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  style={{
                    border: 'none',
                    background: active ? '#FFFFFF' : 'transparent',
                    color: active ? '#1E293B' : '#64748B',
                    fontWeight: active ? 600 : 500,
                    fontSize: '11px',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {region}
                </button>
              );
            })}
          </div>

          {/* Date Range Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#334155'
          }}>
            <Calendar size={12} color="#64748B" />
            <span>Jul 01, 2026 – Oct 31, 2026</span>
          </div>
        </div>
      </div>

      {/* ── ROW 1: 7 EXECUTIVE KPI SUMMARY CARDS ── */}
      <div className="kq-grid-kpis">
        {/* Card 1: Automation Coverage */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '4px' }}>
              Automation Coverage
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: 'clamp(20px, 1.8vw, 24px)', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>
                68%
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#1D4ED8',
                background: '#EFF6FF',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                ▲ +12 pts
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.3 }}>
              Weighted by business priority
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: '68%', height: '100%', background: '#104F8B', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Card 2: Defect Detection */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '4px' }}>
              Defect Detection
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: 'clamp(20px, 1.8vw, 24px)', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>
                78%
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#1D4ED8',
                background: '#EFF6FF',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                ▲ +7 pts
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.3 }}>
              Caught before production, vs last release
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: '78%', height: '100%', background: '#104F8B', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Card 3: QA Effort Saved */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '4px' }}>
              QA Effort Saved
            </div>
            <div style={{ fontSize: 'clamp(18px, 1.6vw, 22px)', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>
              1,248 hrs
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.3 }}>
              $62,400 at $50/hr · 312 automated runs
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px' }} />
        </div>

        {/* Card 4: Amount Saved */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '4px' }}>
              Amount Saved
            </div>
            <div style={{ fontSize: 'clamp(18px, 1.6vw, 22px)', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>
              $276,600
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.3 }}>
              Net cost of quality avoided: $305,000 saved minus $28,400 Kavach cost
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px' }} />
        </div>

        {/* Card 5: Critical Flows */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '4px' }}>
              Critical Flows
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: 'clamp(18px, 1.6vw, 22px)', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>
                7 of 9
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#1D4ED8',
                background: '#EFF6FF',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                78% automated
              </span>
            </div>
            {/* Visual Indicator of 9 blocks: 7 dark, 2 empty dashed */}
            <div style={{ display: 'flex', gap: '3px', marginTop: '8px' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} style={{ width: '10px', height: '7px', background: '#104F8B', borderRadius: '2px' }} />
              ))}
              {[8, 9].map((i) => (
                <div key={i} style={{ width: '10px', height: '7px', border: '1px dashed #CBD5E1', borderRadius: '2px' }} />
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.3 }}>
              2 uncovered (22%): Interfaces/EDI, Manufacturing
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px' }} />
        </div>

        {/* Card 6: Mean Time to Fix */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>
              Mean Time to Fix
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '9px', color: '#94A3B8' }}>
              <span>Before</span>
              <span>Now</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>43 hrs</span>
              <span style={{ color: '#94A3B8', fontSize: '12px' }}>→</span>
              <span style={{ fontSize: 'clamp(18px, 1.6vw, 22px)', fontWeight: 700, color: '#1E293B' }}>18 hrs</span>
            </div>
            <div style={{ marginTop: '4px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#1D4ED8',
                background: '#EFF6FF',
                padding: '1px 5px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                whiteSpace: 'nowrap'
              }}>
                ▼ 58% faster
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.3 }}>
              Defect caught to defect fixed
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px' }} />
        </div>

        {/* Card 7: Change Failure Rate */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '4px' }}>
              Change Failure Rate
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: 'clamp(20px, 1.8vw, 24px)', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>
                12%
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#1D4ED8',
                background: '#EFF6FF',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                ▼ 21 pts
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.3 }}>
              Was 33% before automation
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#E2E8F0', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: '12%', height: '100%', background: '#104F8B', borderRadius: '2px' }} />
          </div>
        </div>
      </div>

      {/* ── ROW 2: PRODUCTION INCIDENTS TREND, WOW DEFECTS TREND & CALLOUT ── */}
      <div className="kq-grid-row2">
        {/* Chart 1: Production Incidents Trend */}
        <div className="kq-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              Production Incidents Trend
            </h3>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Before vs After Automation (Kavach) · incidents per week
            </div>
          </div>

          <div style={{ width: '100%', height: 210, position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '42%',
              fontSize: '10px',
              color: '#64748B',
              zIndex: 2,
              pointerEvents: 'none'
            }}>
              Kavach Go-Live · Aug 15
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsTrendData} margin={{ top: 18, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748B', fontSize: 9 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  interval={3}
                />
                <YAxis
                  domain={[0, 600]}
                  ticks={[0, 200, 400, 600]}
                  tick={{ fill: '#64748B', fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="custom-tooltip">
                          <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>Week of {d.date}</div>
                          <div style={{ color: d.after ? '#104F8B' : '#64748B' }}>
                            {d.after ? `After Automation: ${d.after}` : `Before Automation: ${d.before}`} incidents
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x="17 Aug" stroke="#94A3B8" strokeDasharray="3 3" />
                <Bar dataKey="before" fill="#CBD5E1" radius={[2, 2, 0, 0]} maxBarSize={16} />
                <Bar dataKey="after" fill="#104F8B" radius={[2, 2, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px', color: '#64748B', marginTop: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#CBD5E1' }} /> Before Automation
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#104F8B' }} /> After Automation
            </span>
          </div>
        </div>

        {/* Chart 2: Defects Trend (WoW) */}
        <div className="kq-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              Defects Trend (WoW)
            </h3>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Defects found each week
            </div>
          </div>

          <div style={{ width: '100%', height: 210, position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '42%',
              fontSize: '10px',
              color: '#64748B',
              zIndex: 2,
              pointerEvents: 'none'
            }}>
              Go-live
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wowDefectsTrend} margin={{ top: 18, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748B', fontSize: 9 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  interval={3}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 5, 10]}
                  tick={{ fill: '#64748B', fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="custom-tooltip">
                          <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>Week of {d.date}</div>
                          <div style={{ color: '#104F8B' }}>Production Defects: {d.prodDefects}</div>
                          <div style={{ color: '#64748B' }}>Pre-Prod Defects: {d.preProdDefects}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x="17 Aug" stroke="#94A3B8" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="preProdDefects"
                  name="Pre-Prod Defects"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#94A3B8' }}
                />
                <Line
                  type="monotone"
                  dataKey="prodDefects"
                  name="Production Defects"
                  stroke="#104F8B"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#104F8B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px', color: '#64748B', marginTop: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#104F8B' }} /> Production Defects
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#94A3B8' }} /> Pre-Prod Defects
            </span>
          </div>
        </div>

        {/* Card 3: Executive Callout */}
        <div className="kq-callout-card" style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0
        }}>
          <div>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#0284C7', fontSize: '13px', lineHeight: 1 }}>▼</span>
            </div>

            <div style={{
              fontSize: 'clamp(30px, 2.5vw, 36px)',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}>
              13%
            </div>

            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              marginTop: '6px'
            }}>
              lower incidents in last full week
            </div>

            <div style={{
              fontSize: '11px',
              color: '#64748B',
              marginTop: '4px'
            }}>
              396 vs 455 (weeks of 19 Oct and 12 Oct)
            </div>
          </div>

          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#0369A1',
            lineHeight: 1.4,
            paddingTop: '16px',
            borderTop: '1px solid #DBEAFE',
            marginTop: '16px'
          }}>
            Continuous improvement in production stability
          </div>
        </div>
      </div>

      {/* ── ROW 3: SCENARIO COVERAGE & DEFECTS BY BUSINESS FLOW ── */}
      <div className="kq-grid-row3">
        {/* Left: Scenario Coverage by Business Flow */}
        <div className="kq-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              Scenario Coverage by Business Flow
            </h3>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Automated scenarios out of total
            </div>
          </div>

          {/* List of 9 Business Flows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {scenarioFlows.map((flow) => (
              <div key={flow.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 'clamp(100px, 12vw, 130px)',
                  fontSize: '11px',
                  color: '#334155',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {flow.name}
                </div>
                {/* Horizontal Progress Bar */}
                <div style={{ flex: 1, height: '9px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${flow.pct}%`, height: '100%', background: '#104F8B', borderRadius: '4px' }} />
                </div>
                {/* Numbers and Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', minWidth: '90px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                    {flow.automated}/{flow.total}
                  </span>
                  <span style={{ fontSize: '11px', color: '#1E293B', fontWeight: 700, minWidth: '28px', textAlign: 'right' }}>
                    {flow.pct}%
                  </span>
                  {flow.uncovered && (
                    <span style={{
                      fontSize: '9px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      whiteSpace: 'nowrap'
                    }}>
                      Uncovered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px', color: '#64748B', marginTop: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#104F8B' }} /> Automated
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F1F5F9', border: '1px solid #CBD5E1' }} /> Not Automated
            </span>
          </div>
        </div>

        {/* Right: Defects by Business Flow */}
        <div className="kq-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              Defects by Business Flow
            </h3>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Found since Sep 1 · 61 pre-prod, 17 production
            </div>
          </div>

          {/* List of 9 flows with stacked pre-prod + prod */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {defectsByFlow.map((flow) => {
              const maxDefects = 20;
              const preProdPct = (flow.preProd / maxDefects) * 100;
              const prodPct = (flow.prod / maxDefects) * 100;
              return (
                <div key={flow.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 'clamp(100px, 12vw, 130px)',
                    fontSize: '11px',
                    color: '#334155',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {flow.name}
                  </div>
                  {/* Stacked Horizontal Bar */}
                  <div style={{ flex: 1, height: '9px', background: '#F8FAFC', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${preProdPct}%`, height: '100%', background: '#94A3B8' }} />
                    <div style={{ width: `${prodPct}%`, height: '100%', background: '#104F8B' }} />
                  </div>
                  {/* Total Count */}
                  <div style={{ width: '22px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#1E293B' }}>
                    {flow.total}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px', color: '#64748B', marginTop: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#94A3B8' }} /> Pre-Prod Defects
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#104F8B' }} /> Production Defects
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 4: 5 BOTTOM METRIC CARDS / MINI CHARTS ── */}
      <div className="kq-grid-row4">
        {/* Bottom Card 1: Weekly Defects After Automation */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
                  Weekly Defects After Automation
                </h4>
                <div style={{ fontSize: '10px', color: '#64748B' }}>
                  Defects found each period after Sep 1
                </div>
              </div>
              {/* Segmented Toggle: Weekly / Monthly */}
              <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '4px', gap: '2px' }}>
                <button
                  onClick={() => setDefectsPeriod('weekly')}
                  style={{
                    border: 'none',
                    background: defectsPeriod === 'weekly' ? '#104F8B' : 'transparent',
                    color: defectsPeriod === 'weekly' ? '#FFFFFF' : '#64748B',
                    fontSize: '9px',
                    fontWeight: 600,
                    padding: '2px 5px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setDefectsPeriod('monthly')}
                  style={{
                    border: 'none',
                    background: defectsPeriod === 'monthly' ? '#104F8B' : 'transparent',
                    color: defectsPeriod === 'monthly' ? '#FFFFFF' : '#64748B',
                    fontSize: '9px',
                    fontWeight: 600,
                    padding: '2px 5px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div style={{ width: '100%', height: 110, marginTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectsPeriod === 'weekly' ? weeklyDefectsData : monthlyDefectsData} margin={{ top: 8, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 8 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="custom-tooltip">
                            <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>{d.period}</div>
                            <div style={{ color: '#64748B' }}>Pre-prod: {d.preProd}</div>
                            <div style={{ color: '#104F8B' }}>Production: {d.prod}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="preProd" fill="#94A3B8" radius={[2, 2, 0, 0]} maxBarSize={9} />
                  <Bar dataKey="prod" fill="#104F8B" radius={[2, 2, 0, 0]} maxBarSize={9} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '9px', color: '#64748B', marginTop: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8' }} /> Pre-prod
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#104F8B' }} /> Production
            </span>
          </div>
        </div>

        {/* Bottom Card 2: Change Failure Rate */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              Change Failure Rate
            </h4>
            <div style={{ fontSize: '10px', color: '#64748B' }}>
              Releases that broke production
            </div>

            {/* Comparative Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '18px', height: '100px', marginTop: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>33%</span>
                <div style={{ width: '38px', height: '60px', background: '#CBD5E1', borderRadius: '3px 3px 0 0' }} />
                <span style={{ fontSize: '9px', color: '#64748B', whiteSpace: 'nowrap' }}>Before automation</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#104F8B' }}>12%</span>
                <div style={{ width: '38px', height: '22px', background: '#104F8B', borderRadius: '3px 3px 0 0' }} />
                <span style={{ fontSize: '9px', color: '#104F8B', fontWeight: 600, whiteSpace: 'nowrap' }}>After automation</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', fontWeight: 600, color: '#1E293B', marginTop: '8px' }}>
            ▼ 21 pts fewer failed changes
          </div>
        </div>

        {/* Bottom Card 3: Mean Time to Fix */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              Mean Time to Fix
            </h4>
            <div style={{ fontSize: '10px', color: '#64748B' }}>
              From defect caught to fixed
            </div>

            {/* Comparative Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '18px', height: '100px', marginTop: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>43 hrs</span>
                <div style={{ width: '38px', height: '64px', background: '#CBD5E1', borderRadius: '3px 3px 0 0' }} />
                <span style={{ fontSize: '9px', color: '#64748B', whiteSpace: 'nowrap' }}>Before automation</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#104F8B' }}>18 hrs</span>
                <div style={{ width: '38px', height: '28px', background: '#104F8B', borderRadius: '3px 3px 0 0' }} />
                <span style={{ fontSize: '9px', color: '#104F8B', fontWeight: 600, whiteSpace: 'nowrap' }}>After automation</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', fontWeight: 600, color: '#1E293B', marginTop: '8px' }}>
            ▼ 58% faster resolution
          </div>
        </div>

        {/* Bottom Card 4: QA Effort / Hours Saved */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              QA Effort / Hours Saved
            </h4>
            <div style={{ fontSize: '10px', color: '#64748B' }}>
              $62,400 at $50/hr · 312 automated runs
            </div>

            <div style={{ width: '100%', height: 100, marginTop: '8px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 4, fontSize: '10px', fontWeight: 700, color: '#104F8B', zIndex: 2 }}>
                1,248 hrs
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={qaHoursComboData} margin={{ top: 14, right: 6, left: -30, bottom: 0 }}>
                  <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 8 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 8 }} tickLine={false} axisLine={false} />
                  <Bar dataKey="weekly" fill="#CBD5E1" radius={[2, 2, 0, 0]} maxBarSize={8} />
                  <Line type="monotone" dataKey="running" stroke="#104F8B" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: '#64748B', marginTop: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#CBD5E1' }} /> Hours/wk
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#104F8B' }} /> Total
            </span>
          </div>
        </div>

        {/* Bottom Card 5: Cost of Quality Avoided */}
        <div className="kq-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>
              Cost of Quality Avoided
            </h4>
            <div style={{ fontSize: '10px', color: '#64748B' }}>
              61 defects caught early
            </div>

            {/* Waterfall comparison */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px', height: '100px', marginTop: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155' }}>$305k</span>
                <div style={{ width: '100%', height: '64px', background: '#CBD5E1', borderRadius: '3px 3px 0 0' }} />
                <span style={{ fontSize: '8px', color: '#64748B', textAlign: 'center', lineHeight: 1.1 }}>Est. savings</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#475569' }}>-$28.4k</span>
                <div style={{ width: '100%', height: '10px', background: '#64748B', borderRadius: '2px' }} />
                <span style={{ fontSize: '8px', color: '#64748B', textAlign: 'center', lineHeight: 1.1 }}>Kavach cost</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#104F8B' }}>$276.6k</span>
                <div style={{ width: '100%', height: '56px', background: '#104F8B', borderRadius: '3px 3px 0 0' }} />
                <span style={{ fontSize: '8px', color: '#104F8B', fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>Net avoided</span>
              </div>
            </div>
          </div>

          <div style={{ height: '2px' }} />
        </div>
      </div>
    </div>
  );
}
