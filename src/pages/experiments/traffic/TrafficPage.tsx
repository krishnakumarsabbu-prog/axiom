import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrafficStore, useExperimentStore, useTenantStore } from '../../../stores';
import { Button, Badge, Spinner, Input, Select } from '../../../components/ui';
import { TrafficDetailDrawer } from './TrafficDetailDrawer';
import type { TrafficRecord } from '../../../domain';

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function httpStatusColor(status: number): string {
  if (status >= 500) return 'text-red-400';
  if (status >= 400) return 'text-yellow-400';
  return 'text-green-400';
}

const variantBadgeVariant: Record<TrafficRecord['assignedVariant'], 'info' | 'default' | 'success' | 'warning'> = {
  A: 'info',
  B: 'default',
  CHAMPION: 'success',
  CHALLENGER: 'warning',
};

const TIME_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '5m', label: 'Last 5 min' },
  { value: '15m', label: 'Last 15 min' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
];

const AB_VARIANT_OPTIONS = [
  { value: '', label: 'All Variants' },
  { value: 'A', label: 'Variant A' },
  { value: 'B', label: 'Variant B' },
];

const CC_VARIANT_OPTIONS = [
  { value: '', label: 'All Variants' },
  { value: 'CHAMPION', label: 'Champion' },
  { value: 'CHALLENGER', label: 'Challenger' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAIL', label: 'Failed' },
];

export const TrafficPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { currentExperiment, loadExperiment } = useExperimentStore();
  const {
    records, isLoading, isStreaming, filter,
    loadRecords, setFilter, startStreaming, stopStreaming, seedRecords, clearRecords, reset,
  } = useTrafficStore();

  const [selectedRecord, setSelectedRecord] = useState<TrafficRecord | null>(null);
  const [correlationSearch, setCorrelationSearch] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTenantId = useRef<string>('');
  const prevExpId = useRef<string>('');

  useEffect(() => {
    if (!currentTenant || !id) return;
    const tenantChanged = prevTenantId.current !== currentTenant.id;
    const expChanged = prevExpId.current !== id;

    if (tenantChanged || expChanged) {
      prevTenantId.current = currentTenant.id;
      prevExpId.current = id;
      reset();
      loadExperiment(currentTenant.id, id);
      loadRecords(currentTenant.id, id);
    }

    return () => {
      stopStreaming();
    };
  }, [currentTenant?.id, id]);

  useEffect(() => {
    if (!currentTenant || !id) return;
    loadRecords(currentTenant.id, id);
  }, [filter]);

  const handleCorrelationSearch = useCallback((value: string) => {
    setCorrelationSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setFilter({ searchCorrelationId: value });
    }, 300);
  }, [setFilter]);

  const handleStreamToggle = () => {
    if (!currentTenant || !id || !currentExperiment) return;
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming(currentTenant.id, id, currentExperiment.type);
    }
  };

  const handleSeed = () => {
    if (!currentTenant || !id || !currentExperiment) return;
    seedRecords(currentTenant.id, id, 20, currentExperiment.type);
  };

  const handleClear = () => {
    if (!currentTenant || !id) return;
    clearRecords(currentTenant.id, id);
  };

  const variantOptions = currentExperiment?.type === 'CC' ? CC_VARIANT_OPTIONS : AB_VARIANT_OPTIONS;
  const expName = currentExperiment?.name ?? 'Experiment';

  const successCount = records.filter(r => r.status === 'SUCCESS').length;
  const failCount = records.filter(r => r.status === 'FAIL').length;
  const avgLatency = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.timings.totalMs, 0) / records.length)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/app/experiments/${id}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to {expName}
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{expName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSeed}>
              Seed 20 Records
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button
              variant={isStreaming ? 'danger' : 'primary'}
              size="sm"
              onClick={handleStreamToggle}
              disabled={!currentExperiment}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isStreaming ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
              {isStreaming ? 'Stop Live' : 'Start Live'}
            </Button>
          </div>
        </div>

        <div className="flex border-b border-border mt-4">
          <button
            onClick={() => navigate(`/app/experiments/${id}`)}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
          >
            Overview
          </button>
          <button
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-foreground text-foreground -mb-px"
          >
            Traffic Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Records', val: records.length.toString(), sub: 'matching filters' },
          { label: 'Successful', val: successCount.toString(), sub: `${records.length > 0 ? Math.round(successCount / records.length * 100) : 0}% success rate` },
          { label: 'Failed', val: failCount.toString(), sub: `${records.length > 0 ? Math.round(failCount / records.length * 100) : 0}% error rate` },
          { label: 'Avg Latency', val: records.length > 0 ? `${avgLatency}ms` : '—', sub: 'total time' },
        ].map(({ label, val, sub }) => (
          <div key={label} className="bg-card border border-border rounded-[var(--radius)] p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-display font-bold text-foreground">{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-56">
          <Input
            value={correlationSearch}
            onChange={e => handleCorrelationSearch(e.target.value)}
            placeholder="Search correlation ID..."
          />
        </div>
        <div className="w-40">
          <Select
            options={variantOptions}
            value={filter.variant ?? ''}
            onChange={e => setFilter({ variant: e.target.value as TrafficRecord['assignedVariant'] | '' })}
          />
        </div>
        <div className="w-36">
          <Select
            options={STATUS_OPTIONS}
            value={filter.status ?? ''}
            onChange={e => setFilter({ status: e.target.value as TrafficRecord['status'] | '' })}
          />
        </div>
        <div className="w-40">
          <Select
            options={TIME_RANGE_OPTIONS}
            value={filter.timeRange ?? 'all'}
            onChange={e => setFilter({ timeRange: e.target.value as typeof filter.timeRange })}
          />
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius)] px-6 py-16 text-center">
          <p className="text-muted-foreground text-sm mb-3">No traffic records found</p>
          <p className="text-xs text-muted-foreground mb-4">
            Seed some records or start live streaming to see traffic logs here.
          </p>
          <Button variant="secondary" size="sm" onClick={handleSeed}>
            Seed Sample Records
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[var(--radius)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Time</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Correlation ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Variant</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">HTTP</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Latency</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => (
                  <TrafficRow
                    key={record.id}
                    record={record}
                    isNew={isStreaming && idx === 0}
                    onClick={() => setSelectedRecord(record)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {records.length >= 50 && (
            <div className="px-4 py-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">Showing latest {records.length} records</p>
            </div>
          )}
        </div>
      )}

      <TrafficDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};

interface TrafficRowProps {
  record: TrafficRecord;
  isNew: boolean;
  onClick: () => void;
}

const TrafficRow: React.FC<TrafficRowProps> = ({ record, isNew, onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-border last:border-0 cursor-pointer hover:bg-secondary/50 transition-colors group ${
        isNew ? 'animate-[fadeIn_0.4s_ease-out]' : ''
      }`}
    >
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
        {formatTimestamp(record.timestamp)}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-foreground max-w-[180px]">
        <div className="flex items-center gap-1.5">
          <span className="truncate">{record.correlationId}</span>
          {record.correlationIdSource === 'generated' && (
            <span className="shrink-0 text-[10px] text-muted-foreground bg-secondary border border-border rounded px-1">auto</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={variantBadgeVariant[record.assignedVariant]} size="sm">
          {record.assignedVariant}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={record.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
          {record.status}
        </Badge>
      </td>
      <td className={`px-4 py-3 text-right font-mono text-xs font-semibold ${httpStatusColor(record.response.status)}`}>
        {record.response.status}
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
        {record.timings.totalMs}ms
      </td>
    </tr>
  );
};
