import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConnectorStore, useTenantStore } from '../../stores';
import { Button, Card, Spinner } from '../../components/ui';
import type { ConnectorFieldMapping } from '../../domain';

const CANONICAL_FIELDS = [
  { field: 'correlationId',       label: 'Correlation ID',       required: true,  hint: 'Join key — links this metric to a traffic record' },
  { field: 'timestamp',           label: 'Timestamp',            required: true,  hint: 'Event time. Accepts ISO 8601 or unix epoch (seconds)' },
  { field: 'metricKey',           label: 'Metric Key',           required: true,  hint: 'Metric name, e.g. conversion_rate, revenue_usd' },
  { field: 'value',               label: 'Value',                required: true,  hint: 'The metric value — number, string, or boolean' },
  { field: 'dimensions.segment',  label: 'Dimension: segment',   required: false, hint: 'User segment or cohort dimension' },
  { field: 'dimensions.currency', label: 'Dimension: currency',  required: false, hint: 'ISO 4217 currency code dimension' },
  { field: 'dimensions.country',  label: 'Dimension: country',   required: false, hint: 'ISO 3166 country code dimension' },
  { field: 'dimensions.platform', label: 'Dimension: platform',  required: false, hint: 'Platform or device type dimension' },
];

const SAMPLE_REST_PAYLOAD = {
  id: 'ch_3N8abc',
  metadata: {
    correlationId: 'corr-abc123-xyz789',
    experiment_key: 'checkout_button_cta',
  },
  amount: 4999,
  currency: 'usd',
  status: 'succeeded',
  created: 1704067200,
  customer: { segment: 'premium', country: 'US' },
};

const SAMPLE_DB_PAYLOAD = {
  correlation_id: 'corr-abc123-xyz789',
  metric_key: 'conversion_rate',
  value: 0.3421,
  user_segment: 'premium',
  created_at: '2024-01-15T09:30:00Z',
  platform: 'web',
};

function resolveJsonPath(obj: Record<string, unknown>, path: string): unknown {
  if (!path) return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export const ConnectorMappingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { currentConnector, isLoading, isSaving, loadConnector, updateFieldMappings } = useConnectorStore();

  const [mappings, setMappings] = useState<ConnectorFieldMapping[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentTenant && id) {
      loadConnector(currentTenant.id, id);
    }
  }, [currentTenant, id, loadConnector]);

  useEffect(() => {
    if (currentConnector) {
      setMappings(currentConnector.fieldMappings ?? []);
    }
  }, [currentConnector]);

  const getMappingPath = (field: string) =>
    mappings.find(m => m.canonicalField === field)?.sourcePath ?? '';

  const handleChange = (field: string, path: string) => {
    setSaved(false);
    setMappings(prev => {
      const idx = prev.findIndex(m => m.canonicalField === field);
      if (idx === -1) return path ? [...prev, { canonicalField: field, sourcePath: path }] : prev;
      const next = [...prev];
      if (!path) return next.filter((_, i) => i !== idx);
      next[idx] = { canonicalField: field, sourcePath: path };
      return next;
    });
  };

  const handleSave = async () => {
    if (!currentTenant || !id) return;
    await updateFieldMappings(currentTenant.id, id, mappings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const samplePayload = currentConnector?.type === 'REST_PULL' ? SAMPLE_REST_PAYLOAD : SAMPLE_DB_PAYLOAD;
  const preview = CANONICAL_FIELDS.reduce<Record<string, unknown>>((acc, { field }) => {
    const path = getMappingPath(field);
    if (path) acc[field] = resolveJsonPath(samplePayload as Record<string, unknown>, path) ?? `<no match for "${path}">`;
    return acc;
  }, {});

  if (isLoading || !currentConnector) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  const requiredFieldsMapped = CANONICAL_FIELDS.filter(f => f.required).every(f => getMappingPath(f.field).trim().length > 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => navigate('/app/connectors')} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Field Mapping</h1>
          <p className="text-sm text-muted-foreground">{currentConnector.name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {saved && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Saved
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || !requiredFieldsMapped}>
            {isSaving ? <><Spinner size="sm" /> Saving...</> : 'Save Mappings'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card padding="sm">
            <div className="px-2 py-1 mb-4">
              <h3 className="text-sm font-semibold text-foreground">Canonical Field Mappings</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Map each canonical field to the corresponding path in your source payload using dot notation.</p>
            </div>

            <div className="divide-y divide-border">
              {CANONICAL_FIELDS.map(({ field, label, required, hint }) => (
                <div key={field} className="py-3 px-2 flex items-start gap-3">
                  <div className="w-40 shrink-0 pt-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      {required && <span className="text-[10px] text-destructive font-bold">*</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{hint}</p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`source.field.path`}
                      value={getMappingPath(field)}
                      onChange={e => handleChange(field, e.target.value)}
                      className={`w-full h-8 px-3 bg-background border rounded-[var(--radius)] text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all ${required && !getMappingPath(field) ? 'border-destructive/40' : 'border-input'}`}
                    />
                  </div>
                  <div className="w-5 shrink-0 pt-1.5">
                    {getMappingPath(field) ? (
                      resolveJsonPath(samplePayload as Record<string, unknown>, getMappingPath(field)) !== undefined ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-500" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      )
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-3">Sample Source Payload</h3>
            <pre className="text-[11px] font-mono text-muted-foreground bg-muted rounded-[var(--radius)] p-3 overflow-x-auto max-h-56">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </Card>

          <Card padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-1">Transformed Preview</h3>
            <p className="text-xs text-muted-foreground mb-3">Result of applying your mappings to the sample payload.</p>
            {Object.keys(preview).length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Configure at least one mapping to see a preview.</p>
            ) : (
              <div className="space-y-2">
                {CANONICAL_FIELDS.filter(f => preview[f.field] !== undefined).map(({ field, label }) => (
                  <div key={field} className="flex gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground w-32 shrink-0">{label}</span>
                    <span className={`text-[11px] font-mono truncate ${typeof preview[field] === 'string' && (preview[field] as string).includes('no match') ? 'text-amber-600' : 'text-primary'}`}>
                      {String(preview[field])}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {!requiredFieldsMapped && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-[var(--radius)]">
              <p className="text-xs text-destructive font-medium">Required fields missing</p>
              <p className="text-xs text-muted-foreground mt-0.5">Map all required fields (*) before saving.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
