import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, User, CheckCircle2 } from 'lucide-react';
import { addDays, format, nextDay } from 'date-fns';

const AIAssistant = ({ isOpen, onClose, addTask, addEvent, settings }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi là trợ lý AI (Nexus AI). Tôi đã được tối ưu hóa để tự động tìm kiếm mô hình phù hợp nhất với tài khoản của bạn. Hãy thử ra lệnh cho tôi nhé!", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedModel, setDetectedModel] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
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
    
    // 1. Detect Time
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
    const timeMatch = lowerText.match(timeRegex);
    let startTime = null;
    let endTime = null;
    if (timeMatch) {
      const hourStr = timeMatch[1];
      const minStr = timeMatch[2] || '00';
      const ampm = timeMatch[3];
      startTime = `${hourStr.padStart(2, '0')}:${minStr} ${ampm.toUpperCase()}`;
      
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
    if (lowerText.includes('tomorrow')) targetDate = addDays(new Date(), 1);
    else if (lowerText.includes('monday')) targetDate = nextDay(new Date(), 1);
    else if (lowerText.includes('tuesday')) targetDate = nextDay(new Date(), 2);
    else if (lowerText.includes('wednesday')) targetDate = nextDay(new Date(), 3);
    else if (lowerText.includes('thursday')) targetDate = nextDay(new Date(), 4);
    else if (lowerText.includes('friday')) targetDate = nextDay(new Date(), 5);
    else if (lowerText.includes('saturday')) targetDate = nextDay(new Date(), 6);
    else if (lowerText.includes('sunday')) targetDate = nextDay(new Date(), 0);
    else if (lowerText.includes('next week')) targetDate = addDays(new Date(), 7);

    // 3. Simple Intent Logic
    let priority = 'Medium';
    let tags = ['ai-generated'];
    if (lowerText.includes('urgent') || lowerText.includes('important')) priority = 'High';

    const eventKeywords = ['schedule', 'meeting', 'appointment', 'event', 'họp', 'lịch'];
    const timeInText = timeMatch || lowerText.includes('h') || lowerText.includes(':');
    
    let intent = (eventKeywords.some(k => lowerText.includes(k)) || timeInText) ? 'EVENT' : 'TASK';

    let cleanTitle = text
      .replace(/(remember to|remind me to|schedule a|hãy|nhắc|lên lịch|họp|vào|lúc)/gi, '')
      .replace(/(tomorrow|today|thứ|chiều|sáng|tối)/gi, '')
      .replace(timeRegex, '')
      .trim();
    
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) || 'Nội dung AI phân tích';

    try {
      if (intent === 'EVENT') {
        addEvent({
          title: cleanTitle,
          date: format(targetDate, 'yyyy-MM-dd'),
          startTime: startTime || '09:00 AM',
          endTime: endTime || '10:00 AM',
          location: 'Phân tích cục bộ',
          category: 'Cá nhân',
          color: 'bg-blue-500',
          tags: tags,
          description: `Tạo bởi xử lý dự phòng từ: "${text}"`,
          createdAt: new Date().toISOString()
        });
        return { success: true, message: `Tiếp nhận! Tôi đã lên lịch **${cleanTitle}** vào lúc ${startTime || '09:00 AM'}, ngày ${format(targetDate, 'dd/MM/yyyy')}.` };
      } else {
        addTask({
          title: cleanTitle,
          dueDate: format(targetDate, 'yyyy-MM-dd'),
          category: 'Chung',
          priority: priority,
          tags: tags,
          notes: `Tạo bởi xử lý dự phòng từ: "${text}"`,
          createdAt: new Date().toISOString()
        });
        return { success: true, message: `Xong! Tôi đã thêm **${cleanTitle}** vào danh sách công việc ngày ${format(targetDate, 'dd/MM/yyyy')}.` };
      }
    } catch (err) {
      return { success: false, message: "Rất tiếc, tôi gặp lỗi khi tự xử lý. Bạn thử diễn đạt khác nhé?" };
    }
  };

  const findWorkingModel = async (apiKey) => {
    setIsDiscovering(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!response.ok) throw new Error("Không thể liệt kê mô hình");
      const data = await response.json();
      const bestModels = (data.models || []).filter(m => m.supportedGenerationMethods.includes('generateContent') && !m.name.includes('vision'));
      if (bestModels.length === 0) throw new Error("Không có mô hình phù hợp");
      const priorityModel = bestModels.find(m => m.name.includes('flash')) || bestModels.find(m => m.name.includes('pro')) || bestModels[0];
      return priorityModel.name;
    } catch (err) {
      return null;
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const apiKey = settings?.geminiKey?.trim() || import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey) {
      try {
        let currentModel = detectedModel;
        if (!currentModel) {
          currentModel = await findWorkingModel(apiKey);
          if (currentModel) setDetectedModel(currentModel);
        }

        if (!currentModel) throw new Error("API Key không có quyền truy cập Gemini.");

        const prompt = `You are a productivity AI. Parse this command: "${currentInput}". \nCurrent Date: ${format(new Date(), 'yyyy-MM-dd')}\nReturn JSON: {intent:TASK|EVENT, title, date, startTime, endTime, priority, category, tags, responseMessage(Vietnamese)}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${currentModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
          if (response.status === 404) setDetectedModel(null);
          const errData = await response.json();
          throw new Error(errData.error?.message || "Lỗi API");
        }

        const data = await response.json();
        let jsonStr = data.candidates[0].content.parts[0].text;
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        if (parsed.intent === 'EVENT') {
          addEvent({ title: parsed.title, date: parsed.date || format(new Date(), 'yyyy-MM-dd'), startTime: parsed.startTime || '09:00 AM', endTime: parsed.endTime || '10:00 AM', location: 'Nexus AI', category: parsed.category, color: 'bg-indigo-500', tags: parsed.tags, description: `Tạo bởi ${currentModel}`, createdAt: new Date().toISOString() });
        } else {
          addTask({ title: parsed.title, dueDate: parsed.date || format(new Date(), 'yyyy-MM-dd'), category: parsed.category, priority: parsed.priority, tags: parsed.tags, notes: `Tạo bởi ${currentModel}`, createdAt: new Date().toISOString() });
        }

        setMessages(prev => [...prev, { id: Date.now() + 1, text: parsed.responseMessage, isBot: true, success: true }]);
      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: `⚠️ AI: ${err.message}. Đang dùng bộ xử lý dự phòng...`, isBot: true, success: false }]);
        const result = parseAndExecute(currentInput);
        setMessages(prev => [...prev, { id: Date.now() + 2, text: result.message, isBot: true, success: result.success }]);
      } finally {
        setIsTyping(false);
      }
    } else {
      setTimeout(() => {
        const result = parseAndExecute(currentInput);
        setMessages(prev => [...prev, { id: Date.now() + 1, text: result.message, isBot: true, success: result.success }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => document.body.style.overflow = 'auto';
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]" />
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-4 right-4 md:bottom-10 md:right-10 w-full max-w-[400px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col z-[201] overflow-hidden border border-slate-100">
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
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
              {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex gap-3 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>{msg.isBot ? <Bot size={16} /> : <User size={16} />}</div>
                  <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isBot ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'}`}>
                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    {msg.success && <div className="mt-2 text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1 tracking-widest bg-emerald-50 w-max px-2 py-1 rounded-md"><CheckCircle2 size={12} /> Executed</div>}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Bot size={16} /></div>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    {isDiscovering && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang tìm mô hình phù hợp...</span>}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Yêu cầu AI tạo tác vụ..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl pl-5 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium" />
                <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"><Send size={18} className={isTyping ? 'animate-pulse' : ''} /></button>
              </div>
            </form>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
