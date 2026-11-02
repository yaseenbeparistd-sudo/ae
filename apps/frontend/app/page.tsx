'use client';

import Link from 'next/link';
import './page.css';
import { Server, User, Users, Activity, Cpu, AlertTriangle, CheckCircle2, Cloud, ShieldAlert, Zap, Globe, HardDrive, Network, Box, Bell, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { Badge } from '@/components/ui/Badge/Badge';
import { ApplicationCard } from '@/components/ui/ApplicationCard/ApplicationCard';
import { formatNumber, formatCurrency } from '@/lib/utils';
import type { Application, DashboardSummary } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Synthetic global activity data for the chart
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

const toChartData = (arr: number[]) => (arr || []).map((val, i) => ({ time: i, value: val }));

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
  const { data: health } = useQuery<any>({
    queryKey: ['health-kavacha-live'],
    queryFn: () => api.get('/applications/kavacha/health?live=true'),
    refetchInterval: 1000,
  });

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
  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary'),
    refetchInterval: 30000,
  });

  const { data: applications, isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => api.get('/applications'),
    refetchInterval: 30000,
  });

  return (
    <div className="ov-home-container">
      {/* Hero Section */}
      <div className="ov-hero-section">
        <div className="ov-hero-bg"></div>
        <div className="ov-hero-content">
          <div>
            <h1 className="ov-hero-title">Command Center</h1>
            <p className="ov-hero-subtitle">Global observability and active monitoring across all environments.</p>
          </div>
          <div className="ov-hero-status">
            <div className="ov-status-indicator pulse-healthy"></div>
            <span>System Operational</span>
          </div>
        </div>
      </div>

      <div className="ov-main-grid">
        {/* Left Column (Main Content) */}
        <div className="ov-content-col">
          
          {/* Rich KPI Strip */}
          <div className="ov-rich-kpi-grid">
            <div className="ov-rich-kpi">
              <Globe className="ov-rich-kpi-bg" size={120} color="#3b82f6" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Server size={14}/> Active Apps</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                  {summaryLoading ? <Skeleton width={40} /> : summary?.total_applications || 0}
                </div>
              </div>
            </div>
            
            <div className="ov-rich-kpi">
              <Activity className="ov-rich-kpi-bg" size={120} color="#10b981" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14}/> API Requests</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                  {summaryLoading ? <Skeleton width={80} /> : formatNumber(summary?.total_api_requests || 0)}
                </div>
              </div>
            </div>

            <div className="ov-rich-kpi">
              <Users className="ov-rich-kpi-bg" size={120} color="#8b5cf6" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14}/> Total Users</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                  {summaryLoading ? <Skeleton width={60} /> : formatNumber(summary?.total_active_users || 0)}
                </div>
              </div>
            </div>

            <div className="ov-rich-kpi">
              <AlertTriangle className="ov-rich-kpi-bg" size={120} color="#f43f5e" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={14}/> Error Rate</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ov-text-primary)' }}>
                  {summaryLoading ? <Skeleton width={40} /> : '0.12%'}
                </div>
              </div>
            </div>
          </div>

          <h2 className="ov-section-title" style={{ marginTop: '40px' }}><Activity size={18} color="#3b82f6" /> Global Traffic</h2>
          <div className="ov-activity-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111217', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--ov-text-primary)' }}
                  itemStyle={{ color: 'var(--ov-text-primary)', fontSize: '13px' }}
                  labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                <Area type="monotone" dataKey="compute" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', marginBottom: '20px' }}>
            <h2 className="ov-section-title" style={{ margin: 0, fontSize: '14px', letterSpacing: '0.05em' }}>
              TIER-1 APPLICATION ROSTER <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>[CLUSTER-TOPOLOGY]</span>
            </h2>
            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
              <span className="ov-status-indicator pulse-healthy" style={{ width: 6, height: 6 }} /> LIVE STREAM (1s)
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <LiveNetraCard />
            <LiveKavachCard />
            <StaticBlacklineCard />
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="ov-side-col">
          
          <h2 className="ov-section-title"><Bell size={18} color="#f59e0b" /> Event Stream</h2>
          <div className="ov-events-panel">
            {recentEvents.map(event => (
              <div key={event.id} className="ov-event-item">
                <div className={`ov-event-icon ${event.type}`}>
                  <event.icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ov-text-primary)', marginBottom: '2px' }}>{event.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ov-text-secondary)', lineHeight: 1.4 }}>{event.desc}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ov-text-muted)', marginTop: '4px' }}>{event.time}</div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Link href="#" style={{ fontSize: '12px', color: 'var(--ov-primary)', textDecoration: 'none' }}>View All Events</Link>
            </div>
          </div>

          <h2 className="ov-section-title" style={{ marginTop: '32px' }}><HardDrive size={18} color="#8b5cf6" /> Cluster Health</h2>
          <div className="ov-infra-panel">
            <div className="ov-infra-bar">
              <div className="ov-infra-bar-labels"><span>Total CPU Allocation</span> <span>64%</span></div>
              <div className="ov-infra-bar-track">
                <div className="ov-infra-bar-fill" style={{ width: '64%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}></div>
              </div>
            </div>
            <div className="ov-infra-bar" style={{ marginTop: '12px' }}>
              <div className="ov-infra-bar-labels"><span>Total Memory Allocation</span> <span>82%</span></div>
              <div className="ov-infra-bar-track">
                <div className="ov-infra-bar-fill" style={{ width: '82%', background: 'linear-gradient(90deg, #f59e0b, #fcd34d)' }}></div>
              </div>
            </div>
            <div className="ov-infra-bar" style={{ marginTop: '12px' }}>
              <div className="ov-infra-bar-labels"><span>Storage I/O Capacity</span> <span>31%</span></div>
              <div className="ov-infra-bar-track">
                <div className="ov-infra-bar-fill" style={{ width: '31%', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
              </div>
            </div>
            <div className="ov-infra-bar" style={{ marginTop: '12px' }}>
              <div className="ov-infra-bar-labels"><span>Network Bandwidth</span> <span>45%</span></div>
              <div className="ov-infra-bar-track">
                <div className="ov-infra-bar-fill" style={{ width: '45%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
