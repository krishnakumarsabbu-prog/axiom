import React from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accent?: 'default' | 'success' | 'warning' | 'danger';
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, trend, trendLabel, accent = 'default' }) => {
  const accentColors = {
    default: 'text-foreground',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger:  'text-red-500',
  };

  const trendColors = {
    up:      'text-emerald-600',
    down:    'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="bg-card border border-border rounded-[var(--radius)] shadow-card p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-display font-bold ${accentColors[accent]}`}>{value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        {trend && trendLabel && (
          <span className={`text-xs font-medium ${trendColors[trend]}`}>{trendLabel}</span>
        )}
      </div>
    </div>
  );
};
