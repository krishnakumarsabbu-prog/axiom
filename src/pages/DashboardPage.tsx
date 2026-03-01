import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../stores';
import { Card, Badge } from '../components/ui';

const StatCard: React.FC<{ label: string; value: string; change: string; trend: 'up' | 'down'; icon: React.ReactNode }> = ({
  label, value, change, trend, icon
}) => (
  <Card padding="md" hover>
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <Badge variant={trend === 'up' ? 'success' : 'danger'} size="sm">{change}</Badge>
    </div>
    <p className="text-2xl font-display font-bold text-foreground tracking-tight">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { currentTenant } = useTenantStore();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Active Experiments', value: '24', change: '+12%', trend: 'up' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" /></svg>
    },
    {
      label: 'Connectors', value: '8', change: '+2', trend: 'up' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
    },
    {
      label: 'Mappings', value: '156', change: '-3%', trend: 'down' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
    },
    {
      label: 'API Calls (24h)', value: '45.2K', change: '+8%', trend: 'up' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
    },
  ];

  const activity = [
    { action: 'Experiment created', name: 'Feature Flag Test', time: '2 hours ago', color: 'bg-primary' },
    { action: 'Connector updated', name: 'Stripe API v2', time: '5 hours ago', color: 'bg-emerald-500' },
    { action: 'Mapping deployed', name: 'User Profile Sync', time: '1 day ago', color: 'bg-amber-500' },
    { action: 'API Key rotated', name: 'Production Key #3', time: '2 days ago', color: 'bg-sky-500' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentTenant?.name || 'Experiment Proxy Portal'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">All systems operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            <button className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-0">
            {activity.map((item, index) => (
              <div key={index} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'New Experiment', desc: 'Set up an A/B test or feature flag', path: '/app/experiments/new' },
              { label: 'Add Connector', desc: 'Connect an external service', path: '/app/connectors' },
              { label: 'Configure Mapping', desc: 'Map data between systems', path: '/app/mappings' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full text-left px-4 py-3 bg-muted hover:bg-primary/5 hover:border-primary/20 border border-transparent rounded-[var(--radius)] transition-all duration-150 group"
              >
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
