import type { Connector, CreateConnector } from '../../domain';
import { metricsService } from './metricsService';

const STORAGE_KEY = 'ep-connectors';

function generateId(): string {
  return `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function loadStore(): Record<string, Connector[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, Connector[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

function getForTenant(tenantId: string): Connector[] {
  return loadStore()[tenantId] ?? [];
}

function saveForTenant(tenantId: string, connectors: Connector[]): void {
  const store = loadStore();
  store[tenantId] = connectors;
  saveStore(store);
}

const SEED_CONNECTORS: Omit<Connector, 'tenantId'>[] = [
  {
    id: 'conn-seed-1',
    name: 'Stripe Revenue API',
    description: 'Pulls payment and revenue metrics from Stripe',
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
      { canonicalField: 'correlationId', sourcePath: 'metadata.correlationId' },
      { canonicalField: 'timestamp', sourcePath: 'created' },
      { canonicalField: 'metricKey', sourcePath: 'metadata.experiment_key' },
      { canonicalField: 'value', sourcePath: 'amount' },
      { canonicalField: 'dimensions.currency', sourcePath: 'currency' },
      { canonicalField: 'dimensions.status', sourcePath: 'status' },
    ],
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-25T14:30:00Z',
    lastRunAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastRunStatus: 'success',
    lastRunCount: 47,
  },
  {
    id: 'conn-seed-2',
    name: 'Analytics Postgres DB',
    description: 'Polls conversion and engagement metrics from analytics database',
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
      { canonicalField: 'correlationId', sourcePath: 'correlation_id' },
      { canonicalField: 'timestamp', sourcePath: 'created_at' },
      { canonicalField: 'metricKey', sourcePath: 'metric_key' },
      { canonicalField: 'value', sourcePath: 'value' },
      { canonicalField: 'dimensions.segment', sourcePath: 'user_segment' },
    ],
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-15T08:20:00Z',
    lastRunAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    lastRunStatus: 'success',
    lastRunCount: 128,
  },
];

function ensureSeed(tenantId: string): void {
  const existing = getForTenant(tenantId);
  if (existing.length === 0) {
    saveForTenant(tenantId, SEED_CONNECTORS.map(c => ({ ...c, tenantId })));
  }
}

export const connectorService = {
  async list(tenantId: string): Promise<Connector[]> {
    await new Promise(r => setTimeout(r, 150));
    ensureSeed(tenantId);
    return getForTenant(tenantId);
  },

  async get(tenantId: string, id: string): Promise<Connector> {
    await new Promise(r => setTimeout(r, 100));
    ensureSeed(tenantId);
    const connector = getForTenant(tenantId).find(c => c.id === id);
    if (!connector) throw new Error(`Connector ${id} not found`);
    return connector;
  },

  async create(tenantId: string, input: CreateConnector): Promise<Connector> {
    await new Promise(r => setTimeout(r, 300));
    const connector: Connector = {
      ...input,
      id: generateId(),
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveForTenant(tenantId, [...getForTenant(tenantId), connector]);
    return connector;
  },

  async update(tenantId: string, id: string, patch: Partial<CreateConnector>): Promise<Connector> {
    await new Promise(r => setTimeout(r, 200));
    const existing = getForTenant(tenantId);
    const idx = existing.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Connector ${id} not found`);
    existing[idx] = { ...existing[idx], ...patch, updatedAt: new Date().toISOString() };
    saveForTenant(tenantId, existing);
    return existing[idx];
  },

  async updateFieldMappings(tenantId: string, id: string, fieldMappings: Connector['fieldMappings']): Promise<Connector> {
    return connectorService.update(tenantId, id, { fieldMappings } as Partial<CreateConnector>);
  },

  async toggleStatus(tenantId: string, id: string): Promise<Connector> {
    await new Promise(r => setTimeout(r, 200));
    const existing = getForTenant(tenantId);
    const idx = existing.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Connector ${id} not found`);
    existing[idx] = { ...existing[idx], status: existing[idx].status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE', updatedAt: new Date().toISOString() };
    saveForTenant(tenantId, existing);
    return existing[idx];
  },

  async delete(tenantId: string, id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    saveForTenant(tenantId, getForTenant(tenantId).filter(c => c.id !== id));
  },

  async testConnection(_tenantId: string, id: string): Promise<{ success: boolean; message: string; samplePayload?: unknown }> {
    await new Promise(r => setTimeout(r, 1800 + Math.random() * 500));
    const store = loadStore();
    let connector: Connector | undefined;
    for (const connectors of Object.values(store)) {
      connector = connectors.find(c => c.id === id);
      if (connector) break;
    }
    if (!connector) return { success: false, message: 'Connector not found.' };

    if (Math.random() > 0.15) {
      const samplePayload = connector.type === 'REST_PULL'
        ? [
            { id: 'evt_001', metadata: { correlationId: 'corr-abc123', experiment_key: 'checkout_cta' }, amount: 4999, currency: 'usd', status: 'succeeded', created: new Date().toISOString() },
            { id: 'evt_002', metadata: { correlationId: 'corr-def456', experiment_key: 'checkout_cta' }, amount: 2499, currency: 'eur', status: 'succeeded', created: new Date().toISOString() },
          ]
        : [
            { correlation_id: 'corr-abc123', metric_key: 'conversion_rate', value: 0.34, user_segment: 'premium', created_at: new Date().toISOString() },
            { correlation_id: 'corr-def456', metric_key: 'conversion_rate', value: 0.29, user_segment: 'standard', created_at: new Date().toISOString() },
          ];
      return { success: true, message: `Connected. Received ${samplePayload.length} sample records.`, samplePayload };
    }
    return { success: false, message: 'Connection timeout: endpoint did not respond within 5s.' };
  },

  async runOnce(tenantId: string, id: string): Promise<{ eventsGenerated: number }> {
    await new Promise(r => setTimeout(r, 800));
    const connector = await connectorService.get(tenantId, id);
    const count = await metricsService.ingestForConnector(tenantId, connector);
    const existing = getForTenant(tenantId);
    const idx = existing.findIndex(c => c.id === id);
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], lastRunAt: new Date().toISOString(), lastRunStatus: 'success', lastRunCount: count, updatedAt: new Date().toISOString() };
      saveForTenant(tenantId, existing);
    }
    return { eventsGenerated: count };
  },
};
