import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExperimentStore, useTenantStore, useMappingStore } from '../../stores';
import { Button, Badge, Card, Spinner, CopyButton } from '../../components/ui';
import type { Experiment, ABConfig, CCConfig } from '../../domain';
import { MappingHighlightCards } from './mapping/MappingHighlightCards';

const statusVariant: Record<Experiment['status'], 'default' | 'success' | 'warning' | 'danger'> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  archived: 'danger',
};

const STATUS_TRANSITIONS: Record<Experiment['status'], Experiment['status'] | null> = {
  draft: 'active',
  active: 'paused',
  paused: 'active',
  archived: null,
};

const STATUS_TRANSITION_LABELS: Record<Experiment['status'], string> = {
  draft: 'Activate',
  active: 'Pause',
  paused: 'Resume',
  archived: '',
};

function isABConfig(config: ABConfig | CCConfig): config is ABConfig {
  return 'variantA' in config;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">{title}</h3>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground font-medium text-right max-w-[65%] break-all">{value}</span>
  </div>
);

const EndpointCard: React.FC<{
  label: string;
  url: string;
  method: string;
  timeoutMs: number;
  headers: { key: string; value: string }[];
}> = ({ label, url, method, timeoutMs, headers }) => (
  <div className="p-4 bg-secondary border border-border rounded-[var(--radius)]">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{label}</p>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{method}</span>
        <span className="text-sm text-foreground break-all">{url}</span>
      </div>
      <p className="text-xs text-muted-foreground">Timeout: {timeoutMs}ms</p>
      {headers.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Custom Headers:</p>
          {headers.map((h, i) => (
            <p key={i} className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground">{h.key}</span>: {h.value}
            </p>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ProxyUrlBlock: React.FC<{ label: string; value: string; masked?: boolean }> = ({
  label,
  value,
  masked,
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <CopyButton value={value} />
    </div>
    <div className="flex items-center px-3 py-2.5 bg-secondary border border-border rounded-[var(--radius)] font-mono text-sm text-foreground break-all">
      {masked ? '•'.repeat(Math.min(value.length, 32)) : value}
    </div>
  </div>
);

export const ExperimentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { currentExperiment, isLoading, loadExperiment, updateStatus, clearCurrent } =
    useExperimentStore();
  const { mapping, loadMapping } = useMappingStore();

  useEffect(() => {
    if (currentTenant && id) {
      loadExperiment(currentTenant.id, id);
      loadMapping(currentTenant.id, id);
    }
    return () => clearCurrent();
  }, [currentTenant?.id, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentExperiment) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Experiment not found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/app/experiments')}>
            Back to Experiments
          </Button>
        </div>
      </div>
    );
  }

  const { config, proxyConfig } = currentExperiment;
  const ab = isABConfig(config) ? config : null;
  const cc = !isABConfig(config) ? config : null;
  const nextStatus = STATUS_TRANSITIONS[currentExperiment.status];

  const handleStatusChange = async () => {
    if (!currentTenant || !nextStatus) return;
    await updateStatus(currentTenant.id, currentExperiment.id, nextStatus);
  };

  const proxyUrl = `${proxyConfig.proxyBaseUrl}${proxyConfig.proxyPath}`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/app/experiments')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 2L4 7l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Experiments
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {currentExperiment.name}
            </h1>
            <Badge variant={statusVariant[currentExperiment.status]}>
              <span className="capitalize">{currentExperiment.status}</span>
            </Badge>
            <Badge variant={currentExperiment.type === 'AB' ? 'info' : 'default'}>
              {currentExperiment.type === 'AB' ? 'A/B' : 'C/C'}
            </Badge>
          </div>
          {currentExperiment.description && (
            <p className="text-muted-foreground">{currentExperiment.description}</p>
          )}
        </div>
        {nextStatus && (
          <Button
            variant={nextStatus === 'active' ? 'primary' : 'secondary'}
            onClick={handleStatusChange}
          >
            {STATUS_TRANSITION_LABELS[currentExperiment.status]}
          </Button>
        )}
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => navigate(`/app/experiments/${id}`)}
          className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-foreground text-foreground -mb-px"
        >
          Overview
        </button>
        <button
          onClick={() => navigate(`/app/experiments/${id}/dashboard`)}
          className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate(`/app/experiments/${id}/traffic`)}
          className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
        >
          Traffic Logs
        </button>
        <button
          onClick={() => navigate(`/app/experiments/${id}/mapping`)}
          className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
        >
          Response Mapping
        </button>
      </div>

      <div className="space-y-6">
        <Card padding="md">
          <SectionHeader title="Proxy Integration" />
          <div className="space-y-4">
            <ProxyUrlBlock label="Proxy URL" value={proxyUrl} />
            <ProxyUrlBlock label="API Key" value={proxyConfig.apiKey} masked />
            <div className="bg-secondary border border-border rounded-[var(--radius)] px-4 divide-y divide-border">
              <Field label="Correlation ID Header" value={proxyConfig.correlationIdHeaderName} />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <SectionHeader title="Traffic Summary" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Total Requests" value="—" subtitle="See Traffic Logs" link={`/app/experiments/${id}/traffic`} navigate={navigate} />
            {ab ? (
              <>
                <SummaryCard label="Variant A" value={`${ab.splitA}%`} subtitle="Target split" />
                <SummaryCard label="Variant B" value={`${ab.splitB}%`} subtitle="Target split" />
              </>
            ) : (
              <>
                <SummaryCard label="Champion" value="100%" subtitle="All traffic" />
                <SummaryCard
                  label="Challenger"
                  value={cc?.executionMode === 'parallel' ? 'Shadow' : 'Sequential'}
                  subtitle="Mode"
                />
              </>
            )}
            <SummaryCard label="Errors" value="—" subtitle="See Traffic Logs" link={`/app/experiments/${id}/traffic`} navigate={navigate} />
          </div>
        </Card>

        {mapping && mapping.fields.length > 0 && currentTenant && (
          <Card padding="md">
            <MappingHighlightCards
              mapping={mapping}
              tenantId={currentTenant.id}
              experimentId={currentExperiment.id}
              experimentType={currentExperiment.type}
            />
          </Card>
        )}

        {(!mapping || mapping.fields.length === 0) && (
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Response Highlights</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No field mappings configured yet.
                </p>
              </div>
              <button
                onClick={() => navigate(`/app/experiments/${id}/mapping`)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-[var(--radius)] px-3 py-1.5"
              >
                Configure Mapping
              </button>
            </div>
          </Card>
        )}

        <Card padding="md">
          <SectionHeader title="Experiment Configuration" />
          <div className="bg-secondary border border-border rounded-[var(--radius)] px-4 divide-y divide-border mb-4">
            <Field
              label="Created"
              value={new Date(currentExperiment.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            <Field
              label="Last Updated"
              value={new Date(currentExperiment.updatedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            <Field
              label="Experiment ID"
              value={<span className="font-mono text-xs">{currentExperiment.id}</span>}
            />
            {ab && (
              <>
                <Field
                  label="Traffic Split"
                  value={`Variant A ${ab.splitA}% / Variant B ${ab.splitB}%`}
                />
                <Field
                  label="Bucketing Key"
                  value={`${ab.bucketingKeySource === 'header' ? 'Header' : 'JSONPath'}: ${ab.bucketingKeyValue}`}
                />
              </>
            )}
            {cc && (
              <Field
                label="Execution Mode"
                value={<span className="capitalize">{cc.executionMode}</span>}
              />
            )}
          </div>

          <div className="space-y-3">
            {ab && (
              <>
                <EndpointCard
                  label="Variant A"
                  url={ab.variantA.url}
                  method={ab.variantA.method}
                  timeoutMs={ab.variantA.timeoutMs}
                  headers={ab.variantA.headers}
                />
                <EndpointCard
                  label="Variant B"
                  url={ab.variantB.url}
                  method={ab.variantB.method}
                  timeoutMs={ab.variantB.timeoutMs}
                  headers={ab.variantB.headers}
                />
              </>
            )}
            {cc && (
              <>
                <EndpointCard
                  label="Champion"
                  url={cc.champion.url}
                  method={cc.champion.method}
                  timeoutMs={cc.champion.timeoutMs}
                  headers={cc.champion.headers}
                />
                <EndpointCard
                  label="Challenger"
                  url={cc.challenger.url}
                  method={cc.challenger.method}
                  timeoutMs={cc.challenger.timeoutMs}
                  headers={cc.challenger.headers}
                />
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{
  label: string;
  value: string;
  subtitle: string;
  link?: string;
  navigate?: (path: string) => void;
}> = ({ label, value, subtitle, link, navigate: nav }) => (
  <div
    className={`p-4 bg-card border border-border rounded-[var(--radius)] ${link ? 'cursor-pointer hover:border-muted-foreground/30 transition-colors' : ''}`}
    onClick={link && nav ? () => nav(link) : undefined}
  >
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
  </div>
);
