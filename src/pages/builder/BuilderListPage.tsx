import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore, useTenantStore } from '../../stores';
import { Button, Card, Spinner, Badge } from '../../components/ui';
import type { Dashboard } from '../../domain';

export const BuilderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { dashboards, isLoading, loadList, deleteDashboard } = useDashboardStore();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenant) loadList(currentTenant.id);
  }, [currentTenant?.id]);

  const handleDelete = async (d: Dashboard, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTenant) return;
    if (!confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    setDeleting(d.id);
    await deleteDashboard(currentTenant.id, d.id);
    setDeleting(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Custom Dashboards</h1>
          <p className="text-sm text-muted-foreground mt-1">Build and manage tenant dashboards with drag-and-drop widgets</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/app/builder/new')}>
          New Dashboard
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="md" />
        </div>
      ) : dashboards.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No dashboards yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first custom dashboard to visualize your experiment data.</p>
          <Button variant="primary" onClick={() => navigate('/app/builder/new')}>Create Dashboard</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map(d => (
            <div
              key={d.id}
              onClick={() => navigate(`/app/dashboards/${d.id}`)}
              className="bg-card border border-border rounded-[var(--radius)] shadow-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-card-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{d.name}</h3>
                  {d.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{d.description}</p>}
                </div>
                <Badge variant="default" size="sm">{d.widgets.length} widget{d.widgets.length !== 1 ? 's' : ''}</Badge>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {[...new Set(d.widgets.map(w => w.type))].map(type => (
                  <span key={type} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{type}</span>
                ))}
                {d.widgets.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">No widgets configured</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(d.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/app/builder/${d.id}/edit`); }}
                    className="h-7 px-2.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-[var(--radius)] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={e => handleDelete(d, e)}
                    disabled={deleting === d.id}
                    className="h-7 px-2.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-[var(--radius)] transition-colors disabled:opacity-50"
                  >
                    {deleting === d.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
