import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectorStore, useTenantStore } from '../stores';
import { connectorService } from '../services/mock';
import { Card, Button, Badge, Spinner } from '../components/ui';
import type { Connector } from '../domain';

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

function formatRelative(iso?: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const ConnectorTypeIcon: React.FC<{ type: Connector['type'] }> = ({ type }) => {
  if (type === 'REST_PULL') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
};

const ConnectorCard: React.FC<{
  connector: Connector;
  onToggle: () => void;
  onRunOnce: () => Promise<void>;
  onDelete: () => void;
}> = ({ connector, onToggle, onRunOnce, onDelete }) => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  const handleRunOnce = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      await onRunOnce();
      setRunResult('success');
    } catch {
      setRunResult('error');
    } finally {
      setIsRunning(false);
    }
  };

  const configSummary = connector.type === 'REST_PULL'
    ? (connector.config as { url: string }).url
    : (connector.config as { jdbcUrl: string }).jdbcUrl;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${connector.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <ConnectorTypeIcon type={connector.type} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">{connector.name}</h3>
              <Badge variant={connector.type === 'REST_PULL' ? 'info' : 'default'} size="sm">
                {connector.type === 'REST_PULL' ? 'REST Pull' : 'DB Poll'}
              </Badge>
              <Badge variant={connector.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                {connector.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{connector.description}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-muted rounded-[var(--radius)] px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Schedule</p>
            <p className="text-xs font-semibold text-foreground">Every {formatInterval(connector.schedule.intervalSeconds)}</p>
          </div>
          <div className="bg-muted rounded-[var(--radius)] px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Last Run</p>
            <p className={`text-xs font-semibold ${connector.lastRunStatus === 'error' ? 'text-destructive' : 'text-foreground'}`}>
              {formatRelative(connector.lastRunAt)}
            </p>
          </div>
          <div className="bg-muted rounded-[var(--radius)] px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Events</p>
            <p className="text-xs font-semibold text-foreground">{connector.lastRunCount ?? '—'}</p>
          </div>
        </div>

        <div className="mt-3 px-3 py-2 bg-muted rounded-[var(--radius)]">
          <p className="text-[10px] font-mono text-muted-foreground truncate">{configSummary}</p>
        </div>

        {runResult && (
          <div className={`mt-3 px-3 py-2 rounded-[var(--radius)] text-xs ${runResult === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
            {runResult === 'success' ? 'Run completed successfully. Check Metrics for new events.' : 'Run failed. Please try again.'}
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/app/connectors/${connector.id}/mapping`)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          Mapping
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRunOnce} disabled={isRunning}>
          {isRunning ? <Spinner size="sm" /> : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
          {isRunning ? 'Running...' : 'Run Once'}
        </Button>
        <button
          onClick={onToggle}
          className={`ml-auto text-xs px-2.5 py-1.5 rounded-[var(--radius)] border transition-all ${connector.status === 'ACTIVE' ? 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10' : 'border-primary/30 text-primary hover:bg-primary/10'}`}
        >
          {connector.status === 'ACTIVE' ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-2.5 py-1.5 rounded-[var(--radius)] border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
        >
          Delete
        </button>
      </div>
    </Card>
  );
};

export const ConnectorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { connectors, isLoading, loadConnectors, toggleStatus, deleteConnector, runOnce } = useConnectorStore();

  useEffect(() => {
    if (currentTenant) {
      loadConnectors(currentTenant.id);
    }
  }, [currentTenant, loadConnectors]);

  const handleTestAll = async () => {
    if (!currentTenant) return;
    for (const connector of connectors.filter(c => c.status === 'ACTIVE')) {
      await connectorService.testConnection(currentTenant.id, connector.id);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Connectors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pull business metrics from external systems for experiment analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleTestAll}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Test All
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/app/connectors/new')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Connector
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="md" />
        </div>
      ) : connectors.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No connectors configured</h3>
          <p className="text-sm text-muted-foreground mb-4">Add a connector to start pulling business metrics</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/app/connectors/new')}>Add First Connector</Button>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
            <span>{connectors.length} connector{connectors.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span className="text-emerald-600">{connectors.filter(c => c.status === 'ACTIVE').length} active</span>
            {connectors.filter(c => c.status === 'PAUSED').length > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-600">{connectors.filter(c => c.status === 'PAUSED').length} paused</span>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {connectors.map(connector => (
              <ConnectorCard
                key={connector.id}
                connector={connector}
                onToggle={() => currentTenant && toggleStatus(currentTenant.id, connector.id)}
                onRunOnce={() => currentTenant ? runOnce(currentTenant.id, connector.id).then(() => {}) : Promise.resolve()}
                onDelete={() => {
                  if (currentTenant && confirm(`Delete "${connector.name}"?`)) {
                    deleteConnector(currentTenant.id, connector.id);
                  }
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
