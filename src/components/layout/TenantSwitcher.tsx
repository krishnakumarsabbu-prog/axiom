import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore, useTenantStore } from '../../stores';

export const TenantSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { session, updateActiveTenant } = useAuthStore();
  const { tenants, currentTenant, loadTenants, setCurrentTenant } = useTenantStore();

  useEffect(() => {
    if (session?.user.tenantIds) {
      loadTenants(session.user.tenantIds);
    }
  }, [session?.user.tenantIds, loadTenants]);

  useEffect(() => {
    if (session?.activeTenantId) {
      setCurrentTenant(session.activeTenantId);
    }
  }, [session?.activeTenantId, setCurrentTenant]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTenantChange = (tenantId: string) => {
    updateActiveTenant(tenantId);
    setCurrentTenant(tenantId);
    setIsOpen(false);
  };

  if (!currentTenant) {
    return (
      <div className="px-4 py-2 bg-bg-panel2 rounded-lg border border-border-base">
        <span className="text-sm text-fg-muted">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-bg-panel2 border border-border-base rounded-lg hover:border-border-subtle transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-bg-base border border-border-subtle rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-brand-base">
              {currentTenant.name.charAt(0)}
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-fg-base">{currentTenant.name}</p>
            <p className="text-xs text-fg-muted">{currentTenant.slug}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-fg-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 glass-card shadow-soft z-50">
          <div className="p-2 border-b border-border-base">
            <p className="text-xs font-medium text-fg-muted px-3 py-2">Switch Tenant</p>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantChange(tenant.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  tenant.id === currentTenant.id
                    ? 'bg-bg-base text-brand-base shadow-subtle'
                    : 'hover:bg-bg-panel text-fg-base'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  tenant.id === currentTenant.id ? 'bg-bg-base border-border-subtle' : 'bg-bg-panel2 border-border-base'
                }`}>
                  <span className="text-sm font-semibold">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{tenant.name}</p>
                  <p className="text-xs text-fg-muted">{tenant.slug}</p>
                </div>
                {tenant.id === currentTenant.id && (
                  <svg className="w-4 h-4 text-brand-base" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
