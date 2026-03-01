import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMetricsStore, useConnectorStore, useTenantStore } from '../stores';
import { Card, Badge, Button, Spinner } from '../components/ui';
import type { BusinessMetricFilter } from '../domain';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatValue(v: number | string | boolean): string {
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(4);
  return String(v);
}

const ValueBadge: React.FC<{ value: number | string | boolean }> = ({ value }) => {
  if (typeof value === 'boolean') {
    return <Badge variant={value ? 'success' : 'danger'} size="sm">{String(value)}</Badge>;
  }
  if (typeof value === 'number') {
    return <span className="text-sm font-mono font-medium text-foreground">{formatValue(value)}</span>;
  }
  return <span className="text-sm text-foreground">{String(value)}</span>;
};

export const MetricsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { events, distinctMetricKeys, isLoading, loadEvents, loadDistinctMetricKeys } = useMetricsStore();
  const { connectors, loadConnectors } = useConnectorStore();

  const [filter, setFilter] = useState<Omit<BusinessMetricFilter, 'tenantId'>>({
    timeRange: '24h',
  });
  const [correlationSearch, setCorrelationSearch] = useState('');

  useEffect(() => {
    if (!currentTenant) return;
    loadConnectors(currentTenant.id);
    loadDistinctMetricKeys(currentTenant.id);
  }, [currentTenant, loadConnectors, loadDistinctMetricKeys]);

  useEffect(() => {
    if (!currentTenant) return;
    loadEvents({
      tenantId: currentTenant.id,
      ...filter,
      correlationId: correlationSearch || undefined,
    });
  }, [currentTenant, filter, correlationSearch, loadEvents]);

  const setFilterField = <K extends keyof typeof filter>(key: K, value: typeof filter[K]) => {
    setFilter(prev => ({ ...prev, [key]: value || undefined }));
  };

  const stats = {
    total: events.length,
    metricKeys: new Set(events.map(e => e.metricKey)).size,
    correlations: new Set(events.map(e => e.correlationId)).size,
    connectorIds: new Set(events.map(e => e.sourceConnectorId)).size,
  };

  const allMetricKeys = [...new Set([...distinctMetricKeys, ...events.map(e => e.metricKey)])].sort();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Business Metrics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ingested metric events from connectors, ready to join with traffic records via correlationId
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/app/connectors')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Manage Connectors
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Events', value: stats.total.toLocaleString() },
          { label: 'Metric Keys', value: stats.metricKeys },
          { label: 'Correlation IDs', value: stats.correlations.toLocaleString() },
          { label: 'Source Connectors', value: stats.connectorIds },
        ].map(s => (
          <Card key={s.label} padding="sm">
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="md" className="mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Time Range</label>
            <select
              value={filter.timeRange ?? '24h'}
              onChange={e => setFilterField('timeRange', e.target.value as BusinessMetricFilter['timeRange'])}
              className="h-8 px-2 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Metric Key</label>
            <select
              value={filter.metricKey ?? ''}
              onChange={e => setFilterField('metricKey', e.target.value || undefined)}
              className="h-8 px-2 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
            >
              <option value="">All metric keys</option>
              {allMetricKeys.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Connector</label>
            <select
              value={filter.connectorId ?? ''}
              onChange={e => setFilterField('connectorId', e.target.value || undefined)}
              className="h-8 px-2 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
            >
              <option value="">All connectors</option>
              {connectors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-foreground mb-1">Correlation ID</label>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search correlationId..."
                value={correlationSearch}
                onChange={e => setCorrelationSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
            </div>
          </div>
          {(filter.metricKey || filter.connectorId || correlationSearch) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilter({ timeRange: '24h' }); setCorrelationSearch(''); }}>
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="md" />
        </div>
      ) : events.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No events found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {filter.metricKey || filter.connectorId || correlationSearch
              ? 'Try adjusting your filters or clearing them.'
              : 'Run a connector to ingest business metric events.'}
          </p>
          {!filter.metricKey && !filter.connectorId && !correlationSearch && (
            <Button variant="primary" size="sm" onClick={() => navigate('/app/connectors')}>Go to Connectors</Button>
          )}
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correlation ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metric Key</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dimensions</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTime(event.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">{event.correlationId.slice(0, 20)}…</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="primary" size="sm">{event.metricKey}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <ValueBadge value={event.value} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(event.dimensions).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
                            {k}={v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{event.connectorName ?? event.sourceConnectorId.slice(0, 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {events.length} event{events.length !== 1 ? 's' : ''}</p>
            {events.length === 500 && <p className="text-xs text-muted-foreground">Limit reached — narrow your filters to see more</p>}
          </div>
        </Card>
      )}
    </div>
  );
};
