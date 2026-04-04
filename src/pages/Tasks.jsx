import React, { useMemo, useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Trash2, CheckCircle2, Clock, Calendar, Flag, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/ui/EmptyState';
import { format } from 'date-fns';

const Tasks = ({ tasks, selectedFolder, updateTask, deleteTask, onOpenTask, settings }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Completed'

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const isInFolder = !selectedFolder || task.category === selectedFolder;
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'All' || task.status === activeTab;
      return isInFolder && matchesSearch && matchesTab;
    });
  }, [tasks, selectedFolder, search, activeTab]);

  const stats = useMemo(() => {
    const folderTasks = tasks.filter(t => !selectedFolder || t.category === selectedFolder);
    return {
      total: folderTasks.length,
      pending: folderTasks.filter(t => t.status !== 'Completed').length,
      completed: folderTasks.filter(t => t.status === 'Completed').length,
    };
  }, [tasks, selectedFolder]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0">
               Folder
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedFolder || 'All Tasks'}</h1>
           </div>
           <p className="text-slate-500 font-medium">Viewing {stats.total} total tasks in this folder.</p>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl">
           <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100/30 focus:border-blue-500 transition-all font-bold text-slate-800 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-2">
         <div className="flex items-center gap-8">
            {['All', 'Pending', 'Completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-2 text-sm font-black uppercase tracking-widest transition-colors ${
                  activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-2.5 left-0 right-0 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            ))}
         </div>
         
         <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span>{stats.pending} Remaining</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span>{stats.completed} Done</span>
         </div>
      </div>

      {/* Task List Container */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? filteredTasks.map((task, index) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onOpenTask(task)}
              className="p-6 bg-white rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all cursor-pointer group flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTask({ ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' });
                  }}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                    task.status === 'Completed' 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                      : 'bg-white border-slate-100 text-transparent hover:border-blue-400 hover:text-blue-400'
                  }`}
                >
                  <CheckCircle2 size={18} />
                </button>
                
                <div className="flex-1 min-w-0">
                   <h3 className={`text-lg font-black tracking-tight line-clamp-1 ${
                     task.status === 'Completed' ? 'text-slate-300 line-through' : 'text-slate-800'
                   }`}>
                     {task.title}
                   </h3>
                   <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Flag size={12} className={task.priority === 'High' ? 'text-rose-500' : 'text-blue-500'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{task.priority || 'Medium'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No Date'}
                        </span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                   className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                 >
                   <Trash2 size={20} />
                 </button>
              </div>
            </motion.div>
          )) : (
            <div className="py-2 scale-95 opacity-90 origin-top">
               <EmptyState title="No tasks found here." quotes={settings?.customQuotes} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tasks;
