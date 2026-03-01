import { create } from 'zustand';
import type { Dashboard, Widget, CreateDashboard } from '../domain';
import { dashboardService } from '../services/mock';

interface DashboardState {
  dashboards: Dashboard[];
  current: Dashboard | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadList: (tenantId: string) => Promise<void>;
  loadOne: (tenantId: string, id: string) => Promise<void>;
  create: (tenantId: string, input: CreateDashboard) => Promise<Dashboard>;
  save: (tenantId: string, id: string, updates: Partial<Pick<Dashboard, 'name' | 'description' | 'widgets'>>) => Promise<void>;
  addWidget: (tenantId: string, dashboardId: string, widget: Widget) => Promise<void>;
  updateWidget: (tenantId: string, dashboardId: string, widget: Widget) => Promise<void>;
  removeWidget: (tenantId: string, dashboardId: string, widgetId: string) => Promise<void>;
  deleteDashboard: (tenantId: string, id: string) => Promise<void>;
  setCurrent: (d: Dashboard | null) => void;
  updateCurrentWidgets: (widgets: Widget[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboards: [],
  current: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadList: async (tenantId) => {
    set({ isLoading: true, error: null });
    try {
      const dashboards = await dashboardService.list(tenantId);
      set({ dashboards, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed' });
    }
  },

  loadOne: async (tenantId, id) => {
    set({ isLoading: true, error: null });
    try {
      const current = await dashboardService.get(tenantId, id);
      set({ current, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Failed' });
    }
  },

  create: async (tenantId, input) => {
    set({ isSaving: true });
    try {
      const d = await dashboardService.create(tenantId, input);
      set(state => ({ dashboards: [d, ...state.dashboards], isSaving: false }));
      return d;
    } catch (e) {
      set({ isSaving: false, error: e instanceof Error ? e.message : 'Failed' });
      throw e;
    }
  },

  save: async (tenantId, id, updates) => {
    set({ isSaving: true });
    try {
      const updated = await dashboardService.update(tenantId, id, updates);
      set(state => ({
        current: state.current?.id === id ? updated : state.current,
        dashboards: state.dashboards.map(d => d.id === id ? updated : d),
        isSaving: false,
      }));
    } catch (e) {
      set({ isSaving: false, error: e instanceof Error ? e.message : 'Failed' });
      throw e;
    }
  },

  addWidget: async (tenantId, dashboardId, widget) => {
    const updated = await dashboardService.addWidget(tenantId, dashboardId, widget);
    set(state => ({
      current: state.current?.id === dashboardId ? updated : state.current,
    }));
  },

  updateWidget: async (tenantId, dashboardId, widget) => {
    const updated = await dashboardService.updateWidget(tenantId, dashboardId, widget);
    set(state => ({
      current: state.current?.id === dashboardId ? updated : state.current,
    }));
  },

  removeWidget: async (tenantId, dashboardId, widgetId) => {
    const updated = await dashboardService.removeWidget(tenantId, dashboardId, widgetId);
    set(state => ({
      current: state.current?.id === dashboardId ? updated : state.current,
    }));
  },

  deleteDashboard: async (tenantId, id) => {
    await dashboardService.delete(tenantId, id);
    set(state => ({
      dashboards: state.dashboards.filter(d => d.id !== id),
      current: state.current?.id === id ? null : state.current,
    }));
  },

  setCurrent: (d) => set({ current: d }),

  updateCurrentWidgets: (widgets) => {
    set(state => ({
      current: state.current ? { ...state.current, widgets } : null,
    }));
  },
}));
