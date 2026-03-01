import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Spinner } from '../../components/ui';
import { queryEngine } from '../../services/queryEngine';
import type {
  Widget, WidgetType, QueryConfig, BuilderQueryConfig, SqlQueryConfig,
  Dataset, Aggregation,
} from '../../domain';
import { WidgetPreview } from './WidgetPreview';

interface WidgetConfigModalProps {
  tenantId: string;
  initial?: Widget;
  onSave: (widget: Widget) => void;
  onClose: () => void;
}

const WIDGET_TYPES: { value: WidgetType; label: string; icon: string }[] = [
  { value: 'KPI',   label: 'KPI Card',    icon: '◈' },
  { value: 'LINE',  label: 'Line Chart',  icon: '⌇' },
  { value: 'BAR',   label: 'Bar Chart',   icon: '▦' },
  { value: 'PIE',   label: 'Pie Chart',   icon: '◒' },
  { value: 'TABLE', label: 'Table',       icon: '▤' },
];

const SIZE_PRESETS: { label: string; colSpan: number; rowSpan: number }[] = [
  { label: 'Small (3×2)',   colSpan: 3,  rowSpan: 2 },
  { label: 'Medium (4×3)',  colSpan: 4,  rowSpan: 3 },
  { label: 'Wide (6×3)',    colSpan: 6,  rowSpan: 3 },
  { label: 'Full (12×4)',   colSpan: 12, rowSpan: 4 },
];

const AGGREGATION_OPTIONS: { value: Aggregation; label: string }[] = [
  { value: 'count', label: 'Count'   },
  { value: 'sum',   label: 'Sum'     },
  { value: 'avg',   label: 'Average' },
  { value: 'rate',  label: 'Rate'    },
  { value: 'p95',   label: 'p95'     },
  { value: 'p50',   label: 'p50'     },
];

const TIME_RANGE_OPTIONS = [
  { value: '5m',  label: 'Last 5m'  },
  { value: '15m', label: 'Last 15m' },
  { value: '1h',  label: 'Last 1h'  },
  { value: '6h',  label: 'Last 6h'  },
  { value: '24h', label: 'Last 24h' },
  { value: 'all', label: 'All time' },
];

function makeDefaultBuilderConfig(): BuilderQueryConfig {
  return {
    mode: 'builder',
    dataset: 'Traffic',
    metric: 'requests',
    aggregation: 'count',
    groupBy: 'none',
    timeRange: 'all',
    filters: {},
  };
}

