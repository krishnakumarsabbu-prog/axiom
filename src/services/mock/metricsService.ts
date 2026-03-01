import type { BusinessMetricEvent, BusinessMetricFilter, Connector } from '../../domain';

const STORAGE_KEY = 'ep-metrics';

function generateId(): string {
  return `metric-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function loadStore(): Record<string, BusinessMetricEvent[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, BusinessMetricEvent[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

function getForTenant(tenantId: string): BusinessMetricEvent[] {
  return loadStore()[tenantId] ?? [];
}

function saveForTenant(tenantId: string, events: BusinessMetricEvent[]): void {
  const store = loadStore();
  store[tenantId] = events.slice(-5000);
  saveStore(store);
}

function getTrafficCorrelationIds(tenantId: string): string[] {
  try {
    const raw = localStorage.getItem('experiment-portal-traffic');
    if (!raw) return [];
    const store: Record<string, { correlationId: string }[]> = JSON.parse(raw);
    const ids: string[] = [];
    for (const [key, records] of Object.entries(store)) {
      if (key.startsWith(tenantId)) {
        for (const r of records) {
          if (r.correlationId) ids.push(r.correlationId);
        }
      }
    }
    return [...new Set(ids)].slice(0, 100);
  } catch {
    return [];
  }
}

const METRIC_KEYS = [
  'conversion_rate',
  'revenue_usd',
  'checkout_completed',
  'cart_abandonment',
  'avg_order_value',
  'session_duration',
  'click_through_rate',
];
const SEGMENTS = ['premium', 'standard', 'trial', 'enterprise'];
const CURRENCIES = ['usd', 'eur', 'gbp'];

const TIME_RANGE_MS: Record<string, number> = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

export const metricsService = {
  async list(filter: BusinessMetricFilter): Promise<BusinessMetricEvent[]> {
    await new Promise(r => setTimeout(r, 150));
    let events = getForTenant(filter.tenantId);

    if (filter.timeRange && filter.timeRange !== 'all') {
      const cutoff = Date.now() - (TIME_RANGE_MS[filter.timeRange] ?? 0);
      events = events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    }
    if (filter.metricKey) {
      events = events.filter(e => e.metricKey === filter.metricKey);
    }
    if (filter.correlationId) {
      const q = filter.correlationId.toLowerCase();
      events = events.filter(e => e.correlationId.toLowerCase().includes(q));
    }
    if (filter.connectorId) {
      events = events.filter(e => e.sourceConnectorId === filter.connectorId);
    }

    return [...events].reverse().slice(0, 500);
  },

  async getDistinctMetricKeys(tenantId: string): Promise<string[]> {
    const events = getForTenant(tenantId);
    return [...new Set(events.map(e => e.metricKey))].sort();
  },

  async ingestForConnector(tenantId: string, connector: Connector): Promise<number> {
    const correlationIds = getTrafficCorrelationIds(tenantId);
    const existing = getForTenant(tenantId);

    const targetIds =
      correlationIds.length > 0
        ? correlationIds.slice(0, Math.min(20, correlationIds.length))
        : Array.from({ length: 15 }, (_, i) => `corr-syn-${i}-${Date.now().toString(36)}`);

    const metricKey = METRIC_KEYS[Math.floor(Math.random() * METRIC_KEYS.length)];
    const now = Date.now();
    const newEvents: BusinessMetricEvent[] = [];

    for (const correlationId of targetIds) {
      if (Math.random() > 0.7) continue;

      const offsetMs = Math.floor(Math.random() * 3_600_000);

      let value: number | string | boolean;
      if (['conversion_rate', 'click_through_rate', 'cart_abandonment'].includes(metricKey)) {
        value = parseFloat((Math.random() * 0.8).toFixed(4));
      } else if (['revenue_usd', 'avg_order_value'].includes(metricKey)) {
        value = parseFloat((Math.random() * 500 + 10).toFixed(2));
      } else if (metricKey === 'session_duration') {
        value = Math.floor(Math.random() * 600 + 30);
      } else {
        value = Math.random() > 0.5;
      }

      newEvents.push({
        id: generateId(),
        tenantId,
        timestamp: new Date(now - offsetMs).toISOString(),
        correlationId,
        metricKey,
        value,
        dimensions: {
          segment: SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)],
          ...(connector.type === 'REST_PULL'
            ? { currency: CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)] }
            : {}),
        },
        sourceConnectorId: connector.id,
        connectorName: connector.name,
      });
    }

    saveForTenant(tenantId, [...existing, ...newEvents]);
    return newEvents.length;
  },
};
