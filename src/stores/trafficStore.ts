import { create } from 'zustand';
import type { TrafficRecord, TrafficListFilter } from '../domain';
import { trafficService } from '../services/mock';

interface TrafficState {
  records: TrafficRecord[];
  isLoading: boolean;
  isStreaming: boolean;
  streamIntervalId: ReturnType<typeof setInterval> | null;
  filter: Omit<TrafficListFilter, 'tenantId' | 'experimentId'>;

  loadRecords: (tenantId: string, experimentId: string) => Promise<void>;
  appendRecord: (record: TrafficRecord) => void;
  setFilter: (updates: Partial<Omit<TrafficListFilter, 'tenantId' | 'experimentId'>>) => void;
  startStreaming: (tenantId: string, experimentId: string, type: 'AB' | 'CC') => void;
  stopStreaming: () => void;
  seedRecords: (tenantId: string, experimentId: string, count: number, type: 'AB' | 'CC') => void;
  clearRecords: (tenantId: string, experimentId: string) => void;
  reset: () => void;
}

const defaultFilter: Omit<TrafficListFilter, 'tenantId' | 'experimentId'> = {
  timeRange: 'all',
  searchCorrelationId: '',
  variant: '',
  status: '',
};

export const useTrafficStore = create<TrafficState>((set, get) => ({
  records: [],
  isLoading: false,
  isStreaming: false,
  streamIntervalId: null,
  filter: { ...defaultFilter },

  loadRecords: async (tenantId: string, experimentId: string) => {
    const { filter } = get();
    set({ isLoading: true });
    try {
      const records = await trafficService.list({ tenantId, experimentId, ...filter });
      set({ records, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  appendRecord: (record: TrafficRecord) => {
    set(state => ({ records: [record, ...state.records] }));
  },

  setFilter: (updates) => {
    set(state => ({ filter: { ...state.filter, ...updates } }));
  },

  startStreaming: (tenantId: string, experimentId: string, type: 'AB' | 'CC') => {
    const { streamIntervalId } = get();
    if (streamIntervalId) clearInterval(streamIntervalId);

    const id = setInterval(() => {
      const record = trafficService.generateOne(tenantId, experimentId, type);
      get().appendRecord(record);
    }, 1200 + Math.random() * 800);

    set({ isStreaming: true, streamIntervalId: id });
  },

  stopStreaming: () => {
    const { streamIntervalId } = get();
    if (streamIntervalId) clearInterval(streamIntervalId);
    set({ isStreaming: false, streamIntervalId: null });
  },

  seedRecords: (tenantId: string, experimentId: string, count: number, type: 'AB' | 'CC') => {
    const records = trafficService.seedGenerateTraffic(tenantId, experimentId, count, type);
    set(state => ({
      records: [...records.reverse(), ...state.records],
    }));
  },

  clearRecords: (tenantId: string, experimentId: string) => {
    trafficService.clearAll(tenantId, experimentId);
    set({ records: [] });
  },

  reset: () => {
    const { streamIntervalId } = get();
    if (streamIntervalId) clearInterval(streamIntervalId);
    set({ records: [], isLoading: false, isStreaming: false, streamIntervalId: null, filter: { ...defaultFilter } });
  },
}));