function makeDefaultSqlConfig(): SqlQueryConfig {
  return {
    mode: 'sql',
    sqlText: 'SELECT count(*) FROM traffic',
  };
}

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({
  tenantId,
  initial,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [widgetType, setWidgetType] = useState<WidgetType>(initial?.type ?? 'KPI');
  const [mode, setMode] = useState<'builder' | 'sql'>(
    initial?.queryConfig.mode ?? 'builder',
  );
  const [builderConfig, setBuilderConfig] = useState<BuilderQueryConfig>(
    initial?.queryConfig.mode === 'builder' ? initial.queryConfig : makeDefaultBuilderConfig(),
  );
  const [sqlConfig, setSqlConfig] = useState<SqlQueryConfig>(
    initial?.queryConfig.mode === 'sql' ? initial.queryConfig : makeDefaultSqlConfig(),
  );
  const [sizeIdx, setSizeIdx] = useState(1);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<ReturnType<typeof queryEngine.run> | null>(null);

  const availableMetrics = queryEngine.getAvailableMetrics(builderConfig.dataset);
  const groupByOptions = queryEngine.getGroupByOptions(builderConfig.dataset);

  const runPreview = useCallback(() => {
    setPreviewLoading(true);
    setTimeout(() => {
      const config: QueryConfig = mode === 'builder' ? builderConfig : sqlConfig;
      const result = queryEngine.run(tenantId, config);
      setPreviewResult(result);
      setPreviewLoading(false);
    }, 80);
  }, [tenantId, mode, builderConfig, sqlConfig]);

  useEffect(() => {
    runPreview();
  }, [runPreview]);

  const handleDatasetChange = (dataset: string) => {
    const metrics = queryEngine.getAvailableMetrics(dataset);
    setBuilderConfig(prev => ({
      ...prev,
      dataset: dataset as Dataset,
      metric: metrics[0] ?? '',
      groupBy: 'none',
    }));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const size = SIZE_PRESETS[sizeIdx];
    const position = initial?.position ?? { col: 0, row: 0, colSpan: size.colSpan, rowSpan: size.rowSpan };
    const widget: Widget = {
      id: initial?.id ?? `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: widgetType,
      title: title.trim(),
      position: { ...position, colSpan: size.colSpan, rowSpan: size.rowSpan },
      queryConfig: mode === 'builder' ? builderConfig : sqlConfig,
    };
    onSave(widget);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-[var(--radius)] shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {initial ? 'Edit Widget' : 'Add Widget'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[var(--radius)] hover:bg-muted text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-80 border-r border-border p-5 overflow-y-auto flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Widget Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="My Widget" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {WIDGET_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setWidgetType(t.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-[var(--radius)] border text-xs transition-all ${
                      widgetType === t.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Size</label>
              <div className="space-y-1">
                {SIZE_PRESETS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setSizeIdx(i)}
                    className={`w-full text-left px-3 py-1.5 rounded-[var(--radius)] text-xs transition-colors ${
                      sizeIdx === i
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Query Mode</label>
              <div className="flex rounded-[var(--radius)] border border-border overflow-hidden">
                {(['builder', 'sql'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors capitalize ${
                      mode === m ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m === 'builder' ? 'Builder' : 'SQL'}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'builder' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Dataset</label>
                  <Select
                    value={builderConfig.dataset}
                    onChange={e => handleDatasetChange(e.target.value)}
                    options={[
                      { value: 'Traffic', label: 'Traffic Records' },
                      { value: 'BusinessMetrics', label: 'Business Metrics' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Metric</label>
                  <Select
                    value={builderConfig.metric}
                    onChange={e => setBuilderConfig(prev => ({ ...prev, metric: e.target.value }))}
                    options={availableMetrics.map(m => ({ value: m, label: m }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Aggregation</label>
                  <Select
                    value={builderConfig.aggregation}
                    onChange={e => setBuilderConfig(prev => ({ ...prev, aggregation: e.target.value as Aggregation }))}
                    options={AGGREGATION_OPTIONS}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Group By</label>
                  <Select
                    value={builderConfig.groupBy ?? 'none'}
                    onChange={e => setBuilderConfig(prev => ({ ...prev, groupBy: e.target.value }))}
                    options={groupByOptions}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Time Range</label>
                  <Select
                    value={builderConfig.timeRange}
                    onChange={e => setBuilderConfig(prev => ({ ...prev, timeRange: e.target.value as BuilderQueryConfig['timeRange'] }))}
                    options={TIME_RANGE_OPTIONS}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">SQL Query</label>
                  <textarea
                    value={sqlConfig.sqlText}
                    onChange={e => setSqlConfig({ mode: 'sql', sqlText: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 bg-background border border-input rounded-[var(--radius)] text-xs font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="SELECT count(*) FROM traffic"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Templates:</p>
                  <div className="space-y-1">
                    {queryEngine.SQL_TEMPLATES.map(t => (
                      <button
                        key={t.sql}
                        onClick={() => setSqlConfig({ mode: 'sql', sqlText: t.sql })}
                        className="w-full text-left px-2.5 py-1.5 rounded-[var(--radius)] text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</p>
              <button
                onClick={runPreview}
                className="h-6 px-2.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-[var(--radius)] transition-colors"
              >
                Refresh
              </button>
            </div>
            {previewLoading ? (
              <div className="flex items-center justify-center h-40">
                <Spinner size="md" />
              </div>
            ) : previewResult ? (
              <WidgetPreview type={widgetType} title={title || 'Widget Preview'} result={previewResult} />
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!title.trim()}>
            {initial ? 'Update Widget' : 'Add Widget'}
          </Button>
        </div>
      </div>
    </div>
  );
};
