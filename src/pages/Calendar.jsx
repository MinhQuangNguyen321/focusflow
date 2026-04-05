import React, { useState, useEffect, useRef } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  subDays,
  eachDayOfInterval 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, MapPin, List, LayoutGrid, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import EventCreator from '../components/features/EventCreator';

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let [_, hours, minutes, modifier] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  
  if (modifier) {
      if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

const CurrentTimeTracker = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const topPos = now.getHours() * 60 + now.getMinutes();

  return (
    <div 
      className="absolute left-0 right-0 z-20 flex items-center group pointer-events-none" 
      style={{ top: `${topPos}px` }}
    >
      <div className="w-16 text-right pr-2">
        <span className="text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 shadow-sm px-1.5 py-0.5 rounded-md relative -top-2">
          {format(now, 'HH:mm')}
        </span>
      </div>
      <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-sm -ml-1.5 relative z-10" />
      <div className="flex-1 h-[2px] bg-rose-500 shadow-sm" />
    </div>
  );
};

import { useTranslation } from '../lib/i18n.jsx';

const Calendar = ({ tasks, events, addTask, addEvent, updateEvent, deleteEvent, clearActivities, onOpenTask }) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'day'
  const isDraggingItem = useRef(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearType, setClearType] = useState('all'); // 'all' | 'range'
  const [clearStartDate, setClearStartDate] = useState('');
  const [clearEndDate, setClearEndDate] = useState('');

  const handleClear = () => {
    if (clearActivities) {
       clearActivities(clearType, clearStartDate, clearEndDate);
    }
    setShowClearModal(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day) => {
    setSelectedDate(day);
    setViewMode('day'); // Jump to day view to see Google Calendar style layout
  };

  const handleAddQuickTask = () => {
    if (newEventTitle.trim()) {
      addTask({
        title: newEventTitle,
        dueDate: format(selectedDate, 'yyyy-MM-dd'),
        category: 'Work',
        priority: 'Medium',
        tags: [],
        createdAt: new Date().toISOString(),
      });
      setNewEventTitle('');
      setShowTaskModal(false);
    }
  };

  const openEventCreator = (event = null) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        {viewMode === 'month' ? (
           <>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-1 ml-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <div className="w-px bg-slate-100 my-1 mx-1" />
                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>
           </>
        ) : (
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('Timeline')}</h2>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
         {/* Toggle View Mode */}
        <div className="flex bg-slate-200 p-1 rounded-xl mr-2 shadow-inner">
           <button 
             onClick={() => setViewMode('month')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <LayoutGrid size={14} /> {t('Month')}
           </button>
           <button 
             onClick={() => setViewMode('day')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <List size={14} /> {t('Day')}
           </button>
        </div>

        <button 
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
        >
          <Plus size={18} />
          {t('Quick Task')}
        </button>
        <button 
          onClick={() => openEventCreator()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all font-bold text-sm"
        >
          <CalendarIcon size={16} />
          {t('New Event')}
        </button>
        <button 
          onClick={() => setShowClearModal(true)}
          className="flex items-center justify-center p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  const renderMonthCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm min-w-[500px] sm:min-w-0">
        {days.map((day, i) => {
          const formattedDate = format(day, dateFormat);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
          const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));

          return (
            <div
              key={i}
              className={`min-h-[130px] p-2 transition-colors cursor-pointer group ${
                !isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-700'
              } hover:bg-slate-50/80 active:bg-slate-100`}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 group-hover:bg-slate-100'
                }`}>
                  {formattedDate}
                </span>
                <div className="flex gap-1 pr-1">
                   {dayTasks.length > 0 && <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></span>}
                   {dayEvents.length > 0 && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                </div>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div 
                    key={event.id}
                    className={`px-2 py-1 text-[9px] font-black uppercase tracking-tighter ${event.color || 'bg-blue-500'} text-white rounded-[0.5rem] truncate shadow-sm`}
                  >
                    {event.startTime} {event.title}
                  </div>
                ))}
                {dayTasks.slice(0, 1).map((task) => (
                  <div 
                    key={task.id} 
                    className="px-2 py-1 text-[9px] font-bold text-slate-500 border border-slate-100 rounded-[0.5rem] truncate bg-white"
                  >
                    • {task.title}
                  </div>
                ))}
                {(dayEvents.length > 2 || dayTasks.length > 1) && (
                   <div className="px-2 text-[9px] font-bold text-slate-400">
                      +{dayEvents.length + dayTasks.length - 3} more
                   </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  };

  const renderDayTimeline = () => {
     const hours = Array.from({ length: 24 }, (_, i) => i);
     const dayEvents = events.filter(e => isSameDay(new Date(e.date), selectedDate));
     const isToday = isSameDay(selectedDate, new Date());

     return (
       <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]"
       >
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50 gap-4">
             <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 sm:p-3 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-100 transition-colors"><ChevronLeft size={20}/></button>
                <div className="text-center flex-1 sm:min-w-[200px]">
                   <p className="text-base sm:text-lg font-black text-slate-800">{format(selectedDate, 'EEEE, MMM d')}</p>
                   {isToday && <p className="text-[10px] uppercase font-black tracking-widest text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block mt-1">Today</p>}
                </div>
                <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 sm:p-3 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-100 transition-colors"><ChevronRight size={20}/></button>
             </div>
              <div className="w-full sm:w-auto text-center">
                <button 
                   onClick={() => setSelectedDate(new Date())}
                   className="w-full sm:w-auto px-4 py-2 font-bold text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                   {t('Jump to Today')}
                </button>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto relative scroll-smooth">
             <div className="relative min-h-[1440px]"> {/* 24 hours * 60px */}
                
                {/* Background grid */}
                <div className="absolute inset-0 flex flex-col pointer-events-none">
                   {hours.map(h => (
                     <div key={h} className="h-[60px] border-b border-slate-100 flex relative w-full">
                        <div className="w-16 flex-shrink-0 text-right pr-4 relative -top-2.5">
                           <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                             {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}
                           </span>
                        </div>
                        <div className="flex-1 border-l border-slate-50"></div>
                     </div>
                   ))}
                </div>

                {isToday && <CurrentTimeTracker />}

                {/* Events Blocks */}
                <div className="absolute inset-0 pl-16 pt-0">
                   {dayEvents.map(event => {
                      const startMin = parseTimeToMinutes(event.startTime);
                      const endMin = parseTimeToMinutes(event.endTime);
                      const duration = Math.max(endMin - startMin, 30); // minimum 30px height

                      return (
                         <motion.div 
                           key={event.id + event.startTime}
                           drag="y"
                           dragDirectionLock
                           dragMomentum={false}
                           whileDrag={{ scale: 1.02, zIndex: 50, opacity: 0.9, cursor: 'grabbing' }}
                           onDragStart={() => { isDraggingItem.current = true; }}
                           onDragEnd={(e, info) => {
                              setTimeout(() => { isDraggingItem.current = false; }, 150);
                              
                              const pixelsMoved = info.offset.y;
                              
                              if (Math.abs(pixelsMoved) < 10) return; // was just a click
                              
                              let newStartMins = startMin + pixelsMoved;
                              newStartMins = Math.round(newStartMins / 15) * 15; // Snap 15m
                              
                              if (newStartMins < 0) newStartMins = 0;
                              if (newStartMins + duration > 1440) newStartMins = 1440 - duration;
                              
                              const newStartHour = Math.floor(newStartMins / 60);
                              const newStartMin = newStartMins % 60;
                              
                              const newEndMins = newStartMins + duration;
                              const newEndHour = Math.floor(newEndMins / 60);
                              const newEndMin = newEndMins % 60;
                              
                              const pad = (n) => n.toString().padStart(2, '0');
                              const updatedStart = `${pad(newStartHour)}:${pad(newStartMin)}`;
                              const updatedEnd = `${pad(newEndHour)}:${pad(newEndMin)}`;
                              
                              updateEvent({
                                 ...event,
                                 startTime: updatedStart,
                                 endTime: updatedEnd
                              });
                           }}
                           className={`absolute left-[70px] right-6 z-10 rounded-xl border border-white/20 p-3 overflow-hidden shadow-md cursor-pointer hover:shadow-lg hover:z-30 ${event.color || 'bg-blue-500'} text-white group select-none`}
                           style={{ top: `${startMin}px`, height: `${duration}px`, touchAction: 'none' }}
                           onClick={(e) => {
                              if (isDraggingItem.current) {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 return;
                              }
                              openEventCreator(event);
                           }}
                         >
                            <p className="font-black text-sm leading-tight truncate drop-shadow-sm">{event.title}</p>
                            <p className="text-[10px] font-bold opacity-90 tracking-wider truncate mb-1">{event.startTime} - {event.endTime}</p>
                            {event.location && duration > 45 && (
                               <p className="text-[10px] font-medium opacity-80 truncate flex items-center gap-1">
                                  <MapPin size={10} /> {event.location}
                               </p>
                            )}
                         </motion.div>
                      )
                   })}
                   
                   {/* Clickable background to create event at time */}
                   <div 
                      className="absolute inset-0 pointer-events-auto z-0" 
                      onClick={(e) => {
                         const y = e.nativeEvent.offsetY;
                         const hour = Math.floor(y / 60);
                         const isPM = hour >= 12;
                         const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                         const period = isPM ? 'PM' : 'AM';
                         const guessedStart = `${formattedHour.toString().padStart(2, '0')}:00`;
                         openEventCreator();
                      }}
                   />


                </div>
             </div>
          </div>
       </motion.div>
     );
  };

  const selectedDayItems = [
    ...events.filter(e => e.date && isSameDay(new Date(e.date), selectedDate)).map(e => ({ ...e, type: 'event' })),
    ...tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate)).map(t => ({ ...t, type: 'task' }))
  ].sort((a, b) => {
    if (a.type === 'event' && b.type === 'event') return (a.startTime || '').localeCompare(b.startTime || '');
    if (a.type === 'event') return -1;
    return 1;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <EventCreator 
        isOpen={showEventModal} 
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        initialDate={selectedDate}
        editingEvent={editingEvent}
      />

      {/* Quick Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quick Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                autoFocus
                placeholder="Finish project reports..." 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold text-slate-700"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuickTask()}
              />
              <button 
                onClick={handleAddQuickTask}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
              >
                Add to {format(selectedDate, 'MMM d')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {renderHeader()}
          
          {viewMode === 'month' ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-7 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {renderMonthCells()}
             </motion.div>
          ) : (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               {renderDayTimeline()}
             </motion.div>
          )}

        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 min-h-[500px] flex flex-col sticky top-24">
             <div className="mb-8">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                  {format(selectedDate, 'EEEE')}
                </p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {format(selectedDate, 'MMM d, yyyy')}
                </h3>
             </div>
             
             <div className="space-y-4 flex-1">
                {selectedDayItems.length > 0 ? (
                  selectedDayItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                           if (item.type === 'task') onOpenTask(item);
                           if (item.type === 'event') openEventCreator(item);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          item.type === 'event' 
                            ? 'bg-slate-50 hover:bg-slate-100 border-transparent border-l-4 border-l-blue-500' 
                            : 'bg-white border-slate-100 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 pointer-events-none">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            item.type === 'event' ? 'text-blue-600' : 'text-slate-400'
                          }`}>
                            {item.type === 'event' ? `${item.startTime} - ${item.endTime}` : item.category || 'General'}
                          </span>
                          {item.type === 'event' && item.location && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                              <MapPin size={10} /> {item.location}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-800 text-sm leading-tight pointer-events-none">{item.title}</p>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <CalendarIcon size={48} className="mb-4 stroke-1 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No activities scheduled</p>
                  </div>
                )}
             </div>

             <button 
                onClick={() => openEventCreator()}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-100"
             >
                Add Activity
             </button>
          </div>
        </div>
      </div>

      {/* Clear Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-xl font-black text-rose-600">{t('Clear Calendar')}</h3>
                <button 
                  onClick={() => setShowClearModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="radio" 
                      name="clearType" 
                      checked={clearType === 'all'}
                      onChange={() => setClearType('all')}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <p className="font-bold text-slate-800">{t('Clear All Activities')}</p>
                      <p className="text-xs text-slate-500">{t('Deletes every event and task.')}</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="radio" 
                      name="clearType" 
                      checked={clearType === 'range'}
                      onChange={() => setClearType('range')}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <p className="font-bold text-slate-800">{t('Clear Specific Range')}</p>
                      <p className="text-xs text-slate-500">{t('Only delete within selected dates.')}</p>
                    </div>
                  </label>

                  {clearType === 'range' && (
                     <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('Start Date')}</label>
                           <input 
                             type="date"
                             value={clearStartDate}
                             onChange={(e) => setClearStartDate(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                           />
                        </div>
                        <div className="flex-1">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('End Date')}</label>
                           <input 
                             type="date"
                             value={clearEndDate}
                             onChange={(e) => setClearEndDate(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                           />
                        </div>
                     </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem]">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleClear}
                  disabled={clearType === 'range' && (!clearStartDate || !clearEndDate)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Confirm Delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
