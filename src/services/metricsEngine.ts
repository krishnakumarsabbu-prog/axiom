import type { TrafficRecord, BusinessMetricEvent } from '../domain';

const TRAFFIC_KEY = 'experiment-portal-traffic';
const METRICS_KEY = 'ep-metrics';

export type TimeRange = '5m' | '15m' | '1h' | '6h' | '24h' | 'all';

const TIME_RANGE_MS: Record<TimeRange, number> = {
  '5m':  5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h':  60 * 60 * 1000,
  '6h':  6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  'all': Infinity,
};

export type AggregationType = 'count' | 'sum' | 'avg' | 'rate';

export interface VariantSystemMetrics {
  variant: string;
  count: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  errorRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p50LatencyMs: number;
}

export interface SystemMetrics {
  totalRequests: number;
  successRate: number;
  errorRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p50LatencyMs: number;
  byVariant: VariantSystemMetrics[];
  timeSeriesLatency: TimeSeriesPoint[];
  timeSeriesRequests: TimeSeriesPoint[];
  timeSeriesErrors: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
  variantBreakdown?: Record<string, number>;
}

export interface VariantBusinessMetrics {
  variant: string;
  count: number;
  sum: number;
  avg: number;
  rate: number;
  values: (number | string | boolean)[];
}

export interface BusinessMetricSummary {
  metricKey: string;
  aggregation: AggregationType;
  byVariant: VariantBusinessMetrics[];
  timeSeriesAvg: TimeSeriesPoint[];
}

