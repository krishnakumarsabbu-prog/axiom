import type { Dashboard, Widget, CreateDashboard } from '../../domain';

const STORAGE_KEY = 'ep-dashboards';

function loadStore(): Record<string, Dashboard[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, Dashboard[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getTenantDashboards(tenantId: string): Dashboard[] {
  return loadStore()[tenantId] ?? [];
}

function setTenantDashboards(tenantId: string, dashboards: Dashboard[]): void {
  const store = loadStore();
  store[tenantId] = dashboards;
  saveStore(store);
}

export const dashboardService = {
  async list(tenantId: string): Promise<Dashboard[]> {
    await delay(120);
    return getTenantDashboards(tenantId).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  async get(tenantId: string, id: string): Promise<Dashboard | null> {
    await delay(80);
    return getTenantDashboards(tenantId).find(d => d.id === id) ?? null;
  },

  async create(tenantId: string, input: CreateDashboard): Promise<Dashboard> {
    await delay(150);
    const now = new Date().toISOString();
    const dashboard: Dashboard = {
      id: `dash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId,
      name: input.name,
      description: input.description,
      widgets: [],
      createdAt: now,
      updatedAt: now,
    };
    const list = getTenantDashboards(tenantId);
    setTenantDashboards(tenantId, [...list, dashboard]);
    return dashboard;
  },

  async update(tenantId: string, id: string, updates: Partial<Pick<Dashboard, 'name' | 'description' | 'widgets'>>): Promise<Dashboard> {
    await delay(120);
    const list = getTenantDashboards(tenantId);
    const idx = list.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Dashboard not found');
    const updated: Dashboard = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    setTenantDashboards(tenantId, list);
    return updated;
  },

  async addWidget(tenantId: string, dashboardId: string, widget: Widget): Promise<Dashboard> {
    const list = getTenantDashboards(tenantId);
    const idx = list.findIndex(d => d.id === dashboardId);
    if (idx === -1) throw new Error('Dashboard not found');
    const updated: Dashboard = {
      ...list[idx],
      widgets: [...list[idx].widgets, widget],
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    setTenantDashboards(tenantId, list);
    return updated;
  },

  async updateWidget(tenantId: string, dashboardId: string, widget: Widget): Promise<Dashboard> {
    const list = getTenantDashboards(tenantId);
    const idx = list.findIndex(d => d.id === dashboardId);
    if (idx === -1) throw new Error('Dashboard not found');
    const updated: Dashboard = {
      ...list[idx],
      widgets: list[idx].widgets.map(w => (w.id === widget.id ? widget : w)),
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    setTenantDashboards(tenantId, list);
    return updated;
  },

  async removeWidget(tenantId: string, dashboardId: string, widgetId: string): Promise<Dashboard> {
    const list = getTenantDashboards(tenantId);
    const idx = list.findIndex(d => d.id === dashboardId);
    if (idx === -1) throw new Error('Dashboard not found');
    const updated: Dashboard = {
      ...list[idx],
      widgets: list[idx].widgets.filter(w => w.id !== widgetId),
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    setTenantDashboards(tenantId, list);
    return updated;
  },

  async delete(tenantId: string, id: string): Promise<void> {
    await delay(100);
    const list = getTenantDashboards(tenantId).filter(d => d.id !== id);
    setTenantDashboards(tenantId, list);
  },
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
