import React from 'react';
import { useTenantStore } from '../stores';
import { Card } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { currentTenant } = useTenantStore();

  const stats = [
    { label: 'Active Experiments', value: '24', change: '+12%', trend: 'up' },
    { label: 'Connectors', value: '8', change: '+2', trend: 'up' },
    { label: 'Mappings', value: '156', change: '-3%', trend: 'down' },
    { label: 'API Calls (24h)', value: '45.2K', change: '+8%', trend: 'up' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-2">
          Welcome to {currentTenant?.name || 'Experiment Proxy Portal'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  stat.trend === 'up'
                    ? 'bg-success-50 text-success-700'
                    : 'bg-error-50 text-error-700'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'Experiment created', name: 'Feature Flag Test', time: '2 hours ago' },
              { action: 'Connector updated', name: 'Stripe API v2', time: '5 hours ago' },
              { action: 'Mapping deployed', name: 'User Profile Sync', time: '1 day ago' },
              { action: 'API Key rotated', name: 'Production Key #3', time: '2 days ago' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-neutral-100 last:border-0">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{item.action}</p>
                  <p className="text-sm text-neutral-600">{item.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
              <p className="text-sm font-medium text-primary-700">Create New Experiment</p>
              <p className="text-xs text-primary-600 mt-1">Set up a new A/B test or feature flag</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors">
              <p className="text-sm font-medium text-neutral-700">Add Connector</p>
              <p className="text-xs text-neutral-600 mt-1">Connect to external services and APIs</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors">
              <p className="text-sm font-medium text-neutral-700">Configure Mapping</p>
              <p className="text-xs text-neutral-600 mt-1">Map data between systems</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
