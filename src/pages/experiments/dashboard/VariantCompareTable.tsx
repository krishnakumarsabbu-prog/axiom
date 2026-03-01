import React from 'react';
import type { VariantSystemMetrics, VariantBusinessMetrics } from '../../../services/metricsEngine';

function pctDiff(a: number, b: number): number {
  if (b === 0) return 0;
  return ((a - b) / b) * 100;
}

function formatPctDiff(diff: number, lowerIsBetter = false): { label: string; color: string } {
  if (Math.abs(diff) < 0.5) return { label: '—', color: 'text-muted-foreground' };
  const better = lowerIsBetter ? diff < 0 : diff > 0;
  return {
    label: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
    color: better ? 'text-emerald-600' : 'text-red-500',
  };
}

interface VariantCompareTableProps {
  systemMetrics: VariantSystemMetrics[];
  businessMetrics?: VariantBusinessMetrics[];
  metricKey?: string;
  experimentType: 'AB' | 'CC';
}

export const VariantCompareTable: React.FC<VariantCompareTableProps> = ({
  systemMetrics,
  businessMetrics,
  metricKey,
  experimentType,
}) => {
  if (systemMetrics.length < 2) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Not enough variant data to compare. Ensure traffic has been routed to both variants.
      </div>
    );
  }

  const [base, compare] = experimentType === 'CC'
    ? [
        systemMetrics.find(v => v.variant === 'CHAMPION') ?? systemMetrics[0],
        systemMetrics.find(v => v.variant === 'CHALLENGER') ?? systemMetrics[1],
      ]
    : [systemMetrics[0], systemMetrics[1]];

  const baseLabel = experimentType === 'CC' ? 'Champion' : `Variant ${base.variant}`;
  const compareLabel = experimentType === 'CC' ? 'Challenger' : `Variant ${compare.variant}`;

  const rows: { metric: string; base: string; compare: string; diff: { label: string; color: string }; lowerIsBetter?: boolean }[] = [
    {
      metric: 'Requests',
      base: base.count.toLocaleString(),
      compare: compare.count.toLocaleString(),
      diff: formatPctDiff(pctDiff(compare.count, base.count)),
    },
    {
      metric: 'Success Rate',
      base: `${(base.successRate * 100).toFixed(1)}%`,
      compare: `${(compare.successRate * 100).toFixed(1)}%`,
      diff: formatPctDiff(pctDiff(compare.successRate, base.successRate)),
    },
    {
      metric: 'Error Rate',
      base: `${(base.errorRate * 100).toFixed(1)}%`,
      compare: `${(compare.errorRate * 100).toFixed(1)}%`,
      diff: formatPctDiff(pctDiff(compare.errorRate, base.errorRate), true),
      lowerIsBetter: true,
    },
    {
      metric: 'Avg Latency',
      base: `${Math.round(base.avgLatencyMs)}ms`,
      compare: `${Math.round(compare.avgLatencyMs)}ms`,
      diff: formatPctDiff(pctDiff(compare.avgLatencyMs, base.avgLatencyMs), true),
      lowerIsBetter: true,
    },
    {
      metric: 'p50 Latency',
      base: `${Math.round(base.p50LatencyMs)}ms`,
      compare: `${Math.round(compare.p50LatencyMs)}ms`,
      diff: formatPctDiff(pctDiff(compare.p50LatencyMs, base.p50LatencyMs), true),
      lowerIsBetter: true,
    },
    {
      metric: 'p95 Latency',
      base: `${Math.round(base.p95LatencyMs)}ms`,
      compare: `${Math.round(compare.p95LatencyMs)}ms`,
      diff: formatPctDiff(pctDiff(compare.p95LatencyMs, base.p95LatencyMs), true),
      lowerIsBetter: true,
    },
  ];

  const baseBusinessMetric = businessMetrics?.find(b => b.variant === base.variant);
  const compareBusinessMetric = businessMetrics?.find(b => b.variant === compare.variant);
  if (metricKey && baseBusinessMetric && compareBusinessMetric) {
    rows.push({
      metric: `${metricKey} (avg)`,
      base: baseBusinessMetric.avg.toFixed(4),
      compare: compareBusinessMetric.avg.toFixed(4),
      diff: formatPctDiff(pctDiff(compareBusinessMetric.avg, baseBusinessMetric.avg)),
    });
    rows.push({
      metric: `${metricKey} (rate)`,
      base: `${(baseBusinessMetric.rate * 100).toFixed(2)}%`,
      compare: `${(compareBusinessMetric.rate * 100).toFixed(2)}%`,
      diff: formatPctDiff(pctDiff(compareBusinessMetric.rate, baseBusinessMetric.rate)),
    });
    rows.push({
      metric: `${metricKey} (count)`,
      base: baseBusinessMetric.count.toLocaleString(),
      compare: compareBusinessMetric.count.toLocaleString(),
      diff: formatPctDiff(pctDiff(compareBusinessMetric.count, baseBusinessMetric.count)),
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metric</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{baseLabel}</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{compareLabel}</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diff vs {baseLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(row => (
            <tr key={row.metric} className="hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4 text-sm font-medium text-foreground">{row.metric}</td>
              <td className="py-3 px-4 text-sm text-right font-mono text-muted-foreground">{row.base}</td>
              <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-foreground">{row.compare}</td>
              <td className={`py-3 px-4 text-sm text-right font-mono font-semibold ${row.diff.color}`}>
                {row.diff.label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
