import type { ProxyConfig } from '../../domain';
import { experimentService } from './experimentService';

export const proxyService = {
  async generateProxyConfig(tenantId: string, experimentId: string): Promise<ProxyConfig | null> {
    const detail = await experimentService.get(tenantId, experimentId);
    if (!detail) return null;
    return detail.proxyConfig;
  },
};
