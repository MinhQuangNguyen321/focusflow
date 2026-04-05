import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, RefreshCcw, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n.jsx';

const PRESETS = [
  { label: 'Pomodoro', minutes: 25, color: 'text-rose-500', bg: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
  { label: 'Short Break', minutes: 5, color: 'text-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
  { label: 'Long Break', minutes: 15, color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/20' }
];

const Focus = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins default
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(PRESETS[0]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [customMin, setCustomMin] = useState('');
  const [customSec, setCustomSec] = useState('');

  const intervalRef = useRef(null);

  // Request Notification Permissions
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const notifyComplete = () => {
    if (notificationsEnabled) {
      new Notification('Time is up!', {
        body: `Your ${currentPreset?.label || 'Focus'} session is complete.`,
        icon: '/favicon.ico'
      });
    }
  };

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      clearInterval(intervalRef.current);
      notifyComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!notificationsEnabled && !isActive) {
      // Prompt on first start if not enabled
      requestNotificationPermission();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const setPreset = (preset) => {
    setIsActive(false);
    setCurrentPreset(preset);
    const newTime = preset.minutes * 60;
    setTimeLeft(newTime);
    setInitialTime(newTime);
  };

  const setCustomTime = (e) => {
    e.preventDefault();
    const min = parseInt(customMin) || 0;
    const sec = parseInt(customSec) || 0;
    
    if (min === 0 && sec === 0) return;

    const newTime = (min * 60) + sec;
    setIsActive(false);
    setCurrentPreset(null);
    setTimeLeft(newTime);
    setInitialTime(newTime);
    setCustomMin('');
    setCustomSec('');
  };

  // Formatting
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const activeColor = currentPreset ? currentPreset.color : 'text-slate-800';
  const activeBg = currentPreset ? currentPreset.bg : 'bg-slate-800';
  const activeShadow = currentPreset ? currentPreset.shadow : 'shadow-slate-800/20';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 h-full flex flex-col items-center overflow-y-auto overflow-x-hidden">
      
      <div className="w-full flex justify-between items-center mb-12 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{t('Focus Mode')}</h1>
          <p className="text-slate-500 font-medium hidden sm:block">{t('Block distractions and accomplish your tasks.')}</p>
        </div>
        <button 
          onClick={requestNotificationPermission}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-sm border ${
            notificationsEnabled 
              ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {notificationsEnabled ? <Bell size={18} /> : <VolumeX size={18} />}
          {notificationsEnabled ? t('Notifications On') : t('Enable Notifications')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center w-full max-w-4xl flex-1 pb-10">
        
        {/* Timer Display */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center flex-shrink-0 mb-8 lg:mb-0">
           {/* SVG Progress Circle */}
           <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-xl overflow-visible">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                className="stroke-slate-100 fill-white"
                strokeWidth="4%"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="46%"
                className={`fill-transparent stroke-current transition-colors duration-500 ${activeColor}`}
                strokeWidth="6%"
                strokeLinecap="round"
                initial={{ strokeDasharray: "289%", strokeDashoffset: "289%" }}
                animate={{ strokeDashoffset: `${289 - (289 * progress) / 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
           </svg>
           
           <div className="relative z-10 flex flex-col items-center">
             <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2 whitespace-nowrap">
               {currentPreset ? currentPreset.label : t('Custom Timer')}
             </span>
             <h2 className={`text-6xl md:text-7xl font-black tabular-nums tracking-tighter transition-colors duration-500 ${activeColor}`}>
               {formatTime(timeLeft)}
             </h2>
           </div>
        </div>

        {/* Controls & Presets */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
           
           {/* Primary Controls */}
           <div className="flex items-center justify-center gap-6 p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <button 
                onClick={resetTimer}
                disabled={timeLeft === initialTime && !isActive}
                className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <RefreshCcw size={24} />
             </button>
             <button 
                onClick={toggleTimer}
                className={`flex-1 min-w-[80px] min-h-[80px] p-6 rounded-[2rem] text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center ${activeBg} ${activeShadow}`}
             >
               {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
             </button>
             <button 
                onClick={() => { setIsActive(false); setTimeLeft(0); }}
                disabled={timeLeft === 0}
                className="p-4 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Square size={24} fill="currentColor" />
             </button>
           </div>


           {/* Presets */}
           <div className="grid grid-cols-3 gap-3">
             {PRESETS.map((preset) => (
               <button
                 key={preset.label}
                 onClick={() => setPreset(preset)}
                 className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                   currentPreset?.label === preset.label 
                     ? `border-transparent bg-white ${preset.shadow} shadow-lg ring-1 ring-black/5` 
                     : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                 }`}
               >
                 <span className={`text-lg font-black ${currentPreset?.label === preset.label ? preset.color : 'text-slate-700'}`}>
                   {preset.minutes}
                 </span>
                 <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1 text-center">
                   {preset.label.split(' ')[0]}
                 </span>
               </button>
             ))}
           </div>

           {/* Custom Time */}
           <form onSubmit={setCustomTime} className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
             <div className="flex bg-slate-50 rounded-xl overflow-hidden flex-1">
               <input 
                 type="number" 
                 min="0" 
                 max="999"
                 placeholder="Min"
                 value={customMin}
                 onChange={(e) => setCustomMin(e.target.value)}
                 className="w-full bg-transparent p-3 text-center text-sm font-bold text-slate-700 focus:outline-none placeholder:text-slate-300"
               />
               <div className="w-px bg-slate-200 my-2" />
               <input 
                 type="number" 
                 min="0" 
                 max="59"
                 placeholder="Sec"
                 value={customSec}
                 onChange={(e) => setCustomSec(e.target.value)}
                 className="w-full bg-transparent p-3 text-center text-sm font-bold text-slate-700 focus:outline-none placeholder:text-slate-300"
               />
             </div>
             <button 
               type="submit"
               disabled={!customMin && !customSec}
               className="px-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
               {t('Set')}
             </button>
           </form>

        </div>
      </div>
    </div>
  );
};

export default Focus;
