import { z } from 'zod';

export const FieldMappingItemSchema = z.object({
  key: z.string().min(1),
  displayName: z.string().min(1),
  jsonPath: z.string().min(1),
  dataType: z.enum(['string', 'number', 'boolean']),
  variantScope: z.enum(['ALL', 'A', 'B', 'CHAMPION', 'CHALLENGER']),
});

export type FieldMappingItem = z.infer<typeof FieldMappingItemSchema>;

export const ResponseFieldMappingSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  experimentId: z.string(),
  fields: z.array(FieldMappingItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ResponseFieldMapping = z.infer<typeof ResponseFieldMappingSchema>;

export const CreateFieldMappingItemSchema = FieldMappingItemSchema.omit({ key: true }).extend({
  key: z.string().optional(),
});

export type CreateFieldMappingItem = z.infer<typeof CreateFieldMappingItemSchema>;

export interface MappingPreviewResult {
  jsonPath: string;
  variant: string;
  extractedValue: unknown;
  rawBody: unknown;
  found: boolean;
}
