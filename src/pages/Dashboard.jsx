import React from 'react';
import { Target, CheckCircle2, Clock, Zap, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '../components/ui/EmptyState';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = ({ tasks, events, onOpenTask, categories, setActiveSection, openAIAssistant, user, settings }) => {
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status).length;
  
  // Filter for 'Today' tasks (simplified for prototype)
  const todayTasks = tasks.slice(0, 5);

  // Filter for upcoming events
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.date + ' ' + a.startTime) - new Date(b.date + ' ' + b.startTime))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back, {user ? (user.displayName || user.email.split('@')[0]) : 'Guest'}! 👋
        </h1>
        <p className="text-slate-500 font-medium">You have {tasks.filter(t => t.status === 'Pending').length} tasks and {upcomingEvents.length} events scheduled.</p>
      </div>

      {/* AI Assistant Banner */}
      <motion.button 
        onClick={openAIAssistant}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
            <Sparkles size={32} className="text-blue-50" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Nexus AI Assistant</h2>
            <p className="text-blue-100 font-medium opacity-90">Type what you need, and I'll create the tasks and events automatically.</p>
          </div>
        </div>
        <div className="shrink-0 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-black/10">
          Ask AI
        </div>
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard label="Total Tasks" value={tasks.length} icon={Target} color="bg-blue-600" />
        <StatCard label="Completed" value={getTasksByStatus('Completed')} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard label="Events" value={events.length} icon={Calendar} color="bg-amber-400" />
        <StatCard label="Folders" value={categories.length} icon={Zap} color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-800">Recent Tasks</h3>
               <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
             </div>
             
             <div className="space-y-4">
                {todayTasks.length > 0 ? todayTasks.map((task, index) => (
                  <motion.div 
                    key={task.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onOpenTask(task)}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${task.status === 'Completed' ? 'bg-emerald-400' : 'bg-blue-500'}`} />
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight">{task.title}</p>
                        <p className="text-xs font-semibold text-slate-400">{task.category || 'General'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       {task.priority && (
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                           task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                         }`}>
                           {task.priority}
                         </span>
                       )}
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-2 scale-90 origin-top">
                     <EmptyState title="All clear for today!" quotes={settings?.customQuotes} />
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           {/* Upcoming Events Widget */}
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 uppercase text-xs tracking-widest">Upcoming Events</h3>
                <Clock size={16} className="text-slate-400" />
              </div>
              <div className="space-y-4 flex-1">
                 {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
                   <motion.div 
                     key={event.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors relative overflow-hidden group cursor-pointer"
                   >
                     <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${event.color || 'bg-blue-500'}`} />
                     <div className="flex flex-col gap-1 pl-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          {event.startTime} - {event.endTime}
                        </p>
                        <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                        {event.location && (
                          <p className="text-[10px] font-bold text-slate-400 truncate">{event.location}</p>
                        )}
                     </div>
                   </motion.div>
                 )) : (
                   <div className="py-2 scale-90 origin-top opacity-80">
                     <EmptyState title="Nothing scheduled." quotes={settings?.customQuotes} />
                   </div>
                 )}
              </div>
              <button className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                Create Event
              </button>
           </div>

           <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Focus Session</h4>
                <div className="flex items-center justify-center py-6 relative">
                  <div className="w-24 h-24 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slow"></div>
                  <div className="absolute text-2xl font-black text-white">25:00</div>
                </div>
                <button 
                  onClick={() => setActiveSection('focus')}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all backdrop-blur-sm border border-white/5"
                >
                  Start Timer
                </button>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
