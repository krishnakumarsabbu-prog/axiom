import { create } from 'zustand';
import type { UserSession } from '../domain';
import { authService } from '../services/mock';

interface AuthState {
  session: UserSession | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateActiveTenant: (tenantId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: () => {
    const session = authService.getSession();
    set({ session, isInitialized: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const session = await authService.login({ email, password });
      set({ session, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ session: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateActiveTenant: (tenantId: string) => {
    const currentSession = authService.getSession();
    if (!currentSession) return;

    if (!currentSession.user.tenantIds.includes(tenantId)) {
      console.error('User does not have access to this tenant');
      return;
    }

    authService.updateSession({ activeTenantId: tenantId });
    const updatedSession = authService.getSession();
    set({ session: updatedSession });
  }
}));
