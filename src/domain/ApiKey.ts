import { z } from 'zod';

export const ApiKeySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  key: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  lastUsedAt: z.string().optional(),
  status: z.enum(['active', 'revoked', 'expired']),
  scopes: z.array(z.string()).optional(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

export const CreateApiKeySchema = ApiKeySchema.omit({
  id: true,
  key: true,
  createdAt: true,
  lastUsedAt: true,
});

export type CreateApiKey = z.infer<typeof CreateApiKeySchema>;
