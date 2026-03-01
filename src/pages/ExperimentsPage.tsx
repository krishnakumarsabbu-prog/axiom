import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperimentStore, useTenantStore } from '../stores';
import { Button, Card, Badge, Spinner, EmptyState, Select } from '../components/ui';
import type { Experiment } from '../domain';

const statusVariant: Record<Experiment['status'], 'default' | 'success' | 'warning' | 'danger'> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  archived: 'danger',
};

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'AB', label: 'A/B Test' },
  { value: 'CC', label: 'Champion/Challenger' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

export const ExperimentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { experiments, isLoading, loadExperiments } = useExperimentStore();

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (currentTenant) {
      loadExperiments(currentTenant.id);
    }
  }, [currentTenant?.id]);

  const filtered = experiments.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Experiments</h1>
          <p className="text-muted-foreground mt-1">
            Manage A/B tests and Champion/Challenger experiments
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/app/experiments/new')}>
          + New Experiment
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-44">
          <Select
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
        {(typeFilter || statusFilter) && (
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setTypeFilter(''); setStatusFilter(''); }}
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} experiment{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="🧪"
            title={experiments.length === 0 ? 'No experiments yet' : 'No experiments match filters'}
            description={
              experiments.length === 0
                ? 'Create your first experiment to start running A/B tests or Champion/Challenger comparisons'
                : 'Try adjusting or clearing your filters'
            }
            actionLabel={experiments.length === 0 ? 'Create Experiment' : undefined}
            onAction={experiments.length === 0 ? () => navigate('/app/experiments/new') : undefined}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(exp => (
            <ExperimentRow
              key={exp.id}
              experiment={exp}
              onClick={() => navigate(`/app/experiments/${exp.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ExperimentRowProps {
  experiment: Experiment;
  onClick: () => void;
}

const ExperimentRow: React.FC<ExperimentRowProps> = ({ experiment, onClick }) => {
  const createdDate = new Date(experiment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-[var(--radius)] hover:border-muted-foreground/30 transition-colors duration-150 cursor-pointer group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-sm font-medium text-foreground truncate">
            {experiment.name}
          </span>
          <Badge variant={experiment.type === 'AB' ? 'info' : 'default'} size="sm">
            {experiment.type === 'AB' ? 'A/B' : 'C/C'}
          </Badge>
        </div>
        {experiment.description && (
          <p className="text-sm text-muted-foreground truncate">{experiment.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Badge variant={statusVariant[experiment.status]} size="sm">
          <span className="capitalize">{experiment.status}</span>
        </Badge>
        <span className="text-xs text-muted-foreground hidden sm:block">{createdDate}</span>
        <svg
          className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
          fill="none" viewBox="0 0 16 16"
        >
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};
