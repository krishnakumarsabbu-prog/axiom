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
    <header className="h-14 border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-xl bg-background/70">
      <div className="flex items-center gap-6">
        <TenantSwitcher />

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-80 h-9 px-3 pl-9 bg-card border border-input rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-1 focus:ring-offset-background transition-colors duration-150"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
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
          <div className="text-right pr-4 border-r border-border">
            <p className="text-xs text-muted-foreground">Active Tenant</p>
            <p className="text-sm font-medium text-foreground">{currentTenant.name}</p>
          </div>
        )}

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-accent rounded-[var(--radius)] px-3 py-2 transition-colors duration-150"
          >
            <div className="w-8 h-8 bg-secondary border border-border rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">
                {session?.user.name.charAt(0) || 'U'}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{session?.user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{session?.user.role}</p>
            </div>
            <svg
              className={`w-4 h-4 text-muted-foreground transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-popover border border-border rounded-[var(--radius)] shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-50">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-popover-foreground">{session?.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-[var(--radius)] mt-2 transition-colors"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-[var(--radius)] transition-colors"
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
