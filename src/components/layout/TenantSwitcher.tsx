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
      <div className="px-4 py-2 bg-neutral-100 rounded-lg">
        <span className="text-sm text-neutral-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700">
              {currentTenant.name.charAt(0)}
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-neutral-900">{currentTenant.name}</p>
            <p className="text-xs text-neutral-500">{currentTenant.slug}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-neutral-200">
            <p className="text-xs font-medium text-neutral-500 px-3 py-2">Switch Tenant</p>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantChange(tenant.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  tenant.id === currentTenant.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-neutral-50 text-neutral-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tenant.id === currentTenant.id ? 'bg-primary-200' : 'bg-neutral-100'
                }`}>
                  <span className="text-sm font-semibold">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{tenant.name}</p>
                  <p className="text-xs text-neutral-500">{tenant.slug}</p>
                </div>
                {tenant.id === currentTenant.id && (
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
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
