import React from 'react';
import { LayoutDashboard, StickyNote, Calendar, Settings, Timer } from 'lucide-react';

const MobileNav = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'focus', icon: Timer, label: 'Focus' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
