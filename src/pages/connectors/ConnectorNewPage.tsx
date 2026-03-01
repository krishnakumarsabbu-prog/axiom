import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectorStore, useTenantStore } from '../../stores';
import { connectorService } from '../../services/mock';
import { Button, Input, Spinner } from '../../components/ui';
import type { ConnectorType, RestPullConfig, DbPollConfig, ConnectorFieldMapping } from '../../domain';

type Step = 1 | 2 | 3 | 4;

interface WizardState {
  type: ConnectorType | null;
  name: string;
  description: string;
  intervalSeconds: number;
  restConfig: Partial<RestPullConfig>;
  dbConfig: Partial<DbPollConfig>;
}

const CANONICAL_FIELDS = [
  { field: 'correlationId', label: 'Correlation ID', required: true, hint: 'Links metric to a traffic record' },
  { field: 'timestamp', label: 'Timestamp', required: true, hint: 'Event time (ISO 8601 or unix epoch)' },
  { field: 'metricKey', label: 'Metric Key', required: true, hint: 'Metric name, e.g. conversion_rate' },
  { field: 'value', label: 'Value', required: true, hint: 'Numeric, string, or boolean metric value' },
  { field: 'dimensions.segment', label: 'Dimension: segment', required: false, hint: 'User segment dimension' },
  { field: 'dimensions.currency', label: 'Dimension: currency', required: false, hint: 'Currency code dimension' },
];

