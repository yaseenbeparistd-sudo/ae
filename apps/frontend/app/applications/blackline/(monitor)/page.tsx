'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign, CheckCircle2, TrendingUp, Clock, ShieldCheck,
  FileSpreadsheet, Layers, Activity, Users, ArrowUpRight,
  ArrowDownRight, CheckCircle, AlertCircle, RefreshCw, BarChart3,
  Calendar, Lock, Landmark, Check
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

// --- Reusable Components ---

const Badge = ({ children, type }: { children: React.ReactNode; type: 'success' | 'warning' | 'error' | 'info' | 'neutral' }) => {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
    warning: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
    error: { bg: 'rgba(244,63,94,0.1)', text: '#f43f5e' },
    info: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
    neutral: { bg: 'var(--ov-bg-subtle)', text: 'var(--ov-text-secondary)' }
  };
  const color = colors[type];
  return (
    <span style={{
      background: color.bg, color: color.text,
      padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {children}
    </span>
  );
};

const Card = ({ title, icon: Icon, children, action, className = '' }: { title?: string; icon?: any; children: React.ReactNode; action?: React.ReactNode; className?: string }) => (
  <div className={`bento-card ${className}`} style={{
    display: 'flex', flexDirection: 'column', height: '100%'
  }}>
    {(title || action) && (
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={16} color="var(--ov-text-secondary)" />}
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--ov-text-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</h3>
        </div>
        {action && <div style={{ fontSize: '12px' }}>{action}</div>}
      </div>
    )}
    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  </div>
);

const StatBox = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bento-card" style={{
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative'
  }}>
    <div style={{ position: 'absolute', right: '-12px', bottom: '-12px', opacity: 0.04, pointerEvents: 'none' }}>
      <Icon size={100} color="var(--ov-text-primary)" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: 'var(--ov-bg-subtle)', padding: '8px', borderRadius: '8px' }}>
          <Icon size={16} color="var(--ov-text-secondary)" />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ov-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      </div>
    </div>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)', fontFamily: 'monospace' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
        {trend && (
          <span style={{
            display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600,
            color: trend > 0 ? '#10b981' : trend < 0 ? '#f43f5e' : 'var(--ov-text-secondary)'
          }}>
            {trend > 0 ? <ArrowUpRight size={12} /> : trend < 0 ? <ArrowDownRight size={12} /> : null}
            {Math.abs(trend)}%
          </span>
        )}
        <span style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>{subtext}</span>
      </div>
    </div>
  </div>
);

const volumeTrendData = [
  { day: 'Day 1', gl: 840, subledger: 620, bank: 320 },
  { day: 'Day 5', gl: 950, subledger: 710, bank: 410 },
  { day: 'Day 10', gl: 1120, subledger: 850, bank: 480 },
  { day: 'Day 15', gl: 1350, subledger: 990, bank: 530 },
  { day: 'Day 20', gl: 1520, subledger: 1120, bank: 620 },
  { day: 'Day 25', gl: 1840, subledger: 1380, bank: 710 },
  { day: 'Day 30', gl: 2250, subledger: 1650, bank: 950 },
];

