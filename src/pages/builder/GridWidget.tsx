import React from 'react';
import type { Widget } from '../../domain';
import type { QueryResult } from '../../services/queryEngine';
import { WidgetPreview } from './WidgetPreview';

interface GridWidgetProps {
  widget: Widget;
  result: QueryResult | null;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const GridWidget: React.FC<GridWidgetProps> = ({
  widget,
  result,
  isEditing,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const { col, row, colSpan, rowSpan } = widget.position;

  return (
    <div
      className="relative group"
      style={{
        gridColumn: `${col + 1} / span ${colSpan}`,
        gridRow: `${row + 1} / span ${rowSpan}`,
      }}
      draggable={isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className={`h-full rounded-[var(--radius)] border transition-all overflow-hidden ${
        isEditing
          ? 'border-border cursor-grab active:cursor-grabbing group-hover:border-primary/50 group-hover:shadow-card-md'
          : 'border-border'
      }`}>
        {result ? (
          <div className="h-full overflow-auto">
            <WidgetPreview type={widget.type} title={widget.title} result={result} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-card border-border">
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={onEdit}
            className="h-6 w-6 flex items-center justify-center bg-background border border-border rounded-[var(--radius)] text-muted-foreground hover:text-foreground shadow-sm transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="h-6 w-6 flex items-center justify-center bg-background border border-red-500/20 rounded-[var(--radius)] text-red-500 hover:text-red-600 shadow-sm transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {isEditing && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-5 px-1.5 flex items-center gap-1 bg-background border border-border rounded-[var(--radius)] shadow-sm">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
              <circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/>
              <circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/>
              <circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/>
            </svg>
            <span className="text-[9px] text-muted-foreground">{widget.title}</span>
          </div>
        </div>
      )}
    </div>
  );
};
