import type { TrafficRecord, TrafficListFilter } from '../../domain';

const STORAGE_KEY = 'experiment-portal-traffic';

function generateId(): string {
  return `tr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateCorrelationId(): string {
  return `corr-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
}

function loadStore(): Record<string, TrafficRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, TrafficRecord[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
  }
}

function storeKey(tenantId: string, experimentId: string): string {
  return `${tenantId}::${experimentId}`;
}

function getRecords(tenantId: string, experimentId: string): TrafficRecord[] {
  const store = loadStore();
  return store[storeKey(tenantId, experimentId)] ?? [];
}

function saveRecords(tenantId: string, experimentId: string, records: TrafficRecord[]): void {
  const store = loadStore();
  const key = storeKey(tenantId, experimentId);
  store[key] = records.slice(-2000);
  saveStore(store);
}

const SAMPLE_PATHS = [
  '/api/v1/predict',
  '/api/v1/recommend',
  '/api/v2/score',
  '/api/search',
  '/api/classify',
];

const SAMPLE_USER_IDS = ['usr_001', 'usr_002', 'usr_003', 'usr_004', 'usr_005', 'usr_006'];

function buildSyntheticRecord(
  tenantId: string,
  experimentId: string,
  type: 'AB' | 'CC',
  forced?: { variant?: TrafficRecord['assignedVariant']; status?: TrafficRecord['status'] },
): TrafficRecord {
  const isFail = forced?.status === 'FAIL' || Math.random() < 0.08;
  const isAB = type === 'AB';

  const variants: TrafficRecord['assignedVariant'][] = isAB
    ? ['A', 'B']
    : ['CHAMPION', 'CHALLENGER'];

  const assignedVariant = forced?.variant ?? variants[Math.floor(Math.random() * variants.length)];

  const upstreamMs = isFail ? 0 : 50 + Math.floor(Math.random() * 400);
  const processingMs = 5 + Math.floor(Math.random() * 20);
  const totalMs = upstreamMs + processingMs;

  const correlationId = Math.random() > 0.05
    ? generateCorrelationId()
    : '';
  const hasCorrelationId = correlationId !== '';

  const path = SAMPLE_PATHS[Math.floor(Math.random() * SAMPLE_PATHS.length)];
  const userId = SAMPLE_USER_IDS[Math.floor(Math.random() * SAMPLE_USER_IDS.length)];

  const requestBody = { userId, query: 'sample_query', features: [0.1, 0.4, 0.9] };

  const responseStatus = isFail
    ? (Math.random() > 0.5 ? 500 : 503)
    : [200, 200, 200, 201, 200][Math.floor(Math.random() * 5)];

  const responseBody = isFail
    ? { error: 'upstream_error', message: 'Service temporarily unavailable' }
    : { prediction: Math.random().toFixed(4), model_version: '2.1.0', latency_hint: upstreamMs };

  return {
    id: generateId(),
    tenantId,
    experimentId,
    timestamp: new Date().toISOString(),
    correlationId: hasCorrelationId ? correlationId : generateCorrelationId(),
    correlationIdSource: hasCorrelationId ? 'request' : 'generated',
    assignedVariant,
    request: {
      method: 'POST',
      url: `https://proxy.yourcompany.com/t/${tenantId}/exp/${experimentId}${path}`,
      headers: {
        'content-type': 'application/json',
        'x-user-id': userId,
        ...(hasCorrelationId ? { 'x-correlation-id': correlationId } : {}),
        'x-api-key': 'sk_masked_xxxx',
      },
      query: {},
      bodyJson: requestBody,
      rawBodyText: JSON.stringify(requestBody, null, 2),
    },
    response: {
      status: responseStatus,
      headers: {
        'content-type': 'application/json',
        'x-response-time': `${upstreamMs}ms`,
        'x-variant': assignedVariant,
      },
      bodyJson: responseBody,
      rawBodyText: JSON.stringify(responseBody, null, 2),
    },
    timings: {
      totalMs,
      upstreamMs,
      processingMs,
    },
    status: isFail ? 'FAIL' : 'SUCCESS',
    errorMessage: isFail ? 'Upstream returned non-2xx status' : undefined,
    memoryMb: 128 + Math.floor(Math.random() * 64),
  };
}

const TIME_RANGE_MS: Record<string, number> = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  'all': Infinity,
};

export const trafficService = {
  append(record: TrafficRecord): void {
    const records = getRecords(record.tenantId, record.experimentId);
    saveRecords(record.tenantId, record.experimentId, [...records, record]);
  },

  async list(filter: TrafficListFilter): Promise<TrafficRecord[]> {
    await new Promise(r => setTimeout(r, 100));

    let records = getRecords(filter.tenantId, filter.experimentId);

    if (filter.timeRange && filter.timeRange !== 'all') {
      const cutoff = Date.now() - (TIME_RANGE_MS[filter.timeRange] ?? Infinity);
      records = records.filter(r => new Date(r.timestamp).getTime() >= cutoff);
    }

    if (filter.searchCorrelationId) {
      const q = filter.searchCorrelationId.toLowerCase();
      records = records.filter(r => r.correlationId.toLowerCase().includes(q));
    }

    if (filter.variant) {
      records = records.filter(r => r.assignedVariant === filter.variant);
    }

    if (filter.status) {
      records = records.filter(r => r.status === filter.status);
    }

    return [...records].reverse();
  },

  seedGenerateTraffic(
    tenantId: string,
    experimentId: string,
    count: number,
    type: 'AB' | 'CC' = 'AB',
  ): TrafficRecord[] {
    const records: TrafficRecord[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const offsetMs = (count - i) * (2000 + Math.floor(Math.random() * 3000));
      const record = buildSyntheticRecord(tenantId, experimentId, type);
      record.timestamp = new Date(now - offsetMs).toISOString();
      records.push(record);
    }

    const existing = getRecords(tenantId, experimentId);
    saveRecords(tenantId, experimentId, [...existing, ...records]);
    return records;
  },

  generateOne(
    tenantId: string,
    experimentId: string,
    type: 'AB' | 'CC' = 'AB',
  ): TrafficRecord {
    const record = buildSyntheticRecord(tenantId, experimentId, type);
    const existing = getRecords(tenantId, experimentId);
    saveRecords(tenantId, experimentId, [...existing, record]);
    return record;
  },

  clearAll(tenantId: string, experimentId: string): void {
    const store = loadStore();
    delete store[storeKey(tenantId, experimentId)];
    saveStore(store);
  },
};
