import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDashboardStore, useTenantStore } from '../../stores';
import { Button, Spinner } from '../../components/ui';
import { queryEngine } from '../../services/queryEngine';
import type { Widget, QueryConfig } from '../../domain';
import type { QueryResult } from '../../services/queryEngine';
import { GridWidget } from './GridWidget';
import { WidgetConfigModal } from './WidgetConfigModal';

const GRID_COLS = 12;
const ROW_HEIGHT = 80;

function computeResults(tenantId: string, widgets: Widget[]): Map<string, QueryResult> {
  const map = new Map<string, QueryResult>();
  for (const w of widgets) {
    map.set(w.id, queryEngine.run(tenantId, w.queryConfig as QueryConfig));
  }
  return map;
}

function autoPlace(widgets: Widget[], colSpan: number): { col: number; row: number } {
  if (widgets.length === 0) return { col: 0, row: 0 };
  let maxRow = 0;
  for (const w of widgets) {
    maxRow = Math.max(maxRow, w.position.row + w.position.rowSpan);
  }
  const cols = new Array<number>(GRID_COLS).fill(0);
  for (const w of widgets) {
    for (let c = w.position.col; c < w.position.col + w.position.colSpan; c++) {
      cols[c] = Math.max(cols[c], w.position.row + w.position.rowSpan);
    }
  }
  for (let row = 0; row <= maxRow; row++) {
    for (let col = 0; col <= GRID_COLS - colSpan; col++) {
      const fits = Array.from({ length: colSpan }, (_, i) => cols[col + i] ?? 0).every(v => v <= row);
      if (fits) return { col, row };
    }
  }
  return { col: 0, row: maxRow };
}

export const BuilderEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { current, isLoading, isSaving, loadOne, save, updateCurrentWidgets, setCurrent } = useDashboardStore();

  const [results, setResults] = useState<Map<string, QueryResult>>(new Map());
  const [showModal, setShowModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [, setDragging] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (currentTenant && id) loadOne(currentTenant.id, id);
    return () => setCurrent(null);
  }, [currentTenant?.id, id]);

  useEffect(() => {
    if (current && currentTenant) {
      const r = computeResults(currentTenant.id, current.widgets);
      setResults(r);
    }
  }, [current?.widgets, currentTenant?.id]);

  const handleAddWidget = () => {
    setEditingWidget(null);
    setShowModal(true);
  };

  const handleSaveWidget = (widget: Widget) => {
    if (!current) return;
    let placed = widget;
    if (!editingWidget) {
      const { col, row } = autoPlace(current.widgets, widget.position.colSpan);
      placed = { ...widget, position: { ...widget.position, col, row } };
    }
    const widgets = editingWidget
      ? current.widgets.map(w => w.id === placed.id ? placed : w)
      : [...current.widgets, placed];
    updateCurrentWidgets(widgets);
    setIsDirty(true);
    setShowModal(false);
    setEditingWidget(null);
  };

  const handleRemoveWidget = useCallback((widgetId: string) => {
    if (!current) return;
    const widgets = current.widgets.filter(w => w.id !== widgetId);
    updateCurrentWidgets(widgets);
    setIsDirty(true);
  }, [current, updateCurrentWidgets]);

  const handleDragStart = useCallback((e: React.DragEvent, widgetId: string) => {
    setDragging(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('widgetId', widgetId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const srcId = e.dataTransfer.getData('widgetId');
    if (!current || srcId === targetId) { setDragging(null); return; }
    const srcWidget = current.widgets.find(w => w.id === srcId);
    const targetWidget = current.widgets.find(w => w.id === targetId);
    if (!srcWidget || !targetWidget) { setDragging(null); return; }
    const widgets = current.widgets.map(w => {
      if (w.id === srcId) return { ...srcWidget, position: { ...srcWidget.position, col: targetWidget.position.col, row: targetWidget.position.row } };
      if (w.id === targetId) return { ...targetWidget, position: { ...targetWidget.position, col: srcWidget.position.col, row: srcWidget.position.row } };
      return w;
    });
    updateCurrentWidgets(widgets);
    setIsDirty(true);
    setDragging(null);
  }, [current, updateCurrentWidgets]);

  const handleSave = async () => {
    if (!currentTenant || !id || !current) return;
    await save(currentTenant.id, id, { name: current.name, description: current.description, widgets: current.widgets });
    setIsDirty(false);
  };

  const maxRow = current?.widgets.reduce((max, w) => Math.max(max, w.position.row + w.position.rowSpan), 4) ?? 4;

  if (isLoading || !current) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
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
            <h1 className="text-sm font-semibold text-foreground">{current.name}</h1>
            <p className="text-xs text-muted-foreground">{current.widgets.length} widget{current.widgets.length !== 1 ? 's' : ''}</p>
          </div>
          {isDirty && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Unsaved</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(`/app/dashboards/${id}`)}>
            Preview
          </Button>
          <button
            onClick={handleAddWidget}
            className="h-8 px-3 flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-[var(--radius)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Widget
          </button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/20 p-6">
        {current.widgets.length === 0 ? (
          <div
            className="w-full border-2 border-dashed border-border rounded-[var(--radius)] flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
            style={{ minHeight: `${4 * ROW_HEIGHT + 3 * 8}px` }}
            onClick={handleAddWidget}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">Add your first widget</p>
            <p className="text-xs text-muted-foreground mt-1">Click to configure a KPI card, chart, or table</p>
          </div>
        ) : (
          <div
            className="relative w-full"
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
                isEditing
                onEdit={() => { setEditingWidget(widget); setShowModal(true); }}
                onRemove={() => handleRemoveWidget(widget.id)}
                onDragStart={e => handleDragStart(e, widget.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, widget.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && currentTenant && (
        <WidgetConfigModal
          tenantId={currentTenant.id}
          initial={editingWidget ?? undefined}
          onSave={handleSaveWidget}
          onClose={() => { setShowModal(false); setEditingWidget(null); }}
        />
      )}
    </div>
  );
};
