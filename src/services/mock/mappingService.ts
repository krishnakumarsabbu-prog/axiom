import type { ResponseFieldMapping, FieldMappingItem, MappingPreviewResult } from '../../domain/mapping';
import { extractByPath } from '../../domain/mapping';

const STORAGE_KEY = 'experiment-portal-mappings';

function generateId(): string {
  return `map-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateFieldKey(): string {
  return `field-${Math.random().toString(36).substring(2, 8)}`;
}

function loadStore(): Record<string, ResponseFieldMapping> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, ResponseFieldMapping>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
  }
}

function storeKey(tenantId: string, experimentId: string): string {
  return `${tenantId}::${experimentId}`;
}

function getLatestResponseBody(tenantId: string, experimentId: string, variant?: string): unknown {
  const TRAFFIC_KEY = 'experiment-portal-traffic';
  try {
    const raw = localStorage.getItem(TRAFFIC_KEY);
    if (!raw) return null;
    const store: Record<string, unknown[]> = JSON.parse(raw);
    const key = `${tenantId}::${experimentId}`;
    const records = (store[key] as Array<{
      assignedVariant: string;
      response: { bodyJson?: unknown };
    }> | undefined) ?? [];

    const filtered = variant
      ? records.filter(r => r.assignedVariant === variant)
      : records;

    if (filtered.length === 0) return null;
    const latest = filtered[filtered.length - 1];
    return latest.response?.bodyJson ?? null;
  } catch {
    return null;
  }
}

export const mappingService = {
  async get(tenantId: string, experimentId: string): Promise<ResponseFieldMapping | null> {
    await new Promise(r => setTimeout(r, 80));
    const store = loadStore();
    return store[storeKey(tenantId, experimentId)] ?? null;
  },

  async save(
    tenantId: string,
    experimentId: string,
    fields: FieldMappingItem[],
  ): Promise<ResponseFieldMapping> {
    await new Promise(r => setTimeout(r, 120));
    const store = loadStore();
    const key = storeKey(tenantId, experimentId);
    const existing = store[key];
    const now = new Date().toISOString();

    const mapping: ResponseFieldMapping = {
      id: existing?.id ?? generateId(),
      tenantId,
      experimentId,
      fields: fields.map(f => ({ ...f, key: f.key || generateFieldKey() })),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    store[key] = mapping;
    saveStore(store);
    return mapping;
  },

  async preview(
    tenantId: string,
    experimentId: string,
    jsonPath: string,
    variant?: string,
  ): Promise<MappingPreviewResult> {
    await new Promise(r => setTimeout(r, 60));
    const rawBody = getLatestResponseBody(tenantId, experimentId, variant);
    if (rawBody === null) {
      return { jsonPath, variant: variant ?? 'ALL', extractedValue: undefined, rawBody: null, found: false };
    }
    const extractedValue = extractByPath(rawBody, jsonPath);
    return {
      jsonPath,
      variant: variant ?? 'ALL',
      extractedValue,
      rawBody,
      found: extractedValue !== undefined,
    };
  },

  generateFieldKey,
};
