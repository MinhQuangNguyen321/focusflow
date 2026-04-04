import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, CheckSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch = ({ tasks = [], events = [], openTaskDetail, setActiveSection }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = React.useMemo(() => {
    if (!query.trim()) return { tasks: [], events: [] };
    const q = query.toLowerCase();

    const filteredTasks = tasks.filter(t => 
       (t.title && t.title.toLowerCase().includes(q)) ||
       (t.category && t.category.toLowerCase().includes(q)) ||
       (t.description && t.description.toLowerCase().includes(q)) ||
       (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    ).slice(0, 5);

    const filteredEvents = events.filter(e => 
       (e.title && e.title.toLowerCase().includes(q)) ||
       (e.location && e.location.toLowerCase().includes(q)) ||
       (e.description && e.description.toLowerCase().includes(q))
    ).slice(0, 5);

    return { tasks: filteredTasks, events: filteredEvents };
  }, [query, tasks, events]);

  const totalResults = results.tasks.length + results.events.length;

  return (
    <div className="relative z-50 w-full max-w-sm ml-8" ref={containerRef}>
      <div className="relative flex items-center">
         <Search size={16} className="absolute left-3 text-slate-400" />
         <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => { if(query) setIsOpen(true); }}
            placeholder="Search tasks, descriptions, events..."
            className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold rounded-full pl-9 pr-8 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:font-medium placeholder:text-slate-400"
         />
         {query && (
            <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute right-3 p-0.5 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300">
               <X size={12} />
            </button>
         )}
      </div>

      <AnimatePresence>
        {isOpen && query && (
           <motion.div 
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 5 }}
             className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
           >
              {totalResults === 0 ? (
                 <div className="p-6 text-center text-slate-500 text-sm font-semibold">
                    No matching activities found.
                 </div>
              ) : (
                 <div className="max-h-80 overflow-y-auto p-2 space-y-4">
                    {/* Tasks Matches */}
                    {results.tasks.length > 0 && (
                       <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 mt-2 mb-1">Tasks</p>
                          {results.tasks.map(task => (
                             <button
                               key={task.id}
                               onClick={() => { openTaskDetail(task); setIsOpen(false); }}
                               className="w-full text-left flex items-start gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors group"
                             >
                               <div className="mt-0.5 text-blue-500"><CheckSquare size={16} /></div>
                               <div>
                                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1">{task.title}</p>
                                  {(task.description || task.category) && (
                                     <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                                        {task.category && <span className="mr-1.5 font-bold text-blue-400">{task.category}</span>}
                                        {task.description}
                                     </p>
                                  )}
                               </div>
                             </button>
                          ))}
                       </div>
                    )}
                    
                    {/* Event Matches */}
                    {results.events.length > 0 && (
                       <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 mt-2 mb-1">Calendar & Events</p>
                          {results.events.map(event => (
                             <button
                               key={event.id}
                               onClick={() => { setActiveSection('calendar'); setIsOpen(false); }}
                               className="w-full text-left flex items-start gap-3 p-3 hover:bg-purple-50 rounded-xl transition-colors group"
                             >
                               <div className="mt-0.5 text-purple-500"><Calendar size={16} /></div>
                               <div>
                                  <p className="text-sm font-bold text-slate-800 group-hover:text-purple-600 line-clamp-1">{event.title}</p>
                                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                                     {event.date} • {event.startTime} {event.location ? `- ${event.location}` : ''}
                                  </p>
                               </div>
                             </button>
                          ))}
                       </div>
                    )}
                 </div>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
