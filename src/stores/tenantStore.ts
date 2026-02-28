import { create } from 'zustand';
import type { Tenant } from '../domain';
import { tenantService } from '../services/mock';

interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | undefined;
  isLoading: boolean;
  loadTenants: (tenantIds: string[]) => Promise<void>;
  setCurrentTenant: (tenantId: string) => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenants: [],
  currentTenant: undefined,
  isLoading: false,

  loadTenants: async (tenantIds: string[]) => {
    set({ isLoading: true });
    try {
      const tenants = await tenantService.listTenants(tenantIds);
      set({ tenants, isLoading: false });
    } catch (error) {
      console.error('Failed to load tenants:', error);
      set({ isLoading: false });
    }
  },

  setCurrentTenant: async (tenantId: string) => {
    const { tenants } = get();
    let tenant = tenants.find(t => t.id === tenantId);

    if (!tenant) {
      set({ isLoading: true });
      try {
        tenant = await tenantService.getTenant(tenantId);
        set({ currentTenant: tenant, isLoading: false });
      } catch (error) {
        console.error('Failed to load tenant:', error);
        set({ isLoading: false });
      }
    } else {
      set({ currentTenant: tenant });
    }
  }
}));
