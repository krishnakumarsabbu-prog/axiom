import type {
  Experiment,
  ExperimentDetail,
  CreateExperiment,
  ABConfig,
  CCConfig,
  ProxyConfig,
} from '../../domain';

const STORAGE_KEY = 'experiment-portal-experiments';

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface StoredExperiment {
  experiment: Experiment;
  config: ABConfig | CCConfig;
  proxyConfig: ProxyConfig;
}

function loadStore(): Record<string, StoredExperiment[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, StoredExperiment[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getForTenant(tenantId: string): StoredExperiment[] {
  const store = loadStore();
  return store[tenantId] ?? [];
}

function setForTenant(tenantId: string, items: StoredExperiment[]): void {
  const store = loadStore();
  store[tenantId] = items;
  saveStore(store);
}

export const experimentService = {
  async list(tenantId: string): Promise<Experiment[]> {
    await new Promise(r => setTimeout(r, 200));
    return getForTenant(tenantId).map(s => s.experiment);
  },

  async get(tenantId: string, experimentId: string): Promise<ExperimentDetail | null> {
    await new Promise(r => setTimeout(r, 150));
    const stored = getForTenant(tenantId).find(s => s.experiment.id === experimentId);
    if (!stored) return null;
    return {
      ...stored.experiment,
      config: stored.config,
      proxyConfig: stored.proxyConfig,
    };
  },

  async create(tenantId: string, input: CreateExperiment): Promise<ExperimentDetail> {
    await new Promise(r => setTimeout(r, 400));

    const now = new Date().toISOString();
    const id = generateId();

    const experiment: Experiment = {
      id,
      tenantId,
      name: input.name,
      description: input.description,
      type: input.type,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      correlationIdHeaderName: input.correlationIdHeaderName ?? 'x-correlation-id',
    };

    let config: ABConfig | CCConfig;
    if (input.type === 'AB') {
      if (!input.abConfig) throw new Error('AB config required for AB experiments');
      config = input.abConfig;
    } else {
      if (!input.ccConfig) throw new Error('CC config required for CC experiments');
      config = input.ccConfig;
    }

    const proxyConfig: ProxyConfig = {
      proxyBaseUrl: 'https://proxy.yourcompany.com',
      proxyPath: `/t/${tenantId}/exp/${id}`,
      apiKey: generateApiKey(),
      correlationIdHeaderName: experiment.correlationIdHeaderName,
    };

    const stored: StoredExperiment = { experiment, config, proxyConfig };
    const existing = getForTenant(tenantId);
    setForTenant(tenantId, [...existing, stored]);

    return { ...experiment, config, proxyConfig };
  },

  async updateStatus(
    tenantId: string,
    experimentId: string,
    status: Experiment['status'],
  ): Promise<Experiment> {
    await new Promise(r => setTimeout(r, 200));

    const items = getForTenant(tenantId);
    const idx = items.findIndex(s => s.experiment.id === experimentId);
    if (idx === -1) throw new Error('Experiment not found');

    const updated: StoredExperiment = {
      ...items[idx],
      experiment: {
        ...items[idx].experiment,
        status,
        updatedAt: new Date().toISOString(),
      },
    };
    const next = [...items];
    next[idx] = updated;
    setForTenant(tenantId, next);

    return updated.experiment;
  },

  async delete(tenantId: string, experimentId: string): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    const items = getForTenant(tenantId).filter(s => s.experiment.id !== experimentId);
    setForTenant(tenantId, items);
  },
};
