import React, { useState } from 'react';

interface Props {
  samplesByVariant: Record<string, unknown>;
  variants: string[];
}

export const SampleResponsePanel: React.FC<Props> = ({ samplesByVariant, variants }) => {
  const [activeVariant, setActiveVariant] = useState(variants[0] ?? '');

  const body = samplesByVariant[activeVariant];

  return (
    <div className="bg-card border border-border rounded-[var(--radius)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Latest Sample Response</p>
        <div className="flex gap-1">
          {variants.map(v => (
            <button
              key={v}
              onClick={() => setActiveVariant(v)}
              className={`px-2.5 py-1 text-xs rounded transition-colors font-medium ${
                activeVariant === v
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {body ? (
          <pre className="text-xs font-mono text-foreground overflow-auto max-h-64 whitespace-pre-wrap break-all leading-relaxed">
            {JSON.stringify(body, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No traffic records found for variant {activeVariant}. Seed traffic first.
          </p>
        )}
      </div>
    </div>
  );
};
