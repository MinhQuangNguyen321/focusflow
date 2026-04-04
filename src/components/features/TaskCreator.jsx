import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Folder, Calendar as CalendarIcon, Flag, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TaskCreator = ({ isOpen, onClose, addTask, categories, addCategory }) => {
  const [step, setStep] = useState('simple'); // simple or advanced
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Work');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('simple');
      setTitle('');
      setDescription('');
      setTags([]);
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [isOpen]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = isNewCategory ? newCategoryName.trim() : selectedCategory;
    if (isNewCategory && finalCategory) {
      addCategory(finalCategory);
    }

    addTask({
      title,
      description,
      category: finalCategory || 'Uncategorized',
      priority,
      dueDate,
      tags,
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {step === 'simple' ? 'Create Task' : 'Advanced Task Creator'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">What needs to be done?</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly design sync"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium text-slate-800 text-lg transition-all"
              />
            </div>

            {step === 'simple' ? (
              <div className="flex items-center justify-between pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep('advanced')}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Details & Tags
                </button>
                <div className="flex gap-3">
                   <button 
                     type="button" 
                     onClick={onClose}
                     className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-600"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={!title.trim()}
                     className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100 transition-all"
                   >
                     Create Task
                   </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-2 overflow-y-auto max-h-[60vh] pr-2"
              >
                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Trash2 size={12} /> Details
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more information about this task..."
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium text-slate-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category/Folder */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Folder size={12} /> Folder
                    </label>
                    {isNewCategory ? (
                      <div className="flex gap-2">
                         <input
                           type="text"
                           value={newCategoryName}
                           onChange={(e) => setNewCategoryName(e.target.value)}
                           placeholder="Folder name"
                           className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-400 font-medium text-sm"
                         />
                         <button 
                           onClick={() => setIsNewCategory(false)}
                           className="text-xs font-bold text-slate-400"
                         >
                           Cancel
                         </button>
                      </div>
                    ) : (
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          if (e.target.value === 'NEW') setIsNewCategory(true);
                          else setSelectedCategory(e.target.value);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-400 font-medium text-slate-700 text-sm appearance-none"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="NEW">+ New Folder...</option>
                      </select>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Flag size={12} /> Priority
                    </label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                      {['Low', 'Medium', 'High'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            priority === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Due Date & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CalendarIcon size={12} /> Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-400 font-medium text-slate-700 text-sm"
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag size={12} /> Tags
                      </label>
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Type & press Enter"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-400 font-medium text-slate-700 text-sm"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-blue-800">
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep('simple')}
                    className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    Back to Simple
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
                  >
                    Create Advanced Task
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskCreator;
