import React from 'react';
import { useAuthStore, useTenantStore } from '../stores';
import { Card, Badge } from '../components/ui';

export const SettingsPage: React.FC = () => {
  const { session } = useAuthStore();
  const { currentTenant } = useTenantStore();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-base">Settings</h1>
        <p className="text-fg-muted mt-2">Manage your account and tenant settings</p>
      </div>

      <div className="space-y-6">
        <Card padding="md">
          <h3 className="text-lg font-display font-semibold text-fg-base mb-4">User Profile</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-fg-muted mb-1">Name</p>
              <p className="text-base font-medium text-fg-base">{session?.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-fg-muted mb-1">Email</p>
              <p className="text-base font-medium text-fg-base">{session?.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-fg-muted mb-1">Role</p>
              <Badge variant="default">
                <span className="capitalize">{session?.user.role}</span>
              </Badge>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-display font-semibold text-fg-base mb-4">Current Tenant</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-fg-muted mb-1">Tenant Name</p>
              <p className="text-base font-medium text-fg-base">{currentTenant?.name}</p>
            </div>
            <div>
              <p className="text-sm text-fg-muted mb-1">Slug</p>
              <p className="text-base font-medium text-fg-base">{currentTenant?.slug}</p>
            </div>
            <div>
              <p className="text-sm text-fg-muted mb-1">Status</p>
              <Badge variant="success">
                <span className="capitalize">{currentTenant?.status}</span>
              </Badge>
            </div>
            {currentTenant?.description && (
              <div>
                <p className="text-sm text-fg-muted mb-1">Description</p>
                <p className="text-base text-fg-base">{currentTenant.description}</p>
              </div>
            )}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-lg font-display font-semibold text-fg-base mb-4">Tenant Access</h3>
          <p className="text-sm text-fg-muted mb-3">You have access to the following tenants:</p>
          <div className="space-y-2">
            {session?.user.tenantIds.map((tenantId) => (
              <div key={tenantId} className="flex items-center gap-2 px-3 py-2 bg-bg-base border border-border-base rounded-lg">
                <div className="w-2 h-2 bg-brand-base rounded-full shadow-glow"></div>
                <span className="text-sm text-fg-base">{tenantId}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