function loadTrafficStore(): Record<string, TrafficRecord[]> {
  try {
    const raw = localStorage.getItem(TRAFFIC_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadMetricsStore(): Record<string, BusinessMetricEvent[]> {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getTrafficRecords(tenantId: string, experimentId: string): TrafficRecord[] {
  const store = loadTrafficStore();
  return store[`${tenantId}::${experimentId}`] ?? [];
}

function getBusinessEvents(tenantId: string): BusinessMetricEvent[] {
  const store = loadMetricsStore();
  return store[tenantId] ?? [];
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

function filterByTimeRange(records: { timestamp: string }[], timeRange: TimeRange): { timestamp: string }[] {
  if (timeRange === 'all') return records;
  const cutoff = Date.now() - TIME_RANGE_MS[timeRange];
  return records.filter(r => new Date(r.timestamp).getTime() >= cutoff);
}

function bucketTimeSeries(
  records: TrafficRecord[],
  timeRange: TimeRange,
  buckets: number,
): { label: string; records: TrafficRecord[] }[] {
  if (records.length === 0) return [];

  const now = Date.now();
  const rangeMs = timeRange === 'all'
    ? (now - Math.min(...records.map(r => new Date(r.timestamp).getTime())))
    : TIME_RANGE_MS[timeRange];

  const bucketMs = rangeMs / buckets;
  const start = now - rangeMs;

  const result: { label: string; records: TrafficRecord[] }[] = Array.from({ length: buckets }, (_, i) => ({
    label: formatBucketLabel(start + i * bucketMs, timeRange),
    records: [],
  }));

  for (const record of records) {
    const t = new Date(record.timestamp).getTime();
    const idx = Math.min(Math.floor((t - start) / bucketMs), buckets - 1);
    if (idx >= 0 && idx < buckets) {
      result[idx].records.push(record);
    }
  }

  return result;
}

function formatBucketLabel(ts: number, timeRange: TimeRange): string {
  const d = new Date(ts);
  if (timeRange === '5m' || timeRange === '15m' || timeRange === '1h') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (timeRange === '6h' || timeRange === '24h') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const metricsEngine = {
  getSystemMetrics(tenantId: string, experimentId: string, timeRange: TimeRange): SystemMetrics {
    const allRecords = getTrafficRecords(tenantId, experimentId);
    const records = filterByTimeRange(allRecords, timeRange) as TrafficRecord[];

    const totalRequests = records.length;
    const successCount = records.filter(r => r.status === 'SUCCESS').length;
    const errorCount = records.filter(r => r.status === 'FAIL').length;
    const successRate = totalRequests > 0 ? successCount / totalRequests : 0;
    const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;

    const latencies = records
      .filter(r => r.status === 'SUCCESS')
      .map(r => r.timings.upstreamMs)
      .sort((a, b) => a - b);

    const avgLatencyMs = latencies.length > 0
      ? latencies.reduce((s, v) => s + v, 0) / latencies.length
      : 0;
    const p95LatencyMs = percentile(latencies, 95);
    const p50LatencyMs = percentile(latencies, 50);

    const variantGroups = new Map<string, TrafficRecord[]>();
    for (const r of records) {
      const v = r.assignedVariant;
      if (!variantGroups.has(v)) variantGroups.set(v, []);
      variantGroups.get(v)!.push(r);
    }

    const byVariant: VariantSystemMetrics[] = [];
    for (const [variant, vRecords] of variantGroups) {
      const vSuccess = vRecords.filter(r => r.status === 'SUCCESS').length;
      const vError = vRecords.filter(r => r.status === 'FAIL').length;
      const vLatencies = vRecords
        .filter(r => r.status === 'SUCCESS')
        .map(r => r.timings.upstreamMs)
        .sort((a, b) => a - b);

      byVariant.push({
        variant,
        count: vRecords.length,
        successCount: vSuccess,
        errorCount: vError,
        successRate: vRecords.length > 0 ? vSuccess / vRecords.length : 0,
        errorRate: vRecords.length > 0 ? vError / vRecords.length : 0,
        avgLatencyMs: vLatencies.length > 0
          ? vLatencies.reduce((s, v) => s + v, 0) / vLatencies.length
          : 0,
        p95LatencyMs: percentile(vLatencies, 95),
        p50LatencyMs: percentile(vLatencies, 50),
      });
    }

    const BUCKETS = 12;
    const bucketed = bucketTimeSeries(records, timeRange, BUCKETS);

    const timeSeriesLatency: TimeSeriesPoint[] = bucketed.map(b => {
      const successRecs = b.records.filter(r => r.status === 'SUCCESS');
      const lats = successRecs.map(r => r.timings.upstreamMs);
      const avg = lats.length > 0 ? lats.reduce((s, v) => s + v, 0) / lats.length : 0;
      return { label: b.label, value: Math.round(avg) };
    });

    const timeSeriesRequests: TimeSeriesPoint[] = bucketed.map(b => ({
      label: b.label,
      value: b.records.length,
    }));

    const timeSeriesErrors: TimeSeriesPoint[] = bucketed.map(b => {
      const errors = b.records.filter(r => r.status === 'FAIL').length;
      const rate = b.records.length > 0 ? (errors / b.records.length) * 100 : 0;
      return { label: b.label, value: parseFloat(rate.toFixed(1)) };
    });

    return {
      totalRequests,
      successRate,
      errorRate,
      avgLatencyMs,
      p95LatencyMs,
      p50LatencyMs,
      byVariant,
      timeSeriesLatency,
      timeSeriesRequests,
      timeSeriesErrors,
    };
  },

  getBusinessMetrics(
    tenantId: string,
    experimentId: string,
    timeRange: TimeRange,
    metricKey: string,
    aggregation: AggregationType = 'avg',
  ): BusinessMetricSummary {
    const trafficRecords = filterByTimeRange(
      getTrafficRecords(tenantId, experimentId),
      timeRange,
    ) as TrafficRecord[];

    const correlationToVariant = new Map<string, string>();
    for (const r of trafficRecords) {
      if (r.correlationId) correlationToVariant.set(r.correlationId, r.assignedVariant);
    }

    const allEvents = getBusinessEvents(tenantId);
    const matchingEvents = allEvents.filter(e => {
      if (e.metricKey !== metricKey) return false;
      if (timeRange !== 'all') {
        const cutoff = Date.now() - TIME_RANGE_MS[timeRange];
        if (new Date(e.timestamp).getTime() < cutoff) return false;
      }
      return correlationToVariant.has(e.correlationId);
    });

    const variantGroups = new Map<string, BusinessMetricEvent[]>();
    for (const event of matchingEvents) {
      const variant = correlationToVariant.get(event.correlationId)!;
      if (!variantGroups.has(variant)) variantGroups.set(variant, []);
      variantGroups.get(variant)!.push(event);
    }

    const totalWithMetric = matchingEvents.length;

    const byVariant: VariantBusinessMetrics[] = [];
    for (const [variant, events] of variantGroups) {
      const numerics = events
        .map(e => typeof e.value === 'number' ? e.value : typeof e.value === 'boolean' ? (e.value ? 1 : 0) : parseFloat(String(e.value)))
        .filter(v => !isNaN(v));

      const sum = numerics.reduce((s, v) => s + v, 0);
      const avg = numerics.length > 0 ? sum / numerics.length : 0;
      const variantTrafficCount = trafficRecords.filter(r => r.assignedVariant === variant).length;
      const rate = variantTrafficCount > 0 ? events.length / variantTrafficCount : 0;

      byVariant.push({
        variant,
        count: events.length,
        sum,
        avg,
        rate,
        values: events.map(e => e.value),
      });
    }

    const BUCKETS = 12;
    const now = Date.now();
    const rangeMs = timeRange === 'all'
      ? (matchingEvents.length > 0
          ? now - Math.min(...matchingEvents.map(e => new Date(e.timestamp).getTime()))
          : 86_400_000)
      : TIME_RANGE_MS[timeRange];
    const bucketMs = rangeMs / BUCKETS;
    const start = now - rangeMs;

    const timeSeriesAvg: TimeSeriesPoint[] = Array.from({ length: BUCKETS }, (_, i) => {
      const bucketStart = start + i * bucketMs;
      const bucketEnd = bucketStart + bucketMs;
      const label = formatBucketLabel(bucketStart, timeRange);
      const bucketEvents = matchingEvents.filter(e => {
        const t = new Date(e.timestamp).getTime();
        return t >= bucketStart && t < bucketEnd;
      });

      const variantBreakdown: Record<string, number> = {};
      for (const [variant, events] of variantGroups) {
        const vBucketEvents = events.filter(e => {
          const t = new Date(e.timestamp).getTime();
          return t >= bucketStart && t < bucketEnd;
        });
        if (vBucketEvents.length > 0) {
          const nums = vBucketEvents
            .map(e => typeof e.value === 'number' ? e.value : typeof e.value === 'boolean' ? (e.value ? 1 : 0) : parseFloat(String(e.value)))
            .filter(v => !isNaN(v));
          variantBreakdown[variant] = nums.length > 0
            ? parseFloat((nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(4))
            : 0;
        }
      }

      const numerics = bucketEvents
        .map(e => typeof e.value === 'number' ? e.value : typeof e.value === 'boolean' ? (e.value ? 1 : 0) : parseFloat(String(e.value)))
        .filter(v => !isNaN(v));

      return {
        label,
        value: numerics.length > 0
          ? parseFloat((numerics.reduce((s, v) => s + v, 0) / numerics.length).toFixed(4))
          : 0,
        variantBreakdown: Object.keys(variantBreakdown).length > 0 ? variantBreakdown : undefined,
      };
    });

    void totalWithMetric;

    return {
      metricKey,
      aggregation,
      byVariant,
      timeSeriesAvg,
    };
  },

  getAvailableMetricKeys(tenantId: string): string[] {
    const events = getBusinessEvents(tenantId);
    return [...new Set(events.map(e => e.metricKey))].sort();
  },
};
