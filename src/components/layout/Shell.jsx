import React, { useState, useMemo } from 'react'
import { useTranslation } from '../../lib/i18n.jsx'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import GlobalSearch from '../features/GlobalSearch'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, Settings as SettingsIcon, User, Moon, Sun, Menu, X } from 'lucide-react'
import TaskCreator from '../features/TaskCreator'
import TaskDrawer from '../features/TaskDrawer'

const Shell = ({ children, activeSection, setActiveSection, tasks, events, categories, addTask, updateTask, deleteTask, addCategory, selectedFolder, onSelectFolder, user, onLogout, settings, updateSettings, onOpenNoteEditor }) => {
  const { t } = useTranslation();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getInitials = () => {
    if (!user) return 'GA'; // Guest Account
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  // Function to be called from children (Dashboard, Calendar)
  const openTaskDetail = (task) => {
    setSelectedTask(task);
  };

  // Ensure the drawer always has the latest task data from the global tasks state
  const currentTask = selectedTask ? tasks.find(t => t.id === selectedTask.id) : null;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          selectedFolder={selectedFolder}
          onSelectFolder={onSelectFolder}
          tasks={tasks}
          categories={categories}
          onNewTask={() => setIsCreatorOpen(true)}
          user={user}
          onLogout={onLogout}
          addCategory={addCategory}
        />
      </div>

      {/* Sidebar Spacer for Desktop */}
      <div className="hidden md:block w-[240px] flex-shrink-0" />

      {/* Task Creator Modal */}
      <AnimatePresence>
        {isCreatorOpen && (
          <TaskCreator 
            isOpen={isCreatorOpen} 
            onClose={() => setIsCreatorOpen(false)} 
            addTask={addTask}
            categories={categories}
            addCategory={addCategory}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Drawer */}
      <TaskDrawer 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        task={currentTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 flex items-center px-4 bg-white border-b border-gray-100 justify-between sticky top-0 z-30 flex-shrink-0">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
              >
                <Menu size={20} />
              </button>
              <h1 
                className="text-xl font-bold text-blue-600 mr-4 cursor-pointer"
                onClick={() => {
                  setActiveSection('dashboard');
                  onSelectFolder(null);
                }}
              >
                FocusFlow
              </h1>
           </div>
           
           <div className="flex-1 flex justify-end mr-4">
             <GlobalSearch tasks={tasks} events={events} openTaskDetail={openTaskDetail} setActiveSection={setActiveSection} />
           </div>

           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsCreatorOpen(true)}
               className="p-2 bg-blue-600 text-white rounded-lg shadow-sm active:scale-95 transition-transform"
             >
               <Plus size={20} />
             </button>
             <div 
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className="w-8 h-8 rounded-full bg-blue-100 flex flex-col items-center justify-center text-blue-600 font-bold text-xs border border-blue-200 cursor-pointer shadow-sm active:scale-95 transition-transform"
             >
               {getInitials()}
             </div>
           </div>
        </div>

        {/* Desktop Header */}
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 border-b border-gray-200 bg-white items-center justify-between px-8 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight whitespace-nowrap min-w-[100px]">
              {t(activeSection.charAt(0).toUpperCase() + activeSection.slice(1))}
            </h2>
            <GlobalSearch tasks={tasks} events={events} openTaskDetail={openTaskDetail} setActiveSection={setActiveSection} />
          </div>
          <div className="flex items-center gap-4 relative">
             {settings && (
               <button 
                 onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                 className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all mr-2"
                 title={settings.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
               >
                  {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
             )}

             <div 
               className="flex items-center gap-3 cursor-pointer group"
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user ? (user.displayName || user.email.split('@')[0]) : 'Guest Account'}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{user ? user.email : 'Local Storage Only'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-100 relative">
                  {getInitials()}
                  {user && (
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white ring-2 ring-green-100"></div>
                  )}
                </div>
             </div>
          </div>
        </header>

        {/* Unified Mobile Sidebar Drawer */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 z-[120] md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-[260px] bg-white z-[130] md:hidden shadow-2xl"
              >
                <Sidebar 
                  activeSection={activeSection} 
                  setActiveSection={(sec) => { setActiveSection(sec); setIsMobileSidebarOpen(false); }}
                  selectedFolder={selectedFolder}
                  onSelectFolder={(folder) => { onSelectFolder(folder); setIsMobileSidebarOpen(false); }}
                  tasks={tasks}
                  categories={categories}
                  onNewTask={() => { setIsCreatorOpen(true); setIsMobileSidebarOpen(false); }}
                  user={user}
                  onLogout={onLogout}
                  addCategory={addCategory}
                />
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Global Profile Dropdown (Shared for both views) */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
               <div className="fixed inset-0 z-[100]" onClick={() => setIsDropdownOpen(false)} />
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 transition={{ duration: 0.15 }}
                 className="absolute right-4 top-16 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-[110] origin-top-right"
               >
                  <div 
                     className="p-4 border-b border-slate-50 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors"
                     onClick={() => { 
                        setActiveSection('dashboard'); 
                        onSelectFolder(null);
                        setIsDropdownOpen(false); 
                     }}
                  >
                     <p className="text-sm font-bold text-slate-800">{user ? user.displayName || 'FocusFlow User' : 'Guest Mode'}</p>
                     <p className="text-xs text-slate-500 truncate">{user ? user.email : 'Offline workspace'}</p>
                  </div>
                  <div className="p-2">
                     <button 
                       onClick={() => { setActiveSection('settings'); setIsDropdownOpen(false); }}
                       className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                     >
                        <User size={16} /> Edit Profile
                     </button>
                  </div>
                  <div className="p-2 border-t border-slate-50">
                     <button 
                       onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                       className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                     >
                        <LogOut size={16} /> Sign Out {user ? '' : '(Exit Guest)'}
                     </button>
                  </div>
               </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA - RENDERED ONLY ONCE */}
        <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeSection}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2, ease: "easeInOut" }}
               className="p-4 md:p-8"
             >
               {React.Children.map(children, child => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, { 
                       onOpenTask: openTaskDetail,
                       onOpenNoteEditor: onOpenNoteEditor, // Add this
                       setActiveSection: setActiveSection 
                    });
                  }
                  return child;
               })}
             </motion.div>
           </AnimatePresence>
        </main>

        <div className="md:hidden flex-shrink-0">
          <MobileNav 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            onSelectFolder={onSelectFolder}
          />
        </div>
      </div>
    </div>
  )
}

export default Shell
