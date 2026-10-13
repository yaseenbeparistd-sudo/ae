'use client';

import Link from 'next/link';
import { Activity, Server, Shield } from 'lucide-react';
import { ApplicationCard } from '@/components/ui/ApplicationCard/ApplicationCard';

const apps = [
  {
    id: 'netra',
    name: 'Netra',
    description: 'Centralized observability and monitoring platform.',
    icon: Activity,
    status: 'healthy',
    environment: 'prod',
    color: 'var(--ov-primary)',
  },
  {
    id: 'kavacha',
    name: 'NextGen2',
    description: 'Autonomous test automation & security gateway.',
    icon: Shield,
    status: 'healthy',
    environment: 'prod',
    color: 'var(--ov-info)',
  },
  {
    id: 'blackline',
    name: 'Blackline',
    description: 'Financial reconciliation platform.',
    icon: Server,
    status: 'healthy',
    environment: 'prod',
    color: 'var(--ov-warning)',
  },
];

export default function ApplicationsPage() {
  return (
    <div style={{ padding: 'var(--ov-space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--ov-space-6)' }}>
        <h1 style={{ fontSize: 'var(--ov-font-size-2xl)', fontWeight: 'var(--ov-font-weight-bold)', color: 'var(--ov-text-primary)' }}>
          Applications
        </h1>
        <p style={{ color: 'var(--ov-text-muted)', marginTop: 'var(--ov-space-2)' }}>
          Select an application to view its details, monitors, and active users.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--ov-space-5)',
      }}>
        {apps.map((app) => (
          <ApplicationCard
            key={app.id}
            id={app.id}
            name={app.name}
            description={app.description}
            status={app.status}
            environment={app.environment}
            icon={app.icon}
          />
        ))}
      </div>
    </div>
  );
}
