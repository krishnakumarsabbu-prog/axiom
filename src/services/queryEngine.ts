import type { QueryConfig, BuilderQueryConfig } from '../domain';
import type { TimeRange } from './metricsEngine';

export interface QueryResultRow {
  label: string;
  value: number;
  group?: string;
  [key: string]: string | number | undefined;
}

export interface QueryResult {
  rows: QueryResultRow[];
  columns: string[];
  kpiValue?: number | string;
  kpiLabel?: string;
  error?: string;
}

const TRAFFIC_KEY = 'experiment-portal-traffic';
const METRICS_KEY = 'ep-metrics';

function getAllTrafficRecords(tenantId: string): import('../domain').TrafficRecord[] {
  try {
    const raw = localStorage.getItem(TRAFFIC_KEY);
    const store: Record<string, import('../domain').TrafficRecord[]> = raw ? JSON.parse(raw) : {};
    return Object.entries(store)
      .filter(([key]) => key.startsWith(`${tenantId}::`))
      .flatMap(([, records]) => records);
  } catch {
    return [];
  }
}

function getAllBusinessEvents(tenantId: string): import('../domain').BusinessMetricEvent[] {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    const store: Record<string, import('../domain').BusinessMetricEvent[]> = raw ? JSON.parse(raw) : {};
    return store[tenantId] ?? [];
  } catch {
    return [];
  }
}

