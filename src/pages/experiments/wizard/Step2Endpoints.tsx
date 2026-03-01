import React from 'react';
import { Input } from '../../../components/ui';
import { EndpointForm } from './EndpointForm';
import type { WizardFormState } from './types';

interface Props {
  form: WizardFormState;
  errors: Record<string, string>;
  onChange: (updates: Partial<WizardFormState>) => void;
}

export const Step2Endpoints: React.FC<Props> = ({ form, errors, onChange }) => {
  if (form.type === 'AB') {
    return (
      <div className="space-y-5">
        <EndpointForm
          label="Variant A"
          value={form.variantA}
          errors={{ url: errors['variantA.url'] }}
          onChange={variantA => onChange({ variantA })}
        />
        <EndpointForm
          label="Variant B"
          value={form.variantB}
          errors={{ url: errors['variantB.url'] }}
          onChange={variantB => onChange({ variantB })}
        />
        <div className="p-4 bg-secondary border border-border rounded-[var(--radius)]">
          <p className="text-sm font-semibold text-foreground mb-3">Traffic Split</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                label="Variant A (%)"
                type="number"
                min={1}
                max={99}
                value={form.splitA}
                onChange={e => {
                  const a = Math.min(99, Math.max(1, parseInt(e.target.value) || 1));
                  onChange({ splitA: a, splitB: 100 - a });
                }}
                error={errors.splitA}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Variant B (%)"
                type="number"
                min={1}
                max={99}
                value={form.splitB}
                onChange={e => {
                  const b = Math.min(99, Math.max(1, parseInt(e.target.value) || 1));
                  onChange({ splitB: b, splitA: 100 - b });
                }}
              />
            </div>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-200"
              style={{ width: `${form.splitA}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">A: {form.splitA}%</span>
            <span className="text-xs text-muted-foreground">B: {form.splitB}%</span>
          </div>
          {errors.splitA && <p className="mt-2 text-sm text-destructive">{errors.splitA}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <EndpointForm
        label="Champion"
        value={form.champion}
        errors={{ url: errors['champion.url'] }}
        onChange={champion => onChange({ champion })}
      />
      <EndpointForm
        label="Challenger"
        value={form.challenger}
        errors={{ url: errors['challenger.url'] }}
        onChange={challenger => onChange({ challenger })}
      />
    </div>
  );
};
