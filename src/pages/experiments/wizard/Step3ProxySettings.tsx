import React from 'react';
import { Input, Select } from '../../../components/ui';
import type { WizardFormState } from './types';

interface Props {
  form: WizardFormState;
  errors: Record<string, string>;
  onChange: (updates: Partial<WizardFormState>) => void;
}

const BUCKETING_SOURCE_OPTIONS = [
  { value: 'header', label: 'Request Header' },
  { value: 'jsonpath', label: 'JSONPath in Request Body' },
];

const EXECUTION_MODE_OPTIONS = [
  { value: 'parallel', label: 'Parallel — run simultaneously, discard challenger response' },
  { value: 'sequential', label: 'Sequential — run champion first, then challenger' },
];

export const Step3ProxySettings: React.FC<Props> = ({ form, errors, onChange }) => {
  return (
    <div className="space-y-5">
      <Input
        label="Correlation ID Header Name"
        value={form.correlationIdHeaderName}
        onChange={e => onChange({ correlationIdHeaderName: e.target.value })}
        placeholder="x-correlation-id"
        error={errors.correlationIdHeaderName}
      />
      <p className="text-xs text-muted-foreground -mt-3">
        The proxy will read this header from incoming requests and propagate it to upstream calls for tracing.
      </p>

      {form.type === 'AB' && (
        <div className="space-y-4">
          <Select
            label="Bucketing Key Source"
            options={BUCKETING_SOURCE_OPTIONS}
            value={form.bucketingKeySource}
            onChange={e => onChange({ bucketingKeySource: e.target.value as 'header' | 'jsonpath' })}
          />
          <Input
            label={
              form.bucketingKeySource === 'header'
                ? 'Header Name *'
                : 'JSONPath Expression *'
            }
            value={form.bucketingKeyValue}
            onChange={e => onChange({ bucketingKeyValue: e.target.value })}
            placeholder={
              form.bucketingKeySource === 'header'
                ? 'e.g. x-user-id'
                : 'e.g. $.userId'
            }
            error={errors.bucketingKeyValue}
          />
          <p className="text-xs text-muted-foreground">
            {form.bucketingKeySource === 'header'
              ? 'The value of this header will be hashed to consistently route users to a variant.'
              : 'This JSONPath expression will be evaluated on the request body to extract the bucketing key.'}
          </p>
        </div>
      )}

      {form.type === 'CC' && (
        <Select
          label="Challenger Execution Mode"
          options={EXECUTION_MODE_OPTIONS}
          value={form.executionMode}
          onChange={e => onChange({ executionMode: e.target.value as 'parallel' | 'sequential' })}
        />
      )}
    </div>
  );
};
