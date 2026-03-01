import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResponseFieldMapping } from '../../../domain/mapping';
import { extractByPath, formatExtractedValue } from '../../../domain/mapping';
import { Badge } from '../../../components/ui';

interface Props {
  mapping: ResponseFieldMapping;
  tenantId: string;
  experimentId: string;
  experimentType: 'AB' | 'CC';
}

interface VariantValues {
  variant: string;
  value: unknown;
  found: boolean;
  values: unknown[];
}

function getRecordsByVariant(tenantId: string, experimentId: string): Record<string, Array<{ response: { bodyJson?: unknown }; status: string }>> {
  const TRAFFIC_KEY = 'experiment-portal-traffic';
  try {
    const raw = localStorage.getItem(TRAFFIC_KEY);
    if (!raw) return {};
    const store: Record<string, Array<{ assignedVariant: string; response: { bodyJson?: unknown }; status: string }>> = JSON.parse(raw);
    const key = `${tenantId}::${experimentId}`;
    const records = store[key] ?? [];
    const byVariant: Record<string, Array<{ response: { bodyJson?: unknown }; status: string }>> = {};
    for (const r of records) {
      if (!byVariant[r.assignedVariant]) byVariant[r.assignedVariant] = [];
      byVariant[r.assignedVariant].push(r);
    }
    return byVariant;
  } catch {
    return {};
  }
}

interface FieldHighlightProps {
  displayName: string;
  jsonPath: string;
  dataType: string;
  variantA: VariantValues;
  variantB: VariantValues;
  labelA: string;
  labelB: string;
  badgeVariantA: 'info' | 'success' | 'default';
  badgeVariantB: 'info' | 'success' | 'default' | 'warning';
}

const FieldHighlight: React.FC<FieldHighlightProps> = ({
  displayName, jsonPath, dataType, variantA, variantB, labelA, labelB, badgeVariantA, badgeVariantB,
}) => {
  const numericAvg = (vals: unknown[]): string => {
    const nums = vals.filter(v => typeof v === 'number') as number[];
    if (nums.length === 0) return '—';
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return avg.toFixed(4);
  };

  const renderValue = (vv: VariantValues) => {
    if (!vv.found) return <span className="text-muted-foreground">—</span>;
    const display = formatExtractedValue(vv.value);
    return <span className="font-mono text-foreground">{display || '—'}</span>;
  };

  return (
    <div className="bg-card border border-border rounded-[var(--radius)] p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{jsonPath}</p>
        </div>
        <Badge variant="default" size="sm">{dataType}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary border border-border rounded-[var(--radius)] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Badge variant={badgeVariantA} size="sm">{labelA}</Badge>
          </div>
          <p className="text-lg font-display font-bold text-foreground truncate">
            {renderValue(variantA)}
          </p>
          {dataType === 'number' && variantA.values.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              avg: <span className="font-mono text-foreground">{numericAvg(variantA.values)}</span>
              <span className="ml-1.5">({variantA.values.length} samples)</span>
            </p>
          )}
        </div>
        <div className="bg-secondary border border-border rounded-[var(--radius)] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Badge variant={badgeVariantB} size="sm">{labelB}</Badge>
          </div>
          <p className="text-lg font-display font-bold text-foreground truncate">
            {renderValue(variantB)}
          </p>
          {dataType === 'number' && variantB.values.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              avg: <span className="font-mono text-foreground">{numericAvg(variantB.values)}</span>
              <span className="ml-1.5">({variantB.values.length} samples)</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const MappingHighlightCards: React.FC<Props> = ({
  mapping, tenantId, experimentId, experimentType,
}) => {
  const navigate = useNavigate();
  const [recordsByVariant, setRecordsByVariant] = useState<Record<string, Array<{ response: { bodyJson?: unknown }; status: string }>>>({});

  useEffect(() => {
    setRecordsByVariant(getRecordsByVariant(tenantId, experimentId));
  }, [tenantId, experimentId]);

  if (mapping.fields.length === 0) return null;

  const variantPairs = experimentType === 'CC'
    ? [{ a: 'CHAMPION', b: 'CHALLENGER', labelA: 'Champion', labelB: 'Challenger', bvA: 'success' as const, bvB: 'warning' as const }]
    : [{ a: 'A', b: 'B', labelA: 'Variant A', labelB: 'Variant B', bvA: 'info' as const, bvB: 'default' as const }];

  const getVariantValues = (variant: string, jsonPath: string): VariantValues => {
    const records = recordsByVariant[variant] ?? [];
    const successRecords = records.filter(r => r.status === 'SUCCESS');
    const values = successRecords
      .map(r => extractByPath(r.response?.bodyJson, jsonPath))
      .filter(v => v !== undefined);
    const latest = values[values.length - 1];
    return { variant, value: latest, found: latest !== undefined, values };
  };

  const fieldsToShow = mapping.fields.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Response Highlights</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Extracted from latest traffic records</p>
        </div>
        <button
          onClick={() => navigate(`/app/experiments/${experimentId}/mapping`)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit Mapping
        </button>
      </div>
      <div className="space-y-3">
        {fieldsToShow.map(field => {
          const pair = variantPairs[0];
          const shouldShow =
            field.variantScope === 'ALL' ||
            field.variantScope === pair.a ||
            field.variantScope === pair.b;

          if (!shouldShow) return null;

          const vaValues = getVariantValues(pair.a, field.jsonPath);
          const vbValues = getVariantValues(pair.b, field.jsonPath);

          return (
            <FieldHighlight
              key={field.key}
              displayName={field.displayName}
              jsonPath={field.jsonPath}
              dataType={field.dataType}
              variantA={vaValues}
              variantB={vbValues}
              labelA={pair.labelA}
              labelB={pair.labelB}
              badgeVariantA={pair.bvA}
              badgeVariantB={pair.bvB}
            />
          );
        })}
      </div>
    </div>
  );
};
