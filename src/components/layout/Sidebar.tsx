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
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full">
      <div className="p-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-primary-600">Experiment Proxy</h1>
        <p className="text-xs text-neutral-500 mt-1">Enterprise Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="text-xs text-neutral-500">
          <p>Version 1.0.0</p>
          <p className="mt-1">Multi-Tenant Edition</p>
        </div>
      </div>
    </aside>
  );
};
