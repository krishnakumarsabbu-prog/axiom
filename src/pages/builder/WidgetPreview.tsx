import React from 'react';
import type { WidgetType } from '../../domain';
import type { QueryResult } from '../../services/queryEngine';
import { SparkLine, BarChart } from '../../components/ui/MiniChart';

interface WidgetPreviewProps {
  type: WidgetType;
  title: string;
  result: QueryResult;
}

export const WidgetPreview: React.FC<WidgetPreviewProps> = ({ type, title, result }) => {
  if (result.error) {
    return (
      <div className="rounded-[var(--radius)] border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-xs font-semibold text-red-600 mb-1">Query Error</p>
        <p className="text-xs text-red-500 font-mono">{result.error}</p>
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-muted/30 flex items-center justify-center h-40">
        <p className="text-xs text-muted-foreground">No data returned</p>
      </div>
    );
  }

  const bgCard = 'bg-card border border-border rounded-[var(--radius)] p-4';

  if (type === 'KPI') {
    return (
      <div className={bgCard}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-display font-bold text-foreground">
          {result.kpiValue !== undefined ? String(result.kpiValue) : String(result.rows[0].value)}
        </p>
        {result.kpiLabel && <p className="text-xs text-muted-foreground mt-1">{result.kpiLabel}</p>}
      </div>
    );
  }

  if (type === 'TABLE') {
    return (
      <div className={`${bgCard} overflow-auto`}>
        <p className="text-xs font-semibold text-foreground mb-3">{title}</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {result.columns.map(c => (
                <th key={c} className="text-left py-1.5 px-2 text-muted-foreground font-semibold uppercase tracking-wider">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="py-1.5 px-2 font-medium text-foreground">{row.label}</td>
                <td className="py-1.5 px-2 font-mono text-muted-foreground">{String(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'BAR') {
    const chartData = result.rows.map(r => ({ label: r.label, value: Number(r.value) }));
    return (
      <div className={bgCard}>
        <p className="text-xs font-semibold text-foreground mb-3">{title}</p>
        <BarChart data={chartData} height={80} color="#0ea5e9" showLabels />
      </div>
    );
  }

  if (type === 'LINE') {
    const chartData = result.rows.map(r => ({ label: r.label, value: Number(r.value) }));
    return (
      <div className={bgCard}>
        <p className="text-xs font-semibold text-foreground mb-3">{title}</p>
        <SparkLine data={chartData} height={80} color="#0ea5e9" />
      </div>
    );
  }

  if (type === 'PIE') {
    const total = result.rows.reduce((s, r) => s + Number(r.value), 0);
    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return (
      <div className={bgCard}>
        <p className="text-xs font-semibold text-foreground mb-3">{title}</p>
        <div className="flex gap-4 items-center">
          <svg viewBox="0 0 32 32" className="w-20 h-20 shrink-0">
            {(() => {
              let offset = 0;
              return result.rows.map((r, i) => {
                const pct = total > 0 ? (Number(r.value) / total) : 0;
                const strokeDashoffset = 100 - (pct * 100);
                const rotation = offset * 3.6;
                offset += pct * 100;
                return (
                  <circle
                    key={r.label}
                    cx="16" cy="16" r="15.9"
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth="3"
                    strokeDasharray={`${pct * 100} ${100 - pct * 100}`}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation - 90} 16 16)`}
                    pathLength={100}
                    style={{ strokeLinecap: 'butt' }}
                  />
                );
              });
            })()}
          </svg>
          <div className="space-y-1 flex-1 min-w-0">
            {result.rows.map((r, i) => (
              <div key={r.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-muted-foreground truncate">{r.label}</span>
                <span className="text-xs font-semibold text-foreground ml-auto">
                  {total > 0 ? `${((Number(r.value) / total) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
