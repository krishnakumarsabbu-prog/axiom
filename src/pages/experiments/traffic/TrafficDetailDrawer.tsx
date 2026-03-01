import React, { useState } from 'react';
import type { TrafficRecord } from '../../../domain';
import { Badge } from '../../../components/ui';
import { CopyButton } from '../../../components/ui';

interface Props {
  record: TrafficRecord | null;
  onClose: () => void;
}

type Tab = 'request' | 'response' | 'timings';

const variantColor: Record<TrafficRecord['assignedVariant'], string> = {
  A: 'info',
  B: 'default',
  CHAMPION: 'success',
  CHALLENGER: 'warning',
};

function JsonBlock({ value }: { value: unknown }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return (
    <pre className="text-xs font-mono text-foreground bg-background border border-border rounded-[var(--radius)] p-3 overflow-auto max-h-64 whitespace-pre-wrap break-all">
      {text}
    </pre>
  );
}

function HeadersTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);
  if (entries.length === 0) return <p className="text-xs text-muted-foreground">No headers</p>;
  return (
    <table className="w-full text-xs">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="border-b border-border last:border-0">
            <td className="py-1.5 pr-3 font-mono text-muted-foreground w-1/3 align-top">{k}</td>
            <td className="py-1.5 font-mono text-foreground break-all">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TimingBar({ label, ms, maxMs, color }: { label: string; ms: number; maxMs: number; color: string }) {
  const pct = maxMs > 0 ? Math.round((ms / maxMs) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-mono text-foreground">{ms}ms</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export const TrafficDetailDrawer: React.FC<Props> = ({ record, onClose }) => {
  const [tab, setTab] = useState<Tab>('request');

  if (!record) return null;

  const isSuccess = record.status === 'SUCCESS';
  const httpStatusColor =
    record.response.status >= 500
      ? 'text-red-400'
      : record.response.status >= 400
      ? 'text-yellow-400'
      : 'text-green-400';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-50 bg-card border-l border-border flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <Badge variant={isSuccess ? 'success' : 'danger'} size="sm">
              {record.status}
            </Badge>
            <Badge
              variant={variantColor[record.assignedVariant] as 'info' | 'default' | 'success' | 'warning'}
              size="sm"
            >
              {record.assignedVariant}
            </Badge>
            <span className={`text-sm font-mono font-bold ${httpStatusColor}`}>
              {record.response.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-[var(--radius)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-3 border-b border-border bg-secondary shrink-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Correlation ID:</span>
            <span className="text-xs font-mono text-foreground">{record.correlationId}</span>
            {record.correlationIdSource === 'generated' && (
              <Badge variant="warning" size="sm">auto-generated</Badge>
            )}
            <CopyButton value={record.correlationId} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {new Date(record.timestamp).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
              })}
            </span>
            <span className="text-xs text-muted-foreground">Total: <span className="text-foreground font-mono">{record.timings.totalMs}ms</span></span>
            {record.memoryMb && (
              <span className="text-xs text-muted-foreground">Memory: <span className="text-foreground font-mono">{record.memoryMb}MB</span></span>
            )}
          </div>
          {record.errorMessage && (
            <p className="text-xs text-destructive">{record.errorMessage}</p>
          )}
        </div>

        <div className="flex border-b border-border shrink-0">
          {(['request', 'response', 'timings'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'request' && (
            <>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Method & URL</p>
                <div className="flex items-center gap-2 p-2.5 bg-secondary border border-border rounded-[var(--radius)]">
                  <span className="text-xs font-mono font-bold text-foreground">{record.request.method}</span>
                  <span className="text-xs font-mono text-muted-foreground break-all">{record.request.url}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Headers</p>
                <div className="bg-secondary border border-border rounded-[var(--radius)] p-3">
                  <HeadersTable headers={record.request.headers} />
                </div>
              </div>
              {Object.keys(record.request.query).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Query Params</p>
                  <div className="bg-secondary border border-border rounded-[var(--radius)] p-3">
                    <HeadersTable headers={record.request.query} />
                  </div>
                </div>
              )}
              {record.request.bodyJson !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Request Body</p>
                    <CopyButton value={record.request.rawBodyText ?? JSON.stringify(record.request.bodyJson)} />
                  </div>
                  <JsonBlock value={record.request.bodyJson} />
                </div>
              )}
            </>
          )}

          {tab === 'response' && (
            <>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Status</p>
                <div className="flex items-center gap-2 p-2.5 bg-secondary border border-border rounded-[var(--radius)]">
                  <span className={`text-sm font-mono font-bold ${httpStatusColor}`}>
                    {record.response.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {record.response.status >= 500 ? 'Server Error'
                      : record.response.status >= 400 ? 'Client Error'
                      : record.response.status >= 300 ? 'Redirect'
                      : 'OK'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Headers</p>
                <div className="bg-secondary border border-border rounded-[var(--radius)] p-3">
                  <HeadersTable headers={record.response.headers} />
                </div>
              </div>
              {record.response.bodyJson !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Response Body</p>
                    <CopyButton value={record.response.rawBodyText ?? JSON.stringify(record.response.bodyJson)} />
                  </div>
                  <JsonBlock value={record.response.bodyJson} />
                </div>
              )}
            </>
          )}

          {tab === 'timings' && (
            <>
              <div className="space-y-4">
                <TimingBar
                  label="Total"
                  ms={record.timings.totalMs}
                  maxMs={record.timings.totalMs}
                  color="bg-foreground"
                />
                <TimingBar
                  label="Upstream"
                  ms={record.timings.upstreamMs}
                  maxMs={record.timings.totalMs}
                  color="bg-blue-500"
                />
                <TimingBar
                  label="Processing"
                  ms={record.timings.processingMs}
                  maxMs={record.timings.totalMs}
                  color="bg-green-500"
                />
              </div>
              <div className="bg-secondary border border-border rounded-[var(--radius)] px-4 py-2 space-y-0 divide-y divide-border">
                {[
                  { label: 'Total Latency', val: `${record.timings.totalMs}ms` },
                  { label: 'Upstream Latency', val: `${record.timings.upstreamMs}ms` },
                  { label: 'Processing Overhead', val: `${record.timings.processingMs}ms` },
                  ...(record.memoryMb ? [{ label: 'Memory Used', val: `${record.memoryMb} MB` }] : []),
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-mono text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
