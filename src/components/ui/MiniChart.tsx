import React from 'react';

export interface ChartPoint {
  label: string;
  value: number;
  variantBreakdown?: Record<string, number>;
}

const VARIANT_COLORS: Record<string, string> = {
  A:          '#0ea5e9',
  B:          '#10b981',
  CHAMPION:   '#0ea5e9',
  CHALLENGER: '#f59e0b',
};

function getColor(variant: string, index: number): string {
  return VARIANT_COLORS[variant] ?? ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'][index % 4];
}

interface SparkLineProps {
  data: ChartPoint[];
  color?: string;
  height?: number;
  showArea?: boolean;
  className?: string;
}

export const SparkLine: React.FC<SparkLineProps> = ({
  data,
  color = '#0ea5e9',
  height = 48,
  showArea = true,
  className = '',
}) => {
  if (data.length === 0) return <div style={{ height }} className={`bg-muted rounded ${className}`} />;

  const width = 200;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range = maxVal - minVal || 1;

  const pad = 4;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (width - pad * 2);
    const y = pad + (1 - (d.value - minVal) / range) * (height - pad * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      style={{ height }}
    >
      {showArea && (
        <path d={areaPath} fill={color} fillOpacity="0.1" />
      )}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

interface BarChartProps {
  data: ChartPoint[];
  height?: number;
  color?: string;
  className?: string;
  formatValue?: (v: number) => string;
  unit?: string;
  showLabels?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 80,
  color = '#0ea5e9',
  className = '',
  showLabels = true,
}) => {
  if (data.length === 0) return <div style={{ height }} className={`bg-muted rounded ${className}`} />;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(2, Math.floor((100 / data.length) - 0.5));

  return (
    <div className={`flex items-end gap-px ${className}`} style={{ height }}>
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group relative" style={{ minWidth: barWidth }}>
            <div
              className="w-full rounded-sm transition-all"
              style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: color, opacity: 0.8 }}
            />
            {showLabels && i % Math.ceil(data.length / 6) === 0 && (
              <span className="absolute -bottom-4 text-[8px] text-muted-foreground whitespace-nowrap truncate max-w-[30px]">
                {d.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface MultiLineChartProps {
  data: ChartPoint[];
  height?: number;
  variants: string[];
  className?: string;
  formatValue?: (v: number) => string;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  height = 120,
  variants,
  className = '',
}) => {
  if (data.length === 0 || variants.length === 0) {
    return <div style={{ height }} className={`bg-muted rounded ${className}`} />;
  }

  const width = 400;
  const pad = 8;
  const allValues = data.flatMap(d =>
    variants.map(v => d.variantBreakdown?.[v] ?? 0)
  );
  const maxVal = Math.max(...allValues, 0.0001);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 0.0001;

  const getPath = (variant: string) => {
    const pts = data.map((d, i) => {
      const val = d.variantBreakdown?.[variant] ?? 0;
      const x = pad + (i / (data.length - 1 || 1)) * (width - pad * 2);
      const y = pad + (1 - (val - minVal) / range) * (height - pad * 2);
      return { x, y };
    });
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  };

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {variants.map((v, idx) => (
          <path
            key={v}
            d={getPath(v)}
            fill="none"
            stroke={getColor(v, idx)}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {variants.map((v, idx) => (
          <div key={v} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(v, idx) }} />
            <span className="text-[10px] text-muted-foreground">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className = '', headerRight }) => (
  <div className={`bg-card border border-border rounded-[var(--radius)] shadow-card p-4 ${className}`}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {headerRight}
    </div>
    {children}
  </div>
);
