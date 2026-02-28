import React from 'react';
import { useAuthStore, useTenantStore } from '../stores';
import { Card } from '../components/ui';

export const SettingsPage: React.FC = () => {
  const { session } = useAuthStore();
  const { currentTenant } = useTenantStore();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-2">Manage your account and tenant settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">User Profile</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Name</p>
              <p className="text-base font-medium text-neutral-900">{session?.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="text-base font-medium text-neutral-900">{session?.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Role</p>
              <p className="text-base font-medium text-neutral-900 capitalize">{session?.user.role}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Current Tenant</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Tenant Name</p>
              <p className="text-base font-medium text-neutral-900">{currentTenant?.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Slug</p>
              <p className="text-base font-medium text-neutral-900">{currentTenant?.slug}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 capitalize">
                {currentTenant?.status}
              </span>
            </div>
            {currentTenant?.description && (
              <div>
                <p className="text-sm text-neutral-600">Description</p>
                <p className="text-base text-neutral-900">{currentTenant.description}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Tenant Access</h3>
          <p className="text-sm text-neutral-600 mb-3">You have access to the following tenants:</p>
          <div className="space-y-2">
            {session?.user.tenantIds.map((tenantId) => (
              <div key={tenantId} className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-neutral-700">{tenantId}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
