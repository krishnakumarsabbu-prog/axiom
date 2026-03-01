import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMappingStore, useExperimentStore, useTenantStore } from '../../../stores';
import { Button, Badge, Spinner } from '../../../components/ui';
import { FieldRow } from './FieldRow';
import { SampleResponsePanel } from './SampleResponsePanel';
import type { FieldMappingItem } from '../../../domain/mapping';

function generateKey(): string {
  return `field-${Math.random().toString(36).substring(2, 8)}`;
}

function newField(): FieldMappingItem {
  return {
    key: generateKey(),
    displayName: '',
    jsonPath: '',
    dataType: 'string',
    variantScope: 'ALL',
  };
}

function getLatestBodiesByVariant(tenantId: string, experimentId: string, variants: string[]): Record<string, unknown> {
  const TRAFFIC_KEY = 'experiment-portal-traffic';
  try {
    const raw = localStorage.getItem(TRAFFIC_KEY);
    if (!raw) return {};
    const store: Record<string, Array<{ assignedVariant: string; response: { bodyJson?: unknown } }>> = JSON.parse(raw);
    const key = `${tenantId}::${experimentId}`;
    const records = store[key] ?? [];
    const result: Record<string, unknown> = {};
    for (const variant of variants) {
      const matching = records.filter(r => r.assignedVariant === variant);
      if (matching.length > 0) {
        result[variant] = matching[matching.length - 1].response?.bodyJson ?? null;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export const MappingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { currentExperiment, loadExperiment } = useExperimentStore();
  const { mapping, isLoading, isSaving, loadMapping, saveMapping, previewField } = useMappingStore();

  const [fields, setFields] = useState<FieldMappingItem[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [sampleBodies, setSampleBodies] = useState<Record<string, unknown>>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  const expType = currentExperiment?.type ?? 'AB';
  const variants = expType === 'CC' ? ['CHAMPION', 'CHALLENGER'] : ['A', 'B'];

  useEffect(() => {
    if (!currentTenant || !id) return;
    if (!currentExperiment) {
      loadExperiment(currentTenant.id, id);
    }
    loadMapping(currentTenant.id, id).then(() => setHasLoaded(true));
    const bodies = getLatestBodiesByVariant(currentTenant.id, id, variants);
    setSampleBodies(bodies);
  }, [currentTenant?.id, id]);

  useEffect(() => {
    if (hasLoaded && mapping) {
      setFields(mapping.fields.length > 0 ? mapping.fields : [newField()]);
      setSavedAt(mapping.updatedAt);
    } else if (hasLoaded && !mapping) {
      setFields([newField()]);
    }
  }, [hasLoaded, mapping?.id]);

  const handleFieldChange = useCallback((index: number, updated: FieldMappingItem) => {
    setFields(prev => prev.map((f, i) => i === index ? updated : f));
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddField = () => {
    setFields(prev => [...prev, newField()]);
  };

  const handlePreview = useCallback(async (jsonPath: string) => {
    if (!currentTenant || !id) return { extractedValue: undefined, found: false };
    return previewField(currentTenant.id, id, jsonPath);
  }, [currentTenant?.id, id]);

  const handleSave = async () => {
    if (!currentTenant || !id) return;
    const validFields = fields.filter(f => f.displayName.trim() && f.jsonPath.trim());
    if (validFields.length === 0) return;
    try {
      await saveMapping(currentTenant.id, id, validFields);
      setSavedAt(new Date().toISOString());
    } catch {
    }
  };

  const expName = currentExperiment?.name ?? 'Experiment';

  if (isLoading && !hasLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/app/experiments/${id}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to {expName}
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{expName}</h1>
            {savedAt && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Last saved {new Date(savedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || fields.filter(f => f.displayName.trim() && f.jsonPath.trim()).length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Mapping'}
          </Button>
        </div>

        <div className="flex border-b border-border mt-4">
          <button
            onClick={() => navigate(`/app/experiments/${id}`)}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
          >
            Overview
          </button>
          <button
            onClick={() => navigate(`/app/experiments/${id}/traffic`)}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
          >
            Traffic Logs
          </button>
          <button
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-foreground text-foreground -mb-px"
          >
            Response Mapping
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Field Mappings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define which response fields to surface in the experiment dashboard.
              </p>
            </div>
            <Badge variant={expType === 'AB' ? 'info' : 'default'} size="sm">
              {expType === 'AB' ? 'A/B' : 'C/C'}
            </Badge>
          </div>

          {fields.length === 0 && (
            <div className="bg-card border border-border rounded-[var(--radius)] px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No fields defined yet.</p>
            </div>
          )}

          {fields.map((field, index) => (
            <FieldRow
              key={field.key}
              field={field}
              index={index}
              sampleBody={sampleBodies[field.variantScope === 'ALL' ? variants[0] : field.variantScope]}
              onChange={handleFieldChange}
              onRemove={handleRemove}
              onPreview={handlePreview}
            />
          ))}

          <button
            onClick={handleAddField}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-[var(--radius)] text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add Field
          </button>

          {fields.filter(f => f.displayName.trim() && f.jsonPath.trim()).length > 0 && (
            <div className="bg-card border border-border rounded-[var(--radius)] p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Mapping Preview</p>
              <div className="divide-y divide-border">
                {fields
                  .filter(f => f.displayName.trim() && f.jsonPath.trim())
                  .map(f => (
                    <div key={f.key} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm text-foreground font-medium">{f.displayName}</p>
                        <p className="text-xs font-mono text-muted-foreground">{f.jsonPath}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" size="sm">{f.dataType}</Badge>
                        <Badge variant={f.variantScope === 'ALL' ? 'default' : 'info'} size="sm">{f.variantScope}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Sample Response</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest traffic response per variant for path testing.
            </p>
          </div>
          <SampleResponsePanel samplesByVariant={sampleBodies} variants={variants} />

          <div className="bg-card border border-border rounded-[var(--radius)] p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">JSONPath Syntax</p>
            <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
              <div><span className="text-foreground">prediction</span> — top-level key</div>
              <div><span className="text-foreground">results.score</span> — nested key</div>
              <div><span className="text-foreground">items[0].value</span> — array index</div>
              <div><span className="text-foreground">data.predictions[2]</span> — deep array</div>
              <div><span className="text-foreground">$.prediction</span> — with root prefix</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
