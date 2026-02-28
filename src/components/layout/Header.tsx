import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useTenantStore } from '../../stores';
import { TenantSwitcher } from './TenantSwitcher';

export const Header: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { session, logout } = useAuthStore();
  const { currentTenant } = useTenantStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <TenantSwitcher />

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-96 px-4 py-2 pl-10 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {currentTenant && (
          <div className="text-right pr-4 border-r border-neutral-200">
            <p className="text-xs text-neutral-500">Active Tenant</p>
            <p className="text-sm font-medium text-neutral-900">{currentTenant.name}</p>
          </div>
        )}

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-neutral-50 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {session?.user.name.charAt(0) || 'U'}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">{session?.user.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{session?.user.role}</p>
            </div>
            <svg
              className={`w-4 h-4 text-neutral-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900">{session?.user.name}</p>
                  <p className="text-xs text-neutral-500">{session?.user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg mt-2"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
