import React from 'react';
import { Input, Select, Textarea } from '../../../components/ui';
import type { WizardFormState } from './types';

interface Props {
  form: WizardFormState;
  errors: Partial<Record<keyof WizardFormState, string>>;
  onChange: (updates: Partial<WizardFormState>) => void;
}

const TYPE_OPTIONS = [
  { value: 'AB', label: 'A/B Test — split traffic between two variants' },
  { value: 'CC', label: 'Champion/Challenger — compare a primary with a challenger' },
];

export const Step1BasicInfo: React.FC<Props> = ({ form, errors, onChange }) => {
  return (
    <div className="space-y-5">
      <Input
        label="Experiment Name *"
        value={form.name}
        onChange={e => onChange({ name: e.target.value })}
        placeholder="e.g. Checkout API Optimization"
        error={errors.name}
      />
      <Textarea
        label="Description"
        value={form.description}
        onChange={e => onChange({ description: e.target.value })}
        placeholder="Optional description of what this experiment tests..."
        rows={3}
      />
      <Select
        label="Experiment Type *"
        options={TYPE_OPTIONS}
        value={form.type}
        onChange={e => onChange({ type: e.target.value as 'AB' | 'CC' })}
        error={errors.type}
      />
      <div className={`p-4 rounded-[var(--radius)] border border-border bg-muted/40`}>
        {form.type === 'AB' ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">A/B Test:</span> Traffic is split between
            Variant A and Variant B using a configurable percentage. A bucketing key determines
            which variant each request receives.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Champion/Challenger:</span> All traffic
            hits the Champion endpoint. The Challenger runs in parallel or sequentially for
            comparison — its response is not returned to the caller.
          </p>
        )}
      </div>
    </div>
  );
};
