import type { LoginRequest, UserSession, User } from '../../domain';
import { mockUsers, mockPasswords } from './data';

const SESSION_KEY = 'experiment-portal-session';

function generateToken(): string {
  return `token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function createSession(user: User, activeTenantId: string): UserSession {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8);

  return {
    user,
    token: generateToken(),
    expiresAt: expiresAt.toISOString(),
    activeTenantId
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<UserSession> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const expectedPassword = mockPasswords[credentials.email];
    if (credentials.password !== expectedPassword) {
      throw new Error('Invalid email or password');
    }

    const activeTenantId = user.tenantIds[0];
    const session = createSession(user, activeTenantId);

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  },

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    localStorage.removeItem(SESSION_KEY);
  },

  getSession(): UserSession | null {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData) as UserSession;

      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  updateSession(updates: Partial<UserSession>): void {
    const current = this.getSession();
    if (!current) return;

    const updated = { ...current, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  }
};
