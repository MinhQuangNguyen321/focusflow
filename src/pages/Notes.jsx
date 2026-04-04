import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Clock, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NoteCard = ({ note, onEdit, onDelete, index }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    whileHover={{ y: -8, shadow: "0 25px 40px -10px rgba(0, 0, 0, 0.15)" }}
    transition={{ type: 'spring', damping: 20, stiffness: 300, delay: index * 0.05 }}
    onClick={() => onEdit(note)}
    className={`p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-transparent transition-all cursor-pointer group flex flex-col h-full bg-white relative overflow-hidden`}
  >
    <div className={`absolute top-0 left-0 right-0 h-2 ${note.color.replace('bg-', 'bg-').replace('50', '500')} opacity-40`} />
    <div className={`absolute top-0 left-0 right-0 bottom-0 ${note.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
    
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-800 text-sm tracking-tight line-clamp-1">{note.title}</h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="p-2 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-slate-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <p className="text-slate-600 text-[13px] font-medium line-clamp-6 mb-8 leading-relaxed flex-1">
        {note.content}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {note.tags && note.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-2 py-1 rounded-md">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-black/5">
        <Clock size={12} className="text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{note.date}</span>
      </div>
    </div>
  </motion.div>
);

const Notes = ({ notes, onOpenNoteEditor, deleteNote }) => {
  const [search, setSearch] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState('All');

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(search.toLowerCase()) || 
        note.content.toLowerCase().includes(search.toLowerCase());
      
      const matchesTag = activeFilterTag === 'All' || note.tags?.includes(activeFilterTag);
      
      return matchesSearch && matchesTag;
    });
  }, [notes, search, activeFilterTag]);

  const allTags = useMemo(() => {
    const tags = new Set(['All']);
    notes.forEach(note => {
      if (note.tags) note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [notes]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Your Notes</h1>
            <p className="text-slate-500 font-medium tracking-tight">Organize your thoughts, ideas, and inspirations.</p>
         </div>
         
         <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
               <input 
                 type="text" 
                 placeholder="Search thoughts..." 
                 className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-100/30 focus:border-blue-500 transition-all font-bold text-slate-800 shadow-sm"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <button 
              onClick={() => onOpenNoteEditor()}
              className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shrink-0"
            >
              <Plus size={28} />
            </button>
         </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveFilterTag(tag)}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${
              activeFilterTag === tag 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' 
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note, index) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              index={index} 
              onEdit={onOpenNoteEditor} 
              onDelete={deleteNote} 
            />
          ))}
        </AnimatePresence>
        
        {filteredNotes.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-300">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Hash size={40} className="stroke-1 opacity-20" />
             </div>
             <p className="text-sm font-black uppercase tracking-[0.2em]">No notes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
