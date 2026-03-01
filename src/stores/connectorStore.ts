import { create } from 'zustand';
import type { Connector, CreateConnector } from '../domain';
import { connectorService } from '../services/mock';

interface ConnectorState {
  connectors: Connector[];
  currentConnector: Connector | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadConnectors: (tenantId: string) => Promise<void>;
  loadConnector: (tenantId: string, id: string) => Promise<void>;
  createConnector: (tenantId: string, input: CreateConnector) => Promise<Connector>;
  updateFieldMappings: (tenantId: string, id: string, mappings: Connector['fieldMappings']) => Promise<void>;
  toggleStatus: (tenantId: string, id: string) => Promise<void>;
  deleteConnector: (tenantId: string, id: string) => Promise<void>;
  runOnce: (tenantId: string, id: string) => Promise<{ eventsGenerated: number }>;
  clearCurrent: () => void;
}

export const useConnectorStore = create<ConnectorState>((set, get) => ({
  connectors: [],
  currentConnector: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadConnectors: async (tenantId) => {
    set({ isLoading: true, error: null });
    try {
      const connectors = await connectorService.list(tenantId);
      set({ connectors, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed to load connectors' });
    }
  },

  loadConnector: async (tenantId, id) => {
    set({ isLoading: true, error: null });
    try {
      const connector = await connectorService.get(tenantId, id);
      set({ currentConnector: connector, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed to load connector' });
    }
  },

  createConnector: async (tenantId, input) => {
    set({ isSaving: true, error: null });
    try {
      const connector = await connectorService.create(tenantId, input);
      set({ connectors: [...get().connectors, connector], isSaving: false });
      return connector;
    } catch (e) {
      set({ isSaving: false, error: e instanceof Error ? e.message : 'Failed to create connector' });
      throw e;
    }
  },

  updateFieldMappings: async (tenantId, id, mappings) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await connectorService.updateFieldMappings(tenantId, id, mappings);
      set({
        connectors: get().connectors.map(c => (c.id === id ? updated : c)),
        currentConnector: get().currentConnector?.id === id ? updated : get().currentConnector,
        isSaving: false,
      });
    } catch (e) {
      set({ isSaving: false, error: e instanceof Error ? e.message : 'Failed to update mappings' });
    }
  },

  toggleStatus: async (tenantId, id) => {
    try {
      const updated = await connectorService.toggleStatus(tenantId, id);
      set({ connectors: get().connectors.map(c => (c.id === id ? updated : c)) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to toggle status' });
    }
  },

  deleteConnector: async (tenantId, id) => {
    try {
      await connectorService.delete(tenantId, id);
      set({ connectors: get().connectors.filter(c => c.id !== id) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete connector' });
    }
  },

  runOnce: async (tenantId, id) => {
    try {
      const result = await connectorService.runOnce(tenantId, id);
      const updated = await connectorService.get(tenantId, id);
      set({ connectors: get().connectors.map(c => (c.id === id ? updated : c)) });
      return result;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to run connector' });
      throw e;
    }
  },

  clearCurrent: () => set({ currentConnector: null }),
}));
