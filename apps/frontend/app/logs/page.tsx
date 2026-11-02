'use client';

import { useState } from 'react';
import { 
  ScrollText, Search, Filter, RefreshCw, Download, 
  Terminal, AlertTriangle, AlertCircle, Info, CheckCircle2, Play, Pause 
} from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard/KPICard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  app: string;
  service: string;
  message: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: 'log-101', timestamp: '12:59:42.102', level: 'ERROR', app: 'kavacha', service: 'auth-gateway', message: 'JWT token expired: uid=usr_88291 token_age=86402s from ip=192.168.1.104' },
  { id: 'log-102', timestamp: '12:59:40.854', level: 'WARN', app: 'netra', service: 'rag-retriever', message: 'Vector search latency exceeded threshold: p95=342ms collection=clinical_sop' },
  { id: 'log-103', timestamp: '12:59:38.210', level: 'INFO', app: 'blackline', service: 'reconcile-worker', message: 'Batch transaction sync completed: 4,200 items matched, 0 discrepancies' },
  { id: 'log-104', timestamp: '12:59:35.912', level: 'INFO', app: 'netra', service: 'pipeline-api', message: 'Query response streamed successfully: tokens=1,420 ttft=185ms' },
  { id: 'log-105', timestamp: '12:59:32.441', level: 'WARN', app: 'kavacha', service: 'rbac-engine', message: 'Rate limit threshold 80% reached for client_id=baxter-device-proxy' },
  { id: 'log-106', timestamp: '12:59:30.128', level: 'INFO', app: 'blackline', service: 'ledger-sync', message: 'ERP handshake verified with SAP S/4HANA endpoint: cluster=east-us' },
  { id: 'log-107', timestamp: '12:59:28.004', level: 'DEBUG', app: 'netra', service: 'embedder', message: 'Generated embedding batch 8 items model=text-embedding-3-large duration=32ms' },
  { id: 'log-108', timestamp: '12:59:24.619', level: 'ERROR', app: 'kavacha', service: 'vault-connector', message: 'Secret lease renewal warning: key_path=db/credentials/master ttl=180s' },
  { id: 'log-109', timestamp: '12:59:20.312', level: 'INFO', app: 'netra', service: 'rag-retriever', message: 'Cache hit for similarity query: hash=0x8f2a1b9c similarity=0.984' },
  { id: 'log-110', timestamp: '12:59:15.890', level: 'INFO', app: 'blackline', service: 'api-gateway', message: 'HTTP 200 GET /api/v1/recon/summary duration=14ms client=portal' },
];

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [appFilter, setAppFilter] = useState<string>('ALL');
  const [isLive, setIsLive] = useState(true);

  const filteredLogs = MOCK_LOGS.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
                          log.service.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesApp = appFilter === 'ALL' || log.app === appFilter;
    return matchesSearch && matchesLevel && matchesApp;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ov-space-5)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--ov-space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ov-space-2)', marginBottom: 'var(--ov-space-1)' }}>
            <h1 style={{ fontSize: 'var(--ov-font-size-2xl)', fontWeight: 'var(--ov-font-weight-bold)', color: 'var(--ov-text-primary)', margin: 0 }}>
              Log Explorer
            </h1>
            <Badge variant="healthy" dot>Live Ingestion</Badge>
            <Badge variant="info">OTel Stream: ACTIVE</Badge>
          </div>
          <p style={{ fontSize: 'var(--ov-font-size-sm)', color: 'var(--ov-text-muted)', margin: 0 }}>
            Unified enterprise log correlation, OpenTelemetry structured event streams, and real-time error tracing
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--ov-space-2)' }}>
          <Button 
            variant={isLive ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setIsLive(!isLive)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {isLive ? <Pause size={14} /> : <Play size={14} />} {isLive ? 'Pause Stream' : 'Resume Live'}
          </Button>
          <Button variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Export Logs
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--ov-space-3)' }}>
        <KPICard label="Ingestion Rate" value="482" unit="eps" trend="up" />
        <KPICard label="Error Events" value="18" trend="up" trendValue="+2" />
        <KPICard label="Warnings" value="42" trend="flat" />
        <KPICard label="Avg Latency" value="14.2" unit="ms" trend="flat" />
        <KPICard label="Active Services" value="8" />
        <KPICard label="Log Volume 24h" value="1.4" unit="GB" />
      </div>

      {/* Log Search and Filter Toolbar */}
      <Card>
        <CardBody style={{ padding: 'var(--ov-space-3) var(--ov-space-4)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ov-space-3)', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flex: 1, minWidth: 260, alignItems: 'center', gap: 8, background: 'var(--ov-bg-subtle)', padding: '6px 12px', borderRadius: 'var(--ov-radius-md)', border: '1px solid var(--ov-border)' }}>
              <Search size={14} color="var(--ov-text-muted)" />
              <input
                type="text"
                placeholder="Search log messages, traces, error codes, service names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--ov-text-primary)', fontSize: 'var(--ov-font-size-sm)', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--ov-space-2)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--ov-font-size-xs)', color: 'var(--ov-text-muted)' }}>
                <Filter size={12} /> Level:
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'var(--ov-bg-subtle)', padding: 3, borderRadius: 'var(--ov-radius-md)', border: '1px solid var(--ov-border)' }}>
                {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(lvl)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      background: levelFilter === lvl ? 'var(--ov-primary-muted)' : 'transparent',
                      color: levelFilter === lvl ? 'var(--ov-primary)' : 'var(--ov-text-secondary)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <select
                value={appFilter}
                onChange={(e) => setAppFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  background: 'var(--ov-bg-subtle)',
                  border: '1px solid var(--ov-border)',
                  borderRadius: 'var(--ov-radius-md)',
                  color: 'var(--ov-text-secondary)',
                  fontSize: 'var(--ov-font-size-xs)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Applications</option>
                <option value="netra">Netra</option>
                <option value="kavacha">NextGen2</option>
                <option value="blackline">Blackline</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Log Feed Table */}
      <Card>
        <CardHeader style={{ padding: 'var(--ov-space-3) var(--ov-space-4)', borderBottom: '1px solid var(--ov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CardTitle style={{ fontSize: 'var(--ov-font-size-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={15} color="var(--ov-primary)" /> Live Event Stream ({filteredLogs.length} events)
          </CardTitle>
          <div style={{ fontSize: 'var(--ov-font-size-xs)', color: 'var(--ov-text-muted)' }}>
            Auto-refresh: 1s
          </div>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ov-font-mono)' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--ov-border)', fontSize: '11px', color: 'var(--ov-text-muted)' }}>
                  <th style={{ padding: '8px 16px', width: 120 }}>TIMESTAMP</th>
                  <th style={{ padding: '8px 16px', width: 90 }}>LEVEL</th>
                  <th style={{ padding: '8px 16px', width: 110 }}>APP</th>
                  <th style={{ padding: '8px 16px', width: 160 }}>SERVICE</th>
                  <th style={{ padding: '8px 16px' }}>LOG MESSAGE</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    style={{ 
                      borderBottom: '1px solid var(--ov-border)', 
                      fontSize: '12px',
                      background: log.level === 'ERROR' ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <td style={{ padding: '8px 16px', color: 'var(--ov-text-muted)', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '8px 16px' }}>
                      <span 
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: '10px',
                          fontWeight: 700,
                          background: log.level === 'ERROR' ? 'rgba(239, 68, 68, 0.2)' : log.level === 'WARN' ? 'rgba(245, 158, 11, 0.2)' : log.level === 'INFO' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: log.level === 'ERROR' ? 'var(--ov-status-critical)' : log.level === 'WARN' ? 'var(--ov-status-warning)' : log.level === 'INFO' ? 'var(--ov-primary)' : 'var(--ov-text-muted)',
                        }}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td style={{ padding: '8px 16px' }}>
                      <span style={{ color: log.app === 'netra' ? '#c084fc' : log.app === 'kavacha' ? '#38bdf8' : '#34d399', fontWeight: 600 }}>
                        {log.app === 'kavacha' ? 'NextGen2' : log.app}
                      </span>
                    </td>
                    <td style={{ padding: '8px 16px', color: 'var(--ov-text-secondary)' }}>
                      {log.service}
                    </td>
                    <td style={{ padding: '8px 16px', color: 'var(--ov-text-primary)' }}>
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
