import React, { useMemo, useState } from 'react';
import { Search, Trash2, CheckCircle2, Calendar, Flag, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/ui/EmptyState';
import { format } from 'date-fns';
import { useTranslation } from '../lib/i18n.jsx';

// ── Clear Tasks Modal ──────────────────────────────────────────────
const ClearTasksModal = ({ isOpen, onClose, categories, onConfirm }) => {
  const { t } = useTranslation();
  const [clearType, setClearType] = useState('all');         // 'all' | 'folder' | 'date'
  const [selectedFolder, setSelectedFolder] = useState('');
  const [beforeDate, setBeforeDate] = useState('');

  if (!isOpen) return null;

  const canConfirm =
    clearType === 'all' ||
    (clearType === 'folder' && selectedFolder) ||
    (clearType === 'date' && beforeDate);

  const handleConfirm = () => {
    onConfirm({ type: clearType, folder: selectedFolder, beforeDate });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <Trash2 size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-800">Xóa Công Việc</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 flex flex-col gap-4">

          {/* Option 1: All */}
          <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${clearType === 'all' ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'}`}>
            <input type="radio" name="clearType" className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500" checked={clearType === 'all'} onChange={() => setClearType('all')} />
            <div>
              <p className="font-bold text-slate-800">Xóa tất cả công việc</p>
              <p className="text-xs text-slate-500 mt-0.5">Xóa sạch toàn bộ Task trên hệ thống.</p>
            </div>
          </label>

          {/* Option 2: By Folder */}
          <label className={`flex flex-col gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${clearType === 'folder' ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'}`}>
            <div className="flex items-start gap-3">
              <input type="radio" name="clearType" className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500" checked={clearType === 'folder'} onChange={() => setClearType('folder')} />
              <div>
                <p className="font-bold text-slate-800">Xóa theo thư mục</p>
                <p className="text-xs text-slate-500 mt-0.5">Chỉ xóa Task thuộc về một thư mục nhất định.</p>
              </div>
            </div>
            {clearType === 'folder' && (
              <div className="relative ml-7">
                <select
                  value={selectedFolder}
                  onChange={e => setSelectedFolder(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10"
                >
                  <option value="">-- Chọn thư mục --</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </label>

          {/* Option 3: Before date */}
          <label className={`flex flex-col gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${clearType === 'date' ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'}`}>
            <div className="flex items-start gap-3">
              <input type="radio" name="clearType" className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500" checked={clearType === 'date'} onChange={() => setClearType('date')} />
              <div>
                <p className="font-bold text-slate-800">Xóa trước ngày</p>
                <p className="text-xs text-slate-500 mt-0.5">Xóa mọi Task có ngày tạo trước ngày bạn chọn.</p>
              </div>
            </div>
            {clearType === 'date' && (
              <input
                type="date"
                value={beforeDate}
                onChange={e => setBeforeDate(e.target.value)}
                className="ml-7 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            )}
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem]">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Xác Nhận Xóa
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Tasks Page ─────────────────────────────────────────────────
const Tasks = ({ tasks, selectedFolder, updateTask, deleteTask, clearTasks, categories = [], onOpenTask, settings }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showClearModal, setShowClearModal] = useState(false);

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

  const handleClearConfirm = ({ type, folder, beforeDate }) => {
    if (!clearTasks) return;
    clearTasks(type, folder, beforeDate);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0">
              {t('Folder')}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedFolder || t('All Tasks')}</h1>
          </div>
          <p className="text-slate-500 font-medium">{t('Viewing')} {stats.total} {t('total tasks in this folder.')}</p>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('Search tasks...')}
              className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100/30 focus:border-blue-500 transition-all font-bold text-slate-800 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Clear Button */}
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center justify-center p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl border border-rose-100 transition-all shrink-0"
            title="Xóa hàng loạt"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Tabs & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-8 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-1 hidden-scrollbar w-full md:w-auto">
          {['All', 'Pending', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-2 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t(tab)}
              {activeTab === tab && (
                <div className="absolute -bottom-2.5 left-0 right-0 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <span>{stats.pending} {t('Remaining')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span>{stats.completed} {t('Done')}</span>
        </div>
      </div>

      {/* Task List */}
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
                  <h3 className={`text-lg font-black tracking-tight line-clamp-1 ${task.status === 'Completed' ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Flag size={12} className={task.priority === 'High' ? 'text-rose-500' : 'text-blue-500'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t(task.priority || 'Medium')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {(() => {
                          if (!task.dueDate) return t('No Date');
                          const d = new Date(task.dueDate);
                          return isNaN(d.getTime()) ? t('No Date') : format(d, 'MMM d, yyyy');
                        })()}
                      </span>
                    </div>
                    {task.category && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{task.category}</span>
                    )}
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
              <EmptyState title={t('No tasks found here.')} quotes={settings?.customQuotes} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Tasks Modal */}
      <AnimatePresence>
        {showClearModal && (
          <ClearTasksModal
            isOpen={showClearModal}
            onClose={() => setShowClearModal(false)}
            categories={categories}
            onConfirm={handleClearConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
