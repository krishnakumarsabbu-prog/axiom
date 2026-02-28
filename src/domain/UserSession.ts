import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'viewer']),
  tenantIds: z.array(z.string()),
});

export type User = z.infer<typeof UserSchema>;

export const UserSessionSchema = z.object({
  user: UserSchema,
  token: z.string(),
  expiresAt: z.string(),
  activeTenantId: z.string(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
