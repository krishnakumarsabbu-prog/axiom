import type {
  Experiment,
  ABConfig,
  CCConfig,
  ProxyConfig,
  TrafficRecord,
  BusinessMetricEvent,
  Connector,
  Dashboard,
  Widget,
} from '../../domain';

export const SEED_VERSION = 'v5';
const SEED_KEY = 'ep-seed-version';

export function isSeedNeeded(): boolean {
  return localStorage.getItem(SEED_KEY) !== SEED_VERSION;
}

export function markSeeded(): void {
  localStorage.setItem(SEED_KEY, SEED_VERSION);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ts(daysAgo: number, hoursAgo = 0, minutesAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

function rng(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCorrId(i: number): string {
  return `corr-seed-${i.toString(16).padStart(6, '0')}-${Date.now().toString(36)}`;
}

// ---------------------------------------------------------------------------
// TENANTS — already in mockTenants, we just reference their IDs
// ---------------------------------------------------------------------------

export const TENANT_IDS = {
  acme: 'tenant-1',
  techstart: 'tenant-2',
  global: 'tenant-3',
  research: 'tenant-4',
};

// ---------------------------------------------------------------------------
// EXPERIMENTS
// ---------------------------------------------------------------------------

interface StoredExperiment {
  experiment: Experiment;
  config: ABConfig | CCConfig;
  proxyConfig: ProxyConfig;
}

export const SEED_EXPERIMENTS: Record<string, StoredExperiment[]> = {
  [TENANT_IDS.acme]: [
    {
      experiment: {
        id: 'exp-acme-001',
        tenantId: TENANT_IDS.acme,
        name: 'Checkout CTA Button Test',
        description: 'A/B test comparing "Buy Now" vs "Add to Cart" conversion rates on the checkout page',
        type: 'AB',
        status: 'active',
        createdAt: ts(30),
        updatedAt: ts(2),
        correlationIdHeaderName: 'x-correlation-id',
      },
      config: {
        variantA: { url: 'https://api.acme-prod.com/v1/checkout', method: 'POST', headers: [{ key: 'x-service', value: 'checkout-v1' }], timeoutMs: 3000 },
        variantB: { url: 'https://api.acme-prod.com/v2/checkout', method: 'POST', headers: [{ key: 'x-service', value: 'checkout-v2' }], timeoutMs: 3000 },
        splitA: 50,
        splitB: 50,
        bucketingKeySource: 'header',
        bucketingKeyValue: 'x-user-id',
      } as ABConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.acme.com', proxyPath: '/t/tenant-1/exp/exp-acme-001', apiKey: 'ak_acme_001_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', correlationIdHeaderName: 'x-correlation-id' },
    },
    {
      experiment: {
        id: 'exp-acme-002',
        tenantId: TENANT_IDS.acme,
        name: 'Recommendation Engine v3 Shadow',
        description: 'Champion/Challenger test: production recommendation engine vs new ML v3 model',
        type: 'CC',
        status: 'active',
        createdAt: ts(20),
        updatedAt: ts(1),
        correlationIdHeaderName: 'x-session-id',
      },
      config: {
        champion: { url: 'https://reco.acme-prod.com/v2/recommend', method: 'POST', headers: [{ key: 'x-model', value: 'prod-v2' }], timeoutMs: 2000 },
        challenger: { url: 'https://reco.acme-prod.com/v3/recommend', method: 'POST', headers: [{ key: 'x-model', value: 'ml-v3-beta' }], timeoutMs: 2500 },
        executionMode: 'parallel',
      } as CCConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.acme.com', proxyPath: '/t/tenant-1/exp/exp-acme-002', apiKey: 'ak_acme_002_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', correlationIdHeaderName: 'x-session-id' },
    },
    {
      experiment: {
        id: 'exp-acme-003',
        tenantId: TENANT_IDS.acme,
        name: 'Pricing Page Layout',
        description: 'Test new simplified pricing page layout vs existing tiered display',
        type: 'AB',
        status: 'paused',
        createdAt: ts(45),
        updatedAt: ts(10),
        correlationIdHeaderName: 'x-correlation-id',
      },
      config: {
        variantA: { url: 'https://api.acme-prod.com/pricing/legacy', method: 'GET', headers: [], timeoutMs: 2000 },
        variantB: { url: 'https://api.acme-prod.com/pricing/simplified', method: 'GET', headers: [], timeoutMs: 2000 },
        splitA: 70,
        splitB: 30,
        bucketingKeySource: 'jsonpath',
        bucketingKeyValue: '$.userId',
      } as ABConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.acme.com', proxyPath: '/t/tenant-1/exp/exp-acme-003', apiKey: 'ak_acme_003_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz', correlationIdHeaderName: 'x-correlation-id' },
    },
    {
      experiment: {
        id: 'exp-acme-004',
        tenantId: TENANT_IDS.acme,
        name: 'Search Ranking Model',
        description: 'Draft: new neural search ranking vs BM25 baseline',
        type: 'AB',
        status: 'draft',
        createdAt: ts(5),
        updatedAt: ts(5),
        correlationIdHeaderName: 'x-correlation-id',
      },
      config: {
        variantA: { url: 'https://search.acme-prod.com/bm25', method: 'POST', headers: [], timeoutMs: 1500 },
        variantB: { url: 'https://search.acme-prod.com/neural-v1', method: 'POST', headers: [], timeoutMs: 2000 },
        splitA: 90,
        splitB: 10,
        bucketingKeySource: 'header',
        bucketingKeyValue: 'x-user-id',
      } as ABConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.acme.com', proxyPath: '/t/tenant-1/exp/exp-acme-004', apiKey: 'ak_acme_004_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1', correlationIdHeaderName: 'x-correlation-id' },
    },
    {
      experiment: {
        id: 'exp-acme-005',
        tenantId: TENANT_IDS.acme,
        name: 'Email Notification Frequency',
        description: 'Archived: daily vs weekly digest email experiment',
        type: 'AB',
        status: 'archived',
        createdAt: ts(90),
        updatedAt: ts(60),
        correlationIdHeaderName: 'x-correlation-id',
      },
      config: {
        variantA: { url: 'https://notify.acme-prod.com/daily', method: 'POST', headers: [], timeoutMs: 3000 },
        variantB: { url: 'https://notify.acme-prod.com/weekly', method: 'POST', headers: [], timeoutMs: 3000 },
        splitA: 50,
        splitB: 50,
        bucketingKeySource: 'header',
        bucketingKeyValue: 'x-user-id',
      } as ABConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.acme.com', proxyPath: '/t/tenant-1/exp/exp-acme-005', apiKey: 'ak_acme_005_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', correlationIdHeaderName: 'x-correlation-id' },
    },
  ],
  [TENANT_IDS.techstart]: [
    {
      experiment: {
        id: 'exp-ts-001',
        tenantId: TENANT_IDS.techstart,
        name: 'Onboarding Flow v2',
        description: 'A/B test: streamlined 3-step onboarding vs traditional 7-step wizard',
        type: 'AB',
        status: 'active',
        createdAt: ts(15),
        updatedAt: ts(3),
        correlationIdHeaderName: 'x-correlation-id',
      },
      config: {
        variantA: { url: 'https://api.techstart.io/onboarding/v1', method: 'POST', headers: [], timeoutMs: 4000 },
        variantB: { url: 'https://api.techstart.io/onboarding/v2', method: 'POST', headers: [], timeoutMs: 4000 },
        splitA: 50,
        splitB: 50,
        bucketingKeySource: 'header',
        bucketingKeyValue: 'x-user-id',
      } as ABConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.techstart.io', proxyPath: '/t/tenant-2/exp/exp-ts-001', apiKey: 'ak_ts_001_cccccccccccccccccccccccccccccccc', correlationIdHeaderName: 'x-correlation-id' },
    },
    {
      experiment: {
        id: 'exp-ts-002',
        tenantId: TENANT_IDS.techstart,
        name: 'AI Autocomplete Shadow Test',
        description: 'CC test: rule-based vs GPT-4 powered autocomplete suggestions',
        type: 'CC',
        status: 'active',
        createdAt: ts(8),
        updatedAt: ts(1),
        correlationIdHeaderName: 'x-request-id',
      },
      config: {
        champion: { url: 'https://api.techstart.io/autocomplete/rules', method: 'POST', headers: [], timeoutMs: 500 },
        challenger: { url: 'https://api.techstart.io/autocomplete/gpt4', method: 'POST', headers: [{ key: 'x-model', value: 'gpt-4-turbo' }], timeoutMs: 1500 },
        executionMode: 'parallel',
      } as CCConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.techstart.io', proxyPath: '/t/tenant-2/exp/exp-ts-002', apiKey: 'ak_ts_002_dddddddddddddddddddddddddddddddd', correlationIdHeaderName: 'x-request-id' },
    },
  ],
  [TENANT_IDS.global]: [
    {
      experiment: {
        id: 'exp-gl-001',
        tenantId: TENANT_IDS.global,
        name: 'Global Fraud Detection Model',
        description: 'CC: legacy rule-based fraud model vs new gradient boosting classifier',
        type: 'CC',
        status: 'active',
        createdAt: ts(60),
        updatedAt: ts(0),
        correlationIdHeaderName: 'x-transaction-id',
      },
      config: {
        champion: { url: 'https://fraud.global-ent.com/v1/score', method: 'POST', headers: [], timeoutMs: 1000 },
        challenger: { url: 'https://fraud.global-ent.com/v2/score', method: 'POST', headers: [{ key: 'x-model', value: 'gbm-v2' }], timeoutMs: 1200 },
        executionMode: 'sequential',
      } as CCConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.global-ent.com', proxyPath: '/t/tenant-3/exp/exp-gl-001', apiKey: 'ak_gl_001_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', correlationIdHeaderName: 'x-transaction-id' },
    },
    {
      experiment: {
        id: 'exp-gl-002',
        tenantId: TENANT_IDS.global,
        name: 'Multi-Currency Pricing Engine',
        description: 'Test dynamic currency conversion accuracy vs static rates',
        type: 'AB',
        status: 'active',
        createdAt: ts(25),
        updatedAt: ts(4),
        correlationIdHeaderName: 'x-correlation-id',
      },
      config: {
        variantA: { url: 'https://pricing.global-ent.com/static-rates', method: 'POST', headers: [], timeoutMs: 800 },
        variantB: { url: 'https://pricing.global-ent.com/dynamic-rates', method: 'POST', headers: [], timeoutMs: 1200 },
        splitA: 60,
        splitB: 40,
        bucketingKeySource: 'header',
        bucketingKeyValue: 'x-user-id',
      } as ABConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.global-ent.com', proxyPath: '/t/tenant-3/exp/exp-gl-002', apiKey: 'ak_gl_002_ffffffffffffffffffffffffffffffff', correlationIdHeaderName: 'x-correlation-id' },
    },
    {
      experiment: {
        id: 'exp-gl-003',
        tenantId: TENANT_IDS.global,
        name: 'Customer Risk Scoring v4',
        description: 'Draft: integrate alternative data sources into credit risk model',
        type: 'CC',
        status: 'draft',
        createdAt: ts(3),
        updatedAt: ts(3),
        correlationIdHeaderName: 'x-correlation-id',
      },
      config: {
        champion: { url: 'https://risk.global-ent.com/v3/score', method: 'POST', headers: [], timeoutMs: 2000 },
        challenger: { url: 'https://risk.global-ent.com/v4/score', method: 'POST', headers: [], timeoutMs: 2500 },
        executionMode: 'sequential',
      } as CCConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.global-ent.com', proxyPath: '/t/tenant-3/exp/exp-gl-003', apiKey: 'ak_gl_003_gggggggggggggggggggggggggggggggg', correlationIdHeaderName: 'x-correlation-id' },
    },
  ],
  [TENANT_IDS.research]: [
    {
      experiment: {
        id: 'exp-rl-001',
        tenantId: TENANT_IDS.research,
        name: 'Drug Interaction Predictor',
        description: 'Comparison of CNN vs Transformer model for drug interaction classification',
        type: 'CC',
        status: 'active',
        createdAt: ts(40),
        updatedAt: ts(7),
        correlationIdHeaderName: 'x-sample-id',
      },
      config: {
        champion: { url: 'https://ml.research-labs.edu/interactions/cnn', method: 'POST', headers: [], timeoutMs: 5000 },
        challenger: { url: 'https://ml.research-labs.edu/interactions/transformer', method: 'POST', headers: [], timeoutMs: 6000 },
        executionMode: 'parallel',
      } as CCConfig,
      proxyConfig: { proxyBaseUrl: 'https://proxy.research-labs.edu', proxyPath: '/t/tenant-4/exp/exp-rl-001', apiKey: 'ak_rl_001_hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh', correlationIdHeaderName: 'x-sample-id' },
    },
  ],
};

// ---------------------------------------------------------------------------
// TRAFFIC RECORDS
// ---------------------------------------------------------------------------

function buildTrafficRecord(
  tenantId: string,
  experimentId: string,
  type: 'AB' | 'CC',
  corrId: string,
  daysAgo: number,
  hoursAgo: number,
  forcedVariant?: TrafficRecord['assignedVariant'],
  forcedStatus?: TrafficRecord['status'],
): TrafficRecord {
  const isFail = forcedStatus === 'FAIL' || (!forcedStatus && Math.random() < 0.07);
  const isAB = type === 'AB';
  const variants: TrafficRecord['assignedVariant'][] = isAB ? ['A', 'B'] : ['CHAMPION', 'CHALLENGER'];
  const variant = forcedVariant ?? pickRandom(variants);
  const upstreamMs = isFail ? 0 : rng(40, 450);
  const processingMs = rng(5, 25);
  const paths = ['/api/v1/predict', '/api/v1/score', '/api/v2/recommend', '/api/search', '/api/classify'];
  const userIds = ['usr_001', 'usr_002', 'usr_003', 'usr_004', 'usr_005', 'usr_006', 'usr_007', 'usr_008'];
  const path = pickRandom(paths);
  const userId = pickRandom(userIds);

  return {
    id: `tr-seed-${corrId.slice(-8)}-${Math.random().toString(36).slice(2, 6)}`,
    tenantId,
    experimentId,
    timestamp: ts(daysAgo, hoursAgo),
    correlationId: corrId,
    correlationIdSource: 'request',
    assignedVariant: variant,
    request: {
      method: 'POST',
      url: `https://proxy.yourcompany.com/t/${tenantId}/exp/${experimentId}${path}`,
      headers: {
        'content-type': 'application/json',
        'x-user-id': userId,
        'x-correlation-id': corrId,
        'x-api-key': 'sk_masked_xxxx',
      },
      query: {},
      bodyJson: { userId, features: [parseFloat(Math.random().toFixed(3)), parseFloat(Math.random().toFixed(3))], model_override: null },
      rawBodyText: `{"userId":"${userId}","features":[${Math.random().toFixed(3)},${Math.random().toFixed(3)}]}`,
    },
    response: {
      status: isFail ? (Math.random() > 0.5 ? 500 : 503) : 200,
      headers: {
        'content-type': 'application/json',
        'x-variant': variant,
        'x-response-time': `${upstreamMs}ms`,
      },
      bodyJson: isFail
        ? { error: 'upstream_error', code: 'SERVICE_UNAVAILABLE' }
        : { prediction: parseFloat(Math.random().toFixed(4)), score: parseFloat(Math.random().toFixed(4)), model_version: '2.3.1', latency_ms: upstreamMs },
      rawBodyText: isFail ? '{"error":"upstream_error"}' : `{"prediction":${Math.random().toFixed(4)},"score":${Math.random().toFixed(4)}}`,
    },
    timings: { totalMs: upstreamMs + processingMs, upstreamMs, processingMs },
    status: isFail ? 'FAIL' : 'SUCCESS',
    errorMessage: isFail ? 'Upstream returned non-2xx status code' : undefined,
    memoryMb: rng(112, 192),
  };
}

type TrafficStore = Record<string, TrafficRecord[]>;

function buildAllTraffic(): TrafficStore {
  const store: TrafficStore = {};

  function addRecords(tenantId: string, experimentId: string, type: 'AB' | 'CC', count: number) {
    const key = `${tenantId}::${experimentId}`;
    const records: TrafficRecord[] = [];
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(i / 20);
      const hoursAgo = rng(0, 23);
      const corrId = generateCorrId(i * 100 + experimentId.charCodeAt(experimentId.length - 1));
      records.push(buildTrafficRecord(tenantId, experimentId, type, corrId, daysAgo, hoursAgo));
    }
    // Add a cluster of FAIL records for testing
    for (let i = 0; i < Math.floor(count * 0.08); i++) {
      const corrId = generateCorrId(9000 + i);
      records.push(buildTrafficRecord(tenantId, experimentId, type, corrId, rng(0, 2), rng(0, 12), undefined, 'FAIL'));
    }
    store[key] = records;
  }

  // Acme experiments
  addRecords(TENANT_IDS.acme, 'exp-acme-001', 'AB', 120);
  addRecords(TENANT_IDS.acme, 'exp-acme-002', 'CC', 80);
  addRecords(TENANT_IDS.acme, 'exp-acme-003', 'AB', 55);
  addRecords(TENANT_IDS.acme, 'exp-acme-004', 'AB', 5); // draft, minimal traffic
  addRecords(TENANT_IDS.acme, 'exp-acme-005', 'AB', 200); // archived, lots of historical data

  // TechStart experiments
  addRecords(TENANT_IDS.techstart, 'exp-ts-001', 'AB', 90);
  addRecords(TENANT_IDS.techstart, 'exp-ts-002', 'CC', 60);

  // Global
  addRecords(TENANT_IDS.global, 'exp-gl-001', 'CC', 150);
  addRecords(TENANT_IDS.global, 'exp-gl-002', 'AB', 110);
  addRecords(TENANT_IDS.global, 'exp-gl-003', 'CC', 8);

  // Research
  addRecords(TENANT_IDS.research, 'exp-rl-001', 'CC', 75);

  return store;
}

export const SEED_TRAFFIC = buildAllTraffic();

// ---------------------------------------------------------------------------
// BUSINESS METRICS
// ---------------------------------------------------------------------------

type MetricStore = Record<string, BusinessMetricEvent[]>;

const METRIC_CONFIGS: { key: string; type: 'rate' | 'money' | 'count' | 'duration' | 'bool' }[] = [
  { key: 'conversion_rate',   type: 'rate'     },
  { key: 'revenue_usd',       type: 'money'    },
  { key: 'checkout_completed',type: 'bool'     },
  { key: 'cart_abandonment',  type: 'rate'     },
  { key: 'avg_order_value',   type: 'money'    },
  { key: 'session_duration',  type: 'duration' },
  { key: 'click_through_rate',type: 'rate'     },
  { key: 'signup_completed',  type: 'bool'     },
  { key: 'api_latency_p95',   type: 'duration' },
  { key: 'error_count',       type: 'count'    },
];

const SEGMENTS = ['premium', 'standard', 'trial', 'enterprise', 'freemium'];
const CURRENCIES = ['usd', 'eur', 'gbp'];
const CONN_IDS = ['conn-seed-1', 'conn-seed-2'];

function metricValue(type: string): number | boolean {
  if (type === 'rate')     return parseFloat((Math.random() * 0.85).toFixed(4));
  if (type === 'money')    return parseFloat((rng(5, 999) + Math.random()).toFixed(2));
  if (type === 'count')    return rng(0, 50);
  if (type === 'duration') return rng(30, 900);
  if (type === 'bool')     return Math.random() > 0.3;
  return 0;
}

function buildAllMetrics(trafficStore: TrafficStore): MetricStore {
  const store: MetricStore = {};
  const now = Date.now();

  function addMetricsForTenant(tenantId: string, experimentIds: string[]) {
    const events: BusinessMetricEvent[] = [];
    let idx = 0;

    // Metrics tied to actual traffic correlation IDs (rich linked data)
    for (const expId of experimentIds) {
      const key = `${tenantId}::${expId}`;
      const traffic = (trafficStore[key] ?? []).filter(r => r.status === 'SUCCESS').slice(0, 60);
      for (const record of traffic) {
        const cfg = pickRandom(METRIC_CONFIGS);
        const connId = pickRandom(CONN_IDS);
        events.push({
          id: `me-seed-${idx++}-${expId.slice(-4)}`,
          tenantId,
          timestamp: new Date(new Date(record.timestamp).getTime() + rng(500, 5000)).toISOString(),
          correlationId: record.correlationId,
          metricKey: cfg.key,
          value: metricValue(cfg.type),
          dimensions: {
            segment: pickRandom(SEGMENTS),
            currency: pickRandom(CURRENCIES),
            experiment_id: expId,
          },
          sourceConnectorId: connId,
          connectorName: connId === 'conn-seed-1' ? 'Stripe Revenue API' : 'Analytics Postgres DB',
        });
      }
    }

    // Standalone metric events (not tied to traffic, simulating direct ingestion)
    for (let i = 0; i < 40; i++) {
      const cfg = pickRandom(METRIC_CONFIGS);
      const offsetMs = rng(0, 7 * 24 * 3600 * 1000);
      const connId = pickRandom(CONN_IDS);
      events.push({
        id: `me-seed-standalone-${tenantId.slice(-1)}-${i}`,
        tenantId,
        timestamp: new Date(now - offsetMs).toISOString(),
        correlationId: generateCorrId(10000 + i),
        metricKey: cfg.key,
        value: metricValue(cfg.type),
        dimensions: {
          segment: pickRandom(SEGMENTS),
          currency: pickRandom(CURRENCIES),
        },
        sourceConnectorId: connId,
        connectorName: connId === 'conn-seed-1' ? 'Stripe Revenue API' : 'Analytics Postgres DB',
      });
    }

    store[tenantId] = events;
  }

  addMetricsForTenant(TENANT_IDS.acme,     ['exp-acme-001', 'exp-acme-002', 'exp-acme-003']);
  addMetricsForTenant(TENANT_IDS.techstart, ['exp-ts-001',   'exp-ts-002']);
  addMetricsForTenant(TENANT_IDS.global,    ['exp-gl-001',   'exp-gl-002']);
  addMetricsForTenant(TENANT_IDS.research,  ['exp-rl-001']);

  return store;
}

export const SEED_METRICS = buildAllMetrics(SEED_TRAFFIC);

// ---------------------------------------------------------------------------
// CONNECTORS
// ---------------------------------------------------------------------------

type ConnectorStore = Record<string, Connector[]>;

export function buildConnectorStore(): ConnectorStore {
  const base: Omit<Connector, 'tenantId'>[] = [
    {
      id: 'conn-seed-1',
      name: 'Stripe Revenue API',
      description: 'Pulls payment and revenue metrics from Stripe via REST',
      type: 'REST_PULL',
      config: {
        url: 'https://api.stripe.com/v1/charges',
        method: 'GET',
        headers: { Accept: 'application/json' },
        queryParams: { limit: '100' },
        authType: 'bearer',
        authValue: 'sk_live_***masked***',
        responseArrayPath: 'data',
      },
      schedule: { intervalSeconds: 300 },
      status: 'ACTIVE',
      fieldMappings: [
        { canonicalField: 'correlationId',           sourcePath: 'metadata.correlationId'   },
        { canonicalField: 'timestamp',               sourcePath: 'created'                  },
        { canonicalField: 'metricKey',               sourcePath: 'metadata.experiment_key'  },
        { canonicalField: 'value',                   sourcePath: 'amount'                   },
        { canonicalField: 'dimensions.currency',     sourcePath: 'currency'                 },
        { canonicalField: 'dimensions.status',       sourcePath: 'status'                   },
      ],
      createdAt: ts(60),
      updatedAt: ts(5),
      lastRunAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      lastRunStatus: 'success',
      lastRunCount: 47,
    },
    {
      id: 'conn-seed-2',
      name: 'Analytics Postgres DB',
      description: 'Polls conversion and engagement metrics from analytics warehouse',
      type: 'DB_POLL',
      config: {
        jdbcUrl: 'jdbc:postgresql://analytics.internal:5432/metrics',
        username: 'readonly_user',
        password: '***masked***',
        query: 'SELECT correlation_id, metric_key, value, user_segment, created_at FROM business_metrics WHERE created_at > :lastRun',
        dialect: 'postgresql',
      },
      schedule: { intervalSeconds: 600 },
      status: 'ACTIVE',
      fieldMappings: [
        { canonicalField: 'correlationId',           sourcePath: 'correlation_id' },
        { canonicalField: 'timestamp',               sourcePath: 'created_at'     },
        { canonicalField: 'metricKey',               sourcePath: 'metric_key'     },
        { canonicalField: 'value',                   sourcePath: 'value'          },
        { canonicalField: 'dimensions.segment',      sourcePath: 'user_segment'   },
      ],
      createdAt: ts(45),
      updatedAt: ts(10),
      lastRunAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
      lastRunStatus: 'success',
      lastRunCount: 128,
    },
    {
      id: 'conn-seed-3',
      name: 'Mixpanel Event Stream',
      description: 'REST pull for user engagement events: clicks, page views, funnel completions',
      type: 'REST_PULL',
      config: {
        url: 'https://data.mixpanel.com/api/2.0/export',
        method: 'GET',
        headers: { Accept: 'application/json' },
        queryParams: { from_date: 'today', to_date: 'today', event: '["Checkout Completed","Cart Abandoned"]' },
        authType: 'basic',
        authValue: 'service_account:***masked***',
        responseArrayPath: '',
      },
      schedule: { intervalSeconds: 900 },
      status: 'PAUSED',
      fieldMappings: [
        { canonicalField: 'correlationId',         sourcePath: 'properties.correlation_id'  },
        { canonicalField: 'timestamp',             sourcePath: 'properties.time'            },
        { canonicalField: 'metricKey',             sourcePath: 'event'                      },
        { canonicalField: 'value',                 sourcePath: 'properties.value'           },
        { canonicalField: 'dimensions.segment',    sourcePath: 'properties.user_segment'    },
      ],
      createdAt: ts(20),
      updatedAt: ts(20),
      lastRunAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      lastRunStatus: 'error',
      lastRunCount: 0,
    },
    {
      id: 'conn-seed-4',
      name: 'Snowflake Data Warehouse',
      description: 'Polls aggregated daily business KPIs from Snowflake',
      type: 'DB_POLL',
      config: {
        jdbcUrl: 'jdbc:snowflake://acme.snowflakecomputing.com/?warehouse=COMPUTE_WH&db=ANALYTICS',
        username: 'svc_experiment_ro',
        password: '***masked***',
        query: 'SELECT corr_id, kpi_name, kpi_value, region, business_date FROM kpi_daily WHERE business_date >= :lastRun',
        dialect: 'mssql',
      },
      schedule: { intervalSeconds: 3600 },
      status: 'ACTIVE',
      fieldMappings: [
        { canonicalField: 'correlationId',       sourcePath: 'corr_id'       },
        { canonicalField: 'timestamp',           sourcePath: 'business_date' },
        { canonicalField: 'metricKey',           sourcePath: 'kpi_name'      },
        { canonicalField: 'value',               sourcePath: 'kpi_value'     },
        { canonicalField: 'dimensions.region',   sourcePath: 'region'        },
      ],
      createdAt: ts(10),
      updatedAt: ts(2),
      lastRunAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      lastRunStatus: 'success',
      lastRunCount: 312,
    },
  ];

  const store: ConnectorStore = {};
  for (const tid of Object.values(TENANT_IDS)) {
    store[tid] = base.map(c => ({ ...c, tenantId: tid }));
  }
  return store;
}

export const SEED_CONNECTORS_STORE = buildConnectorStore();

// ---------------------------------------------------------------------------
// DASHBOARDS
// ---------------------------------------------------------------------------

type DashboardStore = Record<string, Dashboard[]>;

export function buildDashboardStore(): DashboardStore {
  const store: DashboardStore = {};

  function kpiWidget(id: string, title: string, col: number, row: number, metric: string, dataset: 'Traffic' | 'BusinessMetrics'): Widget {
    return {
      id,
      type: 'KPI',
      title,
      position: { col, row, colSpan: 3, rowSpan: 2 },
      queryConfig: {
        mode: 'builder',
        dataset,
        metric,
        aggregation: 'count',
        groupBy: 'none',
        timeRange: 'all',
        filters: {},
      },
    };
  }

  function barWidget(id: string, title: string, col: number, row: number, metric: string, groupBy: string): Widget {
    return {
      id,
      type: 'BAR',
      title,
      position: { col, row, colSpan: 6, rowSpan: 3 },
      queryConfig: {
        mode: 'builder',
        dataset: 'Traffic',
        metric,
        aggregation: 'count',
        groupBy,
        timeRange: 'all',
        filters: {},
      },
    };
  }

  function tableWidget(id: string, title: string, col: number, row: number): Widget {
    return {
      id,
      type: 'TABLE',
      title,
      position: { col, row, colSpan: 6, rowSpan: 3 },
      queryConfig: {
        mode: 'sql',
        sqlText: 'SELECT assignedVariant, count(*) FROM traffic GROUP BY assignedVariant',
      },
    };
  }

  function pieWidget(id: string, title: string, col: number, row: number, metric: string): Widget {
    return {
      id,
      type: 'PIE',
      title,
      position: { col, row, colSpan: 4, rowSpan: 3 },
      queryConfig: {
        mode: 'builder',
        dataset: 'Traffic',
        metric,
        aggregation: 'count',
        groupBy: 'status',
        timeRange: 'all',
        filters: {},
      },
    };
  }

  // ---- Acme Dashboards ----
  const acmeDashboards: Dashboard[] = [
    {
      id: 'dash-acme-overview',
      tenantId: TENANT_IDS.acme,
      name: 'Experimentation Overview',
      description: 'High-level KPIs and traffic distribution across all active experiments',
      widgets: [
        kpiWidget('w-a1', 'Total Requests',    0, 0, 'requests',    'Traffic'),
        kpiWidget('w-a2', 'Success Rate',      3, 0, 'successRate', 'Traffic'),
        kpiWidget('w-a3', 'Error Rate',        6, 0, 'errorRate',   'Traffic'),
        kpiWidget('w-a4', 'Avg Latency',       9, 0, 'avgLatency',  'Traffic'),
        barWidget('w-a5', 'Requests by Variant', 0, 2, 'requests', 'variant'),
        tableWidget('w-a6', 'Traffic by Variant (SQL)', 6, 2),
        pieWidget('w-a7', 'Status Distribution', 0, 5, 'requests'),
        {
          id: 'w-a8',
          type: 'BAR',
          title: 'Latency by Variant',
          position: { col: 4, row: 5, colSpan: 8, rowSpan: 3 },
          queryConfig: { mode: 'builder', dataset: 'Traffic', metric: 'avgLatency', aggregation: 'avg', groupBy: 'variant', timeRange: 'all', filters: {} },
        },
      ],
      createdAt: ts(25),
      updatedAt: ts(1),
    },
    {
      id: 'dash-acme-revenue',
      tenantId: TENANT_IDS.acme,
      name: 'Revenue & Conversion Metrics',
      description: 'Business metric KPIs correlated with experiment variants',
      widgets: [
        kpiWidget('w-r1', 'Conversion Rate',  0, 0, 'conversion_rate', 'BusinessMetrics'),
        kpiWidget('w-r2', 'Revenue Events',   3, 0, 'revenue_usd',     'BusinessMetrics'),
        kpiWidget('w-r3', 'Checkout Events',  6, 0, 'checkout_completed', 'BusinessMetrics'),
        {
          id: 'w-r4',
          type: 'BAR',
          title: 'Revenue by Segment (SQL)',
          position: { col: 0, row: 2, colSpan: 12, rowSpan: 4 },
          queryConfig: { mode: 'sql', sqlText: 'SELECT metricKey, avg(value) FROM business_metrics GROUP BY metricKey' },
        },
      ],
      createdAt: ts(18),
      updatedAt: ts(3),
    },
  ];

  // ---- TechStart Dashboards ----
  const techstartDashboards: Dashboard[] = [
    {
      id: 'dash-ts-onboarding',
      tenantId: TENANT_IDS.techstart,
      name: 'Onboarding Funnel Dashboard',
      description: 'Track the A/B test performance on the new onboarding flow',
      widgets: [
        kpiWidget('w-ts1', 'Total Sessions',  0, 0, 'requests',    'Traffic'),
        kpiWidget('w-ts2', 'Success Rate',    3, 0, 'successRate', 'Traffic'),
        kpiWidget('w-ts3', 'Avg Latency',     6, 0, 'avgLatency',  'Traffic'),
        barWidget('w-ts4', 'Sessions by Variant', 0, 2, 'requests', 'variant'),
        pieWidget('w-ts5', 'Request Status', 6, 2, 'requests'),
      ],
      createdAt: ts(14),
      updatedAt: ts(2),
    },
  ];

  // ---- Global Enterprises Dashboards ----
  const globalDashboards: Dashboard[] = [
    {
      id: 'dash-gl-fraud',
      tenantId: TENANT_IDS.global,
      name: 'Fraud Detection Performance',
      description: 'Champion vs Challenger scoring for fraud detection model experiment',
      widgets: [
        kpiWidget('w-gl1', 'Transactions Scored', 0, 0, 'requests',    'Traffic'),
        kpiWidget('w-gl2', 'Success Rate',         3, 0, 'successRate', 'Traffic'),
        kpiWidget('w-gl3', 'p95 Latency',          6, 0, 'p95Latency',  'Traffic'),
        kpiWidget('w-gl4', 'Error Rate',            9, 0, 'errorRate',   'Traffic'),
        barWidget('w-gl5', 'Scoring Volume by Model', 0, 2, 'requests', 'variant'),
        barWidget('w-gl6', 'Latency by Model',       6, 2, 'avgLatency', 'variant'),
        {
          id: 'w-gl7',
          type: 'TABLE',
          title: 'Status by Model (SQL)',
          position: { col: 0, row: 5, colSpan: 12, rowSpan: 3 },
          queryConfig: { mode: 'sql', sqlText: 'SELECT status, count(*) FROM traffic GROUP BY status' },
        },
      ],
      createdAt: ts(55),
      updatedAt: ts(0),
    },
  ];

  // ---- Research Labs Dashboards ----
  const researchDashboards: Dashboard[] = [
    {
      id: 'dash-rl-model',
      tenantId: TENANT_IDS.research,
      name: 'Model Comparison Dashboard',
      description: 'CNN vs Transformer model performance for drug interaction prediction',
      widgets: [
        kpiWidget('w-rl1', 'Samples Processed', 0, 0, 'requests',    'Traffic'),
        kpiWidget('w-rl2', 'Success Rate',       3, 0, 'successRate', 'Traffic'),
        kpiWidget('w-rl3', 'Avg Latency (ms)',   6, 0, 'avgLatency',  'Traffic'),
        barWidget('w-rl4', 'Predictions by Model', 0, 2, 'requests', 'variant'),
        pieWidget('w-rl5', 'Status Distribution',  6, 2, 'requests'),
      ],
      createdAt: ts(35),
      updatedAt: ts(6),
    },
  ];

  store[TENANT_IDS.acme]     = acmeDashboards;
  store[TENANT_IDS.techstart] = techstartDashboards;
  store[TENANT_IDS.global]   = globalDashboards;
  store[TENANT_IDS.research] = researchDashboards;
  return store;
}

export const SEED_DASHBOARDS_STORE = buildDashboardStore();
