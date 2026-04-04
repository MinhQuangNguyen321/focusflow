import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle, Clock, Tag, Folder, Calendar as CalendarIcon, Flag } from 'lucide-react';
import { format } from 'date-fns';

const TaskDrawer = ({ isOpen, onClose, task, updateTask, deleteTask }) => {
  if (!isOpen || !task) return null;

  const toggleStatus = () => {
    updateTask({
      ...task,
      status: task.status === 'Completed' ? 'Pending' : 'Completed'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white h-screen shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <button 
                  onClick={toggleStatus}
                  className={`p-2 rounded-xl transition-all ${
                    task.status === 'Completed' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <CheckCircle size={20} />
                </button>
                <span className={`text-xs font-black uppercase tracking-widest ${
                  task.status === 'Completed' ? 'text-emerald-500' : 'text-slate-400'
                }`}>
                  {task.status}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => { deleteTask(task.id); onClose(); }}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
             <div className="space-y-4">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  {task.title}
                </h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {task.description || "No additional details provided."}
                </p>
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Folder size={10} /> Folder
                      </p>
                      <p className="font-bold text-slate-700 text-sm">{task.category || 'Uncategorized'}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Flag size={10} /> Priority
                      </p>
                      <span className={`text-xs font-black uppercase ${
                        task.priority === 'High' ? 'text-rose-500' : 'text-blue-500'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                     <CalendarIcon size={10} /> Due Date
                   </p>
                   <p className="font-bold text-slate-700 text-sm">
                     {task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'No Date Set'}
                   </p>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                     <Tag size={10} /> Tags
                   </p>
                   <div className="flex flex-wrap gap-2">
                      {task.tags && task.tags.length > 0 ? (
                        task.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase shadow-sm">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No tags attached</span>
                      )}
                   </div>
                </div>
             </div>
          </div>

          {/* Footer Activity */}
          <div className="p-8 bg-slate-50 border-t border-slate-100">
             <div className="flex items-center gap-3 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Created on {task.createdAt ? format(new Date(task.createdAt), 'MMM d, h:mm a') : 'N/A'}
                </span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDrawer;
