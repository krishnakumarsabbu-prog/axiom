export type ConnectorType = 'REST_PULL' | 'DB_POLL';
export type ConnectorStatus = 'ACTIVE' | 'PAUSED';
export type AuthType = 'none' | 'basic' | 'bearer';
export type DbDialect = 'postgresql' | 'mysql' | 'mssql';

export interface RestPullConfig {
  url: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  authType: AuthType;
  authValue: string;
  responseArrayPath: string;
}

export interface DbPollConfig {
  jdbcUrl: string;
  username: string;
  password: string;
  query: string;
  dialect: DbDialect;
}

export interface ConnectorSchedule {
  intervalSeconds: number;
}

export interface ConnectorFieldMapping {
  canonicalField: string;
  sourcePath: string;
}

export interface Connector {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: ConnectorType;
  config: RestPullConfig | DbPollConfig;
  schedule: ConnectorSchedule;
  status: ConnectorStatus;
  fieldMappings: ConnectorFieldMapping[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'error';
  lastRunCount?: number;
}

export type CreateConnector = Omit<Connector, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt' | 'lastRunStatus' | 'lastRunCount'>;
