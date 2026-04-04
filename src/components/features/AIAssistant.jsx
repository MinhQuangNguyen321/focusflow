import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, User, CheckCircle2 } from 'lucide-react';
import { addDays, format, nextDay } from 'date-fns';

const AIAssistant = ({ isOpen, onClose, addTask, addEvent }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI assistant. I can help you create tasks and schedule events instantly. Try saying: \"Remind me to buy groceries tomorrow\" or \"Schedule a team meeting at 3pm on Friday.\"", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // -------- LOCAL NLP ENGINE LOGIC --------
  const parseAndExecute = (text) => {
    const lowerText = text.toLowerCase();
    
    // 1. Detect Time (indicates it's likely an event)
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
    const timeMatch = lowerText.match(timeRegex);
    let startTime = null;
    let endTime = null;
    if (timeMatch) {
      const hourStr = timeMatch[1];
      const minStr = timeMatch[2] || '00';
      const ampm = timeMatch[3];
      startTime = `${hourStr.padStart(2, '0')}:${minStr} ${ampm.toUpperCase()}`;
      
      // Rough guestimate end time (+1 hour)
      let endHour = parseInt(hourStr);
      let endAmpm = ampm;
      if (endHour === 11 && ampm === 'am') { endHour = 12; endAmpm = 'pm'; }
      else if (endHour === 11 && ampm === 'pm') { endHour = 12; endAmpm = 'am'; }
      else if (endHour === 12) { endHour = 1; }
      else { endHour += 1; }
      endTime = `${endHour.toString().padStart(2, '0')}:${minStr} ${endAmpm.toUpperCase()}`;
    }

    // 2. Detect Date
    let targetDate = new Date();
    if (lowerText.includes('tomorrow')) {
      targetDate = addDays(new Date(), 1);
    } else if (lowerText.includes('monday')) { targetDate = nextDay(new Date(), 1); }
    else if (lowerText.includes('tuesday')) { targetDate = nextDay(new Date(), 2); }
    else if (lowerText.includes('wednesday')) { targetDate = nextDay(new Date(), 3); }
    else if (lowerText.includes('thursday')) { targetDate = nextDay(new Date(), 4); }
    else if (lowerText.includes('friday')) { targetDate = nextDay(new Date(), 5); }
    else if (lowerText.includes('saturday')) { targetDate = nextDay(new Date(), 6); }
    else if (lowerText.includes('sunday')) { targetDate = nextDay(new Date(), 0); }
    else if (lowerText.includes('next week')) { targetDate = addDays(new Date(), 7); }

    // 3. Detect Priority/Tags
    let priority = 'Medium';
    let color = 'bg-blue-500'; // Event default
    let category = 'General';
    let tags = ['ai-generated'];

    if (lowerText.includes('urgent') || lowerText.includes('important') || lowerText.includes('asap')) {
      priority = 'High';
      color = 'bg-rose-500';
      category = 'Urgent';
      tags.push('urgent');
    } else if (lowerText.includes('meeting') || lowerText.includes('sync') || lowerText.includes('call')) {
      color = 'bg-blue-500';
      category = 'Meeting';
      tags.push('meeting');
    }

    // 4. Determine Intent (Task vs Event vs Note)
    const eventKeywords = ['schedule', 'meeting', 'appointment', 'event'];
    const noteKeywords = ['note', 'remember', 'write down', 'keep track of', 'save this'];
    
    const isExplicitEvent = eventKeywords.some(keyword => lowerText.includes(keyword));
    const isExplicitNote = noteKeywords.some(keyword => lowerText.includes(keyword));
    
    let intent = 'TASK';
    if (isExplicitEvent || timeMatch) intent = 'EVENT';
    else if (isExplicitNote) intent = 'NOTE';

    // 5. Clean up string for title (primitive, but effective for prototype)
    let cleanTitle = text
      .replace(/(remember to|remind me to|create a task to|schedule a|add a|create an|write down|save this|keep track of|create a note about|note that)/i, '')
      .replace(/(tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, '')
      .replace(timeRegex, '')
      .replace(/(on|at|for|by)-?$/g, '')
      .trim();
    
    // Capitalize first letter
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    if (!cleanTitle) cleanTitle = 'Untitled Entry';

    // 6. Execute Actions
    try {
      if (intent === 'EVENT') {
        addEvent({
          title: cleanTitle,
          date: format(targetDate, 'yyyy-MM-dd'),
          startTime: startTime || '09:00 AM', // Default
          endTime: endTime || '10:00 AM',
          location: 'AI Added',
          category: category,
          color: color,
          tags: tags,
          description: `Automatically created by AI Assistant from: "${text}"`,
          createdAt: new Date().toISOString()
        });
        
        return {
          success: true,
          message: `Got it! I've scheduled **${cleanTitle}** for ${format(targetDate, 'EEEE, MMM do')} at ${startTime || '09:00 AM'}. You can view it in your Calendar.`
        };
      } else if (intent === 'NOTE') {
        addNote({
          title: cleanTitle,
          content: `AI captured this thought: "${text}"`,
          color: 'bg-indigo-50',
          tags: ['ai-captured', ...tags.filter(t => t !== 'ai-generated')]
        });

        return {
          success: true,
          message: `I've saved a new note: **${cleanTitle}**. You can find it in your Notes section.`
        };
      } else {
        addTask({
          title: cleanTitle,
          dueDate: format(targetDate, 'yyyy-MM-dd'),
          category: 'Work', // Default to work or general
          priority: priority,
          tags: tags,
          notes: `Automatically created by AI Assistant from: "${text}"`,
          createdAt: new Date().toISOString()
        });
        
        return {
          success: true,
          message: `Done! I've added **${cleanTitle}** to your task list for ${format(targetDate, 'EEEE, MMM do')}.`
        };
      }
    } catch (err) {
      return { success: false, message: "Oops, I encountered a glitch while trying to process that. Could you try rephrasing?" };
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay for realism
    setTimeout(() => {
      const result = parseAndExecute(userMessage.text);
      
      const botMessage = { 
        id: Date.now() + 1, 
        text: result.message, 
        isBot: true,
        success: result.success
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Prevent scroll propagation from modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => document.body.style.overflow = 'auto';
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
          />

          {/* Chat Modal */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 md:bottom-10 md:right-10 w-full max-w-[400px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col z-[201] overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-inner">
                  <Sparkles size={20} className="text-blue-50" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">Nexus AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-medium text-blue-100 uppercase tracking-widest">Active & Listening</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-3 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.isBot ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  
                  {/* Bubble */}
                  <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.isBot 
                      ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm' 
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}>
                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    {msg.success && (
                      <div className="mt-2 text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1 tracking-widest bg-emerald-50 w-max px-2 py-1 rounded-md">
                        <CheckCircle2 size={12} /> Executed
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI to create a task..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl pl-5 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium placeholder:font-normal"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                  <Send size={18} className={isTyping ? 'animate-pulse' : ''} />
                </button>
              </div>
            </form>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
