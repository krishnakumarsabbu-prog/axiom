import { create } from 'zustand';
import type { BusinessMetricEvent, BusinessMetricFilter } from '../domain';
import { metricsService } from '../services/mock';

interface MetricsState {
  events: BusinessMetricEvent[];
  distinctMetricKeys: string[];
  isLoading: boolean;
  error: string | null;
  activeFilter: BusinessMetricFilter | null;

  loadEvents: (filter: BusinessMetricFilter) => Promise<void>;
  loadDistinctMetricKeys: (tenantId: string) => Promise<void>;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  events: [],
  distinctMetricKeys: [],
  isLoading: false,
  error: null,
  activeFilter: null,

  loadEvents: async (filter) => {
    set({ isLoading: true, error: null, activeFilter: filter });
    try {
      const events = await metricsService.list(filter);
      set({ events, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed to load metrics' });
    }
  },

  loadDistinctMetricKeys: async (tenantId) => {
    try {
      const keys = await metricsService.getDistinctMetricKeys(tenantId);
      set({ distinctMetricKeys: keys });
    } catch {
      // non-critical
    }
  },
}));