export default function BlacklineOverview() {
  const matchPieData = [
    { name: 'Auto-Matched', value: 1418, color: '#10b981' },
    { name: 'Pending Review', value: 2, color: '#f59e0b' },
    { name: 'Exceptions', value: 0, color: '#ef4444' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', minHeight: '100vh', padding: '12px' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: -1, pointerEvents: 'none' }} />

      <style>{`
        .bento-card {
          background: rgba(255, 255, 255, 0.02) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative;
          overflow: hidden;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          border-color: rgba(16, 185, 129, 0.4) !important;
          box-shadow: 0 12px 40px rgba(16, 185, 129, 0.15), 0 4px 24px rgba(0, 0, 0, 0.3) !important;
        }
      `}</style>

      {/* Banner */}
      <div className="bento-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%) !important',
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Blackline Financial Close & Reconciliation Suite
            </h2>
            <Badge type="success">SOX Compliant</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ov-text-secondary)', margin: 0 }}>
            Continuous accounting, automated balance verification, and month-end close acceleration.
          </p>
        </div>
        <Link href="/applications/blackline/health" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            View Health Monitor →
          </button>
        </Link>
      </div>

      {/* 4 Summary Stat Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="bento-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '3px solid #0176D3' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(1, 118, 211, 0.08)', border: '1px solid rgba(1, 118, 211, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={26} color="#0176D3" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#54698D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume Reconciled</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: '2px 0' }}>$4.85M</div>
            <div style={{ fontSize: '11px', color: '#0176D3', fontWeight: 600 }}>↑ 18% vs last month</div>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '3px solid #0176D3' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(1, 118, 211, 0.08)', border: '1px solid rgba(1, 118, 211, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={26} color="#0176D3" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#54698D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Match Rate</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: '2px 0' }}>99.98%</div>
            <div style={{ fontSize: '11px', color: '#0176D3', fontWeight: 600 }}>0 audit exceptions</div>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '3px solid #0176D3' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(1, 118, 211, 0.08)', border: '1px solid rgba(1, 118, 211, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={26} color="#0176D3" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#54698D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Close Cycle Reduction</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: '2px 0' }}>-3.5 Days</div>
            <div style={{ fontSize: '11px', color: '#0176D3', fontWeight: 600 }}>4.5 days down from 8d</div>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '3px solid #0176D3' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(1, 118, 211, 0.08)', border: '1px solid rgba(1, 118, 211, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} color="#0176D3" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#54698D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Readiness</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: '2px 0' }}>100%</div>
            <div style={{ fontSize: '11px', color: '#0176D3', fontWeight: 600 }}>SOX Audit Verified</div>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        
        {/* Reconciled Transaction Volume Trends */}
        <Card title="Monthly Reconciled Volume Breakdown ($K)" icon={TrendingUp}>
          <div style={{ height: '260px', width: '100%', marginTop: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrendData}>
                <defs>
                  <linearGradient id="colorGL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0176D3" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0176D3" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--ov-bg-card)', border: '1px solid var(--ov-border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="gl" stroke="#10b981" fillOpacity={1} fill="url(#colorGL)" name="GL Accounts ($K)" />
                <Area type="monotone" dataKey="subledger" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSub)" name="Subledger ($K)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Account Matching Status Donut */}
        <Card title="Account Matching Accuracy" icon={CheckCircle}>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '16px' }}>
            <div style={{ width: '160px', height: '160px', position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={matchPieData} innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                    {matchPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--ov-bg-card)', border: '1px solid var(--ov-border)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>1,420</span>
                <span style={{ fontSize: '10px', color: 'var(--ov-text-secondary)' }}>Accounts</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ov-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Auto-Matched
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>1,418 (99.98%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ov-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Pending Review
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>2 (0.02%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Exceptions
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>0 (0.00%)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Finance Pipeline & Governance */}
      <Card title="Active Reconciliation Pipelines & Control Points" icon={Layers}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--ov-bg-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ov-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Pipelines</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: '6px 0' }}>14 Active</div>
            <div style={{ fontSize: '11px', color: '#10b981' }}>● Batch sync latency: 42ms</div>
          </div>
          <div style={{ background: 'var(--ov-bg-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ov-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Finance Controllers</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: '6px 0' }}>48 Users</div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>Corporate Finance & Audit</div>
          </div>
          <div style={{ background: 'var(--ov-bg-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ov-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Labor Cost Saved</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ov-text-primary)', margin: '6px 0' }}>$5,200 / mo</div>
            <div style={{ fontSize: '11px', color: '#10b981' }}>104 manual hours eliminated</div>
          </div>
          <div style={{ background: 'var(--ov-bg-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ov-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Audit Integrity</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', margin: '6px 0' }}>Uncompromised</div>
            <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)' }}>100% Cryptographic Trail</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
