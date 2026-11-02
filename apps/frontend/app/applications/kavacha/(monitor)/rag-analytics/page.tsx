'use client';

import { Shield, Lock, Activity, CheckCircle, Zap, Layers, Key } from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard/KPICard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';

export default function KavachaRagAnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ov-space-5)' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--ov-font-size-xl)', fontWeight: 'var(--ov-font-weight-bold)', color: 'var(--ov-text-primary)', margin: 0 }}>
            NextGen2 Security & Access Analytics
          </h2>
          <p style={{ fontSize: 'var(--ov-font-size-sm)', color: 'var(--ov-text-muted)', margin: '4px 0 0 0' }}>
            IAM telemetry, credential authorization checks, and zero-trust policy evaluations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ov-space-2)' }}>
          <Badge variant="healthy" dot>Zero-Trust Engine: ACTIVE</Badge>
          <Badge variant="info">Vault: HashiCorp Cluster 02</Badge>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--ov-space-3)' }}>
        <KPICard label="Auth Check P99" value="18" unit="ms" trend="up" trendValue="-3ms" />
        <KPICard label="Access Approval Rate" value="99.7" unit="%" trend="flat" />
        <KPICard label="MFA Challenges" value="482" unit="/day" trend="flat" />
        <KPICard label="Policy Blocks" value="3" unit="events" trend="down" />
        <KPICard label="Active Tokens" value="1,240" unit="keys" />
        <KPICard label="Revocation SLA" value="1.2" unit="s" />
      </div>

      {/* Analytics Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--ov-space-4)' }}>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 'var(--ov-space-2)' }}>
              <Shield size={16} color="var(--ov-primary)" /> Policy Verification Latencies
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ov-space-3)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ov-font-size-sm)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--ov-text-secondary)' }}>JWT Signature Verification</span>
                  <span style={{ fontFamily: 'var(--ov-font-mono)', fontWeight: 600 }}>4ms</span>
                </div>
                <div style={{ height: 6, background: 'var(--ov-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: '#00F2FE', borderRadius: 3 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ov-font-size-sm)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--ov-text-secondary)' }}>RBAC / ABAC Rule Lookup</span>
                  <span style={{ fontFamily: 'var(--ov-font-mono)', fontWeight: 600 }}>8ms</span>
                </div>
                <div style={{ height: 6, background: 'var(--ov-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '30%', height: '100%', background: '#8B5CF6', borderRadius: 3 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ov-font-size-sm)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--ov-text-secondary)' }}>Audit Trail Ingestion</span>
                  <span style={{ fontFamily: 'var(--ov-font-mono)', fontWeight: 600 }}>6ms</span>
                </div>
                <div style={{ height: 6, background: 'var(--ov-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '22%', height: '100%', background: '#10B981', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 'var(--ov-space-2)' }}>
              <Lock size={16} color="#F59E0B" /> Security Incidents & Anomalies
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ov-space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--ov-space-2) 0', borderBottom: '1px solid var(--ov-border)' }}>
                <span style={{ color: 'var(--ov-text-primary)', fontWeight: 500 }}>Brute Force Attempts</span>
                <span style={{ fontFamily: 'var(--ov-font-mono)', color: '#10B981' }}>0 detected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--ov-space-2) 0', borderBottom: '1px solid var(--ov-border)' }}>
                <span style={{ color: 'var(--ov-text-primary)', fontWeight: 500 }}>Geographic Anomaly Logins</span>
                <span style={{ fontFamily: 'var(--ov-font-mono)', color: '#F59E0B' }}>1 flagged</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--ov-space-2) 0' }}>
                <span style={{ color: 'var(--ov-text-primary)', fontWeight: 500 }}>Expired Session Invalidation</span>
                <span style={{ fontFamily: 'var(--ov-font-mono)', color: 'var(--ov-text-secondary)' }}>100% compliant</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
