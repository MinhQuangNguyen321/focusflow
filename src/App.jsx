import React, { useState, useEffect } from 'react'
import Shell from './components/layout/Shell'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import Focus from './pages/Focus'
import Auth from './pages/Auth'
import AIAssistant from './components/features/AIAssistant'
import NoteEditor from './components/features/NoteEditor'
import HelpWidget from './components/features/HelpWidget'
import { format } from 'date-fns'
import { auth, db } from './firebase'
import { LanguageProvider } from './lib/i18n.jsx'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  setDoc,
  getDocs 
} from 'firebase/firestore'

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Ideas'];
const SENSITIVE_SETTINGS_KEYS = ['geminiKey', 'googleAccessToken'];

const pickSensitiveSettings = (source = {}) => {
  return SENSITIVE_SETTINGS_KEYS.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
};

const stripSensitiveSettings = (source = {}) => {
  const clone = { ...source };
  SENSITIVE_SETTINGS_KEYS.forEach((key) => {
    delete clone[key];
  });
  return clone;
};

const readSensitiveSettings = () => {
  try {
    const raw = sessionStorage.getItem('ai_todo_sensitive_settings');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeSensitiveSettings = (source = {}) => {
  const sensitive = pickSensitiveSettings(source);
  if (Object.keys(sensitive).length === 0) {
    sessionStorage.removeItem('ai_todo_sensitive_settings');
    return;
  }
  sessionStorage.setItem('ai_todo_sensitive_settings', JSON.stringify(sensitive));
};

const DEFAULT_SETTINGS = { 
  darkMode: false, 
  notifications: false, 
  region: 'Global',
  isOnline: true,
  language: 'English',
  avatarUrl: '',
  bio: '',
  role: '',
  location: '',
  geminiKey: '',
  googleAccessToken: null,
  customQuotes: [
    "Take a deep breath and start small.",
    "A clear space is a clear mind.",
    "Focus on the journey, not the destination.",
    "Little by little, a little becomes a lot."
  ]
};

const APP_ICON = `${import.meta.env.BASE_URL}favicon.svg`;

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [guestMode, setGuestMode] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [currentEditingNote, setCurrentEditingNote] = useState(null)
  
  // App Data State
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [events, setEvents] = useState([])
  const [googleEvents, setGoogleEvents] = useState([])
  const [notes, setNotes] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // Dark Mode Application
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Request Notifications
  useEffect(() => {
    if (settings.notifications && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [settings.notifications]);

  // Notification Engine (Alarm Clock)
  useEffect(() => {
    if (!settings.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;

    const checkDeadlines = () => {
      const todayString = format(new Date(), 'yyyy-MM-dd');
      const notifiedItems = JSON.parse(localStorage.getItem('ai_todo_notified') || '{}');
      let hasNewNotification = false;

      // 1. Check Pending Tasks due today
      tasks.forEach(task => {
        if (task.status === 'Pending' && task.dueDate === todayString && !notifiedItems[task.id]) {
          new Notification('Task Due Today 🎯', {
            body: `Don't forget to complete: ${task.title}`,
            icon: APP_ICON
          });
          notifiedItems[task.id] = todayString;
          hasNewNotification = true;
        }
      });

      // 2. Check Events scheduled for today
      events.forEach(event => {
        if (event.date === todayString && !notifiedItems[`event_${event.id}`]) {
          new Notification('Upcoming Event Today 📅', {
            body: `${event.title} starts at ${event.startTime}`,
            icon: APP_ICON
          });
          notifiedItems[`event_${event.id}`] = todayString;
          hasNewNotification = true;
        }
      });

      if (hasNewNotification) {
        // Cleanup old keys so localStorage doesn't bloat endlessly
        Object.keys(notifiedItems).forEach(key => {
          if (notifiedItems[key] !== todayString) delete notifiedItems[key];
        });
        localStorage.setItem('ai_todo_notified', JSON.stringify(notifiedItems));
      }
    };

    // Run check immediately, then every 1 minute
    checkDeadlines();
    const intervalId = setInterval(checkDeadlines, 60000);
    return () => clearInterval(intervalId);
  }, [tasks, events, settings.notifications]);

  // Google Calendar Integration
  useEffect(() => {
    if (settings?.googleAccessToken) {
      const fetchEvents = async () => {
        try {
          const timeMin = new Date();
          timeMin.setMonth(timeMin.getMonth() - 2); 
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&maxResults=250&singleEvents=true&orderBy=startTime`, {
            headers: {
              Authorization: `Bearer ${settings.googleAccessToken}`
            }
          });
          const data = await res.json();
          if (data.items) {
             const gEvents = data.items.map(item => {
               const startStr = item.start.dateTime || item.start.date;
               const endStr = item.end.dateTime || item.end.date;
               return {
                 id: 'google_' + item.id,
                 title: item.summary || 'No Title',
                 date: startStr ? startStr.split('T')[0] : '', // yyyy-MM-dd
                 startTime: item.start.dateTime ? startStr.split('T')[1].substring(0, 5) : '00:00',
                 endTime: item.end.dateTime ? endStr.split('T')[1].substring(0, 5) : '23:59',
                 category: 'Google',
                 type: 'google',
                 description: item.description || ''
               }
             });
             setGoogleEvents(gEvents);
          }
        } catch (error) {
          console.error("Failed to fetch Google Calendar events:", error);
        }
      };
      fetchEvents();
      // Optionally sync every 5 minutes
      const interval = setInterval(fetchEvents, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setGoogleEvents([]);
    }
  }, [settings?.googleAccessToken]);

  // 1. Listen for Auth State
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) setGuestMode(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Cloud Sync / Local Data Handling
  useEffect(() => {
    if (user && db) {
      // SYNC MODE: Cloud
      const unsubTasks = onSnapshot(collection(db, "users", user.uid, "tasks"), (snapshot) => {
        setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });
      const unsubEvents = onSnapshot(collection(db, "users", user.uid, "events"), (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });
      const unsubNotes = onSnapshot(collection(db, "users", user.uid, "notes"), (snapshot) => {
        setNotes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });
      const unsubCats = onSnapshot(doc(db, "users", user.uid, "settings", "categories"), (snapshot) => {
        if (snapshot.exists()) setCategories(snapshot.data().list);
      });
      const unsubSettings = onSnapshot(doc(db, "users", user.uid, "settings", "preferences"), (snapshot) => {
        if (snapshot.exists()) {
          const publicSettings = stripSensitiveSettings(snapshot.data());
          const sensitiveSettings = readSensitiveSettings();
          setSettings({ ...DEFAULT_SETTINGS, ...publicSettings, ...sensitiveSettings });
        }
      });

      return () => { unsubTasks(); unsubEvents(); unsubNotes(); unsubCats(); unsubSettings(); };
    } else if (guestMode || !user) {
      // SYNC MODE: Local (Guest or Not Logged In)
      const savedTasks = localStorage.getItem('ai_todo_tasks');
      const savedNotes = localStorage.getItem('ai_todo_notes');
      const savedEvents = localStorage.getItem('ai_todo_events');
      const savedCats = localStorage.getItem('ai_todo_categories');
      const savedSettings = localStorage.getItem('ai_todo_settings');

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedCats) setCategories(JSON.parse(savedCats));
      if (savedSettings) {
        const localPublicSettings = stripSensitiveSettings(JSON.parse(savedSettings));
        const sensitiveSettings = readSensitiveSettings();
        setSettings({ ...DEFAULT_SETTINGS, ...localPublicSettings, ...sensitiveSettings });
      }
    }
  }, [user, guestMode]);

  // 3. One-time Migration from Local to Cloud
  useEffect(() => {
    if (user && db) {
      const migrate = async () => {
        const localTasks = JSON.parse(localStorage.getItem('ai_todo_tasks') || '[]');
        if (localTasks.length > 0) {
          const cloudCheck = await getDocs(collection(db, "users", user.uid, "tasks"));
          if (cloudCheck.empty) {
            console.log("Migrating local data to cloud...");
            for (const task of localTasks) {
              await addDoc(collection(db, "users", user.uid, "tasks"), task);
            }
            localStorage.removeItem('ai_todo_tasks'); // Cleanup after migration
          }
        }
      };
      migrate();
    }
  }, [user]);

  // Persistence for Guest Mode
  useEffect(() => {
    if (!user && guestMode) {
      localStorage.setItem('ai_todo_tasks', JSON.stringify(tasks));
      localStorage.setItem('ai_todo_categories', JSON.stringify(categories));
      localStorage.setItem('ai_todo_events', JSON.stringify(events));
      localStorage.setItem('ai_todo_notes', JSON.stringify(notes));
      localStorage.setItem('ai_todo_settings', JSON.stringify(stripSensitiveSettings(settings)));
    }
  }, [tasks, categories, events, notes, settings, user, guestMode]);

  useEffect(() => {
    writeSensitiveSettings(settings);
  }, [settings?.geminiKey, settings?.googleAccessToken]);

  const addTask = async (taskData) => {
    const newTask = { ...taskData, status: 'Pending', createdAt: new Date().toISOString() };
    if (user) {
      await addDoc(collection(db, "users", user.uid, "tasks"), newTask);
    } else {
      setTasks(prev => [...prev, { ...newTask, id: Date.now() }]);
    }
  };

  const addEvent = async (eventData) => {
    if (user) {
      await addDoc(collection(db, "users", user.uid, "events"), eventData);
    } else {
      setEvents(prev => [...prev, { ...eventData, id: Date.now() }]);
    }
  };

  const addNote = async (noteData) => {
    const newNote = { 
      ...noteData, 
      date: format(new Date(), 'MMM dd, yyyy'),
      createdAt: new Date().toISOString() 
    };
    if (user) {
      await addDoc(collection(db, "users", user.uid, "notes"), newNote);
    } else {
      setNotes(prev => [...prev, { ...newNote, id: Date.now() }]);
    }
  };

  const updateTask = async (updatedTask) => {
    if (user) {
      const taskRef = doc(db, "users", user.uid, "tasks", updatedTask.id);
      await updateDoc(taskRef, updatedTask);
    } else {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
  };

  const updateEvent = async (updatedEvent) => {
    if (updatedEvent.id?.toString().startsWith('google_')) {
      alert("Sự kiện từ Google Calendar chỉ có thể được xem (chưa hỗ trợ sửa đồng bộ).");
      return;
    }
    if (user) {
      const eventRef = doc(db, "users", user.uid, "events", updatedEvent.id);
      await updateDoc(eventRef, updatedEvent);
    } else {
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    }
  };

  const updateNote = async (updatedNote) => {
    if (user) {
      const noteRef = doc(db, "users", user.uid, "notes", updatedNote.id);
      await updateDoc(noteRef, updatedNote);
    } else {
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    }
  };

  const deleteTask = async (id) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const deleteEvent = async (id) => {
    if (id?.toString().startsWith('google_')) {
      alert("Sự kiện từ Google Calendar chỉ có thể được xem (chưa hỗ trợ xóa đồng bộ).");
      return;
    }
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "events", id));
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const deleteNote = async (id) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "notes", id));
    } else {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const clearActivities = async (type, startDateStr, endDateStr) => {
    let tasksToDelete = [];
    let eventsToDelete = [];
    
    if (type === 'all') {
      tasksToDelete = [...tasks];
      eventsToDelete = [...events];
    } else if (type === 'range' && startDateStr && endDateStr) {
      // Set to midnight for accurate day comparisons
      const start = new Date(startDateStr);
      start.setHours(0,0,0,0);
      const end = new Date(endDateStr);
      end.setHours(23,59,59,999);
      
      const startTime = start.getTime();
      const endTime = end.getTime();
      
      tasksToDelete = tasks.filter(t => {
         if (!t.dueDate) return false;
         const d = new Date(t.dueDate).getTime();
         return d >= startTime && d <= endTime;
      });
      eventsToDelete = events.filter(e => {
         if (!e.date) return false;
         const d = new Date(e.date).getTime();
         return d >= startTime && d <= endTime;
      });
    }

    if (user) {
       await Promise.all([
          ...tasksToDelete.map(t => deleteDoc(doc(db, "users", user.uid, "tasks", t.id.toString()))),
          ...eventsToDelete.map(e => deleteDoc(doc(db, "users", user.uid, "events", e.id.toString())))
       ]);
    } else {
       const taskIds = new Set(tasksToDelete.map(t => t.id));
       const eventIds = new Set(eventsToDelete.map(e => e.id));
       setTasks(prev => prev.filter(t => !taskIds.has(t.id)));
       setEvents(prev => prev.filter(e => !eventIds.has(e.id)));
    }
  };

  const clearTasks = async (type, folder, beforeDate) => {
    let toDelete = [];

    if (type === 'all') {
      toDelete = [...tasks];
    } else if (type === 'folder' && folder) {
      toDelete = tasks.filter(t => t.category === folder);
    } else if (type === 'date' && beforeDate) {
      const cutoff = new Date(beforeDate);
      cutoff.setHours(23, 59, 59, 999);
      toDelete = tasks.filter(t => {
        if (!t.createdAt) return false;
        return new Date(t.createdAt) <= cutoff;
      });
    }

    if (user) {
      await Promise.all(
        toDelete.map(t => deleteDoc(doc(db, 'users', user.uid, 'tasks', t.id.toString())))
      );
    } else {
      const ids = new Set(toDelete.map(t => t.id));
      setTasks(prev => prev.filter(t => !ids.has(t.id)));
    }
  };

  const clearNotes = async (type, tag, beforeDate) => {
    let toDelete = [];

    if (type === 'all') {
      toDelete = [...notes];
    } else if (type === 'tag' && tag) {
      toDelete = notes.filter(n => n.tags?.includes(tag));
    } else if (type === 'date' && beforeDate) {
      const cutoff = new Date(beforeDate);
      cutoff.setHours(23, 59, 59, 999);
      toDelete = notes.filter(n => {
        // Fallback: If createdAt is missing, try to use the numeric ID (timestamp)
        const timestamp = n.createdAt ? new Date(n.createdAt) : (!isNaN(n.id) ? new Date(Number(n.id)) : null);
        if (!timestamp) return false;
        return timestamp <= cutoff;
      });
    }

    if (user) {
      await Promise.all(
        toDelete.map(n => deleteDoc(doc(db, 'users', user.uid, 'notes', n.id.toString())))
      );
    } else {
      const ids = new Set(toDelete.map(n => n.id));
      setNotes(prev => prev.filter(n => !ids.has(n.id)));
    }
  };

  const addCategory = async (category) => {
    if (!categories.includes(category)) {
      const newList = [...categories, category];
      if (user) {
        await setDoc(doc(db, "users", user.uid, "settings", "categories"), { list: newList });
      } else {
        setCategories(newList);
      }
    }
  };

  const updateSettings = async (newSettingsObj) => {
    const updated = { ...settings, ...newSettingsObj };
    const publicSettings = stripSensitiveSettings(updated);
    if (user) {
      await setDoc(doc(db, "users", user.uid, "settings", "preferences"), publicSettings);
      setSettings(updated);
    } else {
      setSettings(updated);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('ai_todo_sensitive_settings');
    setUser(null);
    setGuestMode(false);
    // Clear data to prevent leaks between sessions
    setTasks([]);
    setEvents([]);
    setNotes([]);
    setCategories(DEFAULT_CATEGORIES);
  };

  const handleOpenNoteEditor = (note = null) => {
    setCurrentEditingNote(note);
    setShowNoteEditor(true);
  };

  const handleSaveNote = (noteData) => {
    if (currentEditingNote) {
      updateNote({ ...noteData, id: currentEditingNote.id });
    } else {
      addNote(noteData);
    }
    setShowNoteEditor(false);
  };

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    if (folder) {
      setActiveSection('tasks');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasks} 
            events={[...events, ...googleEvents]} 
            updateTask={updateTask} 
            categories={categories}
            clearTasks={clearTasks} 
            setActiveSection={setActiveSection}
            onSelectFolder={handleSelectFolder}
            openAIAssistant={() => setShowAIAssistant(true)}
            user={user}
            settings={settings}
          />
        )
      case 'tasks':
        return (
          <Tasks
            tasks={tasks}
            selectedFolder={selectedFolder}
            updateTask={updateTask}
            deleteTask={deleteTask}
            clearTasks={clearTasks}
            categories={categories}
            settings={settings}
          />
        )
      case 'notes':
        return (
          <Notes 
            notes={notes}
            onOpenNoteEditor={handleOpenNoteEditor}
            deleteNote={deleteNote}
            clearNotes={clearNotes}
          />
        )
      case 'focus':
        return <Focus />
      case 'calendar':
        return (
          <Calendar 
            tasks={tasks} 
            events={[...events, ...googleEvents]} 
            addTask={addTask} 
            addEvent={addEvent} 
            updateEvent={updateEvent}
            deleteEvent={deleteEvent}
            settings={settings}
            clearActivities={clearActivities}
          />
        )
      case 'settings':
        return (
          <Settings 
            user={user}
            settings={settings}
            updateSettings={updateSettings}
            allData={{ tasks, events, notes }}
            onLogout={handleLogout}
          />
        )
      default:
        return (
          <Dashboard 
            tasks={tasks} 
            events={[...events, ...googleEvents]} 
            updateTask={updateTask} 
            categories={categories} 
            clearTasks={clearTasks}
            setActiveSection={setActiveSection}
            onSelectFolder={handleSelectFolder}
            openAIAssistant={() => setShowAIAssistant(true)}
            user={user}
            settings={settings}
          />
        )
    }
  }

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Initializing FocusFlow AI</p>
        </div>
      </div>
    )
  }

  if (!user && !guestMode) {
    return <Auth onGuestMode={() => setGuestMode(true)} />
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LanguageProvider language={settings.language}>
        <div className="h-screen flex flex-col bg-[#f3f4f6]">
        <Shell 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          selectedFolder={selectedFolder}
          onSelectFolder={handleSelectFolder}
          user={user}
          settings={settings}
          updateSettings={updateSettings}
          isOnline={settings.isOnline}
          categories={categories}
          addCategory={addCategory}
          addTask={addTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          onLogout={handleLogout}
          onOpenNoteEditor={handleOpenNoteEditor}
          tasks={tasks}
          events={[...events, ...googleEvents]}
        >
          {renderSection()}
        </Shell>

        <HelpWidget activeSection={activeSection} />

        <AIAssistant 
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          addTask={addTask}
          addEvent={addEvent}
          addNote={addNote}
          settings={settings}
        />

        <NoteEditor 
          isOpen={showNoteEditor}
          onClose={() => setShowNoteEditor(false)}
          note={currentEditingNote}
          onSave={handleSaveNote}
          onDelete={deleteNote}
        />
        </div>
      </LanguageProvider>
    </GoogleOAuthProvider>
  )
}

export default App;
