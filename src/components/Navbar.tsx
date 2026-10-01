import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, History, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Today', icon: Target },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-900/90 backdrop-blur-md border-t border-surface-800/80 px-4 py-2 sm:py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                  isActive
                    ? 'text-brand-400 bg-surface-800/60 shadow-inner'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/30'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
