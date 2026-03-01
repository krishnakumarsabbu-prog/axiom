import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: '📊' },
  { label: 'Experiments', path: '/app/experiments', icon: '🧪' },
  { label: 'Connectors', path: '/app/connectors', icon: '🔌' },
  { label: 'Mappings', path: '/app/mappings', icon: '🗺️' },
  { label: 'Builder', path: '/app/builder', icon: '🔨' },
  { label: 'Settings', path: '/app/settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 glass-panel flex flex-col h-full">
      <div className="p-6 border-b border-border-base">
        <h1 className="text-xl font-display font-bold text-brand-base tracking-tight">Experiment Proxy</h1>
        <p className="text-xs text-fg-muted mt-1 font-medium">Enterprise Portal</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-bg-panel2 text-brand-base font-medium shadow-subtle'
                  : 'text-fg-muted hover:text-fg-base hover:bg-bg-panel2/50'
              }`
            }
          >
            <span className="text-lg opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-base">
        <div className="text-xs text-fg-muted">
          <p className="font-medium">Version 1.0.0</p>
          <p className="mt-1 opacity-70">Multi-Tenant Edition</p>
        </div>
      </div>
    </aside>
  );
};
