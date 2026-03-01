import { create } from 'zustand';
import type { ResponseFieldMapping, FieldMappingItem, MappingPreviewResult } from '../domain/mapping';
import { mappingService } from '../services/mock';

interface MappingState {
  mapping: ResponseFieldMapping | null;
  isLoading: boolean;
  isSaving: boolean;
  previews: Record<string, MappingPreviewResult>;

  loadMapping: (tenantId: string, experimentId: string) => Promise<void>;
  saveMapping: (tenantId: string, experimentId: string, fields: FieldMappingItem[]) => Promise<void>;
  previewField: (tenantId: string, experimentId: string, jsonPath: string, variant?: string) => Promise<MappingPreviewResult>;
  clearPreviews: () => void;
  reset: () => void;
}

export const useMappingStore = create<MappingState>((set, _get) => ({
  mapping: null,
  isLoading: false,
  isSaving: false,
  previews: {},

  loadMapping: async (tenantId: string, experimentId: string) => {
    set({ isLoading: true });
    try {
      const mapping = await mappingService.get(tenantId, experimentId);
      set({ mapping, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  saveMapping: async (tenantId: string, experimentId: string, fields: FieldMappingItem[]) => {
    set({ isSaving: true });
    try {
      const mapping = await mappingService.save(tenantId, experimentId, fields);
      set({ mapping, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('Failed to save mapping');
    }
  },

  previewField: async (tenantId: string, experimentId: string, jsonPath: string, variant?: string) => {
    const result = await mappingService.preview(tenantId, experimentId, jsonPath, variant);
    const key = `${jsonPath}::${variant ?? 'ALL'}`;
    set(state => ({ previews: { ...state.previews, [key]: result } }));
    return result;
  },

  clearPreviews: () => set({ previews: {} }),

  reset: () => set({ mapping: null, isLoading: false, isSaving: false, previews: {} }),
}));
