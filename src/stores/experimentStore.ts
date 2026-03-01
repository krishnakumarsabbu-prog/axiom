import { create } from 'zustand';
import type { Experiment, ExperimentDetail, CreateExperiment } from '../domain';
import { experimentService } from '../services/mock';

interface ExperimentState {
  experiments: Experiment[];
  currentExperiment: ExperimentDetail | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  loadExperiments: (tenantId: string) => Promise<void>;
  loadExperiment: (tenantId: string, id: string) => Promise<void>;
  createExperiment: (tenantId: string, input: CreateExperiment) => Promise<ExperimentDetail>;
  updateStatus: (tenantId: string, id: string, status: Experiment['status']) => Promise<void>;
  deleteExperiment: (tenantId: string, id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useExperimentStore = create<ExperimentState>((set, get) => ({
  experiments: [],
  currentExperiment: null,
  isLoading: false,
  isCreating: false,
  error: null,

  loadExperiments: async (tenantId: string) => {
    set({ isLoading: true, error: null });
    try {
      const experiments = await experimentService.list(tenantId);
      set({ experiments, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed to load experiments' });
    }
  },

  loadExperiment: async (tenantId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await experimentService.get(tenantId, id);
      set({ currentExperiment: detail, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed to load experiment' });
    }
  },

  createExperiment: async (tenantId: string, input: CreateExperiment) => {
    set({ isCreating: true, error: null });
    try {
      const detail = await experimentService.create(tenantId, input);
      const { experiments } = get();
      set({ experiments: [...experiments, detail], isCreating: false });
      return detail;
    } catch (e) {
      set({ isCreating: false, error: e instanceof Error ? e.message : 'Failed to create experiment' });
      throw e;
    }
  },

  updateStatus: async (tenantId: string, id: string, status: Experiment['status']) => {
    try {
      const updated = await experimentService.updateStatus(tenantId, id, status);
      const { experiments, currentExperiment } = get();
      set({
        experiments: experiments.map(e => e.id === id ? updated : e),
        currentExperiment: currentExperiment?.id === id
          ? { ...currentExperiment, ...updated }
          : currentExperiment,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update status' });
    }
  },

  deleteExperiment: async (tenantId: string, id: string) => {
    try {
      await experimentService.delete(tenantId, id);
      const { experiments } = get();
      set({ experiments: experiments.filter(e => e.id !== id) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete experiment' });
    }
  },

  clearCurrent: () => set({ currentExperiment: null }),
}));
