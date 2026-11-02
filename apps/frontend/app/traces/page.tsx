'use client';

import { useState } from 'react';
import { 
  Network, Search, Filter, RefreshCw, GitCommit, 
  Layers, Clock, AlertCircle, CheckCircle2, ChevronRight, Activity 
} from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard/KPICard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';

interface DistributedTrace {
  traceId: string;
  rootService: string;
  endpoint: string;
  duration: string;
  durationMs: number;
  spans: number;
  errorSpans: number;
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical';
}

const MOCK_TRACES: DistributedTrace[] = [
  { traceId: 'tr-8f92a10b4c2e', rootService: 'netra-gateway', endpoint: 'POST /v1/query/rag', duration: '284ms', durationMs: 284, spans: 14, errorSpans: 0, timestamp: '18s ago', status: 'healthy' },
  { traceId: 'tr-7a19c34f2d1e', rootService: 'nextgen2-iam', endpoint: 'POST /oauth/token', duration: '48ms', durationMs: 48, spans: 6, errorSpans: 0, timestamp: '34s ago', status: 'healthy' },
  { traceId: 'tr-6c81d22e9a5b', rootService: 'blackline-recon', endpoint: 'POST /batch/sync', duration: '840ms', durationMs: 840, spans: 24, errorSpans: 1, timestamp: '1m ago', status: 'warning' },
  { traceId: 'tr-5e42b11a8c3d', rootService: 'netra-embedder', endpoint: 'POST /embed/vector', duration: '94ms', durationMs: 94, spans: 8, errorSpans: 0, timestamp: '2m ago', status: 'healthy' },
  { traceId: 'tr-4d91a88b7c2f', rootService: 'nextgen2-vault', endpoint: 'GET /secrets/db-creds', duration: '410ms', durationMs: 410, spans: 12, errorSpans: 2, timestamp: '3m ago', status: 'critical' },
  { traceId: 'tr-3c72b99a6c1e', rootService: 'blackline-api', endpoint: 'GET /reports/ledger', duration: '124ms', durationMs: 124, spans: 10, errorSpans: 0, timestamp: '4m ago', status: 'healthy' },
];

export default function TracesPage() {
  const [search, setSearch] = useState('');

  const filteredTraces = MOCK_TRACES.filter(t => 
    t.traceId.toLowerCase().includes(search.toLowerCase()) ||
    t.rootService.toLowerCase().includes(search.toLowerCase()) ||
    t.endpoint.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ov-space-5)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--ov-space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ov-space-2)', marginBottom: 'var(--ov-space-1)' }}>
            <h1 style={{ fontSize: 'var(--ov-font-size-2xl)', fontWeight: 'var(--ov-font-weight-bold)', color: 'var(--ov-text-primary)', margin: 0 }}>
              Traces & Correlation
            </h1>
            <Badge variant="healthy" dot>Jaeger / OpenTelemetry</Badge>
            <Badge variant="info">Sampling: 100%</Badge>
          </div>
          <p style={{ fontSize: 'var(--ov-font-size-sm)', color: 'var(--ov-text-muted)', margin: 0 }}>
            End-to-end distributed trace spans, microservice call graphs, and cross-application root cause analysis
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--ov-space-2)' }}>
          <Button variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh Traces
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--ov-space-3)' }}>
        <KPICard label="Avg Trace Duration" value="142" unit="ms" trend="flat" />
        <KPICard label="Traces Evaluated" value="84,200" unit="req" trend="up" />
        <KPICard label="Error Spans %" value="0.08" unit="%" trend="down" />
        <KPICard label="Deepest Span" value="18" unit="hops" />
        <KPICard label="Service Nodes" value="14" />
        <KPICard label="Slowest Span" value="840" unit="ms" trend="up" />
      </div>

      {/* Trace Search & Table */}
      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--ov-space-3)' }}>
          <CardTitle style={{ fontSize: 'var(--ov-font-size-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network size={16} color="var(--ov-primary)" /> Distributed Call Tree Traces ({filteredTraces.length})
          </CardTitle>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ov-bg-subtle)', padding: '6px 12px', borderRadius: 'var(--ov-radius-md)', border: '1px solid var(--ov-border)', minWidth: 260 }}>
            <Search size={14} color="var(--ov-text-muted)" />
            <input
              type="text"
              placeholder="Search trace ID, endpoint, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--ov-text-primary)', fontSize: 'var(--ov-font-size-xs)', width: '100%' }}
            />
          </div>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ov-font-mono)' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--ov-border)', fontSize: '11px', color: 'var(--ov-text-muted)' }}>
                  <th style={{ padding: '10px 16px' }}>TRACE ID</th>
                  <th style={{ padding: '10px 16px' }}>ROOT SERVICE</th>
                  <th style={{ padding: '10px 16px' }}>OPERATION / ENDPOINT</th>
                  <th style={{ padding: '10px 16px' }}>LATENCY</th>
                  <th style={{ padding: '10px 16px' }}>SPANS</th>
                  <th style={{ padding: '10px 16px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTraces.map((trace) => (
                  <tr key={trace.traceId} style={{ borderBottom: '1px solid var(--ov-border)', fontSize: '12px', transition: 'background 0.15s' }}>
                    <td style={{ padding: '10px 16px', color: 'var(--ov-primary)' }}>
                      {trace.traceId}
                      <div style={{ fontSize: '10px', color: 'var(--ov-text-muted)' }}>{trace.timestamp}</div>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--ov-text-primary)' }}>
                      {trace.rootService}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--ov-text-secondary)' }}>
                      {trace.endpoint}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, color: trace.durationMs > 500 ? 'var(--ov-status-critical)' : trace.durationMs > 200 ? 'var(--ov-status-warning)' : 'var(--ov-status-healthy)' }}>
                          {trace.duration}
                        </span>
                        <div style={{ width: 60, height: 4, background: 'var(--ov-bg-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (trace.durationMs / 900) * 100)}%`, height: '100%', background: trace.durationMs > 500 ? '#EF4444' : trace.durationMs > 200 ? '#F59E0B' : '#10B981' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--ov-text-muted)' }}>
                      {trace.spans} spans {trace.errorSpans > 0 && <span style={{ color: 'var(--ov-status-critical)', fontWeight: 600 }}>({trace.errorSpans} err)</span>}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <Badge variant={trace.status}>
                        {trace.status.toUpperCase()}
                      </Badge>
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
