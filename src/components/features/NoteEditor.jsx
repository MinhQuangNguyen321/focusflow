import React, { useState, useEffect } from 'react';
import { X, Tag, Palette, Save, Trash2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
  { id: 'rose', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', ring: 'ring-rose-200' },
  { id: 'amber', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', ring: 'ring-amber-200' },
  { id: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  { id: 'violet', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', ring: 'ring-violet-200' },
  { id: 'slate', bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', ring: 'ring-slate-200' },
];

const NoteEditor = ({ isOpen, onClose, note, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedColor(COLORS.find(c => c.bg === note.color) || COLORS[0]);
      setTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setSelectedColor(COLORS[0]);
      setTags([]);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    onSave({
      ...note,
      title: title || 'Untitled Note',
      content,
      color: selectedColor.bg,
      tags
    });
    onClose();
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed inset-x-4 top-20 md:inset-auto md:left-1/2 md:-translate-x-1/2 w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl z-[201] overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]`}
          >
            {/* Header */}
            <div className={`p-6 flex justify-between items-center border-b border-slate-50 ${selectedColor.bg} transition-colors duration-500`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white/50 backdrop-blur-md ${selectedColor.text}`}>
                  <Tag size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {note ? 'Edit Note' : 'New Note'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {note && (
                  <button 
                    onClick={() => { onDelete(note.id); onClose(); }}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Note"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <input 
                type="text" 
                placeholder="Note Title" 
                className="w-full text-3xl font-black text-slate-800 placeholder:text-slate-200 focus:outline-none bg-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              
              <textarea 
                placeholder="Start writing..." 
                className="w-full h-64 text-lg font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none bg-transparent resize-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Tags Area */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <Hash size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold group"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    placeholder="Add tag..." 
                    className="px-3 py-1.5 bg-transparent text-xs font-bold text-slate-500 focus:outline-none"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Palette size={18} className="text-slate-400" />
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color.bg} ${color.border} ${
                        selectedColor.id === color.id ? `ring-4 ${color.ring}` : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Save size={18} />
                Save Note
              </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default NoteEditor;
