import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['active', 'inactive', 'suspended']),
  config: z.record(z.string(), z.unknown()).optional(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateTenant = z.infer<typeof CreateTenantSchema>;
