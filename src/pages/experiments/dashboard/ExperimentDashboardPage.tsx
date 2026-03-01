import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExperimentStore, useTenantStore } from '../../../stores';
import { metricsEngine, type TimeRange, type AggregationType } from '../../../services/metricsEngine';
import { Spinner } from '../../../components/ui';
import { SparkLine, BarChart, MultiLineChart, ChartCard } from '../../../components/ui/MiniChart';
import { KpiCard } from './DashboardKpiCard';
import { VariantCompareTable } from './VariantCompareTable';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '5m',  label: 'Last 5m'  },
  { value: '15m', label: 'Last 15m' },
  { value: '1h',  label: 'Last 1h'  },
  { value: '6h',  label: 'Last 6h'  },
  { value: '24h', label: 'Last 24h' },
  { value: 'all', label: 'All time' },
];

const AGGREGATION_OPTIONS: { value: AggregationType; label: string }[] = [
  { value: 'avg',   label: 'Average' },
  { value: 'sum',   label: 'Sum'     },
  { value: 'count', label: 'Count'   },
  { value: 'rate',  label: 'Rate'    },
];

const FilterSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="h-8 px-2 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const SectionTitle: React.FC<{ children: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-foreground">{children}</h2>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const EmptyChart: React.FC<{ height?: number; label?: string }> = ({ height = 60, label = 'No data' }) => (
  <div
    className="flex items-center justify-center bg-muted/50 rounded-[var(--radius)] text-xs text-muted-foreground"
    style={{ height }}
  >
    {label}
  </div>
);

