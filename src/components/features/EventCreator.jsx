import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Tag, Calendar as CalendarIcon, Type, AlignLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const EVENT_CATEGORIES = [
  { name: 'Meeting', color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { name: 'Social', color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-600' },
  { name: 'Fitness', color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { name: 'Urgent', color: 'bg-rose-500', lightColor: 'bg-rose-50', textColor: 'text-rose-600' },
  { name: 'Work', color: 'bg-indigo-500', lightColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
];

const EventCreator = ({ isOpen, onClose, addEvent, updateEvent, deleteEvent, initialDate, editingEvent }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EVENT_CATEGORIES[0]);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setStartTime(editingEvent.startTime || '09:00');
        setEndTime(editingEvent.endTime || '10:00');
        setDate(editingEvent.date || format(new Date(), 'yyyy-MM-dd'));
        setLocation(editingEvent.location || '');
        setDescription(editingEvent.description || '');
        setCategory(EVENT_CATEGORIES.find(c => c.name === editingEvent.category) || EVENT_CATEGORIES[0]);
        setTags(editingEvent.tags || []);
      } else {
        setTitle('');
        setStartTime('09:00');
        setEndTime('10:00');
        setDate(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
        setLocation('');
        setDescription('');
        setCategory(EVENT_CATEGORIES[0]);
        setTags([]);
      }
      setCurrentTag('');
    }
  }, [isOpen, initialDate, editingEvent]);

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

    if (editingEvent) {
       updateEvent({
         ...editingEvent,
         title, startTime, endTime, date, location, description, category: category.name, color: category.color, tags
       });
    } else {
       addEvent({
         title, startTime, endTime, date, location, description, category: category.name, color: category.color, tags, createdAt: new Date().toISOString()
       });
    }

    onClose();
  };

  const handleDelete = () => {
     if (editingEvent && deleteEvent) {
        deleteEvent(editingEvent.id);
        onClose();
     }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 sm:p-10 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                 {editingEvent ? 'Edit Event' : 'Create New Event'}
               </h2>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{editingEvent ? 'Update meeting details' : 'Schedule your next big thing'}</p>
            </div>
            <button type="button" onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title & Category Selector */}
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                  <Type size={20} />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event Title"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[1.5rem] focus:outline-none font-bold text-xl text-slate-800 placeholder:text-slate-300 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {EVENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border-2 ${
                      category.name === cat.name 
                        ? `${cat.color} text-white border-transparent shadow-lg shadow-${cat.color.split('-')[1]}-200` 
                        : `bg-white text-slate-400 border-slate-100 hover:border-slate-200`
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Date & Time */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Date & Time</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
                      <CalendarIcon size={18} className="text-slate-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
                        <Clock size={16} className="text-slate-400" />
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none w-full"
                        />
                      </div>
                      <span className="font-bold text-slate-300">to</span>
                      <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
                        <Clock size={16} className="text-slate-400" />
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Location</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
                    <MapPin size={18} className="text-slate-300" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location..."
                      className="bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Tags */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 h-full max-h-[108px] focus-within:border-blue-200 focus-within:bg-white transition-all">
                    <AlignLeft size={18} className="text-slate-300 mt-0.5" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Notes, links, or details..."
                      className="bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none w-full h-full resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tags</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
                    <Tag size={18} className="text-slate-300" />
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Nature, Work..."
                      className="bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 px-1">
                    {tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 mt-6 pt-6">
              {editingEvent && (
                 <button
                   type="button"
                   onClick={handleDelete}
                   className="p-5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                   title="Delete Event"
                 >
                   <Trash2 size={20} />
                 </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-5 text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-[2] py-5 bg-slate-900 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
              >
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EventCreator;
