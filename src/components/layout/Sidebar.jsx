import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  StickyNote, 
  Calendar, 
  Settings, 
  Folder, 
  Timer, 
  Plus
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n.jsx';

const Sidebar = ({ 
  activeSection, 
  setActiveSection, 
  tasks, 
  categories, 
  onNewTask, 
  selectedFolder, 
  onSelectFolder, 
  user, 
  onLogout,
  addCategory
}) => {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', label: t('Home'), icon: LayoutDashboard },
    { id: 'focus', label: t('Focus'), icon: Timer },
    { id: 'notes', label: t('Notes'), icon: StickyNote },
    { id: 'calendar', label: t('Calendar'), icon: Calendar },
    { id: 'settings', label: t('Settings'), icon: Settings },
  ];

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addCategory(newFolderName.trim());
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };
  const getTaskCount = (category) => tasks.filter(t => t.category === category).length;

  return (
    <aside className="w-[240px] h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo Section */}
      <div 
        className="p-8 pb-4 cursor-pointer"
        onClick={() => { setActiveSection('dashboard'); onSelectFolder(null); }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            F
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">FocusFlow</span>
        </div>
      </div>

      {/* Navigation Section (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        {/* Main Menu */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">{t('Home')}</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id && !selectedFolder;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); onSelectFolder(null); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'} />
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900 transition-colors'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.id === 'dashboard' && tasks.length > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tasks.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Folders */}
        <div>
          <div className="flex items-center justify-between px-4 mb-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Folders')}</p>
             <button 
               onClick={() => setIsAddingFolder(true)}
               className="p-1 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm"
               title="Add new folder"
             >
               <Plus size={18} />
             </button>
          </div>
          
          <div className="space-y-1">
            {isAddingFolder && (
               <form onSubmit={handleAddFolder} className="px-4 py-2">
                 <input 
                   autoFocus
                   type="text"
                   placeholder="Folder name..."
                   className="w-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                   value={newFolderName}
                   onChange={e => setNewFolderName(e.target.value)}
                   onBlur={() => { if (!newFolderName.trim()) setIsAddingFolder(false); }}
                 />
               </form>
            )}

            {categories.map(cat => {
              const isFolderActive = activeSection === 'tasks' && selectedFolder === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectFolder(cat)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                    isFolderActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder size={18} className={isFolderActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500 transition-colors'} />
                    <span className={`text-sm font-bold ${isFolderActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900 transition-colors'}`}>{cat}</span>
                  </div>
                  {getTaskCount(cat) > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      isFolderActive ? 'bg-blue-200/50 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {getTaskCount(cat)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Section (Static at bottom) */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        <button 
          onClick={onNewTask}
          className="w-full py-4 bg-blue-600 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
