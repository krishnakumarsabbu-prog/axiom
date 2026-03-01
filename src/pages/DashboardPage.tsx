import React from 'react';
import { useTenantStore } from '../stores';
import { Card, Badge } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { currentTenant } = useTenantStore();

  const stats = [
    { label: 'Active Experiments', value: '24', change: '+12%', trend: 'up' },
    { label: 'Connectors', value: '8', change: '+2', trend: 'up' },
    { label: 'Mappings', value: '156', change: '-3%', trend: 'down' },
    { label: 'API Calls (24h)', value: '45.2K', change: '+8%', trend: 'up' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-base">Dashboard</h1>
        <p className="text-fg-muted mt-2">
          Welcome to {currentTenant?.name || 'Experiment Proxy Portal'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-fg-muted">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-fg-base mt-2">{stat.value}</p>
              </div>
              <Badge variant={stat.trend === 'up' ? 'success' : 'danger'}>
                {stat.change}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="text-lg font-display font-semibold text-fg-base mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'Experiment created', name: 'Feature Flag Test', time: '2 hours ago' },
              { action: 'Connector updated', name: 'Stripe API v2', time: '5 hours ago' },
              { action: 'Mapping deployed', name: 'User Profile Sync', time: '1 day ago' },
              { action: 'API Key rotated', name: 'Production Key #3', time: '2 days ago' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-border-base last:border-0">
                <div className="w-2 h-2 bg-brand-base rounded-full mt-2 shadow-glow"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-fg-base">{item.action}</p>
                  <p className="text-sm text-fg-muted">{item.name}</p>
                  <p className="text-xs text-fg-muted/70 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-display font-semibold text-fg-base mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-bg-base border border-border-base hover:border-brand-base rounded-lg transition-all duration-200 group">
              <p className="text-sm font-medium text-brand-base">Create New Experiment</p>
              <p className="text-xs text-fg-muted mt-1">Set up a new A/B test or feature flag</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-bg-base border border-border-base hover:border-border-subtle rounded-lg transition-all duration-200">
              <p className="text-sm font-medium text-fg-base">Add Connector</p>
              <p className="text-xs text-fg-muted mt-1">Connect to external services and APIs</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-bg-base border border-border-base hover:border-border-subtle rounded-lg transition-all duration-200">
              <p className="text-sm font-medium text-fg-base">Configure Mapping</p>
              <p className="text-xs text-fg-muted mt-1">Map data between systems</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
