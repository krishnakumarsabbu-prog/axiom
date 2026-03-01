import React from 'react';
import type { WizardFormState } from './types';

interface Props {
  form: WizardFormState;
}

const Field: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground font-medium text-right max-w-[60%] break-all">{value ?? '—'}</span>
  </div>
);

const EndpointSummary: React.FC<{ label: string; url: string; method: string; timeoutMs: number }> = ({
  label, url, method, timeoutMs,
}) => (
  <div className="p-3 bg-muted/40 rounded-[var(--radius)] border border-border space-y-1.5">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm text-foreground">
      <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded mr-2">{method}</span>
      {url}
    </p>
    <p className="text-xs text-muted-foreground">Timeout: {timeoutMs}ms</p>
  </div>
);

export const Step4Review: React.FC<Props> = ({ form }) => {
  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-[var(--radius)] px-4 divide-y divide-border">
        <Field label="Name" value={form.name} />
        <Field label="Type" value={form.type === 'AB' ? 'A/B Test' : 'Champion/Challenger'} />
        {form.description && <Field label="Description" value={form.description} />}
        <Field label="Correlation ID Header" value={form.correlationIdHeaderName} />
        {form.type === 'AB' && (
          <>
            <Field label="Traffic Split" value={`${form.splitA}% / ${form.splitB}%`} />
            <Field
              label="Bucketing Key"
              value={`${form.bucketingKeySource === 'header' ? 'Header' : 'JSONPath'}: ${form.bucketingKeyValue}`}
            />
          </>
        )}
        {form.type === 'CC' && (
          <Field label="Execution Mode" value={form.executionMode} />
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Endpoints</p>
        {form.type === 'AB' ? (
          <>
            <EndpointSummary label="Variant A" url={form.variantA.url} method={form.variantA.method} timeoutMs={form.variantA.timeoutMs} />
            <EndpointSummary label="Variant B" url={form.variantB.url} method={form.variantB.method} timeoutMs={form.variantB.timeoutMs} />
          </>
        ) : (
          <>
            <EndpointSummary label="Champion" url={form.champion.url} method={form.champion.method} timeoutMs={form.champion.timeoutMs} />
            <EndpointSummary label="Challenger" url={form.challenger.url} method={form.challenger.method} timeoutMs={form.challenger.timeoutMs} />
          </>
        )}
      </div>

      <div className="p-4 bg-muted/30 border border-border rounded-[var(--radius)]">
        <p className="text-sm text-muted-foreground">
          After creation, a proxy URL and API key will be generated. The experiment will be
          created in <span className="text-foreground font-medium">draft</span> status — activate
          it when you're ready to start routing traffic.
        </p>
      </div>
    </div>
  );
};
