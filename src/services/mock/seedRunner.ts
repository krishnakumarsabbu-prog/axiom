import {
  SEED_EXPERIMENTS,
  SEED_TRAFFIC,
  SEED_METRICS,
  SEED_CONNECTORS_STORE,
  SEED_DASHBOARDS_STORE,
  isSeedNeeded,
  markSeeded,
} from './seedData';

const EXP_KEY       = 'experiment-portal-experiments';
const TRAFFIC_KEY   = 'experiment-portal-traffic';
const METRICS_KEY   = 'ep-metrics';
const CONNECTORS_KEY = 'ep-connectors';
const DASHBOARDS_KEY = 'ep-dashboards';

function writeIfEmpty(storageKey: string, data: unknown): boolean {
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      const isEmpty =
        typeof parsed === 'object' &&
        parsed !== null &&
        Object.keys(parsed).length === 0;
      if (!isEmpty) return false;
    } catch {
      return false;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(data));
  return true;
}

export function runSeedIfNeeded(): void {
  if (!isSeedNeeded()) return;

  try {
    writeIfEmpty(EXP_KEY, SEED_EXPERIMENTS);
    writeIfEmpty(TRAFFIC_KEY, SEED_TRAFFIC);
    writeIfEmpty(METRICS_KEY, SEED_METRICS);
    writeIfEmpty(CONNECTORS_KEY, SEED_CONNECTORS_STORE);
    writeIfEmpty(DASHBOARDS_KEY, SEED_DASHBOARDS_STORE);
    markSeeded();
  } catch (e) {
    console.warn('[Seed] Failed to write seed data:', e);
  }
}

export function forceSeedReset(): void {
  localStorage.removeItem(EXP_KEY);
  localStorage.removeItem(TRAFFIC_KEY);
  localStorage.removeItem(METRICS_KEY);
  localStorage.removeItem(CONNECTORS_KEY);
  localStorage.removeItem(DASHBOARDS_KEY);
  localStorage.removeItem('ep-seed-version');
  runSeedIfNeeded();
}
