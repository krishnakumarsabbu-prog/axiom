import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDashboardStore, useTenantStore } from '../../stores';
import { Button, Badge, Spinner } from '../../components/ui';
import { queryEngine } from '../../services/queryEngine';
import type { QueryConfig } from '../../domain';
import { GridWidget } from './GridWidget';

const GRID_COLS = 12;
const ROW_HEIGHT = 80;

export const DashboardViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { current, isLoading, loadOne, setCurrent } = useDashboardStore();

  useEffect(() => {
    if (currentTenant && id) loadOne(currentTenant.id, id);
    return () => setCurrent(null);
  }, [currentTenant?.id, id]);

  const results = useMemo(() => {
    if (!current || !currentTenant) return new Map();
    const map = new Map<string, ReturnType<typeof queryEngine.run>>();
    for (const w of current.widgets) {
      map.set(w.id, queryEngine.run(currentTenant.id, w.queryConfig as QueryConfig));
    }
    return map;
  }, [current?.widgets, currentTenant?.id]);

  const maxRow = current?.widgets.reduce((max, w) => Math.max(max, w.position.row + w.position.rowSpan), 4) ?? 4;

  if (isLoading || !current) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/builder')}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{current.name}</h1>
            {current.description && <p className="text-sm text-muted-foreground mt-0.5">{current.description}</p>}
          </div>
          <Badge variant="default">{current.widgets.length} widget{current.widgets.length !== 1 ? 's' : ''}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(`/app/builder/${id}/edit`)}>
            Edit Layout
          </Button>
        </div>
      </div>

      {current.widgets.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[var(--radius)] p-16 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">No widgets yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add widgets in the editor to visualize your data.</p>
          <Button variant="primary" onClick={() => navigate(`/app/builder/${id}/edit`)}>Open Editor</Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridAutoRows: `${ROW_HEIGHT}px`,
            gap: '8px',
            minHeight: `${maxRow * ROW_HEIGHT + (maxRow - 1) * 8}px`,
          }}
        >
          {current.widgets.map(widget => (
            <GridWidget
              key={widget.id}
              widget={widget}
              result={results.get(widget.id) ?? null}
              isEditing={false}
              onEdit={() => navigate(`/app/builder/${id}/edit`)}
              onRemove={() => {}}
              onDragStart={() => {}}
              onDragOver={() => {}}
              onDrop={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};
