import { z } from 'zod';

export const TrafficRequestSchema = z.object({
  method: z.string(),
  url: z.string(),
  headers: z.record(z.string(), z.string()),
  query: z.record(z.string(), z.string()),
  bodyJson: z.unknown().optional(),
  rawBodyText: z.string().optional(),
});

export type TrafficRequest = z.infer<typeof TrafficRequestSchema>;

export const TrafficResponseSchema = z.object({
  status: z.number(),
  headers: z.record(z.string(), z.string()),
  bodyJson: z.unknown().optional(),
  rawBodyText: z.string().optional(),
});

export type TrafficResponse = z.infer<typeof TrafficResponseSchema>;

export const TrafficTimingsSchema = z.object({
  totalMs: z.number(),
  upstreamMs: z.number(),
  processingMs: z.number(),
});

export type TrafficTimings = z.infer<typeof TrafficTimingsSchema>;

export const TrafficRecordSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  experimentId: z.string(),
  timestamp: z.string(),
  correlationId: z.string(),
  correlationIdSource: z.enum(['request', 'generated']),
  assignedVariant: z.enum(['A', 'B', 'CHAMPION', 'CHALLENGER']),
  request: TrafficRequestSchema,
  response: TrafficResponseSchema,
  timings: TrafficTimingsSchema,
  status: z.enum(['SUCCESS', 'FAIL']),
  errorMessage: z.string().optional(),
  memoryMb: z.number().optional(),
});

export type TrafficRecord = z.infer<typeof TrafficRecordSchema>;

export interface TrafficListFilter {
  tenantId: string;
  experimentId: string;
  timeRange?: '5m' | '15m' | '1h' | '6h' | '24h' | 'all';
  searchCorrelationId?: string;
  variant?: TrafficRecord['assignedVariant'] | '';
  status?: TrafficRecord['status'] | '';
}
