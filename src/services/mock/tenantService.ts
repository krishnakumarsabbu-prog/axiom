import type { Tenant } from '../../domain';
import { mockTenants } from './data';

export const tenantService = {
  async listTenants(tenantIds?: string[]): Promise<Tenant[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (tenantIds && tenantIds.length > 0) {
      return mockTenants.filter(t => tenantIds.includes(t.id));
    }

    return mockTenants;
  },

  async getTenant(tenantId: string): Promise<Tenant | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const tenant = mockTenants.find(t => t.id === tenantId);
    return tenant;
  }
};
