import React from 'react';
import { Input, Select, Button } from '../../../components/ui';
import type { EndpointConfig } from '../../../domain';

interface EndpointErrors {
  url?: string;
  method?: string;
  timeoutMs?: string;
}

interface Props {
  label: string;
  value: EndpointConfig;
  errors?: EndpointErrors;
  onChange: (updated: EndpointConfig) => void;
}

const METHOD_OPTIONS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
];

export const EndpointForm: React.FC<Props> = ({ label, value, errors = {}, onChange }) => {
  const addHeader = () => {
    onChange({ ...value, headers: [...value.headers, { key: '', value: '' }] });
  };

  const removeHeader = (idx: number) => {
    onChange({ ...value, headers: value.headers.filter((_, i) => i !== idx) });
  };

  const updateHeader = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = value.headers.map((h, i) => i === idx ? { ...h, [field]: val } : h);
    onChange({ ...value, headers: updated });
  };

  return (
    <div className="p-4 bg-background border border-border rounded-[var(--radius)] space-y-4">
      <p className="text-sm font-semibold text-foreground">{label}</p>

      <div className="flex gap-3">
        <div className="w-28 shrink-0">
          <Select
            label="Method"
            options={METHOD_OPTIONS}
            value={value.method}
            onChange={e => onChange({ ...value, method: e.target.value as EndpointConfig['method'] })}
            error={errors.method}
          />
        </div>
        <div className="flex-1">
          <Input
            label="URL *"
            value={value.url}
            onChange={e => onChange({ ...value, url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
            error={errors.url}
          />
        </div>
      </div>

      <Input
        label="Timeout (ms)"
        type="number"
        min={100}
        max={60000}
        value={value.timeoutMs}
        onChange={e => onChange({ ...value, timeoutMs: parseInt(e.target.value) || 5000 })}
        error={errors.timeoutMs}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Headers</label>
          <Button variant="ghost" size="sm" type="button" onClick={addHeader}>
            + Add Header
          </Button>
        </div>
        {value.headers.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No custom headers configured.</p>
        ) : (
          <div className="space-y-2">
            {value.headers.map((h, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={h.key}
                  onChange={e => updateHeader(idx, 'key', e.target.value)}
                  placeholder="Header name"
                  className="flex-1"
                />
                <Input
                  value={h.value}
                  onChange={e => updateHeader(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(idx)}
                  className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
