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
    <header className="h-16 glass-panel border-b border-border-base flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80">
      <div className="flex items-center gap-6">
        <TenantSwitcher />

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-96 px-4 py-2 pl-10 bg-bg-panel2 border border-border-base rounded-lg focus:outline-none focus:border-brand-base focus:shadow-glow text-fg-base placeholder:text-fg-muted transition-all duration-200"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fg-muted"
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
          <div className="text-right pr-4 border-r border-border-base">
            <p className="text-xs text-fg-muted">Active Tenant</p>
            <p className="text-sm font-medium text-fg-base">{currentTenant.name}</p>
          </div>
        )}

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-bg-panel2 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-base to-fg-muted rounded-full flex items-center justify-center shadow-subtle">
              <span className="text-sm font-semibold text-bg-base">
                {session?.user.name.charAt(0) || 'U'}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-fg-base">{session?.user.name}</p>
              <p className="text-xs text-fg-muted capitalize">{session?.user.role}</p>
            </div>
            <svg
              className={`w-4 h-4 text-fg-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 glass-card shadow-soft z-50">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-border-base">
                  <p className="text-sm font-medium text-fg-base">{session?.user.name}</p>
                  <p className="text-xs text-fg-muted">{session?.user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-fg-base hover:bg-bg-panel rounded-lg mt-2 transition-colors"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