function runBuilderQuery(tenantId: string, config: BuilderQueryConfig): QueryResult {
  const timeRange = config.timeRange as TimeRange;
  const experimentId = config.experimentId ?? '__all__';

  if (config.dataset === 'Traffic') {
    const allRecords = config.experimentId
      ? (() => {
          try {
            const raw = localStorage.getItem(TRAFFIC_KEY);
            const store: Record<string, import('../domain').TrafficRecord[]> = raw ? JSON.parse(raw) : {};
            return store[`${tenantId}::${config.experimentId}`] ?? [];
          } catch { return []; }
        })()
      : getAllTrafficRecords(tenantId);

    const now = Date.now();
    const cutoff = timeRange === 'all' ? 0 : now - {
      '5m': 5 * 60 * 1000, '15m': 15 * 60 * 1000,
      '1h': 3600 * 1000, '6h': 6 * 3600 * 1000, '24h': 24 * 3600 * 1000,
    }[timeRange]!;
    const filtered = allRecords.filter(r => new Date(r.timestamp).getTime() >= cutoff);

    const groupField = config.groupBy;

    if (config.metric === 'requests') {
      if (!groupField || groupField === 'none') {
        return {
          rows: [{ label: 'Requests', value: filtered.length }],
          columns: ['label', 'value'],
          kpiValue: filtered.length,
          kpiLabel: 'Total Requests',
        };
      }
      const groups = new Map<string, number>();
      for (const r of filtered) {
        const key = groupField === 'variant' ? r.assignedVariant
          : groupField === 'status' ? r.status
          : groupField === 'method' ? r.request.method
          : 'all';
        groups.set(key, (groups.get(key) ?? 0) + 1);
      }
      const rows = [...groups.entries()].map(([label, value]) => ({ label, value }));
      return { rows, columns: ['label', 'value'] };
    }

    if (config.metric === 'successRate') {
      if (!groupField || groupField === 'none') {
        const rate = filtered.length > 0
          ? (filtered.filter(r => r.status === 'SUCCESS').length / filtered.length) * 100
          : 0;
        return {
          rows: [{ label: 'Success Rate', value: parseFloat(rate.toFixed(2)) }],
          columns: ['label', 'value'],
          kpiValue: `${rate.toFixed(1)}%`,
          kpiLabel: 'Success Rate',
        };
      }
    }

    if (config.metric === 'errorRate') {
      const rate = filtered.length > 0
        ? (filtered.filter(r => r.status === 'FAIL').length / filtered.length) * 100
        : 0;
      return {
        rows: [{ label: 'Error Rate', value: parseFloat(rate.toFixed(2)) }],
        columns: ['label', 'value'],
        kpiValue: `${rate.toFixed(1)}%`,
        kpiLabel: 'Error Rate',
      };
    }

    if (config.metric === 'avgLatency') {
      const success = filtered.filter(r => r.status === 'SUCCESS');
      const avg = success.length > 0
        ? success.reduce((s, r) => s + r.timings.upstreamMs, 0) / success.length
        : 0;
      if (!groupField || groupField === 'none') {
        return {
          rows: [{ label: 'Avg Latency', value: Math.round(avg) }],
          columns: ['label', 'value'],
          kpiValue: `${Math.round(avg)}ms`,
          kpiLabel: 'Avg Latency',
        };
      }
      const groups = new Map<string, number[]>();
      for (const r of success) {
        const key = r.assignedVariant;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r.timings.upstreamMs);
      }
      const rows = [...groups.entries()].map(([label, vals]) => ({
        label,
        value: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
      }));
      return { rows, columns: ['label', 'value'] };
    }

    if (config.metric === 'p95Latency') {
      const success = filtered.filter(r => r.status === 'SUCCESS');
      const sorted = success.map(r => r.timings.upstreamMs).sort((a, b) => a - b);
      const p95 = sorted.length > 0 ? sorted[Math.ceil(0.95 * sorted.length) - 1] : 0;
      return {
        rows: [{ label: 'p95 Latency', value: p95 }],
        columns: ['label', 'value'],
        kpiValue: `${p95}ms`,
        kpiLabel: 'p95 Latency',
      };
    }

    void experimentId;
    return { rows: [{ label: 'N/A', value: 0 }], columns: ['label', 'value'], kpiValue: '—' };
  }

  if (config.dataset === 'BusinessMetrics') {
    const events = getAllBusinessEvents(tenantId).filter(
      e => e.metricKey === config.metric,
    );
    const groupField = config.groupBy;

    const numerics = events.map(e =>
      typeof e.value === 'number' ? e.value
        : typeof e.value === 'boolean' ? (e.value ? 1 : 0)
        : parseFloat(String(e.value))
    ).filter(v => !isNaN(v));

    if (!groupField || groupField === 'none') {
      const count = events.length;
      const sum = numerics.reduce((s, v) => s + v, 0);
      const avg = count > 0 ? sum / count : 0;
      const agg = config.aggregation;
      const kpiValue = agg === 'count' ? count
        : agg === 'sum' ? parseFloat(sum.toFixed(4))
        : parseFloat(avg.toFixed(4));
      return {
        rows: [{ label: config.metric, value: typeof kpiValue === 'number' ? kpiValue : 0 }],
        columns: ['label', 'value'],
        kpiValue,
        kpiLabel: `${config.metric} (${agg})`,
      };
    }

    const allTraffic = getAllTrafficRecords(tenantId);
    const corrToVariant = new Map<string, string>();
    for (const r of allTraffic) corrToVariant.set(r.correlationId, r.assignedVariant);

    const groups = new Map<string, number[]>();
    for (const e of events) {
      const key = groupField === 'variant'
        ? (corrToVariant.get(e.correlationId) ?? 'unknown')
        : groupField === 'metricKey' ? e.metricKey
        : 'all';
      if (!groups.has(key)) groups.set(key, []);
      const v = typeof e.value === 'number' ? e.value
        : typeof e.value === 'boolean' ? (e.value ? 1 : 0)
        : parseFloat(String(e.value));
      if (!isNaN(v)) groups.get(key)!.push(v);
    }

    const rows: QueryResultRow[] = [...groups.entries()].map(([label, vals]) => {
      const sum = vals.reduce((s, v) => s + v, 0);
      const agg = config.aggregation;
      const value = agg === 'count' ? vals.length
        : agg === 'sum' ? parseFloat(sum.toFixed(4))
        : parseFloat((sum / vals.length).toFixed(4));
      return { label, value };
    });

    return { rows, columns: ['label', 'value'] };
  }

  return { rows: [], columns: [], error: 'Unknown dataset' };
}

const SQL_KEYWORDS_ALLOWLIST = /^\s*SELECT\s/i;
const KNOWN_SQL_PATTERNS: { pattern: RegExp; handler: (tenantId: string) => QueryResult }[] = [
  {
    pattern: /SELECT\s+count\(\*\)\s+FROM\s+traffic/i,
    handler: (tenantId) => {
      const records = getAllTrafficRecords(tenantId);
      return {
        rows: [{ label: 'count(*)', value: records.length }],
        columns: ['count(*)'],
        kpiValue: records.length,
        kpiLabel: 'Total Traffic Records',
      };
    },
  },
  {
    pattern: /SELECT\s+assignedVariant\s*,\s*count\(\*\)\s+FROM\s+traffic\s+GROUP\s+BY\s+assignedVariant/i,
    handler: (tenantId) => {
      const records = getAllTrafficRecords(tenantId);
      const groups = new Map<string, number>();
      for (const r of records) groups.set(r.assignedVariant, (groups.get(r.assignedVariant) ?? 0) + 1);
      const rows = [...groups.entries()].map(([label, value]) => ({ label, value }));
      return { rows, columns: ['assignedVariant', 'count'] };
    },
  },
  {
    pattern: /SELECT\s+metricKey\s*,\s*avg\(value\)\s+FROM\s+business_metrics\s+GROUP\s+BY\s+metricKey/i,
    handler: (tenantId) => {
      const events = getAllBusinessEvents(tenantId);
      const groups = new Map<string, number[]>();
      for (const e of events) {
        const v = typeof e.value === 'number' ? e.value : parseFloat(String(e.value));
        if (!isNaN(v)) {
          if (!groups.has(e.metricKey)) groups.set(e.metricKey, []);
          groups.get(e.metricKey)!.push(v);
        }
      }
      const rows = [...groups.entries()].map(([label, vals]) => ({
        label,
        value: parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(4)),
      }));
      return { rows, columns: ['metricKey', 'avg(value)'] };
    },
  },
  {
    pattern: /SELECT\s+status\s*,\s*count\(\*\)\s+FROM\s+traffic\s+GROUP\s+BY\s+status/i,
    handler: (tenantId) => {
      const records = getAllTrafficRecords(tenantId);
      const groups = new Map<string, number>();
      for (const r of records) groups.set(r.status, (groups.get(r.status) ?? 0) + 1);
      const rows = [...groups.entries()].map(([label, value]) => ({ label, value }));
      return { rows, columns: ['status', 'count'] };
    },
  },
];

