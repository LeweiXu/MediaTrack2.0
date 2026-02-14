
import React from 'react';
import { CURRENT_USER } from '../SampleData';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'library', icon: 'library_books', label: 'Library' },
    { id: 'statistics', icon: 'insights', label: 'Statistics' },
    { id: 'social', icon: 'groups', label: 'Social' },
  ];

  return (
    <aside className="w-20 lg:w-64 border-r border-slate-100 bg-white flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-icons">query_stats</span>
        </div>
        <span className="hidden lg:block font-extrabold text-xl tracking-tight text-slate-900">MediaTrack</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
              activeView === item.id 
              ? 'bg-primary/10 text-primary' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="hidden lg:block font-semibold">{item.label}</span>
          </button>
        ))}

        <div className="pt-8 pb-4">
          <div className="h-px bg-slate-100 mx-2"></div>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
            activeView === 'settings' 
            ? 'bg-primary/10 text-primary' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
          }`}
        >
          <span className="material-icons">settings</span>
          <span className="hidden lg:block font-semibold">Settings</span>
        </button>
      </nav>

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <img 
            alt="Avatar" 
            className="w-10 h-10 rounded-full object-cover" 
            src={CURRENT_USER.avatar} 
          />
          <div className="hidden lg:block">
            <p className="text-sm font-bold text-slate-800">{CURRENT_USER.name}</p>
            <p className="text-xs text-slate-500">{CURRENT_USER.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
