import { z } from 'zod';

export const EndpointConfigSchema = z.object({
  url: z.string().url({ message: 'Must be a valid URL' }),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  headers: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  timeoutMs: z.number().int().min(100).max(60000).default(5000),
  tlsCertPlaceholder: z.string().optional(),
  tlsKeyPlaceholder: z.string().optional(),
});

export type EndpointConfig = z.infer<typeof EndpointConfigSchema>;

export const ABConfigSchema = z.object({
  variantA: EndpointConfigSchema,
  variantB: EndpointConfigSchema,
  splitA: z.number().min(1).max(99),
  splitB: z.number().min(1).max(99),
  bucketingKeySource: z.enum(['header', 'jsonpath']),
  bucketingKeyValue: z.string().min(1, 'Bucketing key is required'),
}).refine((d) => d.splitA + d.splitB === 100, {
  message: 'Split percentages must sum to 100',
  path: ['splitA'],
});

export type ABConfig = z.infer<typeof ABConfigSchema>;

export const CCConfigSchema = z.object({
  champion: EndpointConfigSchema,
  challenger: EndpointConfigSchema,
  executionMode: z.enum(['parallel', 'sequential']),
});

export type CCConfig = z.infer<typeof CCConfigSchema>;

export const ProxyConfigSchema = z.object({
  proxyBaseUrl: z.string(),
  proxyPath: z.string(),
  apiKey: z.string(),
  correlationIdHeaderName: z.string().default('x-correlation-id'),
});

export type ProxyConfig = z.infer<typeof ProxyConfigSchema>;

export const ExperimentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  type: z.enum(['AB', 'CC']),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string(),
  correlationIdHeaderName: z.string().default('x-correlation-id'),
});

export type Experiment = z.infer<typeof ExperimentSchema>;

export interface ExperimentDetail extends Experiment {
  config: ABConfig | CCConfig;
  proxyConfig: ProxyConfig;
}

export const CreateExperimentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  type: z.enum(['AB', 'CC']),
  correlationIdHeaderName: z.string().default('x-correlation-id'),
  abConfig: ABConfigSchema.optional(),
  ccConfig: CCConfigSchema.optional(),
});

export type CreateExperiment = z.infer<typeof CreateExperimentSchema>;
