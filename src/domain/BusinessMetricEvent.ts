export interface BusinessMetricEvent {
  id: string;
  tenantId: string;
  timestamp: string;
  correlationId: string;
  metricKey: string;
  value: number | string | boolean;
  dimensions: Record<string, string>;
  sourceConnectorId: string;
  connectorName?: string;
}

export interface BusinessMetricFilter {
  tenantId: string;
  metricKey?: string;
  correlationId?: string;
  connectorId?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d' | 'all';
}