function runSqlQuery(tenantId: string, sqlText: string): QueryResult {
  if (!SQL_KEYWORDS_ALLOWLIST.test(sqlText)) {
    return { rows: [], columns: [], error: 'Only SELECT statements are supported.' };
  }

  const stripped = sqlText.replace(/;$/, '').trim();
  for (const { pattern, handler } of KNOWN_SQL_PATTERNS) {
    if (pattern.test(stripped)) {
      return handler(tenantId);
    }
  }

  const allRecords = getAllTrafficRecords(tenantId);
  const allEvents = getAllBusinessEvents(tenantId);

  if (/FROM\s+traffic/i.test(stripped)) {
    return {
      rows: [{ label: 'Simulated result', value: allRecords.length }],
      columns: ['label', 'value'],
      kpiValue: `${allRecords.length} records matched`,
      kpiLabel: 'Query result (simulated)',
    };
  }
  if (/FROM\s+business_metrics/i.test(stripped)) {
    return {
      rows: [{ label: 'Simulated result', value: allEvents.length }],
      columns: ['label', 'value'],
      kpiValue: `${allEvents.length} events matched`,
      kpiLabel: 'Query result (simulated)',
    };
  }

  return {
    rows: [],
    columns: [],
    error: 'Query not recognized. Try one of the template queries.',
  };
}

export const queryEngine = {
  run(tenantId: string, config: QueryConfig): QueryResult {
    try {
      if (config.mode === 'builder') return runBuilderQuery(tenantId, config);
      if (config.mode === 'sql') return runSqlQuery(tenantId, config.sqlText);
      return { rows: [], columns: [], error: 'Unknown query mode' };
    } catch (e) {
      return { rows: [], columns: [], error: e instanceof Error ? e.message : 'Query failed' };
    }
  },

  getAvailableMetrics(dataset: string): string[] {
    if (dataset === 'Traffic') {
      return ['requests', 'successRate', 'errorRate', 'avgLatency', 'p95Latency'];
    }
    if (dataset === 'BusinessMetrics') {
      try {
        const raw = localStorage.getItem(METRICS_KEY);
        const store: Record<string, import('../domain').BusinessMetricEvent[]> = raw ? JSON.parse(raw) : {};
        const allKeys = Object.values(store).flat().map(e => e.metricKey);
        return [...new Set(allKeys)].sort();
      } catch { return []; }
    }
    return [];
  },

  getGroupByOptions(dataset: string): { value: string; label: string }[] {
    if (dataset === 'Traffic') {
      return [
        { value: 'none', label: 'No grouping' },
        { value: 'variant', label: 'By Variant' },
        { value: 'status', label: 'By Status' },
        { value: 'method', label: 'By HTTP Method' },
      ];
    }
    if (dataset === 'BusinessMetrics') {
      return [
        { value: 'none', label: 'No grouping' },
        { value: 'variant', label: 'By Variant' },
        { value: 'metricKey', label: 'By Metric Key' },
      ];
    }
    return [];
  },

  SQL_TEMPLATES: [
    { label: 'Total traffic records', sql: 'SELECT count(*) FROM traffic' },
    { label: 'Traffic by variant', sql: 'SELECT assignedVariant, count(*) FROM traffic GROUP BY assignedVariant' },
    { label: 'Traffic by status', sql: 'SELECT status, count(*) FROM traffic GROUP BY status' },
    { label: 'Avg business metric by key', sql: 'SELECT metricKey, avg(value) FROM business_metrics GROUP BY metricKey' },
  ] as const,
};