const StepIndicator: React.FC<{ currentStep: Step; steps: string[] }> = ({ currentStep, steps }) => (
  <div className="flex items-center gap-0 mb-8">
    {steps.map((label, idx) => {
      const step = (idx + 1) as Step;
      const isDone = currentStep > step;
      const isCurrent = currentStep === step;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-muted text-muted-foreground border border-border'}`}>
              {isDone ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : step}
            </div>
            <span className={`text-[10px] mt-1 whitespace-nowrap ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mt-[-10px] ${isDone ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const Step1SelectType: React.FC<{
  selected: ConnectorType | null;
  onSelect: (type: ConnectorType) => void;
}> = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-display font-semibold text-foreground mb-1">Select Connector Type</h2>
    <p className="text-sm text-muted-foreground mb-6">Choose how this connector will retrieve data from your system.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {([
        {
          type: 'REST_PULL' as ConnectorType,
          title: 'REST Pull',
          description: 'Periodically pulls records from an HTTP endpoint. Ideal for REST APIs, webhooks, and JSON/XML feeds.',
          features: ['HTTP GET or POST', 'Bearer / Basic auth', 'Custom headers & query params', 'JSON response parsing'],
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          ),
        },
        {
          type: 'DB_POLL' as ConnectorType,
          title: 'Database Poll',
          description: 'Executes a SQL query against a relational database to fetch metrics on a schedule.',
          features: ['PostgreSQL, MySQL, MSSQL', 'Custom SQL query', 'Parameterized with :lastRun', 'Column-to-field mapping'],
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          ),
        },
      ] as const).map(({ type, title, description, features, icon }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`text-left p-5 rounded-[var(--radius)] border-2 transition-all hover:border-primary/40 ${selected === type ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${selected === type ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {icon}
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
          <ul className="space-y-1">
            {features.map(f => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={selected === type ? 'text-primary' : ''}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  </div>
);

const Step2Configure: React.FC<{
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}> = ({ state, onChange }) => {
  const setRest = (patch: Partial<RestPullConfig>) =>
    onChange({ restConfig: { ...state.restConfig, ...patch } });
  const setDb = (patch: Partial<DbPollConfig>) =>
    onChange({ dbConfig: { ...state.dbConfig, ...patch } });

  return (
    <div>
      <h2 className="text-lg font-display font-semibold text-foreground mb-1">Configure Connector</h2>
      <p className="text-sm text-muted-foreground mb-6">Provide connection details and schedule settings.</p>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Connector Name" placeholder="e.g. Stripe Revenue API" value={state.name} onChange={e => onChange({ name: e.target.value })} required />
          <Input label="Description" placeholder="Brief description of this connector" value={state.description} onChange={e => onChange({ description: e.target.value })} />
        </div>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-foreground mb-1.5">Poll Interval (seconds)</label>
          <input
            type="number"
            min={30}
            max={86400}
            value={state.intervalSeconds}
            onChange={e => onChange({ intervalSeconds: parseInt(e.target.value) || 300 })}
            className="w-full h-9 px-3 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Minimum 30s. Common: 300 (5m), 600 (10m), 3600 (1h)</p>
        </div>

        {state.type === 'REST_PULL' && (
          <div className="space-y-4 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2">REST Configuration</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input label="Endpoint URL" placeholder="https://api.example.com/v1/metrics" value={state.restConfig.url ?? ''} onChange={e => setRest({ url: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Method</label>
                <select
                  value={state.restConfig.method ?? 'GET'}
                  onChange={e => setRest({ method: e.target.value as 'GET' | 'POST' })}
                  className="w-full h-9 px-3 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Auth Type</label>
                <select
                  value={state.restConfig.authType ?? 'none'}
                  onChange={e => setRest({ authType: e.target.value as 'none' | 'basic' | 'bearer' })}
                  className="w-full h-9 px-3 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="none">None</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>
              {state.restConfig.authType !== 'none' && (
                <Input label="Auth Value" placeholder={state.restConfig.authType === 'bearer' ? 'your_token' : 'username:password'} value={state.restConfig.authValue ?? ''} onChange={e => setRest({ authValue: e.target.value })} />
              )}
            </div>
            <Input label="Response Array Path" placeholder="data (or data.items for nested)" value={state.restConfig.responseArrayPath ?? ''} onChange={e => setRest({ responseArrayPath: e.target.value })} hint="JSON path to the array of records in the response" />
          </div>
        )}

        {state.type === 'DB_POLL' && (
          <div className="space-y-4 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2">Database Configuration</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Dialect</label>
              <select
                value={state.dbConfig.dialect ?? 'postgresql'}
                onChange={e => setDb({ dialect: e.target.value as 'postgresql' | 'mysql' | 'mssql' })}
                className="w-full h-9 px-3 bg-background border border-input rounded-[var(--radius)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mssql">Microsoft SQL Server</option>
              </select>
            </div>
            <Input label="JDBC URL" placeholder="jdbc:postgresql://host:5432/dbname" value={state.dbConfig.jdbcUrl ?? ''} onChange={e => setDb({ jdbcUrl: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Username" placeholder="readonly_user" value={state.dbConfig.username ?? ''} onChange={e => setDb({ username: e.target.value })} />
              <Input label="Password" type="password" placeholder="••••••••" value={state.dbConfig.password ?? ''} onChange={e => setDb({ password: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">SQL Query</label>
              <textarea
                value={state.dbConfig.query ?? ''}
                onChange={e => setDb({ query: e.target.value })}
                rows={4}
                placeholder="SELECT correlation_id, metric_key, value, created_at FROM metrics WHERE created_at > :lastRun"
                className="w-full px-3 py-2 bg-background border border-input rounded-[var(--radius)] text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded text-[11px]">:lastRun</code> to filter records since the last successful run.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Step3Test: React.FC<{
  state: WizardState;
  tenantId: string;
  testResult: { success: boolean; message: string; samplePayload?: unknown } | null;
  isTesting: boolean;
  onTest: () => void;
}> = ({ state, testResult, isTesting, onTest }) => (
  <div>
    <h2 className="text-lg font-display font-semibold text-foreground mb-1">Test Connection</h2>
    <p className="text-sm text-muted-foreground mb-6">Verify the connector can reach your data source and preview a sample payload.</p>

    <div className="bg-muted rounded-[var(--radius)] p-4 mb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Connector Summary</p>
      <p className="text-sm font-medium text-foreground">{state.name}</p>
      <p className="text-xs text-muted-foreground">{state.type === 'REST_PULL' ? (state.restConfig.url ?? '—') : (state.dbConfig.jdbcUrl ?? '—')}</p>
    </div>

    {!testResult && !isTesting && (
      <Button variant="primary" size="md" onClick={onTest}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Test Connection
      </Button>
    )}

    {isTesting && (
      <div className="flex items-center gap-3 py-4">
        <Spinner size="sm" />
        <span className="text-sm text-muted-foreground">Connecting to {state.type === 'REST_PULL' ? 'endpoint' : 'database'}...</span>
      </div>
    )}

    {testResult && (
      <div className="space-y-4">
        <div className={`flex items-start gap-3 p-4 rounded-[var(--radius)] border ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-destructive/10 border-destructive/20'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${testResult.success ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'}`}>
            {testResult.success ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            )}
          </div>
          <div>
            <p className={`text-sm font-medium ${testResult.success ? 'text-emerald-700' : 'text-destructive'}`}>
              {testResult.success ? 'Connection Successful' : 'Connection Failed'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{testResult.message}</p>
          </div>
          {!testResult.success && (
            <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={onTest}>Retry</Button>
          )}
        </div>

        {!!testResult.samplePayload && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Sample Payload (first 2 records)</p>
            <pre className="bg-muted border border-border rounded-[var(--radius)] p-4 text-xs font-mono text-foreground overflow-x-auto max-h-48">
              {JSON.stringify(testResult.samplePayload as Record<string, unknown>, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )}
  </div>
);

const Step4Review: React.FC<{
  state: WizardState;
  mappings: ConnectorFieldMapping[];
  onMappingChange: (field: string, path: string) => void;
}> = ({ state, mappings, onMappingChange }) => {
  const getMappingPath = (field: string) => mappings.find(m => m.canonicalField === field)?.sourcePath ?? '';

  return (
    <div>
      <h2 className="text-lg font-display font-semibold text-foreground mb-1">Field Mapping & Review</h2>
      <p className="text-sm text-muted-foreground mb-6">Map source payload fields to canonical metric fields, then save your connector.</p>

      <div className="space-y-6">
        <div className="bg-muted rounded-[var(--radius)] p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Connector Summary</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{state.name}</span></div>
            <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground">{state.type === 'REST_PULL' ? 'REST Pull' : 'DB Poll'}</span></div>
            <div><span className="text-muted-foreground">Schedule:</span> <span className="font-medium text-foreground">Every {state.intervalSeconds}s</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="font-medium text-foreground">ACTIVE</span></div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Field Mappings</p>
          <p className="text-xs text-muted-foreground mb-3">Enter the source field path for each canonical field. For nested JSON use dot notation: <code className="bg-muted px-1 rounded">metadata.correlationId</code></p>
          <div className="space-y-3">
            {CANONICAL_FIELDS.map(({ field, label, required, hint }) => (
              <div key={field} className="flex items-start gap-3">
                <div className="w-44 shrink-0 pt-2">
                  <p className="text-xs font-medium text-foreground">{label}{required && <span className="text-destructive ml-0.5">*</span>}</p>
                  <p className="text-[10px] text-muted-foreground">{hint}</p>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`source path, e.g. ${field.replace('dimensions.', '')}`}
                    value={getMappingPath(field)}
                    onChange={e => onMappingChange(field, e.target.value)}
                    className="w-full h-8 px-3 bg-background border border-input rounded-[var(--radius)] text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConnectorNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { createConnector, isSaving } = useConnectorStore();
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>({
    type: null,
    name: '',
    description: '',
    intervalSeconds: 300,
    restConfig: { method: 'GET', authType: 'none', headers: {}, queryParams: {} },
    dbConfig: { dialect: 'postgresql' },
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; samplePayload?: unknown } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [mappings, setMappings] = useState<ConnectorFieldMapping[]>([]);

  const update = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }));

  const canProceed = (): boolean => {
    if (step === 1) return state.type !== null;
    if (step === 2) return state.name.trim().length > 0 && (
      state.type === 'REST_PULL' ? !!(state.restConfig.url) : !!(state.dbConfig.jdbcUrl && state.dbConfig.query)
    );
    if (step === 3) return testResult?.success === true;
    return true;
  };

  const handleTest = async () => {
    if (!currentTenant || !state.type) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const tempId = `temp-${Date.now()}`;
      const result = await connectorService.testConnection(currentTenant.id, tempId);
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Unexpected error during connection test.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleMappingChange = (field: string, path: string) => {
    setMappings(prev => {
      const idx = prev.findIndex(m => m.canonicalField === field);
      if (idx === -1) return [...prev, { canonicalField: field, sourcePath: path }];
      const next = [...prev];
      next[idx] = { canonicalField: field, sourcePath: path };
      return next.filter(m => m.sourcePath.trim().length > 0);
    });
  };

  const handleSave = async () => {
    if (!currentTenant || !state.type) return;
    const config = state.type === 'REST_PULL'
      ? { url: state.restConfig.url!, method: state.restConfig.method ?? 'GET', headers: state.restConfig.headers ?? {}, queryParams: state.restConfig.queryParams ?? {}, authType: state.restConfig.authType ?? 'none', authValue: state.restConfig.authValue ?? '', responseArrayPath: state.restConfig.responseArrayPath ?? 'data' }
      : { jdbcUrl: state.dbConfig.jdbcUrl!, username: state.dbConfig.username ?? '', password: state.dbConfig.password ?? '', query: state.dbConfig.query!, dialect: state.dbConfig.dialect ?? 'postgresql' };

    await createConnector(currentTenant.id, {
      tenantId: currentTenant.id,
      name: state.name,
      description: state.description,
      type: state.type,
      config,
      schedule: { intervalSeconds: state.intervalSeconds },
      status: 'ACTIVE',
      fieldMappings: mappings,
    });
    navigate('/app/connectors');
  };

  const STEP_LABELS = ['Select Type', 'Configure', 'Test', 'Mapping & Save'];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => navigate('/app/connectors')} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">New Connector</h1>
          <p className="text-sm text-muted-foreground">Set up a data source for business metrics ingestion</p>
        </div>
      </div>

      <StepIndicator currentStep={step} steps={STEP_LABELS} />

      <div className="bg-card border border-border rounded-[var(--radius)] p-6 shadow-card">
        {step === 1 && <Step1SelectType selected={state.type} onSelect={t => update({ type: t })} />}
        {step === 2 && <Step2Configure state={state} onChange={update} />}
        {step === 3 && state.type && currentTenant && (
          <Step3Test state={state} tenantId={currentTenant.id} testResult={testResult} isTesting={isTesting} onTest={handleTest} />
        )}
        {step === 4 && <Step4Review state={state} mappings={mappings} onMappingChange={handleMappingChange} />}
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" size="md" onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate('/app/connectors')}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <div className="flex items-center gap-3">
          {step === 3 && !testResult?.success && (
            <Button variant="secondary" size="md" onClick={() => setStep(4)}>
              Skip Test
            </Button>
          )}
          {step < 4 ? (
            <Button variant="primary" size="md" disabled={!canProceed()} onClick={() => setStep((step + 1) as Step)}>
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Spinner size="sm" /> Saving...</> : 'Save Connector'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
