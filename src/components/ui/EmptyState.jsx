import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Ghost, Coffee, Star, Sun, Wind } from 'lucide-react';

// Cute preset SVGs combinations to give a lively empty state feel
const ILLUSTRATIONS = [
  { icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Ghost, color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Wind, color: 'text-teal-500', bg: 'bg-teal-50' }
];

const EmptyState = ({ title = "It's quiet here...", quotes = ["Take a deep breath and start small."] }) => {
  const [randomQuote, setRandomQuote] = useState('');
  const [illustration, setIllustration] = useState(ILLUSTRATIONS[0]);

  useEffect(() => {
    // Pick random quote
    if (quotes && quotes.length > 0) {
      setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
    // Pick random illustration
    setIllustration(ILLUSTRATIONS[Math.floor(Math.random() * ILLUSTRATIONS.length)]);
  }, [quotes]);

  const Icon = illustration.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]"
    >
      <div className={`w-24 h-24 rounded-full ${illustration.bg} flex items-center justify-center mb-6 shadow-inner relative`}>
        <motion.div
           animate={{ y: [0, -10, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={40} className={illustration.color} />
        </motion.div>
        {/* Floating dust particles */}
        <motion.div className="absolute w-2 h-2 bg-white rounded-full top-2 left-4 shadow-sm" animate={{ y: [0, 5, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-4 right-4 shadow-sm" animate={{ y: [0, -6, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} />
      </div>

      <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
      <div className="max-w-xs relative pb-4">
         <span className="text-3xl text-slate-200 absolute -top-4 -left-4 font-serif">"</span>
         <p className="text-sm font-medium text-slate-500 italic relative z-10 leading-relaxed">
           {randomQuote}
         </p>
         <span className="text-3xl text-slate-200 absolute -bottom-6 -right-4 font-serif">"</span>
      </div>
    </motion.div>
  );
};

export default EmptyState;
