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
    <aside className="w-[260px] shrink-0 bg-background border-r border-border flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-border">
        <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Experiment Proxy</h1>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors duration-150 no-underline ${
                isActive
                  ? 'bg-secondary text-foreground border border-border font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>
    </aside>
  );
};
