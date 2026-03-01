import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useTenantStore, useThemeStore } from '../../stores';
import { TenantSwitcher } from './TenantSwitcher';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const Header: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { session, logout } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const { theme, toggleTheme } = useThemeStore();

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

  const initials = session?.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 bg-card/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <TenantSwitcher />

        <div className="relative hidden md:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-72 h-8 pl-8 pr-3 bg-muted border border-border rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-150"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {currentTenant && (
          <div className="hidden lg:flex items-center gap-2 pr-3 mr-1 border-r border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">{currentTenant.name}</span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-muted rounded-[var(--radius)] px-2 py-1.5 transition-colors duration-150"
          >
            <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-tight">{session?.user.name}</p>
              <p className="text-[11px] text-muted-foreground capitalize leading-tight">{session?.user.role}</p>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-popover border border-border rounded-[var(--radius)] shadow-card-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/50">
                <p className="text-sm font-semibold text-popover-foreground truncate">{session?.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { setIsUserMenuOpen(false); navigate('/app/settings'); }}
                  className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-[calc(var(--radius)-2px)] transition-colors"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-[calc(var(--radius)-2px)] transition-colors"
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
