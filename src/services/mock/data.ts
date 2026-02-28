import type { Tenant, User } from '../../domain';

export const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Acme Corporation',
    slug: 'acme',
    description: 'Global technology solutions provider',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    status: 'active',
    config: {
      maxExperiments: 100,
      features: ['advanced-analytics', 'custom-connectors']
    }
  },
  {
    id: 'tenant-2',
    name: 'TechStart Industries',
    slug: 'techstart',
    description: 'Innovative startup focused on AI experimentation',
    createdAt: '2024-02-10T10:30:00Z',
    updatedAt: '2024-02-10T10:30:00Z',
    status: 'active',
    config: {
      maxExperiments: 50,
      features: ['basic-analytics']
    }
  },
  {
    id: 'tenant-3',
    name: 'Global Enterprises Ltd',
    slug: 'global-ent',
    description: 'Enterprise-scale experimentation platform',
    createdAt: '2024-03-05T14:20:00Z',
    updatedAt: '2024-03-05T14:20:00Z',
    status: 'active',
    config: {
      maxExperiments: 500,
      features: ['advanced-analytics', 'custom-connectors', 'sso', 'audit-logs']
    }
  },
  {
    id: 'tenant-4',
    name: 'Research Labs Inc',
    slug: 'research-labs',
    description: 'Academic and research experimentation workspace',
    createdAt: '2024-03-20T09:15:00Z',
    updatedAt: '2024-03-20T09:15:00Z',
    status: 'active',
    config: {
      maxExperiments: 200,
      features: ['advanced-analytics', 'collaboration-tools']
    }
  }
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@acme.com',
    name: 'John Admin',
    role: 'admin',
    tenantIds: ['tenant-1', 'tenant-2', 'tenant-3', 'tenant-4']
  },
  {
    id: 'user-2',
    email: 'user@techstart.com',
    name: 'Jane User',
    role: 'user',
    tenantIds: ['tenant-2']
  },
  {
    id: 'user-3',
    email: 'viewer@global.com',
    name: 'Bob Viewer',
    role: 'viewer',
    tenantIds: ['tenant-3']
  }
];

export const mockPasswords: Record<string, string> = {
  'admin@acme.com': 'admin123',
  'user@techstart.com': 'user123',
  'viewer@global.com': 'viewer123'
};
