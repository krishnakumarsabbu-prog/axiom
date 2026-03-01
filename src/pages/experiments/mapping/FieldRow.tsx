import React, { useState, useEffect } from 'react';
import type { FieldMappingItem } from '../../../domain/mapping';
import { formatExtractedValue } from '../../../domain/mapping';
import { Input, Select } from '../../../components/ui';

interface Props {
  field: FieldMappingItem;
  index: number;
  sampleBody: unknown;
  onChange: (index: number, updated: FieldMappingItem) => void;
  onRemove: (index: number) => void;
  onPreview: (jsonPath: string) => Promise<{ extractedValue: unknown; found: boolean }>;
}

const DATA_TYPE_OPTIONS = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
];

const VARIANT_SCOPE_OPTIONS = [
  { value: 'ALL', label: 'All Variants' },
  { value: 'A', label: 'Variant A' },
  { value: 'B', label: 'Variant B' },
  { value: 'CHAMPION', label: 'Champion' },
  { value: 'CHALLENGER', label: 'Challenger' },
];

export const FieldRow: React.FC<Props> = ({ field, index, onChange, onRemove, onPreview }) => {
  const [preview, setPreview] = useState<{ value: unknown; found: boolean } | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [pathInput, setPathInput] = useState(field.jsonPath);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPathInput(field.jsonPath);
  }, [field.jsonPath]);

  const handlePathChange = (val: string) => {
    setPathInput(val);
    onChange(index, { ...field, jsonPath: val });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(async () => {
        setIsPreviewing(true);
        try {
          const result = await onPreview(val.trim());
          setPreview({ value: result.extractedValue, found: result.found });
        } catch {
          setPreview(null);
        } finally {
          setIsPreviewing(false);
        }
      }, 400);
    } else {
      setPreview(null);
    }
  };

  const previewDisplay = isPreviewing
    ? '...'
    : preview === null
    ? null
    : preview.found
    ? formatExtractedValue(preview.value)
    : 'not found';

  return (
    <div className="bg-secondary border border-border rounded-[var(--radius)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Field {index + 1}</span>
        <button
          onClick={() => onRemove(index)}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Display Name"
          value={field.displayName}
          onChange={e => onChange(index, { ...field, displayName: e.target.value })}
          placeholder="e.g. Prediction Score"
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">JSONPath</label>
          <input
            value={pathInput}
            onChange={e => handlePathChange(e.target.value)}
            placeholder="e.g. prediction or results[0].score"
            className="w-full h-10 px-3 bg-card border border-input rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono text-sm transition-colors"
          />
          {previewDisplay !== null && (
            <div className={`mt-1.5 flex items-center gap-1.5 ${preview?.found === false ? 'text-yellow-400' : 'text-green-400'}`}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <circle cx="5" cy="5" r="5"/>
              </svg>
              <span className="text-xs font-mono truncate max-w-[220px]">{previewDisplay}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Data Type"
          options={DATA_TYPE_OPTIONS}
          value={field.dataType}
          onChange={e => onChange(index, { ...field, dataType: e.target.value as FieldMappingItem['dataType'] })}
        />
        <Select
          label="Variant Scope"
          options={VARIANT_SCOPE_OPTIONS}
          value={field.variantScope}
          onChange={e => onChange(index, { ...field, variantScope: e.target.value as FieldMappingItem['variantScope'] })}
        />
      </div>
    </div>
  );
};