export const ExperimentDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { currentExperiment, isLoading, loadExperiment } = useExperimentStore();

  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [metricKey, setMetricKey] = useState<string>('');
  const [aggregation, setAggregation] = useState<AggregationType>('avg');
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);

  useEffect(() => {
    if (currentTenant && id) {
      loadExperiment(currentTenant.id, id);
    }
  }, [currentTenant, id, loadExperiment]);

  useEffect(() => {
    if (currentTenant) {
      const keys = metricsEngine.getAvailableMetricKeys(currentTenant.id);
      setAvailableKeys(keys);
      if (keys.length > 0 && !metricKey) setMetricKey(keys[0]);
    }
  }, [currentTenant, metricKey]);

  const systemMetrics = useMemo(() => {
    if (!currentTenant || !id) return null;
    return metricsEngine.getSystemMetrics(currentTenant.id, id, timeRange);
  }, [currentTenant, id, timeRange]);

  const businessMetrics = useMemo(() => {
    if (!currentTenant || !id || !metricKey) return null;
    return metricsEngine.getBusinessMetrics(currentTenant.id, id, timeRange, metricKey, aggregation);
  }, [currentTenant, id, timeRange, metricKey, aggregation]);

  const experimentType = currentExperiment?.type ?? 'AB';
  const variants = systemMetrics?.byVariant.map(v => v.variant) ?? [];

  if (isLoading || !currentExperiment) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  const noData = !systemMetrics || systemMetrics.totalRequests === 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate(`/app/experiments/${id}`)}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <h1 className="text-2xl font-display font-bold text-foreground">{currentExperiment.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-9">
            {experimentType === 'AB' ? 'A/B Test' : 'Champion/Challenger'} Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect
            value={timeRange}
            onChange={v => setTimeRange(v as TimeRange)}
            options={TIME_RANGE_OPTIONS}
          />
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        {[
          { label: 'Overview', path: `/app/experiments/${id}` },
          { label: 'Dashboard', path: `/app/experiments/${id}/dashboard` },
          { label: 'Traffic Logs', path: `/app/experiments/${id}/traffic` },
          { label: 'Response Mapping', path: `/app/experiments/${id}/mapping` },
        ].map(tab => (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab.label === 'Dashboard'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {noData ? (
        <div className="bg-card border border-border rounded-[var(--radius)] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No traffic data yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Go to Traffic Logs and seed some traffic to see metrics.
          </p>
          <button
            onClick={() => navigate(`/app/experiments/${id}/traffic`)}
            className="text-sm text-primary hover:underline"
          >
            Go to Traffic Logs →
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <SectionTitle sub="Computed from live traffic records">System Metrics</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                label="Total Requests"
                value={systemMetrics.totalRequests.toLocaleString()}
                sub="in selected range"
              />
              <KpiCard
                label="Success Rate"
                value={`${(systemMetrics.successRate * 100).toFixed(1)}%`}
                accent={systemMetrics.successRate >= 0.95 ? 'success' : systemMetrics.successRate >= 0.85 ? 'warning' : 'danger'}
              />
              <KpiCard
                label="Avg Latency"
                value={`${Math.round(systemMetrics.avgLatencyMs)}ms`}
                sub={`p50: ${Math.round(systemMetrics.p50LatencyMs)}ms`}
                accent={systemMetrics.avgLatencyMs < 200 ? 'success' : systemMetrics.avgLatencyMs < 500 ? 'warning' : 'danger'}
              />
              <KpiCard
                label="p95 Latency"
                value={`${Math.round(systemMetrics.p95LatencyMs)}ms`}
                sub={`Error rate: ${(systemMetrics.errorRate * 100).toFixed(1)}%`}
                accent={systemMetrics.p95LatencyMs < 500 ? 'default' : systemMetrics.p95LatencyMs < 1000 ? 'warning' : 'danger'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard
                title="Requests Over Time"
                subtitle="Total requests per bucket"
              >
                {systemMetrics.timeSeriesRequests.some(p => p.value > 0) ? (
                  <div className="mt-2">
                    <BarChart data={systemMetrics.timeSeriesRequests} height={72} color="#0ea5e9" showLabels />
                  </div>
                ) : <EmptyChart height={72} />}
              </ChartCard>

              <ChartCard
                title="Avg Latency Over Time"
                subtitle="Upstream response time (ms)"
              >
                {systemMetrics.timeSeriesLatency.some(p => p.value > 0) ? (
                  <div className="mt-2">
                    <SparkLine data={systemMetrics.timeSeriesLatency} color="#0ea5e9" height={72} />
                  </div>
                ) : <EmptyChart height={72} />}
              </ChartCard>

              <ChartCard
                title="Error Rate Over Time"
                subtitle="Percentage of failed requests"
              >
                {systemMetrics.timeSeriesErrors.some(p => p.value > 0) ? (
                  <div className="mt-2">
                    <SparkLine
                      data={systemMetrics.timeSeriesErrors}
                      color={systemMetrics.errorRate > 0.1 ? '#ef4444' : '#f59e0b'}
                      height={72}
                    />
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-center h-[72px] text-xs text-emerald-600 gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    0% errors in range
                  </div>
                )}
              </ChartCard>
            </div>
          </section>

          {variants.length > 0 && (
            <section>
              <SectionTitle sub="Per-variant breakdown">Variant System Performance</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {systemMetrics.byVariant.map(v => (
                  <div key={v.variant} className="bg-card border border-border rounded-[var(--radius)] p-4 shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${v.variant === 'A' || v.variant === 'CHAMPION' ? 'bg-primary' : 'bg-amber-500'}`} />
                      <p className="text-sm font-semibold text-foreground">{v.variant}</p>
                      <span className="ml-auto text-xs text-muted-foreground">{v.count.toLocaleString()} req</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Success</span>
                        <span className={`text-xs font-semibold ${v.successRate >= 0.95 ? 'text-emerald-600' : v.successRate >= 0.85 ? 'text-amber-600' : 'text-red-500'}`}>
                          {(v.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Avg Latency</span>
                        <span className="text-xs font-semibold text-foreground">{Math.round(v.avgLatencyMs)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">p95 Latency</span>
                        <span className="text-xs font-semibold text-foreground">{Math.round(v.p95LatencyMs)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Errors</span>
                        <span className={`text-xs font-semibold ${v.errorRate > 0.05 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {v.errorCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
              <SectionTitle sub="Joined via correlationId from connector-ingested events">
                Business Metrics
              </SectionTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {availableKeys.length > 0 ? (
                  <>
                    <FilterSelect
                      value={metricKey}
                      onChange={setMetricKey}
                      options={availableKeys.map(k => ({ value: k, label: k }))}
                    />
                    <FilterSelect
                      value={aggregation}
                      onChange={v => setAggregation(v as AggregationType)}
                      options={AGGREGATION_OPTIONS}
                    />
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No metric keys available.{' '}
                    <button
                      onClick={() => navigate('/app/connectors')}
                      className="text-primary hover:underline"
                    >
                      Run a connector
                    </button>
                    {' '}to ingest events.
                  </div>
                )}
              </div>
            </div>

            {availableKeys.length > 0 && metricKey && (
              <>
                {businessMetrics && businessMetrics.byVariant.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {businessMetrics.byVariant.map(v => (
                      <div key={v.variant} className="bg-card border border-border rounded-[var(--radius)] p-4 shadow-card">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          {v.variant} — {metricKey}
                        </p>
                        <p className="text-2xl font-display font-bold text-foreground">
                          {aggregation === 'count' ? v.count.toLocaleString()
                            : aggregation === 'sum' ? v.sum.toFixed(2)
                            : aggregation === 'rate' ? `${(v.rate * 100).toFixed(2)}%`
                            : v.avg.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{v.count} events joined</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-muted rounded-[var(--radius)] text-sm text-muted-foreground">
                    No business metric events joined to this experiment's traffic yet. Run a connector to ingest events with matching correlationIds.
                  </div>
                )}

                {businessMetrics && businessMetrics.timeSeriesAvg.some(p => p.value !== 0) && variants.length > 0 && (
                  <ChartCard
                    title={`${metricKey} Over Time`}
                    subtitle={`${aggregation} per variant (joined via correlationId)`}
                    className="mb-6"
                  >
                    <div className="mt-3">
                      <MultiLineChart
                        data={businessMetrics.timeSeriesAvg}
                        variants={variants}
                        height={100}
                      />
                    </div>
                  </ChartCard>
                )}
              </>
            )}
          </section>

          <section>
            <SectionTitle sub={experimentType === 'CC' ? 'Champion vs Challenger statistical comparison' : 'Side-by-side variant comparison'}>
              {experimentType === 'CC' ? 'Champion vs Challenger Analysis' : 'Variant Comparison'}
            </SectionTitle>
            <div className="bg-card border border-border rounded-[var(--radius)] shadow-card overflow-hidden">
              <VariantCompareTable
                systemMetrics={systemMetrics.byVariant}
                businessMetrics={businessMetrics?.byVariant}
                metricKey={metricKey || undefined}
                experimentType={experimentType}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
