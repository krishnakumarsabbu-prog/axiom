import { z } from 'zod';

export const WidgetTypeSchema = z.enum(['KPI', 'TABLE', 'LINE', 'BAR', 'PIE']);
export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const DatasetSchema = z.enum(['Traffic', 'BusinessMetrics']);
export type Dataset = z.infer<typeof DatasetSchema>;

export const AggregationSchema = z.enum(['count', 'sum', 'avg', 'rate', 'p95', 'p50']);
export type Aggregation = z.infer<typeof AggregationSchema>;

export const BuilderQueryConfigSchema = z.object({
  mode: z.literal('builder'),
  dataset: DatasetSchema,
  metric: z.string().min(1),
  aggregation: AggregationSchema,
  groupBy: z.string().optional(),
  timeRange: z.enum(['5m', '15m', '1h', '6h', '24h', 'all']).default('all'),
  experimentId: z.string().optional(),
  filters: z.record(z.string(), z.string()).default({}),
});

export type BuilderQueryConfig = z.infer<typeof BuilderQueryConfigSchema>;

export const SqlQueryConfigSchema = z.object({
  mode: z.literal('sql'),
  sqlText: z.string().min(1, 'SQL is required'),
});

export type SqlQueryConfig = z.infer<typeof SqlQueryConfigSchema>;

export const QueryConfigSchema = z.discriminatedUnion('mode', [
  BuilderQueryConfigSchema,
  SqlQueryConfigSchema,
]);

export type QueryConfig = z.infer<typeof QueryConfigSchema>;

export const WidgetPositionSchema = z.object({
  col: z.number().int().min(0),
  row: z.number().int().min(0),
  colSpan: z.number().int().min(1).max(12),
  rowSpan: z.number().int().min(1).max(8),
});

export type WidgetPosition = z.infer<typeof WidgetPositionSchema>;

export const WidgetSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string().min(1),
  position: WidgetPositionSchema,
  queryConfig: QueryConfigSchema,
});

export type Widget = z.infer<typeof WidgetSchema>;

export const DashboardSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  widgets: z.array(WidgetSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Dashboard = z.infer<typeof DashboardSchema>;

export const CreateDashboardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type CreateDashboard = z.infer<typeof CreateDashboardSchema>;
